import { after, NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { runOrderPostCheckoutTasks, synchronizeOrderFromCheckoutSession } from '@/lib/orders'
import { getStripe } from '@/lib/stripe'

const POST_CHECKOUT_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])

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
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (POST_CHECKOUT_EVENT_TYPES.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session
    const order = await synchronizeOrderFromCheckoutSession(session, {
      runPostProcessing: false,
    })

    if (!order) {
      console.error('Webhook failed to synchronize order:', event.id, event.type, session.id)
      return NextResponse.json({ error: 'Order not found' }, { status: 500 })
    }

    after(async () => {
      try {
        await runOrderPostCheckoutTasks(order.id)
      } catch (error) {
        console.error('Post-checkout webhook processing failed:', event.id, order.id, error)
      }
    })
  }

  return NextResponse.json({ received: true })
}
