'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { formatEuro } from '@/lib/cartPricing'
import { LOYALTY_CODE } from '@/lib/siteConfig'
import { CartItem } from './CartItem'
import { CheckoutButton } from './CheckoutButton'
import { CheckoutContactFields } from './CheckoutContactFields'

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, shippingTotal, total } = useCartStore()

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />
      ) : null}

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-all duration-300 ${
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--cream-3)] p-6">
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

        <div className="flex-1 overflow-y-auto px-6">
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
          <div className="space-y-4 border-t border-[var(--cream-3)] p-6">
            <div className="space-y-2 rounded-2xl bg-[var(--cream)] p-4">
              <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--grey)]">
                <span>Sous-total</span>
                <span>{formatEuro(subtotal())}</span>
              </div>
              <div className="flex justify-between font-condensed text-sm tracking-wide text-[var(--grey)]">
                <span>Livraison</span>
                <span>{formatEuro(shippingTotal())}</span>
              </div>
              <div className="flex justify-between font-condensed text-lg tracking-wide text-[var(--black)]">
                <span>Total</span>
                <span className="font-bold">{formatEuro(total())}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--terra)]/20 bg-[var(--terra-lt)] px-4 py-3 text-center">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Compte fidelite</p>
              <p className="mt-1 text-sm text-[var(--black)]">
                Cree ton compte et utilise le code <strong>{LOYALTY_CODE}</strong> sur ta premiere commande.
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
