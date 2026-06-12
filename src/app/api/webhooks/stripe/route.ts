import { after, NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getOrderById, getOrderByStripeSessionId, getOrderDisplayReference, recordMarketingEvent, runOrderPostCheckoutTasks, synchronizeOrderFromCheckoutSession } from '@/lib/orders'
import { getStripe } from '@/lib/stripe'
import { sendTikTokCompletePaymentEvent } from '@/lib/tiktokEvents'
import type { Order } from '@/types/order'

const POST_CHECKOUT_EVENT_TYPES = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])
const CHECKOUT_FAILURE_EVENT_TYPES = new Set([
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
])

async function recordCheckoutOutcome(session: Stripe.Checkout.Session, eventName: string) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id
  const { data } = orderId ? await getOrderById(orderId) : await getOrderByStripeSessionId(session.id)
  const order = data ?? null
  const items: Order['items'] = Array.isArray(order?.items) ? order.items : []

  await recordMarketingEvent({
    eventName,
    sourceChannel: order?.source_channel ?? session.metadata?.source_channel ?? null,
    utmSource: order?.utm_source ?? null,
    utmMedium: order?.utm_medium ?? null,
    utmCampaign: order?.utm_campaign ?? null,
    utmContent: order?.utm_content ?? null,
    utmTerm: order?.utm_term ?? null,
    gclid: order?.gclid ?? null,
    fbclid: order?.fbclid ?? null,
    ttclid: order?.ttclid ?? null,
    value: session.amount_total != null ? session.amount_total / 100 : order?.total_amount ?? null,
    currency: session.currency?.toUpperCase() ?? 'EUR',
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    productIds: items.map((item) => item.product_id).join(','),
    orderNumber: order ? getOrderDisplayReference(order) : session.metadata?.order_number ?? null,
    payload: {
      stripe_session_id: session.id,
      payment_status: session.payment_status,
      status: session.status,
    },
  })
}

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

      try {
        await sendTikTokCompletePaymentEvent({
          order,
          session,
          eventId: `purchase:${order.id}`,
        })
      } catch (error) {
        console.error('TikTok webhook event processing failed:', event.id, order.id, error)
      }
    })
  } else if (CHECKOUT_FAILURE_EVENT_TYPES.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session
    await recordCheckoutOutcome(
      session,
      event.type === 'checkout.session.expired' ? 'checkout_expired' : 'payment_failed',
    )
  }

  return NextResponse.json({ received: true })
}
