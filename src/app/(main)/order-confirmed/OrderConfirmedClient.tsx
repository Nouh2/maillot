'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/tracking'
import { useCartStore } from '@/store/cart'
import type { Order } from '@/types/order'

interface OrderConfirmedClientProps {
  purchase?: {
    dedupeKey: string
    orderNumber: string
    value: number
    items: Order['items']
    sourceChannel?: string | null
  }
}

export function OrderConfirmedClient({ purchase }: OrderConfirmedClientProps) {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  useEffect(() => {
    if (!purchase) return

    trackPurchase(purchase)
  }, [purchase])

  return null
}
