import { getSupabaseServiceClient } from '@/lib/supabase/server'

type MarketingEventRow = {
  id: string
  event_name: string
  page_path?: string | null
  source_channel?: string | null
  utm_campaign?: string | null
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
  total_amount?: number | null
  source_channel?: string | null
  utm_campaign?: string | null
  ttclid?: string | null
  gclid?: string | null
  fbclid?: string | null
  created_at: string
}

type CheckoutLeadSummaryRow = {
  id: string
  recovered_order_id?: string | null
  source_channel?: string | null
  utm_campaign?: string | null
  ttclid?: string | null
  gclid?: string | null
  fbclid?: string | null
  abandoned_cart_30m_sent_at?: string | null
  abandoned_cart_6h_sent_at?: string | null
  abandoned_cart_24h_sent_at?: string | null
  last_checkout_started_at: string
}

export type OpsMarketingSourceSummary = {
  source: string
  events: number
  checkouts: number
  purchases: number
  orders: number
  revenue: number
}

export type OpsMarketingSummary = {
  generatedAt: string
  since: string
  funnel: Array<{ eventName: string; label: string; count: number }>
  totals: {
    events: number
    sessions: number
    orders: number
    revenue: number
    checkoutLeads: number
    recoveredLeads: number
    tiktokClicks: number
    googleClicks: number
    metaClicks: number
    abandoned30mSent: number
    abandoned6hSent: number
    abandoned24hSent: number
  }
  sources: OpsMarketingSourceSummary[]
  campaigns: OpsMarketingSourceSummary[]
  recentEvents: MarketingEventRow[]
}

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

function sourceLabel(value?: string | null) {
  return value?.trim().toLowerCase() || 'direct'
}

function campaignLabel(value?: string | null) {
  return value?.trim() || 'sans campagne'
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

export async function getOpsMarketingSummary(): Promise<OpsMarketingSummary> {
  const generatedAt = new Date()
  const since = new Date(generatedAt.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: events }, { data: orders }, { data: checkoutLeads }] = await Promise.all([
    service()
      .from('marketing_events')
      .select('id, event_name, page_path, source_channel, utm_campaign, ttclid, gclid, fbclid, value, product_name, order_number, session_id, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1000),
    service()
      .from('orders')
      .select('id, order_number, total_amount, source_channel, utm_campaign, ttclid, gclid, fbclid, created_at')
      .gte('created_at', since)
      .neq('status', 'cancelled')
      .limit(500),
    service()
      .from('checkout_leads')
      .select('id, recovered_order_id, source_channel, utm_campaign, ttclid, gclid, fbclid, abandoned_cart_30m_sent_at, abandoned_cart_6h_sent_at, abandoned_cart_24h_sent_at, last_checkout_started_at')
      .gte('last_checkout_started_at', since)
      .limit(500),
  ])

  const eventRows = ((events as MarketingEventRow[] | null) ?? [])
  const orderRows = ((orders as MarketingOrderRow[] | null) ?? [])
  const leadRows = ((checkoutLeads as CheckoutLeadSummaryRow[] | null) ?? [])
  const sourceMap = new Map<string, OpsMarketingSourceSummary>()
  const campaignMap = new Map<string, OpsMarketingSourceSummary>()

  for (const event of eventRows) {
    const source = sourceLabel(event.source_channel)
    const campaign = campaignLabel(event.utm_campaign)
    const isCheckout = event.event_name === 'begin_checkout' || event.event_name === 'checkout_redirected'
    const isPurchase = event.event_name === 'purchase'

    increment(sourceMap, source, {
      events: 1,
      checkouts: isCheckout ? 1 : 0,
      purchases: isPurchase ? 1 : 0,
    })
    increment(campaignMap, campaign, {
      events: 1,
      checkouts: isCheckout ? 1 : 0,
      purchases: isPurchase ? 1 : 0,
    })
  }

  for (const order of orderRows) {
    const revenue = Number(order.total_amount ?? 0)
    increment(sourceMap, sourceLabel(order.source_channel), { orders: 1, revenue })
    increment(campaignMap, campaignLabel(order.utm_campaign), { orders: 1, revenue })
  }

  const eventCounts = eventRows.reduce<Record<string, number>>((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] ?? 0) + 1
    return acc
  }, {})

  const clickIds = [...eventRows, ...orderRows, ...leadRows]

  return {
    generatedAt: generatedAt.toISOString(),
    since,
    funnel: [
      { eventName: 'page_view', label: 'Pages vues', count: eventCounts.page_view ?? 0 },
      { eventName: 'product_view', label: 'Produits vus', count: eventCounts.product_view ?? 0 },
      { eventName: 'add_to_cart', label: 'Ajouts panier', count: eventCounts.add_to_cart ?? 0 },
      { eventName: 'begin_checkout', label: 'Checkouts', count: eventCounts.begin_checkout ?? 0 },
      { eventName: 'checkout_redirected', label: 'Redirections Stripe', count: eventCounts.checkout_redirected ?? 0 },
      { eventName: 'purchase', label: 'Achats tracks', count: eventCounts.purchase ?? 0 },
    ],
    totals: {
      events: eventRows.length,
      sessions: countUnique(eventRows.map((event) => event.session_id)),
      orders: orderRows.length,
      revenue: orderRows.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
      checkoutLeads: leadRows.length,
      recoveredLeads: leadRows.filter((lead) => Boolean(lead.recovered_order_id)).length,
      tiktokClicks: countUnique(clickIds.map((row) => row.ttclid)),
      googleClicks: countUnique(clickIds.map((row) => row.gclid)),
      metaClicks: countUnique(clickIds.map((row) => row.fbclid)),
      abandoned30mSent: leadRows.filter((lead) => Boolean(lead.abandoned_cart_30m_sent_at)).length,
      abandoned6hSent: leadRows.filter((lead) => Boolean(lead.abandoned_cart_6h_sent_at)).length,
      abandoned24hSent: leadRows.filter((lead) => Boolean(lead.abandoned_cart_24h_sent_at)).length,
    },
    sources: Array.from(sourceMap.values()).sort((a, b) => b.events + b.revenue - (a.events + a.revenue)).slice(0, 8),
    campaigns: Array.from(campaignMap.values()).sort((a, b) => b.events + b.revenue - (a.events + a.revenue)).slice(0, 8),
    recentEvents: eventRows.slice(0, 30),
  }
}
