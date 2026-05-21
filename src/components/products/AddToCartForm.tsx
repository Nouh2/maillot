'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { BadgePercent, Check, Gift, Minus, Plus, Truck } from 'lucide-react'
import {
  BUNDLE_CYCLE_ITEM_COUNT,
  calculateBundleFreeItemCount,
  FLOCAGE_PRICE,
  FREE_SHIPPING_MIN_ITEMS,
  calculateCartItemUnitPrice,
  formatEuro,
  getProductPricing,
} from '@/lib/cartPricing'
import { normalizeProductTextSeasons } from '@/lib/season'
import { trackAddToCart, trackEvent } from '@/lib/tracking'
import { useCartStore } from '@/store/cart'
import type { Patch, Product } from '@/types/product'
import { cn } from '@/lib/utils'
import { PatchSelector } from './PatchSelector'
import { SizeSelector } from './SizeSelector'

const PAYMENT_METHODS = [
  { name: 'American Express', src: '/payment/amex.svg' },
  { name: 'Apple Pay', src: '/payment/apple-pay.svg' },
  { name: 'Google Pay', src: '/payment/google-pay.svg' },
  { name: 'Mastercard', src: '/payment/mastercard.svg' },
  { name: 'PayPal', src: '/payment/paypal.svg' },
  { name: 'Shop Pay', src: '/payment/shop-pay.svg' },
  { name: 'Visa', src: '/payment/visa.svg' },
] as const
const BUNDLE_OPTIONS = [
  {
    qty: 1,
    title: 'Solo',
    benefit: '1 maillot',
    badge: null,
    icon: BadgePercent,
  },
  {
    qty: 3,
    title: 'Pack de 3',
    benefit: 'Livraison offerte',
    badge: null,
    icon: Truck,
  },
  {
    qty: 4,
    title: 'Pack de 4',
    benefit: '1 maillot offert',
    badge: 'Meilleur deal',
    icon: Gift,
  },
] as const

function pluralizeMaillot(count: number) {
  return `maillot${count > 1 ? 's' : ''}`
}

function getBundlePreview(unitPrice: number, qty: number) {
  const freeCount = calculateBundleFreeItemCount(qty)
  const paidCount = Math.max(0, qty - freeCount)
  const subtotal = unitPrice * qty
  const total = unitPrice * paidCount

  return {
    freeCount,
    subtotal,
    total,
    saving: Math.max(0, subtotal - total),
  }
}

export function AddToCartForm({ product, patches }: { product: Product; patches: Patch[] }) {
  const [size, setSize] = useState<string | null>(null)
  const [selectedPatches, setSelectedPatches] = useState<string[]>([])
  const [qty, setQty] = useState(1)
  const [hasFlocage, setHasFlocage] = useState(false)
  const [flocageName, setFlocageName] = useState('')
  const [flocageNumber, setFlocageNumber] = useState('')
  const [error, setError] = useState('')
  const [selectedBundleTarget, setSelectedBundleTarget] = useState(1)

  const addItem = useCartStore((state) => state.addItem)
  const getCartItemCount = useCartStore((state) => state.itemCount)
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
  })

  const availablePatches =
    product.available_patches.length > 0
      ? patches.filter((patch) => product.available_patches.includes(patch.code))
      : patches

  const unitPrice = calculateCartItemUnitPrice({
    basePrice: pricing.currentPrice,
    patchCount: selectedPatches.length,
    hasFlocage,
  })
  const bundlePreview = getBundlePreview(unitPrice, qty)
  const currentCartCount = getCartItemCount()
  const projectedBundleCount = currentCartCount + qty
  const projectedFreeCount = calculateBundleFreeItemCount(projectedBundleCount)
  const bundleProgressTarget = selectedBundleTarget === 1 ? BUNDLE_CYCLE_ITEM_COUNT : Math.max(1, selectedBundleTarget)
  const missingForSelectedBundle = Math.max(0, selectedBundleTarget - projectedBundleCount)
  const selectedBundleOption = BUNDLE_OPTIONS.find((option) => option.qty === selectedBundleTarget) ?? BUNDLE_OPTIONS[0]
  const progressCount = Math.min(projectedBundleCount, bundleProgressTarget)
  const progressWidth = Math.min(100, (progressCount / bundleProgressTarget) * 100)
  const progressLabel = selectedBundleTarget === 1 ? `Offre pack de ${BUNDLE_CYCLE_ITEM_COUNT}` : selectedBundleOption.title

  const selectBundleOption = (targetQty: number) => {
    setSelectedBundleTarget(targetQty)
    setQty(Math.max(1, targetQty - currentCartCount))
  }

  useEffect(() => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: normalizeProductTextSeasons(product.name),
      price: pricing.currentPrice,
      league: product.league,
    })
  }, [pricing.currentPrice, product.id, product.league, product.name])

  const handleAdd = () => {
    if (!size) {
      setError('Veuillez selectionner une taille')
      return
    }

    setError('')

    const selectedPatchObjects = patches.filter((patch) => selectedPatches.includes(patch.code))
    const normalizedName = normalizeProductTextSeasons(product.name)

    addItem({
      product_id: product.id,
      slug: product.slug,
      name: normalizedName,
      club: product.club,
      size,
      patches: selectedPatches,
      patch_names: selectedPatchObjects.map((patch) => patch.name),
      flocage_name: hasFlocage ? flocageName.toUpperCase() : null,
      flocage_number: hasFlocage ? flocageNumber : null,
      price: unitPrice,
      photo: product.photos[0] ?? '',
      qty,
    })

    trackAddToCart({
      productId: product.id,
      productName: normalizedName,
      club: product.club,
      quantity: qty,
      size,
      patchCount: selectedPatches.length,
      hasFlocage,
      unitPrice,
      value: bundlePreview.total,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <SizeSelector available={product.sizes} selected={size} onSelect={setSize} />
        <PatchSelector patches={availablePatches} selected={selectedPatches} onSelect={setSelectedPatches} />
      </div>

      <div className="space-y-3">
        <label className="group flex cursor-pointer items-center gap-2.5">
          <div className="relative flex h-5 w-5 items-center justify-center rounded-sm border-2 border-[var(--black)] bg-white transition-colors">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={hasFlocage}
              onChange={(event) => setHasFlocage(event.target.checked)}
            />
            <div className="absolute inset-0 flex scale-0 items-center justify-center bg-[var(--black)] transition-transform peer-checked:scale-100">
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </div>
          </div>

          <div>
            <span className="text-[15px] font-bold text-[var(--black)]">Personnaliser ce maillot</span>
            <span className="ml-2 text-[13px] text-[var(--grey)]">(+{formatEuro(FLOCAGE_PRICE)})</span>
          </div>
        </label>

        {hasFlocage ? (
          <div className="grid grid-cols-6 gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="col-span-4 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--grey)]">Nom</label>
              <input
                type="text"
                maxLength={15}
                value={flocageName}
                onChange={(event) => setFlocageName(event.target.value)}
                placeholder="Ex: ZIDANE"
                className="w-full rounded-xl border-2 border-[var(--cream-3)] bg-white px-4 py-3 font-condensed text-lg uppercase outline-none transition-colors focus:border-[var(--black)]"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--grey)]">Numero</label>
              <input
                type="text"
                maxLength={2}
                value={flocageNumber}
                onChange={(event) => setFlocageNumber(event.target.value.replace(/\D/g, ''))}
                placeholder="10"
                className="w-full rounded-xl border-2 border-[var(--cream-3)] bg-white px-4 py-3 text-center font-condensed text-lg outline-none transition-colors focus:border-[var(--black)]"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.25rem] border border-[var(--cream-3)] bg-white p-1.5 text-[var(--black)] shadow-[0_14px_32px_rgba(28,23,18,0.1)]">
        <div className="flex items-center justify-between gap-3 px-2.5 py-1.5">
          <div className="min-w-0">
            <p className="font-condensed text-[10px] uppercase tracking-[0.2em] text-[var(--terra)]">Offre coupe du monde</p>
            <h3 className="mt-0.5 whitespace-nowrap font-bebas text-[22px] leading-none tracking-wide sm:text-2xl">
              4e maillot offert
            </h3>
          </div>
          <div className="shrink-0 rounded-full border border-[var(--terra)]/15 bg-[var(--terra-lt)] px-2.5 py-1 font-condensed text-[10px] uppercase tracking-[0.12em] text-[var(--terra)]">
            Livraison offerte dès le 3e
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {BUNDLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const selected = selectedBundleTarget === option.qty

            return (
              <button
                key={option.qty}
                type="button"
                aria-pressed={selected}
                onClick={() => selectBundleOption(option.qty)}
                className={cn(
                  'relative min-h-[86px] overflow-hidden rounded-xl border px-2.5 py-2.5 text-left transition-all',
                  selected
                    ? 'border-[var(--terra)] bg-[var(--terra-lt)] text-[var(--black)] shadow-[0_0_0_2px_rgba(193,68,14,0.14)]'
                    : 'border-[var(--cream-3)] bg-[var(--cream)] text-[var(--black)] hover:border-[var(--terra)]/35 hover:bg-[var(--terra-lt)]',
                )}
              >
                {option.badge ? (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-[var(--terra)] px-1.5 py-0.5 font-condensed text-[8px] uppercase tracking-[0.1em] text-white">
                    Top
                  </span>
                ) : null}

                <Icon className="mb-1.5 h-4 w-4 text-[var(--terra)]" />
                <p className="font-bebas text-[19px] leading-none tracking-wide sm:text-[20px]">{option.title}</p>

                <p className="mt-1.5 font-condensed text-[11px] font-bold uppercase leading-tight tracking-[0.08em] text-[var(--terra)]">
                  {option.benefit}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-1 rounded-xl border border-[var(--cream-3)] bg-[var(--cream)] px-3 py-1.5">
          <div className="mb-1 flex items-center justify-between font-condensed text-[10px] uppercase tracking-[0.14em] text-[var(--grey)]">
            <span>{progressLabel}</span>
            <span>
              {progressCount}/{bundleProgressTarget}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--cream-3)]">
            <div
              className="h-full rounded-full bg-[var(--terra)] transition-all"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] leading-snug text-[var(--grey)]">
            {selectedBundleTarget === 1
              ? 'Ajoute ce maillot seul, ou complète un pack pour activer les avantages.'
              : missingForSelectedBundle === 0
                ? selectedBundleTarget >= BUNDLE_CYCLE_ITEM_COUNT && projectedFreeCount > 0
                  ? 'Pack complet: le moins cher des 4 maillots passe offert au panier.'
                  : `Pack complet: livraison offerte dès le ${FREE_SHIPPING_MIN_ITEMS}e maillot.`
                : `Encore ${missingForSelectedBundle} ${pluralizeMaillot(missingForSelectedBundle)} pour compléter ce pack.`}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--cream-3)] pt-3">
        {error ? <p className="mb-4 animate-pulse text-center text-xs font-bold tracking-widest text-red-500">{error}</p> : null}

        <div className="flex flex-col gap-3">
          <div className="flex items-center">
            <div className="flex h-[52px] items-center rounded-xl border-2 border-[var(--cream-3)] bg-white px-2 shadow-sm">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-9 w-9 items-center justify-center text-[var(--grey)] transition-colors hover:text-[var(--black)]"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-bebas text-xl text-[var(--black)]">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="flex h-9 w-9 items-center justify-center text-[var(--grey)] transition-colors hover:text-[var(--black)]"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="ml-3 flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--black)] px-5 py-4 text-center text-[14px] font-bold uppercase leading-tight tracking-wider text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98] sm:text-[15px]"
            >
              Ajouter au panier - {formatEuro(bundlePreview.total)}
            </button>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method.name}
                  className="flex h-6 w-[38px] items-center justify-center rounded border border-[var(--cream-3)] bg-white px-1.5 shadow-xs"
                >
                  <Image src={method.src} alt={method.name} width={34} height={16} className="max-h-4 w-auto object-contain" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
