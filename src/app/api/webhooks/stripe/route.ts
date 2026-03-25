import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/telegram'

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
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id ?? session.client_reference_id
    const shippingAddress = session.collected_information?.shipping_details?.address ?? session.customer_details?.address
    const shippingName = session.collected_information?.shipping_details?.name ?? session.customer_details?.name

    const orderUpdate = {
      stripe_session_id: session.id,
      customer_name: session.customer_details?.name ?? shippingName ?? null,
      customer_email: session.customer_details?.email ?? null,
      customer_phone: session.customer_details?.phone ?? null,
      shipping_address: shippingAddress
        ? {
            street: shippingAddress.line1 ?? null,
            line2: shippingAddress.line2 ?? null,
            city: shippingAddress.city ?? null,
            state: shippingAddress.state ?? null,
            postal_code: shippingAddress.postal_code ?? null,
            country: shippingAddress.country ?? null,
          }
        : null,
      total_amount: session.amount_total ? session.amount_total / 100 : null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseServiceClient() as any
    let lookup = supabase.from('orders').select('*')

    lookup = orderId
      ? lookup.eq('id', orderId)
      : lookup.eq('stripe_session_id', session.id)

    const { data: existingOrder, error: fetchError } = await lookup.maybeSingle()

    if (fetchError || !existingOrder) {
      console.error('Failed to find order for Stripe session:', fetchError ?? session.id)
      return NextResponse.json({ error: 'Order not found' }, { status: 500 })
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        ...orderUpdate,
        status: existingOrder.status === 'pending' ? 'paid' : existingOrder.status,
      })
      .eq('id', existingOrder.id)
      .select()
      .single()

    if (updateError || !updatedOrder) {
      console.error('Failed to update order:', updateError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    if (!updatedOrder.telegram_notified) {
      const notified = await sendTelegramNotification(updatedOrder)

      if (notified) {
        await supabase
          .from('orders')
          .update({ telegram_notified: true })
          .eq('id', updatedOrder.id)
      }
    }
  }

  return NextResponse.json({ received: true })
}
