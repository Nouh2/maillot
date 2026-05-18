'use client'

import dynamic from 'next/dynamic'
import { useCartStore } from '@/store/cart'

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer').then((mod) => mod.CartDrawer), {
  ssr: false,
  loading: () => null,
})

export function LazyCartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen)

  return isOpen ? <CartDrawer /> : null
}
