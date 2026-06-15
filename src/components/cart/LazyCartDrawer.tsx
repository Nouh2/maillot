'use client'

import dynamic from 'next/dynamic'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types/product'

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer').then((mod) => mod.CartDrawer), {
  ssr: false,
  loading: () => null,
})

export function LazyCartDrawer({ packSuggestions }: { packSuggestions: Product[] }) {
  const isOpen = useCartStore((state) => state.isOpen)

  return isOpen ? <CartDrawer packSuggestions={packSuggestions} /> : null
}
