import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/telegram'
import type { CartItem } from '@/types/cart'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    let items: CartItem[] = []
    try {
      items = JSON.parse(session.metadata?.items ?? '[]')
    } catch (parseErr) {
      console.error('Failed to parse items metadata:', parseErr)
      // Retourner 200 pour éviter les relivraisons Stripe
      return NextResponse.json({ received: true })
    }
    const address = session.collected_information?.shipping_details?.address

    const order = {
      stripe_session_id: session.id,
      status: 'paid' as const,
      customer_name: session.customer_details?.name,
      customer_email: session.customer_details?.email,
      customer_phone: session.customer_details?.phone,
      shipping_address: address ? {
        street: address.line1,
        city: address.city,
        postal_code: address.postal_code,
        country: address.country,
      } : null,
      items: items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        size: i.size,
        patches: i.patches,
        qty: i.qty,
        price: i.price,
        photo: i.photo,
      })),
      total_amount: session.amount_total ? session.amount_total / 100 : null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseServiceClient() as any
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error) {
      console.error('Failed to insert order:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    const notified = await sendTelegramNotification(data)
    if (notified) {
      await supabase.from('orders').update({ telegram_notified: true }).eq('id', data.id)
    }
  }

  return NextResponse.json({ received: true })
}
