'use client'

import { useEffect, useState } from 'react'
import { BadgePercent, Check, Gift, Minus, Plus, ShieldCheck, Truck } from 'lucide-react'
import {
  BUNDLE_CYCLE_ITEM_COUNT,
  calculateBundleFreeItemCount,
  FLOCAGE_PRICE,
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

const PAYMENT_METHODS = ['CB', 'Visa', 'Mastercard']
const BUNDLE_OPTIONS = [
  {
    qty: 1,
    title: '1 Maillot',
    label: 'Achat simple',
    badge: null,
    icon: BadgePercent,
  },
  {
    qty: 3,
    title: '3 Maillots',
    label: 'Livraison offerte',
    badge: null,
    icon: Truck,
  },
  {
    qty: 4,
    title: 'Pack 4',
    label: '3 payes + 1 offert',
    badge: 'Meilleur deal',
    icon: Gift,
  },
] as const

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

  const addItem = useCartStore((state) => state.addItem)
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
    <div className="space-y-8">
      <div className="space-y-10">
        <SizeSelector available={product.sizes} selected={size} onSelect={setSize} />
        <PatchSelector patches={availablePatches} selected={selectedPatches} onSelect={setSelectedPatches} />
      </div>

      <div className="space-y-6 pt-2">
        <label className="group flex cursor-pointer items-center gap-3">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-sm border-2 border-[var(--black)] bg-white transition-colors">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={hasFlocage}
              onChange={(event) => setHasFlocage(event.target.checked)}
            />
            <div className="absolute inset-0 flex scale-0 items-center justify-center bg-[var(--black)] transition-transform peer-checked:scale-100">
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
          </div>

          <div>
            <span className="text-[17px] font-bold text-[var(--black)]">Personnaliser ce maillot</span>
            <span className="ml-2 text-[15px] text-[var(--grey)]">(+{formatEuro(FLOCAGE_PRICE)})</span>
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

      <div className="rounded-[1.5rem] border border-[var(--black)] bg-[var(--black)] p-2 text-white shadow-[0_18px_40px_rgba(28,23,18,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="font-condensed text-[11px] uppercase tracking-[0.22em] text-[#b7ff1a]">Bundles exclusifs</p>
            <h3 className="mt-1 font-bebas text-3xl tracking-wide">3 achetes = 4e offert</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-condensed text-[11px] uppercase tracking-[0.18em]">
            Livraison offerte des 3
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {BUNDLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const preview = getBundlePreview(unitPrice, option.qty)
            const selected = qty === option.qty

            return (
              <button
                key={option.qty}
                type="button"
                aria-pressed={selected}
                onClick={() => setQty(option.qty)}
                className={cn(
                  'relative min-h-[136px] overflow-hidden rounded-2xl border p-4 text-left transition-all',
                  selected
                    ? 'border-[#b7ff1a] bg-[#efffd1] text-[var(--black)] shadow-[0_0_0_2px_rgba(183,255,26,0.3)]'
                    : 'border-white/10 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/[0.09]',
                )}
              >
                {option.badge ? (
                  <span className="absolute right-3 top-3 rounded-full bg-[#b7ff1a] px-2 py-1 font-condensed text-[10px] uppercase tracking-[0.16em] text-[var(--black)]">
                    {option.badge}
                  </span>
                ) : null}

                <Icon className={cn('mb-4 h-6 w-6', selected ? 'text-[var(--black)]' : 'text-[#b7ff1a]')} />
                <p className="font-bebas text-2xl tracking-wide">{option.title}</p>
                <p className={cn('mt-1 text-xs', selected ? 'text-[var(--black)]/70' : 'text-white/65')}>{option.label}</p>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-condensed text-xl font-bold">{formatEuro(preview.total)}</p>
                    {preview.saving > 0 ? (
                      <p className={cn('text-[11px] line-through', selected ? 'text-[var(--black)]/45' : 'text-white/40')}>
                        {formatEuro(preview.subtotal)}
                      </p>
                    ) : null}
                  </div>
                  {preview.freeCount > 0 ? (
                    <span className="rounded-full bg-[var(--black)] px-2 py-1 font-condensed text-[10px] uppercase tracking-[0.16em] text-[#b7ff1a]">
                      +{preview.freeCount} offert
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
          <div className="mb-2 flex items-center justify-between font-condensed text-xs uppercase tracking-[0.16em] text-white/75">
            <span>Progression pack</span>
            <span>
              {Math.min(qty, BUNDLE_CYCLE_ITEM_COUNT)}/{BUNDLE_CYCLE_ITEM_COUNT}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#b7ff1a] transition-all"
              style={{ width: `${Math.min(100, (qty / BUNDLE_CYCLE_ITEM_COUNT) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/65">
            {bundlePreview.freeCount > 0
              ? `Bundle applique: ${formatEuro(bundlePreview.saving)} economises sur ce pack.`
              : `Ajoute ${BUNDLE_CYCLE_ITEM_COUNT - qty} maillot${BUNDLE_CYCLE_ITEM_COUNT - qty > 1 ? 's' : ''} pour obtenir le 4e offert.`}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--cream-3)] pt-4">
        {error ? <p className="mb-4 animate-pulse text-center text-xs font-bold tracking-widest text-red-500">{error}</p> : null}

        <div className="flex flex-col gap-6">
          <div className="flex items-center">
            <div className="flex h-[56px] items-center rounded-xl border-2 border-[var(--cream-3)] bg-white px-2 shadow-sm">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-10 w-10 items-center justify-center text-[var(--grey)] transition-colors hover:text-[var(--black)]"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-bebas text-xl text-[var(--black)]">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="flex h-10 w-10 items-center justify-center text-[var(--grey)] transition-colors hover:text-[var(--black)]"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="ml-4 flex h-[56px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--black)] text-[16px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
            >
              Ajouter au panier - {formatEuro(bundlePreview.total)}
            </button>
          </div>

          <div className="space-y-4">

            <div className="flex flex-wrap items-center justify-center gap-2 py-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded-full border border-[var(--cream-3)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--grey)]"
                >
                  {method}
                </span>
              ))}
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-blue-50 bg-[#F0F4FF] p-6">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-100/30 transition-transform duration-700 group-hover:scale-110" />

              <h3 className="relative mb-4 inline-block text-[18px] font-bold italic text-[var(--black)]">
                Paiement & Securite
                <div className="absolute left-0 -bottom-1 -z-10 h-2 w-full rounded-full bg-[#4BFF00] opacity-60" />
              </h3>

              <div className="mb-4 flex flex-wrap gap-2">
                <div className="flex items-center justify-center rounded border border-blue-100 bg-white px-2 py-1 shadow-xs">
                  <ShieldCheck className="mr-1 h-3 w-3 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-blue-900">SSL Securing</span>
                </div>
                {pricing.promoDescription ? (
                  <div className="rounded border border-[var(--terra)]/10 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--terra)]">
                    {pricing.promoDescription}
                  </div>
                ) : null}
              </div>

              <p className="relative z-10 text-[14px] leading-relaxed text-[#555555]">
                Vos informations de paiement sont traitees de maniere securisee. Nous ne stockons pas les informations de carte bancaire et n&apos;y avons pas acces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
