import crypto from 'node:crypto'
import type Stripe from 'stripe'
import { sendOrderPaidEmail, sendTrackingEmail } from '@/lib/email'
import { sendTelegramNotification } from '@/lib/telegram'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import type { Order } from '@/types/order'

type OrderRow = Order & {
  payment_confirmation_sent_at?: string | null
  tracking_email_sent_at?: string | null
  marketing_opt_in?: boolean
}

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
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
