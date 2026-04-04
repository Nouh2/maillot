'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/tracking'

export function TrackEventOnMount({
  event,
  params,
}: {
  event: string
  params?: Record<string, unknown>
}) {
  useEffect(() => {
    trackEvent(event, params)
  }, [event, params])

  return null
}
