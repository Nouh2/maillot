'use client'

import Link from 'next/link'
import { BadgePercent, Gift, Truck } from 'lucide-react'
import {
  BUNDLE_CYCLE_ITEM_COUNT,
  FREE_SHIPPING_MIN_ITEMS,
  calculateBundleFreeItemCount,
  formatEuro,
} from '@/lib/cartPricing'
import { useCartStore } from '@/store/cart'

function pluralizeMaillot(count: number) {
  return `maillot${count > 1 ? 's' : ''}`
}

export function CartBundleOffer({ compact = false }: { compact?: boolean }) {
  const { itemCount, discountTotal, bundleDiscountTotal, bundleFreeItemCount, freeShippingUnlocked } = useCartStore()
  const quantity = itemCount()
  const discount = discountTotal()
  const bundleDiscount = bundleDiscountTotal()
  const freeItems = bundleFreeItemCount()
  const shippingUnlocked = freeShippingUnlocked()
  const nextBundleRemainder = quantity % BUNDLE_CYCLE_ITEM_COUNT
  const neededForBundle = nextBundleRemainder === 0 ? BUNDLE_CYCLE_ITEM_COUNT : BUNDLE_CYCLE_ITEM_COUNT - nextBundleRemainder
  const neededForShipping = Math.max(0, FREE_SHIPPING_MIN_ITEMS - quantity)
  const cycleProgressCount = quantity <= 0 ? 0 : nextBundleRemainder === 0 ? BUNDLE_CYCLE_ITEM_COUNT : nextBundleRemainder
  const progress = quantity <= 0 ? 0 : Math.min(100, (cycleProgressCount / BUNDLE_CYCLE_ITEM_COUNT) * 100)
  const nextFreeItems = calculateBundleFreeItemCount(quantity + neededForBundle)
  const nextAdditionalFreeItems = Math.max(0, nextFreeItems - freeItems)

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--cream-3)] bg-white text-[var(--black)] shadow-[0_18px_40px_rgba(28,23,18,0.1)]">
      <div className="relative p-4">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[var(--terra-lt)]" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--terra)] text-white">
            <Gift className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-condensed text-[11px] uppercase tracking-[0.2em] text-[var(--terra)]">Offre coupe du monde</p>
              {freeItems > 0 ? (
                <span className="rounded-full border border-[var(--terra)]/15 bg-[var(--terra-lt)] px-2 py-0.5 font-condensed text-[10px] uppercase tracking-[0.14em] text-[var(--terra)]">
                  Débloquée
                </span>
              ) : null}
            </div>

            <h3 className="mt-1 font-bebas text-3xl leading-none tracking-wide">
              {freeItems > 0
                ? `${freeItems} ${pluralizeMaillot(freeItems)} offert${freeItems > 1 ? 's' : ''}`
                : 'Pack de 4: 1 maillot offert'}
            </h3>

            <p className="mt-2 text-sm leading-snug text-[var(--grey)]">
              {freeItems > 0
                ? `${formatEuro(bundleDiscount)} économisés automatiquement. Encore ${neededForBundle} ${pluralizeMaillot(neededForBundle)} pour obtenir ${nextAdditionalFreeItems} maillot offert de plus.`
                : shippingUnlocked
                  ? `Livraison offerte active. Ajoute ${neededForBundle} ${pluralizeMaillot(neededForBundle)} pour obtenir ${nextFreeItems} offert.`
                  : `Ajoute ${neededForShipping} ${pluralizeMaillot(neededForShipping)} pour débloquer la livraison offerte.`}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="mb-2 flex items-center justify-between font-condensed text-[11px] uppercase tracking-[0.16em] text-[var(--grey)]">
            <span>{freeItems > 0 ? 'Prochain maillot offert' : `Offre pack de ${BUNDLE_CYCLE_ITEM_COUNT}`}</span>
            <span>{cycleProgressCount}/{BUNDLE_CYCLE_ITEM_COUNT}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--cream-3)]">
            <div className="h-full rounded-full bg-[var(--terra)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[var(--cream-3)] bg-[var(--cream)] p-3">
            <Truck className="mb-2 h-4 w-4 text-[var(--terra)]" />
            <p className="font-condensed text-xs uppercase tracking-[0.16em]">Livraison</p>
            <p className="mt-1 text-xs text-[var(--grey)]">{shippingUnlocked ? 'Offerte' : `Dès le ${FREE_SHIPPING_MIN_ITEMS}e maillot`}</p>
          </div>
          <div className="rounded-xl border border-[var(--cream-3)] bg-[var(--cream)] p-3">
            <BadgePercent className="mb-2 h-4 w-4 text-[var(--terra)]" />
            <p className="font-condensed text-xs uppercase tracking-[0.16em]">Remise</p>
            <p className="mt-1 text-xs text-[var(--grey)]">{discount > 0 ? `-${formatEuro(discount)}` : 'Auto au panier'}</p>
          </div>
        </div>

        {!compact && freeItems === 0 ? (
          <Link
            href="/shop"
            className="relative mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--terra)] px-4 py-3 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-white transition-transform active:scale-[0.98]"
          >
            Completer mon pack
          </Link>
        ) : null}
      </div>
    </section>
  )
}
