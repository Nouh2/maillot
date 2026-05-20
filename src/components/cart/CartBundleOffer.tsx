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
  const progressTarget = freeItems > 0 ? BUNDLE_CYCLE_ITEM_COUNT : Math.max(FREE_SHIPPING_MIN_ITEMS, BUNDLE_CYCLE_ITEM_COUNT)
  const progress = quantity <= 0 ? 0 : Math.min(100, (Math.min(quantity, progressTarget) / progressTarget) * 100)
  const nextFreeItems = calculateBundleFreeItemCount(quantity + neededForBundle)

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--black)] bg-[var(--black)] text-white shadow-[0_18px_40px_rgba(28,23,18,0.16)]">
      <div className="relative p-4">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#b7ff1a]/15" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b7ff1a] text-[var(--black)]">
            <Gift className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-condensed text-[11px] uppercase tracking-[0.2em] text-[#b7ff1a]">Offre bundle</p>
              {freeItems > 0 ? (
                <span className="rounded-full border border-[#b7ff1a]/30 bg-[#b7ff1a]/15 px-2 py-0.5 font-condensed text-[10px] uppercase tracking-[0.14em] text-[#b7ff1a]">
                  Debloquee
                </span>
              ) : null}
            </div>

            <h3 className="mt-1 font-bebas text-3xl leading-none tracking-wide">
              {freeItems > 0
                ? `${freeItems} ${pluralizeMaillot(freeItems)} offert${freeItems > 1 ? 's' : ''}`
                : '3 achetes = 4e offert'}
            </h3>

            <p className="mt-2 text-sm leading-snug text-white/70">
              {freeItems > 0
                ? `${formatEuro(bundleDiscount)} economises automatiquement sur ce panier.`
                : shippingUnlocked
                  ? `Ajoute ${neededForBundle} ${pluralizeMaillot(neededForBundle)} pour obtenir ${nextFreeItems} offert.`
                  : `Ajoute ${neededForShipping} ${pluralizeMaillot(neededForShipping)} pour debloquer la livraison offerte.`}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="mb-2 flex items-center justify-between font-condensed text-[11px] uppercase tracking-[0.16em] text-white/55">
            <span>{shippingUnlocked ? 'Livraison offerte active' : `Livraison offerte des ${FREE_SHIPPING_MIN_ITEMS}`}</span>
            <span>{Math.min(quantity, freeItems > 0 ? BUNDLE_CYCLE_ITEM_COUNT : progressTarget)}/{freeItems > 0 ? BUNDLE_CYCLE_ITEM_COUNT : progressTarget}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#b7ff1a] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.07] p-3">
            <Truck className="mb-2 h-4 w-4 text-[#b7ff1a]" />
            <p className="font-condensed text-xs uppercase tracking-[0.16em]">Livraison</p>
            <p className="mt-1 text-xs text-white/60">{shippingUnlocked ? 'Offerte' : `Des ${FREE_SHIPPING_MIN_ITEMS} maillots`}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.07] p-3">
            <BadgePercent className="mb-2 h-4 w-4 text-[#b7ff1a]" />
            <p className="font-condensed text-xs uppercase tracking-[0.16em]">Remise</p>
            <p className="mt-1 text-xs text-white/60">{discount > 0 ? `-${formatEuro(discount)}` : 'Auto au panier'}</p>
          </div>
        </div>

        {!compact && freeItems === 0 ? (
          <Link
            href="/shop"
            className="relative mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#b7ff1a] px-4 py-3 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-[var(--black)] transition-transform active:scale-[0.98]"
          >
            Completer mon pack
          </Link>
        ) : null}
      </div>
    </section>
  )
}
