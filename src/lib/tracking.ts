'use client'

import { track as trackVercelEvent } from '@vercel/analytics'
import type { CartItem } from '@/types/cart'
import type { Order } from '@/types/order'

export type StoredAttribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  source_channel?: string
}

type TrackingParams = Record<string, unknown>
type FlatTrackingValue = string | number | boolean | null | undefined
type CommerceItem = CartItem | Order['items'][number]

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
  promoCode?: string
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
  const currentDataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? []
  currentDataLayer.push({ event: name, ...params })
  ;(window as Window & { dataLayer?: unknown[] }).dataLayer = currentDataLayer
}

function sendToVercel(name: string, params: TrackingParams = {}) {
  if (name === 'page_view') return

  trackVercelEvent(name, toFlatTrackingParams(params))
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

export function captureAttribution(searchParams: URLSearchParams) {
  if (!hasTrackingConsent()) return

  const utmSource = searchParams.get('utm_source')?.trim()
  const utmMedium = searchParams.get('utm_medium')?.trim()
  const utmCampaign = searchParams.get('utm_campaign')?.trim()
  const utmContent = searchParams.get('utm_content')?.trim()

  if (!utmSource && !utmMedium && !utmCampaign && !utmContent) return

  const storage = getStorageSafe()
  if (!storage) return

  const payload: StoredAttribution = {
    ...(utmSource ? { utm_source: utmSource } : {}),
    ...(utmMedium ? { utm_medium: utmMedium } : {}),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(utmContent ? { utm_content: utmContent } : {}),
    source_channel: utmSource || 'direct',
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
  sendToVercel(name, params)
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
    promo_code: promoCode?.trim() || null,
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
