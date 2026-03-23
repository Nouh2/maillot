'use client'
import { useCartStore } from '@/store/cart'

export function CartButton() {
  const { itemCount, openCart } = useCartStore()
  const count = itemCount()

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-[var(--black)] hover:text-[var(--terra)] transition-colors"
      aria-label={`Panier — ${count} article(s)`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--terra)] text-white text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
