// src/components/providers/Providers.tsx
'use client'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'

export function Providers({ children }: { children: React.ReactNode }) {
  // Hydrate Zustand après le montage côté client pour éviter les mismatches SSR
  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])
  return <>{children}</>
}
