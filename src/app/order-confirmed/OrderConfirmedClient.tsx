'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'

export function OrderConfirmedClient() {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return null
}
