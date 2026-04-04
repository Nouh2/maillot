export type AttributionPayload = {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  source_channel?: string | null
}

export function normalizeAttributionPayload(value: unknown): AttributionPayload {
  if (!value || typeof value !== 'object') {
    return {}
  }

  const record = value as Record<string, unknown>

  function pick(key: keyof AttributionPayload) {
    const raw = record[key]
    return typeof raw === 'string' && raw.trim() ? raw.trim() : null
  }

  return {
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_content: pick('utm_content'),
    source_channel: pick('source_channel'),
  }
}

export async function syncLeadToBrevo(params: {
  email: string
  marketingOptIn: boolean
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const listId = process.env.BREVO_MARKETING_LIST_ID?.trim()

  if (!apiKey || !listId || !params.marketingOptIn) {
    return false
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: params.email,
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    })

    if (!response.ok && response.status !== 400) {
      console.error('Brevo sync failed:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Brevo sync error:', error)
    return false
  }
}
