'use client'

import Link from 'next/link'
import { CheckoutContactFields } from '@/components/cart/CheckoutContactFields'
import { CheckoutButton } from '@/components/cart/CheckoutButton'
import { CartItem } from '@/components/cart/CartItem'
import { formatEuro, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_PRICE } from '@/lib/cartPricing'
import { LOYALTY_CODE } from '@/lib/siteConfig'
import { useCartStore } from '@/store/cart'
import { MobileCheckoutBar } from '@/components/cart/MobileCheckoutBar'

export default function CartPage() {
  const { items, subtotal, bundleDiscount, loyaltyDiscount, discountedSubtotal, shippingTotal, total, itemCount, freeItemsCount, freeShippingUnlocked } = useCartStore()
  const quantity = itemCount()
  const freeItems = freeItemsCount()
  const shipping = shippingTotal()
  const shippingUnlocked = freeShippingUnlocked()

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
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Resume</p>
            <h2 className="mt-3 font-bebas text-4xl text-[var(--black)]">Ta commande</h2>

            <div className="mt-6 space-y-3 border-t border-[var(--cream-3)] pt-5">
              <div className="flex items-center justify-between text-sm text-[var(--grey)]">
                <span>Sous-total</span>
                <span>{formatEuro(subtotal())}</span>
              </div>
              {bundleDiscount() > 0 ? (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span>{freeItems} maillot{freeItems > 1 ? 's' : ''} offert{freeItems > 1 ? 's' : ''}</span>
                  <span>-{formatEuro(bundleDiscount())}</span>
                </div>
              ) : null}
              {loyaltyDiscount() > 0 ? (
                <div className="flex items-center justify-between text-sm text-[var(--terra)]">
                  <span>Code {LOYALTY_CODE}</span>
                  <span>-{formatEuro(loyaltyDiscount())}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-sm text-[var(--grey)]">
                <span>Sous-total remisé</span>
                <span>{formatEuro(discountedSubtotal())}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--grey)]">
                <span>Livraison</span>
                <span>{shippingUnlocked ? 'Offerte' : formatEuro(shipping)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--cream-3)] pt-3 font-condensed text-lg uppercase tracking-[0.08em] text-[var(--black)]">
                <span>Total</span>
                <span className="font-bold">{formatEuro(total())}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[var(--cream)] p-4 text-sm text-[var(--black)]">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Offres panier</p>
              <p className="mt-2">Livraison {shippingUnlocked ? 'offerte debloquee' : `offerte des ${formatEuro(FREE_SHIPPING_THRESHOLD)} d achats`}.</p>
              <p className="mt-1">En dessous du seuil, les frais de port sont de {formatEuro(STANDARD_SHIPPING_PRICE)}.</p>
              <p className="mt-1">Achete 2 maillots, le 3e le moins cher passe automatiquement offert.</p>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--terra)]/20 bg-[var(--terra-lt)] px-4 py-4 text-sm text-[var(--black)]">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Offre fidelite</p>
              <p className="mt-2">
                Cree ton compte et profite de <strong>-10 %</strong> sur ta premiere commande avec le code <strong>{LOYALTY_CODE}</strong>, valable une fois par email.
              </p>
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
              Le flocage est facture {formatEuro(5)} par maillot. Les patchs selectionnes restent ajoutes article par article.
            </p>
          </section>
        </aside>
      </div>

      {/* Barre sticky mobile */}
      <MobileCheckoutBar />
    </div>
  )
}
