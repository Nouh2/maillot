import crypto from 'node:crypto'
import type Stripe from 'stripe'
import { getOrderDisplayReference } from '@/lib/orders'
import { DEFAULT_TIKTOK_PIXEL_ID } from '@/lib/tiktokConfig'
import type { Order } from '@/types/order'

const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

type TikTokEventResult =
  | { sent: true }
  | { sent: false; reason: 'missing_config' | 'unpaid_session' | 'request_failed' }

function getTikTokEventsConfig() {
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN?.trim()
  const pixelCode =
    process.env.TIKTOK_EVENTS_API_PIXEL_CODE?.trim() ||
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() ||
    DEFAULT_TIKTOK_PIXEL_ID
  const testEventCode = process.env.TIKTOK_EVENTS_API_TEST_EVENT_CODE?.trim()

  if (!accessToken || !pixelCode) return null

  return {
    accessToken,
    pixelCode,
    testEventCode: testEventCode || null,
    endpoint: process.env.TIKTOK_EVENTS_API_URL?.trim() || TIKTOK_EVENTS_API_URL,
  }
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function normalizeEmail(email?: string | null): string | null {
  const value = email?.trim().toLowerCase()
  return value || null
}

function normalizePhone(phone?: string | null): string | null {
  const value = phone?.replace(/[^\d+]/g, '').trim()
  return value || null
}

function compactRecord<T extends Record<string, unknown>>(record: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  )
}

function toTikTokContents(items: Order['items']) {
  return items.map((item) =>
    compactRecord({
      content_id: item.product_id,
      content_name: item.name,
      price: item.price,
      quantity: item.qty,
    }),
  )
}

function isPaidCheckoutSession(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
}

export async function sendTikTokCompletePaymentEvent(params: {
  order: Order
  session: Stripe.Checkout.Session
  eventId: string
}): Promise<TikTokEventResult> {
  const config = getTikTokEventsConfig()
  if (!config) return { sent: false, reason: 'missing_config' }
  if (!isPaidCheckoutSession(params.session)) return { sent: false, reason: 'unpaid_session' }

  const email = normalizeEmail(params.order.customer_email ?? params.session.customer_details?.email)
  const phone = normalizePhone(params.order.customer_phone ?? params.session.customer_details?.phone)
  const orderNumber = getOrderDisplayReference(params.order)
  const value = params.session.amount_total != null ? params.session.amount_total / 100 : params.order.total_amount
  const currency = params.session.currency?.toUpperCase() || 'EUR'
  const contents = toTikTokContents(params.order.items)

  const payload = compactRecord({
    event_source: 'web',
    event_source_id: config.pixelCode,
    test_event_code: config.testEventCode,
    data: [
      {
        event: 'CompletePayment',
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        user: compactRecord({
          email: email ? sha256(email) : null,
          phone: phone ? sha256(phone) : null,
          external_id: email ? sha256(email) : null,
          ttclid: params.order.ttclid ?? null,
        }),
        properties: compactRecord({
          currency,
          value,
          order_id: orderNumber,
          content_type: 'product',
          contents,
        }),
        page: compactRecord({
          url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/order-confirmed?session_id=${params.session.id}`,
        }),
      },
    ],
  })

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Access-Token': config.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      console.error('TikTok CompletePayment event failed:', response.status, errorBody.slice(0, 500))
      return { sent: false, reason: 'request_failed' }
    }

    return { sent: true }
  } catch (error) {
    console.error('TikTok CompletePayment event failed:', error)
    return { sent: false, reason: 'request_failed' }
  }
}
