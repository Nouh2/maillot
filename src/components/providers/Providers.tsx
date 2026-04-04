'use client'

import { Suspense, useEffect } from 'react'
import { AnalyticsManager } from '@/components/providers/AnalyticsManager'
import { useCartStore } from '@/store/cart'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <AnalyticsManager />
      </Suspense>
    </>
  )
}
