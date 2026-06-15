'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { CheckoutContactFields } from '@/components/cart/CheckoutContactFields'
import { CheckoutButton } from '@/components/cart/CheckoutButton'
import { CartItem } from '@/components/cart/CartItem'
import { calculateCartPricing, formatEuro } from '@/lib/cartPricing'
import { isSupportedPromoCode, normalizePromoCode } from '@/lib/promoCodes'
import { useCartStore } from '@/store/cart'
import { MobileCheckoutBar } from '@/components/cart/MobileCheckoutBar'
import { CartBundleOffer } from '@/components/cart/CartBundleOffer'

export default function CartPage() {
  const { items, subtotal, discountTotal, total, itemCount, promoCode, setPromoCode } = useCartStore()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const quantity = itemCount()
  const discount = discountTotal()
  const pricing = calculateCartPricing(items, { promoCode })

  const handlePromoSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = normalizePromoCode(promoInput)

    if (isSupportedPromoCode(code)) {
      setPromoCode(code)
      setPromoInput('')
      setPromoError('')
      return
    }

    setPromoError('Code promo invalide ou expiré.')
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] px-4 py-12 text-center">
        <p className="mb-2 font-condensed text-xs uppercase tracking-[4px] text-[var(--terra)]">Commande</p>
        <h1 className="font-bebas text-6xl text-white md:text-7xl">MON PANIER</h1>
        <p className="mt-2 text-[var(--grey-lt)]">{quantity} maillot{quantity > 1 ? 's' : ''} dans la commande</p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="order-2 rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8 lg:order-1">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-bebas text-4xl text-[var(--cream-3)]">Panier vide</p>
              <p className="mt-3 text-sm text-[var(--grey)]">Ajoute tes maillots avant de passer commande.</p>
              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-full bg-[var(--black)] px-6 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)]"
              >
                Retour au shop
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={`${item.product_id}-${item.size}-${item.flocage_name ?? ''}-${item.flocage_number ?? ''}`} item={item} />
              ))}
            </div>
          )}
        </section>

        <aside className="order-1 space-y-5 pb-24 lg:order-2 lg:pb-0">
          {items.length > 0 ? <CartBundleOffer /> : null}

          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Resume</p>
            <h2 className="mt-3 font-bebas text-4xl text-[var(--black)]">Ta commande</h2>

            <div className="mt-6 space-y-3 border-t border-[var(--cream-3)] pt-5">
              <div className="flex items-center justify-between text-sm text-[var(--grey)]">
                <span>Sous-total</span>
                <span>{formatEuro(subtotal())}</span>
              </div>
              {discount > 0 ? (
                <div className="flex items-center justify-between text-sm text-[var(--terra)]">
                  <span>{pricing.discountSource === 'promo_code' ? `Code ${pricing.promoCode}` : 'Remise pack'}</span>
                  <span>-{formatEuro(discount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-[var(--cream-3)] pt-3 font-condensed text-lg uppercase tracking-[0.08em] text-[var(--black)]">
                <span>Total</span>
                <span className="font-bold">{formatEuro(total())}</span>
              </div>
            </div>

            <form onSubmit={handlePromoSubmit} className="mt-5 rounded-2xl border border-[var(--cream-3)] bg-white p-4">
              <label htmlFor="promo-code" className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">
                Code promo
              </label>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  id="promo-code"
                  type="text"
                  value={promoInput}
                  onChange={(event) => {
                    setPromoInput(event.target.value)
                    setPromoError('')
                  }}
                  placeholder="ADDICT10"
                  className="min-h-11 w-full rounded-full border border-[var(--cream-3)] bg-[var(--cream)] px-4 text-sm font-semibold uppercase tracking-[0.08em] outline-none transition-colors focus:border-[var(--black)]"
                  autoCapitalize="characters"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="min-h-11 rounded-full bg-[var(--black)] px-4 font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--terra)]"
                >
                  Appliquer
                </button>
              </div>
              {promoCode ? (
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--terra)]">
                  <span>Code {promoCode} enregistré. Le panier garde la meilleure remise entre code et pack.</span>
                  <button
                    type="button"
                    onClick={() => setPromoCode(null)}
                    className="shrink-0 font-condensed font-bold uppercase tracking-[0.12em] text-[var(--black)] underline underline-offset-4"
                  >
                    Retirer
                  </button>
                </div>
              ) : null}
              {promoError ? <p className="mt-2 text-xs font-semibold text-red-700">{promoError}</p> : null}
            </form>

            <div className="mt-6 rounded-2xl bg-[var(--cream)] p-4 text-sm text-[var(--black)]">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Offres panier</p>
              <p className="mt-2">Livraison incluse sur toutes les commandes.</p>
              <p className="mt-1">2 maillots : -5 EUR. Dès 3 maillots : le moins cher par tranche de 3 passe à -50%.</p>
              {pricing.discountSource === 'promo_code' ? (
                <p className="mt-1 text-[var(--terra)]">Code {pricing.promoCode} appliqué car plus avantageux que la remise pack.</p>
              ) : null}
            </div>

            <div className="mt-4">
              <CheckoutContactFields />
            </div>

            <CheckoutButton className="mt-6" />
          </section>

          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Rappel</p>
            <h2 className="mt-3 font-bebas text-4xl text-[var(--black)]">Personnalisation</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--grey)]">
              Le flocage est facturé {formatEuro(5)} par maillot. Les patchs sélectionnés restent ajoutés article par article.
            </p>
          </section>
        </aside>
      </div>

      <MobileCheckoutBar />
    </div>
  )
}
