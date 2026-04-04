'use client'

export type StoredAttribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  source_channel?: string
}

const CONSENT_STORAGE_KEY = 'kitlab-consent'
const ATTRIBUTION_STORAGE_KEY = 'kitlab-attribution'
const CONSENT_COOKIE_KEY = 'kitlab_consent'
const CONSENT_CHANGE_EVENT = 'kitlab-consent-change'

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

  const currentDataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? []
  currentDataLayer.push({ event: name, ...params })
  ;(window as Window & { dataLayer?: unknown[] }).dataLayer = currentDataLayer
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
