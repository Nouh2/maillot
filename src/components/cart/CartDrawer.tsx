'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatEuro, FREE_SHIPPING_THRESHOLD } from '@/lib/cartPricing'
import { LOYALTY_CODE } from '@/lib/siteConfig'
import { CartItem } from './CartItem'
import { CheckoutButton } from './CheckoutButton'
import { CheckoutContactFields } from './CheckoutContactFields'

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, bundleDiscount, loyaltyDiscount, discountedSubtotal, shippingTotal, total, freeItemsCount, freeShippingUnlocked } = useCartStore()
  const freeItems = freeItemsCount()

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
        <div className="shrink-0 flex items-center justify-between border-b border-[var(--cream-3)] p-6">
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-bebas text-3xl text-[var(--cream-3)]">Panier vide</p>
              <p className="mt-2 text-sm text-[var(--grey)]">Ajoutez des maillots pour commencer</p>
            </div>
          ) : (
            items.map((item) => <CartItem key={`${item.product_id}-${item.size}`} item={item} />)
          )}
        </div>

        {items.length > 0 ? (
          <div className="shrink-0 space-y-4 border-t border-[var(--cream-3)] p-6 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
            <div className="space-y-2 rounded-2xl bg-[var(--cream)] p-4">
              <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--grey)]">
                <span>Sous-total</span>
                <span>{formatEuro(subtotal())}</span>
              </div>
              {bundleDiscount() > 0 ? (
                <div className="flex justify-between font-condensed text-sm tracking-wide text-emerald-700">
                  <span>{freeItems} maillot{freeItems > 1 ? 's' : ''} offert{freeItems > 1 ? 's' : ''}</span>
                  <span>-{formatEuro(bundleDiscount())}</span>
                </div>
              ) : null}
              {loyaltyDiscount() > 0 ? (
                <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--terra)]">
                  <span>Code {LOYALTY_CODE}</span>
                  <span>-{formatEuro(loyaltyDiscount())}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--grey)]">
                <span>Sous-total remisé</span>
                <span>{formatEuro(discountedSubtotal())}</span>
              </div>
              <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--grey)]">
                <span>Livraison</span>
                <span>{freeShippingUnlocked() ? 'Offerte' : formatEuro(shippingTotal())}</span>
              </div>
              <div className="flex justify-between font-condensed text-lg tracking-wide text-[var(--black)]">
                <span>Total</span>
                <span className="font-bold">{formatEuro(total())}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--terra)]/20 bg-[var(--terra-lt)] px-4 py-3 text-center">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Compte fidelite</p>
              <p className="mt-1 text-sm text-[var(--black)]">
                Code <strong>{LOYALTY_CODE}</strong> reserve a la premiere commande. Livraison offerte des {formatEuro(FREE_SHIPPING_THRESHOLD)} d achats.
              </p>
            </div>

            <Link
              href="/panier"
              onClick={closeCart}
              className="block text-center font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)] underline underline-offset-4"
            >
              Voir le panier detaille
            </Link>

            <CheckoutContactFields compact />

            <CheckoutButton />
          </div>
        ) : null}
      </div>
    </>
  )
}
