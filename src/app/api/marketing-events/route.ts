import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

const ALLOWED_EVENTS = new Set([
  'page_view',
  'product_view',
  'add_to_cart',
  'begin_checkout',
  'checkout_redirected',
  'purchase',
  'contact_form_submitted',
  'account_magic_link_requested',
])

type UnknownRecord = Record<string, unknown>

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {}
}

function pickString(record: UnknownRecord, key: string, maxLength = 500): string | null {
  const value = record[key]
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return null

  const normalized = String(value).trim()
  if (!normalized) return null
  return normalized.slice(0, maxLength)
}

function pickNumber(record: UnknownRecord, key: string): number | null {
  const value = record[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function pickInteger(record: UnknownRecord, key: string): number | null {
  const value = pickNumber(record, key)
  return value === null ? null : Math.trunc(value)
}

function sanitizePayload(params: UnknownRecord): UnknownRecord {
  const allowedKeys = [
    'currency',
    'value',
    'product_id',
    'product_name',
    'product_ids',
    'item_count',
    'unique_items',
    'quantity',
    'transaction_id',
    'order_number',
    'source_channel',
    'promo_code',
    'marketing_opt_in',
    'size',
    'club',
    'patch_count',
    'has_flocage',
  ]

  return Object.fromEntries(
    allowedKeys
      .filter((key) => key in params)
      .map((key) => [key, params[key]]),
  )
}

export async function POST(request: NextRequest) {
  let body: UnknownRecord

  try {
    const rawBody = await request.text()
    body = rawBody ? JSON.parse(rawBody) as UnknownRecord : {}
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  const eventName = pickString(body, 'event_name', 80)
  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ error: 'Evenement invalide' }, { status: 400 })
  }

  const params = asRecord(body.params)
  const attribution = asRecord(body.attribution)
  const orderNumber = pickString(params, 'order_number', 120) ?? pickString(params, 'transaction_id', 120)

  const payload = {
    event_name: eventName,
    page_path: pickString(body, 'page_path', 500),
    page_location: pickString(body, 'page_location', 1000),
    session_id: pickString(body, 'session_id', 120),
    source_channel:
      pickString(params, 'source_channel', 80) ?? pickString(attribution, 'source_channel', 80),
    utm_source: pickString(attribution, 'utm_source', 160),
    utm_medium: pickString(attribution, 'utm_medium', 160),
    utm_campaign: pickString(attribution, 'utm_campaign', 220),
    utm_content: pickString(attribution, 'utm_content', 220),
    utm_term: pickString(attribution, 'utm_term', 220),
    gclid: pickString(attribution, 'gclid', 500),
    fbclid: pickString(attribution, 'fbclid', 500),
    ttclid: pickString(attribution, 'ttclid', 500),
    value: pickNumber(params, 'value'),
    currency: pickString(params, 'currency', 10),
    item_count: pickInteger(params, 'item_count'),
    product_id: pickString(params, 'product_id', 180),
    product_name: pickString(params, 'product_name', 300),
    product_ids: pickString(params, 'product_ids', 1000),
    order_number: orderNumber,
    event_payload: sanitizePayload(params),
  }

  const { error } = await service().from('marketing_events').insert(payload)
  if (error) {
    console.error('Failed to store marketing event:', error)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
