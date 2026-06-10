import { getSupabaseServiceClient } from '@/lib/supabase/server'

type MarketingEventRow = {
  id: string
  event_name: string
  page_path?: string | null
  source_channel?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  ttclid?: string | null
  gclid?: string | null
  fbclid?: string | null
  value?: number | null
  product_name?: string | null
  order_number?: string | null
  session_id?: string | null
  created_at: string
}

type MarketingOrderRow = {
  id: string
  order_number?: string | null
  status?: string | null
  total_amount?: number | null
  source_channel?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  ttclid?: string | null
  gclid?: string | null
  fbclid?: string | null
  created_at: string
}

type CheckoutLeadSummaryRow = {
  id: string
  recovered_order_id?: string | null
  source_channel?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  ttclid?: string | null
  gclid?: string | null
  fbclid?: string | null
  abandoned_cart_30m_sent_at?: string | null
  abandoned_cart_6h_sent_at?: string | null
  abandoned_cart_24h_sent_at?: string | null
  last_checkout_started_at: string
}

type AttributedRow = {
  source_channel?: string | null
  utm_source?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  ttclid?: string | null
  gclid?: string | null
  fbclid?: string | null
}

export type OpsMarketingSourceSummary = {
  source: string
  events: number
  checkouts: number
  purchases: number
  orders: number
  revenue: number
}

export type OpsMarketingTotals = {
  events: number
  sessions: number
  pageViews: number
  productViews: number
  addToCart: number
  checkoutEvents: number
  orders: number
  revenue: number
  averageOrderValue: number
  pendingOrders: number
  pendingRevenue: number
  recentPendingOrders: number
  abandonedPendingOrders: number
  checkoutLeads: number
  recoveredLeads: number
  unrecoveredLeads: number
  tiktokEvents: number
  tiktokClicks: number
  googleClicks: number
  metaClicks: number
  abandoned30mSent: number
  abandoned6hSent: number
  abandoned24hSent: number
  sessionToOrderRate: number
  viewToCartRate: number
  cartToCheckoutRate: number
  checkoutToOrderRate: number
  leadRecoveryRate: number
}

export type OpsMarketingWindowSummary = {
  since: string
  until: string
  funnel: Array<{ eventName: string; label: string; count: number }>
  totals: OpsMarketingTotals
  sources: OpsMarketingSourceSummary[]
  campaigns: OpsMarketingSourceSummary[]
  tiktokCampaigns: OpsMarketingSourceSummary[]
  recentEvents: MarketingEventRow[]
}

export type OpsMarketingSummary = OpsMarketingWindowSummary & {
  generatedAt: string
  windowDays: number
  previous: OpsMarketingWindowSummary
}

const WINDOW_DAYS = 14
const PAID_STATUSES = new Set(['paid', 'shipped', 'delivered'])
const CHECKOUT_EVENT_NAMES = new Set(['checkout_created', 'begin_checkout', 'checkout_redirected'])

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

function sourceLabel(row?: AttributedRow | null) {
  return row?.source_channel?.trim().toLowerCase() || row?.utm_source?.trim().toLowerCase() || 'direct'
}

function campaignLabel(row?: AttributedRow | null) {
  return row?.utm_campaign?.trim() || 'sans campagne'
}

function tiktokCampaignLabel(row?: AttributedRow | null) {
  const campaign = row?.utm_campaign?.trim() || 'sans campagne'
  const content = row?.utm_content?.trim()
  return content ? `${campaign} / ${content}` : campaign
}

function isTikTok(row?: AttributedRow | null) {
  const source = `${row?.source_channel ?? ''} ${row?.utm_source ?? ''}`.toLowerCase()
  return Boolean(row?.ttclid || source.includes('tiktok'))
}

function increment(map: Map<string, OpsMarketingSourceSummary>, key: string, patch: Partial<OpsMarketingSourceSummary>) {
  const current = map.get(key) ?? {
    source: key,
    events: 0,
    checkouts: 0,
    purchases: 0,
    orders: 0,
    revenue: 0,
  }

  map.set(key, {
    ...current,
    events: current.events + (patch.events ?? 0),
    checkouts: current.checkouts + (patch.checkouts ?? 0),
    purchases: current.purchases + (patch.purchases ?? 0),
    orders: current.orders + (patch.orders ?? 0),
    revenue: current.revenue + (patch.revenue ?? 0),
  })
}

function countUnique(values: Array<string | null | undefined>) {
  return new Set(values.filter((value): value is string => Boolean(value))).size
}

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? (numerator / denominator) * 100 : 0
}

function sortSummaryRows(rows: Iterable<OpsMarketingSourceSummary>, limit: number) {
  return Array.from(rows)
    .sort((a, b) => b.revenue + b.orders * 100 + b.events - (a.revenue + a.orders * 100 + a.events))
    .slice(0, limit)
}

async function getWindowRows(since: string, until: string) {
  const [{ data: events }, { data: orders }, { data: checkoutLeads }] = await Promise.all([
    service()
      .from('marketing_events')
      .select(
        'id, event_name, page_path, source_channel, utm_source, utm_medium, utm_campaign, utm_content, ttclid, gclid, fbclid, value, product_name, order_number, session_id, created_at',
      )
      .gte('created_at', since)
      .lt('created_at', until)
      .order('created_at', { ascending: false })
      .limit(5000),
    service()
      .from('orders')
      .select('id, order_number, status, total_amount, source_channel, utm_source, utm_medium, utm_campaign, utm_content, ttclid, gclid, fbclid, created_at')
      .gte('created_at', since)
      .lt('created_at', until)
      .neq('status', 'cancelled')
      .limit(1000),
    service()
      .from('checkout_leads')
      .select(
        'id, recovered_order_id, source_channel, utm_source, utm_medium, utm_campaign, utm_content, ttclid, gclid, fbclid, abandoned_cart_30m_sent_at, abandoned_cart_6h_sent_at, abandoned_cart_24h_sent_at, last_checkout_started_at',
      )
      .gte('last_checkout_started_at', since)
      .lt('last_checkout_started_at', until)
      .limit(1000),
  ])

  return {
    eventRows: ((events as MarketingEventRow[] | null) ?? []),
    orderRows: ((orders as MarketingOrderRow[] | null) ?? []),
    leadRows: ((checkoutLeads as CheckoutLeadSummaryRow[] | null) ?? []),
  }
}

async function buildWindowSummary(since: string, until: string, generatedAt: Date): Promise<OpsMarketingWindowSummary> {
  const { eventRows, orderRows, leadRows } = await getWindowRows(since, until)
  const revenueOrderRows = orderRows.filter((order) => PAID_STATUSES.has(order.status ?? ''))
  const pendingOrderRows = orderRows.filter((order) => order.status === 'pending')
  const sourceMap = new Map<string, OpsMarketingSourceSummary>()
  const campaignMap = new Map<string, OpsMarketingSourceSummary>()
  const tiktokCampaignMap = new Map<string, OpsMarketingSourceSummary>()

  for (const event of eventRows) {
    const isCheckout = CHECKOUT_EVENT_NAMES.has(event.event_name)
    const isPurchase = event.event_name === 'purchase'

    increment(sourceMap, sourceLabel(event), {
      events: 1,
      checkouts: isCheckout ? 1 : 0,
      purchases: isPurchase ? 1 : 0,
    })
    increment(campaignMap, campaignLabel(event), {
      events: 1,
      checkouts: isCheckout ? 1 : 0,
      purchases: isPurchase ? 1 : 0,
    })

    if (isTikTok(event)) {
      increment(tiktokCampaignMap, tiktokCampaignLabel(event), {
        events: 1,
        checkouts: isCheckout ? 1 : 0,
        purchases: isPurchase ? 1 : 0,
      })
    }
  }

  for (const order of revenueOrderRows) {
    const revenue = Number(order.total_amount ?? 0)
    increment(sourceMap, sourceLabel(order), { orders: 1, revenue })
    increment(campaignMap, campaignLabel(order), { orders: 1, revenue })

    if (isTikTok(order)) {
      increment(tiktokCampaignMap, tiktokCampaignLabel(order), { orders: 1, revenue })
    }
  }

  const eventCounts = eventRows.reduce<Record<string, number>>((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] ?? 0) + 1
    return acc
  }, {})
  const clickIds = [...eventRows, ...orderRows, ...leadRows]
  const pageViews = eventCounts.page_view ?? 0
  const productViews = eventCounts.product_view ?? 0
  const addToCart = eventCounts.add_to_cart ?? 0
  const checkoutEvents = Array.from(CHECKOUT_EVENT_NAMES).reduce((sum, eventName) => sum + (eventCounts[eventName] ?? 0), 0)
  const revenue = revenueOrderRows.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)
  const recoveredLeads = leadRows.filter((lead) => Boolean(lead.recovered_order_id)).length

  return {
    since,
    until,
    funnel: [
      { eventName: 'page_view', label: 'Pages vues', count: pageViews },
      { eventName: 'product_view', label: 'Produits vus', count: productViews },
      { eventName: 'add_to_cart', label: 'Ajouts panier', count: addToCart },
      { eventName: 'checkout_created', label: 'Checkouts crees', count: eventCounts.checkout_created ?? 0 },
      { eventName: 'begin_checkout', label: 'Checkouts', count: eventCounts.begin_checkout ?? 0 },
      { eventName: 'checkout_redirected', label: 'Redirections Stripe', count: eventCounts.checkout_redirected ?? 0 },
      { eventName: 'purchase', label: 'Achats tracks', count: eventCounts.purchase ?? 0 },
      { eventName: 'purchase_confirmed', label: 'Achats confirmes', count: eventCounts.purchase_confirmed ?? 0 },
      { eventName: 'checkout_abandoned_email_sent', label: 'Relances panier', count: eventCounts.checkout_abandoned_email_sent ?? 0 },
      { eventName: 'checkout_duplicate_attempt', label: 'Tentatives doublon', count: eventCounts.checkout_duplicate_attempt ?? 0 },
      { eventName: 'payment_failed', label: 'Paiements echoues', count: eventCounts.payment_failed ?? 0 },
      { eventName: 'checkout_expired', label: 'Checkouts expires', count: eventCounts.checkout_expired ?? 0 },
    ],
    totals: {
      events: eventRows.length,
      sessions: countUnique(eventRows.map((event) => event.session_id)),
      pageViews,
      productViews,
      addToCart,
      checkoutEvents,
      orders: revenueOrderRows.length,
      revenue,
      averageOrderValue: revenueOrderRows.length > 0 ? revenue / revenueOrderRows.length : 0,
      pendingOrders: pendingOrderRows.length,
      pendingRevenue: pendingOrderRows.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
      recentPendingOrders: pendingOrderRows.filter((order) => {
        return generatedAt.getTime() - new Date(order.created_at).getTime() < 30 * 60 * 1000
      }).length,
      abandonedPendingOrders: pendingOrderRows.filter((order) => {
        return generatedAt.getTime() - new Date(order.created_at).getTime() >= 30 * 60 * 1000
      }).length,
      checkoutLeads: leadRows.length,
      recoveredLeads,
      unrecoveredLeads: Math.max(0, leadRows.length - recoveredLeads),
      tiktokEvents: eventRows.filter((event) => isTikTok(event)).length,
      tiktokClicks: countUnique(clickIds.map((row) => row.ttclid)),
      googleClicks: countUnique(clickIds.map((row) => row.gclid)),
      metaClicks: countUnique(clickIds.map((row) => row.fbclid)),
      abandoned30mSent: leadRows.filter((lead) => Boolean(lead.abandoned_cart_30m_sent_at)).length,
      abandoned6hSent: leadRows.filter((lead) => Boolean(lead.abandoned_cart_6h_sent_at)).length,
      abandoned24hSent: leadRows.filter((lead) => Boolean(lead.abandoned_cart_24h_sent_at)).length,
      sessionToOrderRate: percent(revenueOrderRows.length, countUnique(eventRows.map((event) => event.session_id))),
      viewToCartRate: percent(addToCart, productViews),
      cartToCheckoutRate: percent(checkoutEvents, addToCart),
      checkoutToOrderRate: percent(revenueOrderRows.length, checkoutEvents),
      leadRecoveryRate: percent(recoveredLeads, leadRows.length),
    },
    sources: sortSummaryRows(sourceMap.values(), 10),
    campaigns: sortSummaryRows(campaignMap.values(), 10),
    tiktokCampaigns: sortSummaryRows(tiktokCampaignMap.values(), 10),
    recentEvents: eventRows.slice(0, 30),
  }
}

export async function getOpsMarketingSummary(): Promise<OpsMarketingSummary> {
  const generatedAt = new Date()
  const currentUntil = generatedAt
  const currentSince = new Date(currentUntil.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const previousUntil = currentSince
  const previousSince = new Date(previousUntil.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const [current, previous] = await Promise.all([
    buildWindowSummary(currentSince.toISOString(), currentUntil.toISOString(), generatedAt),
    buildWindowSummary(previousSince.toISOString(), previousUntil.toISOString(), generatedAt),
  ])

  return {
    ...current,
    generatedAt: generatedAt.toISOString(),
    windowDays: WINDOW_DAYS,
    previous,
  }
}
