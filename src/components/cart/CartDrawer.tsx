'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { calculateCartPricing, formatEuro } from '@/lib/cartPricing'
import { CartBundleOffer } from './CartBundleOffer'
import { CartItem } from './CartItem'
import { CheckoutButton } from './CheckoutButton'
import { CheckoutContactFields } from './CheckoutContactFields'
import type { Product } from '@/types/product'

export function CartDrawer({ packSuggestions = [] }: { packSuggestions?: Product[] }) {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    discountTotal,
    total,
    promoCode,
  } = useCartStore()
  const discount = discountTotal()
  const pricing = calculateCartPricing(items, { promoCode })

  useEffect(() => {
    if (!isOpen) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isOpen])

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-[2px]" onClick={closeCart} />
      ) : null}

      <div
        className={`fixed inset-y-0 right-0 z-[200] flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl transition-all duration-300 overscroll-contain ${
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        }`}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-[var(--cream-3)] p-5 sm:p-6">
          <h2 className="font-bebas text-2xl tracking-widest">Mon Panier</h2>
          <button
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="text-[var(--grey)] transition-colors hover:text-[var(--black)]"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-bebas text-3xl text-[var(--cream-3)]">Panier vide</p>
              <p className="mt-2 text-sm text-[var(--grey)]">Ajoutez des maillots pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)]">
              <div className="px-1">
                {items.map((item) => (
                  <CartItem key={`${item.product_id}-${item.size}-${item.flocage_name ?? ''}-${item.flocage_number ?? ''}`} item={item} />
                ))}
              </div>

              <CartBundleOffer compact packSuggestions={packSuggestions} />

              <div className="space-y-2 rounded-2xl bg-[var(--cream)] p-4">
                <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--grey)]">
                  <span>Sous-total</span>
                  <span>{formatEuro(subtotal())}</span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--terra)]">
                    <span>{pricing.discountSource === 'promo_code' ? `Code ${pricing.promoCode}` : 'Remise pack'}</span>
                    <span>-{formatEuro(discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-condensed text-lg tracking-wide text-[var(--black)]">
                  <span>Total</span>
                  <span className="font-bold">{formatEuro(total())}</span>
                </div>
              </div>

              <Link
                href="/panier"
                onClick={closeCart}
                className="block text-center font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)] underline underline-offset-4"
              >
                Voir le panier détaillé
              </Link>

              <CheckoutContactFields compact />

              <CheckoutButton />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
