'use client'

import { track as trackVercelEvent } from '@vercel/analytics'
import type { CartItem } from '@/types/cart'
import type { Order } from '@/types/order'

export type StoredAttribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  fbclid?: string
  ttclid?: string
  source_channel?: string
  referrer_host?: string
}

type TrackingParams = Record<string, unknown>
type FlatTrackingValue = string | number | boolean | null | undefined
type CommerceItem = CartItem | Order['items'][number]

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  ttq?: TikTokAnalyticsQueue
}

type TikTokAnalyticsQueue = unknown[] & {
  page?: () => void
  track?: (name: string, params?: Record<string, unknown>) => void
}

interface AddToCartTrackingParams {
  productId: string
  productName: string
  club?: string | null
  quantity: number
  size: string
  patchCount: number
  hasFlocage: boolean
  unitPrice: number
  value: number
}

interface BeginCheckoutTrackingParams {
  items: CartItem[]
  value: number
  marketingOptIn: boolean
  promoCode?: string | null
}

interface PurchaseTrackingParams {
  dedupeKey: string
  orderNumber: string
  value: number
  items: Order['items']
  sourceChannel?: string | null
}

const CONSENT_STORAGE_KEY = 'kitlab-consent'
const ATTRIBUTION_STORAGE_KEY = 'kitlab-attribution'
const CONSENT_COOKIE_KEY = 'kitlab_consent'
const CONSENT_CHANGE_EVENT = 'kitlab-consent-change'
const TRACKED_EVENT_STORAGE_KEY_PREFIX = 'kitlab-tracked-event:'
const MARKETING_SESSION_STORAGE_KEY = 'kitlab-marketing-session'

function getConsentVersion(): string {
  return process.env.NEXT_PUBLIC_COOKIE_CONSENT_VERSION || 'v1'
}

function getStorageSafe(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function getTrackedEventStorageKey(key: string) {
  return `${TRACKED_EVENT_STORAGE_KEY_PREFIX}${key}`
}

function hasTrackedEvent(key: string) {
  const storage = getStorageSafe()
  if (!storage) return false

  return storage.getItem(getTrackedEventStorageKey(key)) === '1'
}

function markTrackedEvent(key: string) {
  const storage = getStorageSafe()
  if (!storage) return

  storage.setItem(getTrackedEventStorageKey(key), '1')
}

function toCommerceItems(items: CommerceItem[]) {
  return items.map((item) => ({
    item_id: item.product_id,
    item_name: item.name,
    item_category: 'club' in item ? item.club : null,
    item_variant: item.size,
    price: roundCurrency(item.price),
    quantity: item.qty,
    patch_count: item.patches?.length ?? 0,
    has_flocage: Boolean(item.flocage_name || item.flocage_number),
  }))
}

function getItemCount(items: CommerceItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

function toFlatTrackingParams(params: TrackingParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      )
    }),
  ) as Record<string, FlatTrackingValue>
}

function pushToDataLayer(name: string, params: TrackingParams = {}) {
  const currentDataLayer = (window as AnalyticsWindow).dataLayer ?? []
  currentDataLayer.push({ event: name, ...params })
  ;(window as AnalyticsWindow).dataLayer = currentDataLayer
}

function sendToGtag(name: string, params: TrackingParams = {}) {
  const analyticsWindow = window as AnalyticsWindow

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? []
  analyticsWindow.gtag =
    analyticsWindow.gtag ??
    function gtag(...args: unknown[]) {
      analyticsWindow.dataLayer?.push(args)
    }

  analyticsWindow.gtag('event', name, params)
}

function getTikTokPixelId() {
  return process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim()
}

function toTikTokContents(items: unknown) {
  if (!Array.isArray(items)) return undefined

  return items.map((item) => {
    if (!item || typeof item !== 'object') return {}

    const record = item as Record<string, unknown>
    return {
      content_id: record.item_id,
      content_name: record.item_name,
      content_category: record.item_category,
      price: record.price,
      quantity: record.quantity,
    }
  })
}

function toTikTokPayload(params: TrackingParams = {}) {
  const contents = toTikTokContents(params.items)

  return {
    currency: params.currency,
    value: params.value,
    content_type: 'product',
    content_id: params.product_id ?? params.product_ids,
    content_name: params.product_name,
    contents,
    quantity: params.quantity ?? params.item_count,
    order_id: params.transaction_id ?? params.order_number,
  }
}

function sendToTikTok(name: string, params: TrackingParams = {}) {
  if (!getTikTokPixelId()) return

  const analyticsWindow = window as AnalyticsWindow
  if (!analyticsWindow.ttq) {
    const queue = [] as TikTokAnalyticsQueue
    queue.page = () => queue.push(['page'])
    queue.track = (eventName, eventParams) => queue.push(['track', eventName, eventParams])
    analyticsWindow.ttq = queue
  }

  const ttq = analyticsWindow.ttq
  if (name === 'page_view') {
    ttq.page?.()
    return
  }

  const eventMap: Record<string, string> = {
    product_view: 'ViewContent',
    add_to_cart: 'AddToCart',
    begin_checkout: 'InitiateCheckout',
    purchase: 'Purchase',
  }
  const tiktokEventName = eventMap[name]
  if (!tiktokEventName) return

  ttq.track?.(tiktokEventName, toTikTokPayload(params))
}

function sendToVercel(name: string, params: TrackingParams = {}) {
  if (name === 'page_view') return

  trackVercelEvent(name, toFlatTrackingParams(params))
}

function getMarketingSessionId(): string | null {
  const storage = getStorageSafe()
  if (!storage) return null

  const existing = storage.getItem(MARKETING_SESSION_STORAGE_KEY)
  if (existing) return existing

  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  storage.setItem(MARKETING_SESSION_STORAGE_KEY, sessionId)
  return sessionId
}

function sendToFirstPartyAnalytics(name: string, params: TrackingParams = {}) {
  const payload = JSON.stringify({
    event_name: name,
    page_path: window.location.pathname,
    page_location: window.location.href,
    session_id: getMarketingSessionId(),
    attribution: getStoredAttribution(),
    params,
  })

  if ('sendBeacon' in navigator) {
    const sent = navigator.sendBeacon('/api/marketing-events', new Blob([payload], { type: 'application/json' }))
    if (sent) return
  }

  fetch('/api/marketing-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

export function getTrackingConsent(): 'granted' | 'denied' | null {
  const storage = getStorageSafe()
  if (!storage) return null

  const raw = storage.getItem(CONSENT_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { version?: string; value?: 'granted' | 'denied' }
    if (parsed.version !== getConsentVersion()) return null
    return parsed.value ?? null
  } catch {
    return null
  }
}

export function setTrackingConsent(value: 'granted' | 'denied') {
  const storage = getStorageSafe()
  if (storage) {
    storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ version: getConsentVersion(), value }))
  }

  if (typeof document !== 'undefined') {
    document.cookie = `${CONSENT_COOKIE_KEY}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT))
  }
}

export function hasTrackingConsent(): boolean {
  return getTrackingConsent() === 'granted'
}

function getExternalReferrerHost(): string | null {
  if (typeof document === 'undefined' || !document.referrer) return null

  try {
    const referrer = new URL(document.referrer)
    if (referrer.hostname === window.location.hostname) return null
    return referrer.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

function getReferrerAttribution(host: string): Pick<StoredAttribution, 'utm_source' | 'utm_medium' | 'source_channel' | 'referrer_host'> | null {
  if (host.includes('checkout.stripe.com')) return null

  if (host.includes('google.')) {
    return { utm_source: 'google', utm_medium: 'organic', source_channel: 'google', referrer_host: host }
  }

  if (host.includes('bing.')) {
    return { utm_source: 'bing', utm_medium: 'organic', source_channel: 'bing', referrer_host: host }
  }

  if (host.includes('chatgpt.com')) {
    return { utm_source: 'chatgpt.com', utm_medium: 'referral', source_channel: 'chatgpt.com', referrer_host: host }
  }

  if (host.includes('tiktok.com')) {
    return { utm_source: 'tiktok', utm_medium: 'referral', source_channel: 'tiktok', referrer_host: host }
  }

  return { utm_source: host, utm_medium: 'referral', source_channel: host, referrer_host: host }
}

export function captureAttribution(searchParams: URLSearchParams) {
  if (!hasTrackingConsent()) return

  const utmSource = searchParams.get('utm_source')?.trim()
  const utmMedium = searchParams.get('utm_medium')?.trim()
  const utmCampaign = searchParams.get('utm_campaign')?.trim()
  const utmContent = searchParams.get('utm_content')?.trim()
  const utmTerm = searchParams.get('utm_term')?.trim()
  const gclid = searchParams.get('gclid')?.trim()
  const fbclid = searchParams.get('fbclid')?.trim()
  const ttclid = searchParams.get('ttclid')?.trim()

  const storage = getStorageSafe()
  if (!storage) return

  const hasExplicitAttribution = Boolean(utmSource || utmMedium || utmCampaign || utmContent || utmTerm || gclid || fbclid || ttclid)
  const existingAttribution = getStoredAttribution()
  const referrerHost = getExternalReferrerHost()
  const referrerAttribution = !hasExplicitAttribution && referrerHost ? getReferrerAttribution(referrerHost) : null

  if (!hasExplicitAttribution && !referrerAttribution) return
  if (!hasExplicitAttribution && existingAttribution.source_channel && existingAttribution.source_channel !== 'direct') return

  const sourceChannel = utmSource || (gclid ? 'google' : fbclid ? 'meta' : ttclid ? 'tiktok' : 'direct')

  const payload: StoredAttribution = {
    ...referrerAttribution,
    ...(utmSource ? { utm_source: utmSource } : {}),
    ...(utmMedium ? { utm_medium: utmMedium } : {}),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(utmContent ? { utm_content: utmContent } : {}),
    ...(utmTerm ? { utm_term: utmTerm } : {}),
    ...(gclid ? { gclid } : {}),
    ...(fbclid ? { fbclid } : {}),
    ...(ttclid ? { ttclid } : {}),
    source_channel: hasExplicitAttribution ? sourceChannel : referrerAttribution?.source_channel ?? sourceChannel,
  }

  storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(payload))
}

export function getStoredAttribution(): StoredAttribution {
  if (!hasTrackingConsent()) return {}

  const storage = getStorageSafe()
  if (!storage) return {}

  const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as StoredAttribution
  } catch {
    return {}
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!hasTrackingConsent() || typeof window === 'undefined') return

  pushToDataLayer(name, params)
  sendToGtag(name, params)
  sendToTikTok(name, params)
  sendToVercel(name, params)
  sendToFirstPartyAnalytics(name, params)
}

export function trackAddToCart({
  productId,
  productName,
  club,
  quantity,
  size,
  patchCount,
  hasFlocage,
  unitPrice,
  value,
}: AddToCartTrackingParams) {
  const payload = {
    currency: 'EUR',
    value: roundCurrency(value),
    product_id: productId,
    product_name: productName,
    item_count: quantity,
    quantity,
    size,
    club: club ?? null,
    patch_count: patchCount,
    has_flocage: hasFlocage,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: club ?? null,
        item_variant: size,
        price: roundCurrency(unitPrice),
        quantity,
        patch_count: patchCount,
        has_flocage: hasFlocage,
      },
    ],
  }

  trackEvent('add_to_cart', payload)
}

export function trackBeginCheckout({
  items,
  value,
  marketingOptIn,
  promoCode,
}: BeginCheckoutTrackingParams) {
  const itemCount = getItemCount(items)
  const payload = {
    currency: 'EUR',
    value: roundCurrency(value),
    item_count: itemCount,
    unique_items: items.length,
    product_ids: items.map((item) => item.product_id).join(','),
    marketing_opt_in: marketingOptIn,
    promo_code: promoCode ?? null,
    items: toCommerceItems(items),
  }

  trackEvent('begin_checkout', payload)
}

export function trackPurchase({ dedupeKey, orderNumber, value, items, sourceChannel }: PurchaseTrackingParams) {
  if (!hasTrackingConsent() || typeof window === 'undefined') return
  if (hasTrackedEvent(dedupeKey)) return

  const itemCount = getItemCount(items)
  const payload = {
    currency: 'EUR',
    transaction_id: orderNumber,
    order_number: orderNumber,
    value: roundCurrency(value),
    item_count: itemCount,
    unique_items: items.length,
    product_ids: items.map((item) => item.product_id).join(','),
    source_channel: sourceChannel ?? null,
    items: toCommerceItems(items),
  }

  trackEvent('purchase', payload)
  markTrackedEvent(dedupeKey)
}

export function subscribeToTrackingConsent(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handleChange = () => onChange()

  window.addEventListener('storage', handleChange)
  window.addEventListener(CONSENT_CHANGE_EVENT, handleChange)

  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange)
  }
}
