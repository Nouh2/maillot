'use client'

import Link from 'next/link'
import { CreditCard, Truck } from 'lucide-react'
import { FREE_SHIPPING_MIN_ITEMS } from '@/lib/cartPricing'
import { useCartStore } from '@/store/cart'

function pluralizeMaillot(count: number) {
  return `maillot${count > 1 ? 's' : ''}`
}

export function CartBundleOffer({ compact = false }: { compact?: boolean }) {
  const { itemCount, freeShippingUnlocked } = useCartStore()
  const quantity = itemCount()
  const shippingUnlocked = freeShippingUnlocked()
  const neededForShipping = Math.max(0, FREE_SHIPPING_MIN_ITEMS - quantity)
  const progressCount = Math.min(quantity, FREE_SHIPPING_MIN_ITEMS)
  const progress = quantity <= 0 ? 0 : Math.min(100, (progressCount / FREE_SHIPPING_MIN_ITEMS) * 100)

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--cream-3)] bg-white text-[var(--black)] shadow-[0_18px_40px_rgba(28,23,18,0.1)]">
      <div className="relative p-4">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[var(--terra-lt)]" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--terra)] text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-condensed text-[11px] uppercase tracking-[0.2em] text-[var(--terra)]">Bundle 3 maillots</p>
              {shippingUnlocked ? (
                <span className="rounded-full border border-[var(--terra)]/15 bg-[var(--terra-lt)] px-2 py-0.5 font-condensed text-[10px] uppercase tracking-[0.14em] text-[var(--terra)]">
                  Débloquée
                </span>
              ) : null}
            </div>

            <h3 className="mt-1 font-bebas text-3xl leading-none tracking-wide">
              3 maillots achetés = livraison offerte
            </h3>

            <p className="mt-2 text-sm leading-snug text-[var(--grey)]">
              {shippingUnlocked
                ? 'Livraison offerte active. Chaque maillot reste facturé au prix normal.'
                : `Ajoute ${neededForShipping} ${pluralizeMaillot(neededForShipping)} pour débloquer la livraison offerte.`}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="mb-2 flex items-center justify-between font-condensed text-[11px] uppercase tracking-[0.16em] text-[var(--grey)]">
            <span>Livraison offerte</span>
            <span>{progressCount}/{FREE_SHIPPING_MIN_ITEMS}</span>
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
            <CreditCard className="mb-2 h-4 w-4 text-[var(--terra)]" />
            <p className="font-condensed text-xs uppercase tracking-[0.16em]">Maillots</p>
            <p className="mt-1 text-xs text-[var(--grey)]">Tous facturés</p>
          </div>
        </div>

        {!compact && !shippingUnlocked ? (
          <Link
            href="/shop"
            className="relative mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--terra)] px-4 py-3 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-white transition-transform active:scale-[0.98]"
          >
            Compléter mon pack
          </Link>
        ) : null}
      </div>
    </section>
  )
}
