'use client'

import { CheckoutButton } from './CheckoutButton'
import { formatEuro } from '@/lib/cartPricing'
import { useCartStore } from '@/store/cart'

export function MobileCheckoutBar() {
  const { items, total, itemCount } = useCartStore()
  const quantity = itemCount()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--cream-3)] bg-white px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">
          {quantity} maillot{quantity > 1 ? 's' : ''}
        </span>
        <span className="font-condensed text-lg font-bold text-[var(--black)]">
          {formatEuro(total())}
        </span>
      </div>
      <CheckoutButton />
    </div>
  )
}
