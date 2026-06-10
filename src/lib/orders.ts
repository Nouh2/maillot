import crypto from 'node:crypto'
import type Stripe from 'stripe'
import { sendAbandonedCartEmail, sendOrderPaidEmail, sendTrackingEmail, type AbandonedCartStage } from '@/lib/email'
import { sendTelegramNotification } from '@/lib/telegram'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'
import type { Order } from '@/types/order'

type OrderRow = Order & {
  payment_confirmation_sent_at?: string | null
  tracking_email_sent_at?: string | null
  marketing_opt_in?: boolean
}

type CheckoutLeadRow = {
  id: string
  email: string
  cart_snapshot: CartItem[] | null
  source_channel?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  gclid?: string | null
  fbclid?: string | null
  ttclid?: string | null
  recovered_order_id?: string | null
  last_checkout_started_at: string
  abandoned_cart_30m_sent_at?: string | null
  abandoned_cart_6h_sent_at?: string | null
  abandoned_cart_24h_sent_at?: string | null
}

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

export async function recordMarketingEvent(params: {
  eventName: string
  pagePath?: string | null
  sourceChannel?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmContent?: string | null
  utmTerm?: string | null
  gclid?: string | null
  fbclid?: string | null
  ttclid?: string | null
  value?: number | null
  currency?: string | null
  itemCount?: number | null
  productIds?: string | null
  orderNumber?: string | null
  payload?: Record<string, unknown>
}): Promise<void> {
  const { error } = await service()
    .from('marketing_events')
    .insert({
      event_name: params.eventName,
      page_path: params.pagePath ?? null,
      source_channel: params.sourceChannel ?? null,
      utm_source: params.utmSource ?? null,
      utm_medium: params.utmMedium ?? null,
      utm_campaign: params.utmCampaign ?? null,
      utm_content: params.utmContent ?? null,
      utm_term: params.utmTerm ?? null,
      gclid: params.gclid ?? null,
      fbclid: params.fbclid ?? null,
      ttclid: params.ttclid ?? null,
      value: params.value ?? null,
      currency: params.currency ?? null,
      item_count: params.itemCount ?? null,
      product_ids: params.productIds ?? null,
      order_number: params.orderNumber ?? null,
      event_payload: params.payload ?? {},
    })

  if (error) {
    console.error('Failed to record marketing event:', params.eventName, error)
  }
}

export function generateOrderNumber(now = new Date()): string {
  const datePart = now.toISOString().slice(2, 10).replaceAll('-', '')
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase()
  return `MA-${datePart}-${suffix}`
}

export function generatePublicTrackingToken(): string {
  return crypto.randomUUID()
}

export function getOrderDisplayReference(order: Pick<OrderRow, 'order_number' | 'id'>): string {
  return order.order_number?.trim() || `CMD-${order.id.slice(0, 8).toUpperCase()}`
}

export function deriveSourceChannel(params: {
  utmSource?: string | null
  sourceChannel?: string | null
}): string {
  if (params.sourceChannel?.trim()) return params.sourceChannel.trim().toLowerCase()
  if (params.utmSource?.trim()) return params.utmSource.trim().toLowerCase()
  return 'direct'
}

function mapShippingAddress(session: Stripe.Checkout.Session): Order['shipping_address'] {
  const shippingAddress =
    session.collected_information?.shipping_details?.address ??
    session.customer_details?.address

  if (!shippingAddress) return null

  return {
    street: shippingAddress.line1 ?? null,
    line2: shippingAddress.line2 ?? null,
    city: shippingAddress.city ?? null,
    state: shippingAddress.state ?? null,
    postal_code: shippingAddress.postal_code ?? null,
    country: shippingAddress.country ?? null,
  }
}

export async function linkOrdersToUserAccount(userId: string, email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return

  await service()
    .from('orders')
    .update({ customer_user_id: userId })
    .is('customer_user_id', null)
    .eq('customer_email', normalizedEmail)
}

export async function getOrdersForAccount(userId: string, email: string) {
  await linkOrdersToUserAccount(userId, email)

  return service()
    .from('orders')
    .select('id, order_number, public_tracking_token, status, total_amount, created_at, items, tracking_number, tracking_url')
    .eq('customer_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
}

export async function getOrderByStripeSessionId(sessionId: string) {
  return service()
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()
}

export async function getOrderByTrackingToken(token: string) {
  return service()
    .from('orders')
    .select('*')
    .eq('public_tracking_token', token)
    .maybeSingle()
}

export async function getOpsOrders(params?: {
  statuses?: Array<Order['status']>
  limit?: number
}) {
  let query = service()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params?.limit ?? 50)

  if (params?.statuses?.length) {
    query = query.in('status', params.statuses)
  }

  return query
}

export async function getOrderById(orderId: string) {
  return service()
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle()
}

export async function updateOpsOrder(params: {
  orderId: string
  status?: Order['status']
  trackingNumber?: string | null
  trackingUrl?: string | null
  supplierReference?: string | null
  supplierStatus?: string | null
  sentToSupplier?: boolean
}) {
  const { data: existingOrder } = await getOrderById(params.orderId)
  const currentOrder = existingOrder as OrderRow | null
  if (!currentOrder) {
    return { data: null, error: new Error('Order not found') }
  }

  const now = new Date().toISOString()
  const payload: Record<string, unknown> = {}

  if (params.status) {
    payload.status = params.status
    if (params.status === 'shipped' && !currentOrder.shipped_at) {
      payload.shipped_at = now
    }
    if (params.status === 'delivered' && !currentOrder.delivered_at) {
      payload.delivered_at = now
    }
  }

  if (params.trackingNumber !== undefined) {
    payload.tracking_number = params.trackingNumber?.trim() || null
  }

  if (params.trackingUrl !== undefined) {
    payload.tracking_url = params.trackingUrl?.trim() || null
  }

  if (params.supplierReference !== undefined) {
    payload.supplier_reference = params.supplierReference?.trim() || null
  }

  if (params.supplierStatus !== undefined) {
    payload.supplier_status = params.supplierStatus?.trim() || null
  }

  if (params.sentToSupplier && !currentOrder.sent_to_supplier_at) {
    payload.sent_to_supplier_at = now
  }

  return service()
    .from('orders')
    .update(payload)
    .eq('id', params.orderId)
    .select('*')
    .single()
}

export async function sendTrackingEmailForOrder(orderId: string): Promise<boolean> {
  const { data } = await getOrderById(orderId)
  const order = data as OrderRow | null

  if (!order?.customer_email) return false
  if (!order.tracking_number && !order.tracking_url) return false

  const sent = await sendTrackingEmail({
    to: order.customer_email,
    customerName: order.customer_name,
    orderNumber: getOrderDisplayReference(order),
    trackingToken: order.public_tracking_token,
    trackingNumber: order.tracking_number,
    trackingUrl: order.tracking_url,
  })

  if (!sent) return false

  await service()
    .from('orders')
    .update({
      tracking_email_sent_at: new Date().toISOString(),
      status: order.status === 'paid' ? 'shipped' : order.status,
      shipped_at: order.shipped_at ?? new Date().toISOString(),
    })
    .eq('id', orderId)

  return true
}

async function updateCheckoutLeadRecovery(order: OrderRow): Promise<void> {
  if (!order.customer_email) return

  const { error } = await service()
    .from('checkout_leads')
    .update({
      recovered_order_id: order.id,
      updated_at: new Date().toISOString(),
    })
    .eq('email', order.customer_email)

  if (error) {
    console.error('Failed to update checkout lead recovery:', error)
  }
}

async function maybeSendOrderTelegramNotification(order: OrderRow): Promise<void> {
  if (order.telegram_notified) return

  const notified = await sendTelegramNotification(order)
  if (!notified) return

  order.telegram_notified = true
  const { error } = await service()
    .from('orders')
    .update({ telegram_notified: true })
    .eq('id', order.id)

  if (error) {
    console.error('Failed to mark Telegram notification as sent:', error)
  }
}

async function maybeSendOrderPaidEmailNotification(order: OrderRow): Promise<void> {
  if (order.payment_confirmation_sent_at || !order.customer_email) return

  const sent = await sendOrderPaidEmail({
    to: order.customer_email,
    customerName: order.customer_name,
    orderNumber: getOrderDisplayReference(order),
    trackingToken: order.public_tracking_token,
  })

  if (!sent) return

  const timestamp = new Date().toISOString()
  order.payment_confirmation_sent_at = timestamp
  const { error } = await service()
    .from('orders')
    .update({ payment_confirmation_sent_at: timestamp })
    .eq('id', order.id)

  if (error) {
    console.error('Failed to mark payment confirmation email as sent:', error)
  }
}

async function runOrderPostCheckoutTasksForOrder(order: OrderRow): Promise<void> {
  await updateCheckoutLeadRecovery(order)
  await maybeSendOrderTelegramNotification(order)
  await maybeSendOrderPaidEmailNotification(order)
}

export async function runOrderPostCheckoutTasks(orderId: string): Promise<void> {
  const { data, error } = await getOrderById(orderId)
  const order = data as OrderRow | null

  if (error || !order) {
    console.error('Failed to load order for post-checkout tasks:', error ?? orderId)
    return
  }

  await runOrderPostCheckoutTasksForOrder(order)
}

export async function synchronizeOrderFromCheckoutSession(
  session: Stripe.Checkout.Session,
  options?: { runPostProcessing?: boolean }
): Promise<OrderRow | null> {
  const orderId = session.metadata?.order_id ?? session.client_reference_id
  const lookup = orderId
    ? service().from('orders').select('*').eq('id', orderId)
    : service().from('orders').select('*').eq('stripe_session_id', session.id)

  const { data: existingOrder, error: fetchError } = await lookup.maybeSingle()
  if (fetchError || !existingOrder) {
    console.error('Failed to find order for Stripe session:', fetchError ?? session.id)
    return null
  }

  const order = existingOrder as OrderRow
  const isCheckoutCompleted = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
  const wasPending = order.status === 'pending'
  const paidAt = isCheckoutCompleted ? new Date().toISOString() : order.paid_at ?? null

  const { data: updatedOrder, error: updateError } = await service()
    .from('orders')
    .update({
      stripe_session_id: session.id,
      customer_name: session.customer_details?.name ?? order.customer_name ?? null,
      customer_email: session.customer_details?.email?.trim().toLowerCase() ?? order.customer_email ?? null,
      customer_phone: session.customer_details?.phone ?? order.customer_phone ?? null,
      shipping_address: mapShippingAddress(session) ?? order.shipping_address ?? null,
      total_amount: session.amount_total != null ? session.amount_total / 100 : order.total_amount ?? null,
      status: order.status === 'pending' && isCheckoutCompleted ? 'paid' : order.status,
      paid_at: paidAt,
    })
    .eq('id', order.id)
    .select('*')
    .single()

  if (updateError || !updatedOrder) {
    console.error('Failed to update order:', updateError)
    return null
  }

  const nextOrder = updatedOrder as OrderRow

  if (wasPending && isCheckoutCompleted) {
    await recordMarketingEvent({
      eventName: 'purchase_confirmed',
      sourceChannel: nextOrder.source_channel,
      utmSource: nextOrder.utm_source,
      utmMedium: nextOrder.utm_medium,
      utmCampaign: nextOrder.utm_campaign,
      utmContent: nextOrder.utm_content,
      utmTerm: nextOrder.utm_term,
      gclid: nextOrder.gclid,
      fbclid: nextOrder.fbclid,
      ttclid: nextOrder.ttclid,
      value: nextOrder.total_amount ?? null,
      currency: 'EUR',
      itemCount: nextOrder.items.reduce((sum, item) => sum + item.qty, 0),
      productIds: nextOrder.items.map((item) => item.product_id).join(','),
      orderNumber: getOrderDisplayReference(nextOrder),
      payload: {
        stripe_session_id: session.id,
        status: nextOrder.status,
      },
    })
  }

  if (options?.runPostProcessing !== false) {
    await runOrderPostCheckoutTasksForOrder(nextOrder)
  }

  return nextOrder
}

export async function dispatchPendingOrderEmails(): Promise<{ paymentEmails: number; trackingEmails: number }> {
  let paymentEmails = 0
  let trackingEmails = 0

  const { data: paymentOrders } = await service()
    .from('orders')
    .select('*')
    .eq('status', 'paid')
    .is('payment_confirmation_sent_at', null)
    .not('customer_email', 'is', null)
    .limit(50)

  for (const row of (paymentOrders as OrderRow[] | null) ?? []) {
    const sent = await sendOrderPaidEmail({
      to: row.customer_email!,
      customerName: row.customer_name,
      orderNumber: getOrderDisplayReference(row),
      trackingToken: row.public_tracking_token,
    })

    if (sent) {
      paymentEmails += 1
      await service()
        .from('orders')
        .update({ payment_confirmation_sent_at: new Date().toISOString() })
        .eq('id', row.id)
    }
  }

  const { data: trackingOrders } = await service()
    .from('orders')
    .select('*')
    .in('status', ['shipped', 'delivered'])
    .is('tracking_email_sent_at', null)
    .not('customer_email', 'is', null)
    .or('tracking_url.not.is.null,tracking_number.not.is.null')
    .limit(50)

  for (const row of (trackingOrders as OrderRow[] | null) ?? []) {
    const sent = await sendTrackingEmail({
      to: row.customer_email!,
      customerName: row.customer_name,
      orderNumber: getOrderDisplayReference(row),
      trackingToken: row.public_tracking_token,
      trackingNumber: row.tracking_number,
      trackingUrl: row.tracking_url,
    })

    if (sent) {
      trackingEmails += 1
      await service()
        .from('orders')
        .update({ tracking_email_sent_at: new Date().toISOString() })
        .eq('id', row.id)
    }
  }

  return { paymentEmails, trackingEmails }
}

function getAbandonedCartStage(lead: CheckoutLeadRow, now = new Date()): AbandonedCartStage | null {
  const checkoutStartedAt = new Date(lead.last_checkout_started_at).getTime()
  if (Number.isNaN(checkoutStartedAt)) return null

  const ageMs = now.getTime() - checkoutStartedAt
  const minutes = ageMs / 60000
  const hours = ageMs / 3600000

  if (!lead.abandoned_cart_30m_sent_at && minutes >= 30) return '30m'
  if (lead.abandoned_cart_30m_sent_at && !lead.abandoned_cart_6h_sent_at && hours >= 6) return '6h'
  if (lead.abandoned_cart_6h_sent_at && !lead.abandoned_cart_24h_sent_at && hours >= 24) return '24h'

  return null
}

function getAbandonedCartSentColumn(stage: AbandonedCartStage) {
  switch (stage) {
    case '30m':
      return 'abandoned_cart_30m_sent_at'
    case '6h':
      return 'abandoned_cart_6h_sent_at'
    case '24h':
      return 'abandoned_cart_24h_sent_at'
  }
}

export async function dispatchAbandonedCartEmails(): Promise<{ abandonedCartEmails: number }> {
  let abandonedCartEmails = 0
  const now = new Date()
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString()

  const { data: leads, error } = await service()
    .from('checkout_leads')
    .select('id, email, cart_snapshot, source_channel, utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid, ttclid, recovered_order_id, last_checkout_started_at, abandoned_cart_30m_sent_at, abandoned_cart_6h_sent_at, abandoned_cart_24h_sent_at')
    .is('recovered_order_id', null)
    .not('email', 'is', null)
    .lte('last_checkout_started_at', thirtyMinutesAgo)
    .limit(100)

  if (error) {
    console.error('Failed to load abandoned checkout leads:', error)
    return { abandonedCartEmails }
  }

  for (const lead of (leads as CheckoutLeadRow[] | null) ?? []) {
    const stage = getAbandonedCartStage(lead, now)
    if (!stage) continue

    const sent = await sendAbandonedCartEmail({
      to: lead.email,
      stage,
      items: lead.cart_snapshot,
    })

    if (!sent) continue

    abandonedCartEmails += 1
    const sentColumn = getAbandonedCartSentColumn(stage)
    const items = lead.cart_snapshot ?? []

    await service()
      .from('checkout_leads')
      .update({
        [sentColumn]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id)
      .is('recovered_order_id', null)
      .is(sentColumn, null)

    await recordMarketingEvent({
      eventName: 'checkout_abandoned_email_sent',
      sourceChannel: lead.source_channel,
      utmSource: lead.utm_source,
      utmMedium: lead.utm_medium,
      utmCampaign: lead.utm_campaign,
      utmContent: lead.utm_content,
      utmTerm: lead.utm_term,
      gclid: lead.gclid,
      fbclid: lead.fbclid,
      ttclid: lead.ttclid,
      value: items.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.qty ?? 1), 0),
      currency: 'EUR',
      itemCount: items.reduce((sum, item) => sum + Number(item.qty ?? 1), 0),
      productIds: items.map((item) => item.product_id).filter(Boolean).join(','),
      payload: {
        stage,
        lead_id: lead.id,
      },
    })
  }

  return { abandonedCartEmails }
}

export async function dispatchPendingLifecycleEmails(): Promise<{
  paymentEmails: number
  trackingEmails: number
  abandonedCartEmails: number
}> {
  const orderEmails = await dispatchPendingOrderEmails()
  const abandonedCartEmails = await dispatchAbandonedCartEmails()

  return {
    ...orderEmails,
    ...abandonedCartEmails,
  }
}
