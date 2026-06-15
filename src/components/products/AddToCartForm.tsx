'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { PackBuilderCard, type PackBuilderSlot, type PackBuilderSuggestion } from '@/components/bundle/PackBuilderCard'
import {
  FLOCAGE_PRICE,
  calculateCartPricing,
  calculateCartItemUnitPrice,
  formatEuro,
  getProductPricing,
} from '@/lib/cartPricing'
import { normalizeProductTextSeasons } from '@/lib/season'
import { trackAddToCart, trackEvent } from '@/lib/tracking'
import { useCartStore } from '@/store/cart'
import type { Patch, Product } from '@/types/product'
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

function toBuilderSuggestion(product: Product): PackBuilderSuggestion {
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  return {
    id: product.id,
    slug: product.slug,
    name: normalizeProductTextSeasons(product.name),
    club: product.club,
    season: product.season,
    price: pricing.currentPrice,
    photo: product.photos[0] ?? '',
    sizes: product.sizes,
  }
}

export function AddToCartForm({
  product,
  patches,
  openSizeOnLoad = false,
  packSuggestions = [],
}: {
  product: Product
  patches: Patch[]
  openSizeOnLoad?: boolean
  packSuggestions?: Product[]
}) {
  const [size, setSize] = useState<string | null>(null)
  const [selectedPatches, setSelectedPatches] = useState<string[]>([])
  const [packItems, setPackItems] = useState<Array<{ suggestion: PackBuilderSuggestion; size: string }>>([])
  const [hasFlocage, setHasFlocage] = useState(false)
  const [flocageName, setFlocageName] = useState('')
  const [flocageNumber, setFlocageNumber] = useState('')
  const [error, setError] = useState('')
  const [sizeOpenSignal, setSizeOpenSignal] = useState(0)
  const sizeBlockRef = useRef<HTMLDivElement>(null)
  const didApplySizeIntent = useRef(false)

  const addItem = useCartStore((state) => state.addItem)
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  const filteredAvailablePatches =
    product.available_patches.length > 0
      ? patches.filter((patch) => product.available_patches.includes(patch.code))
      : []
  const availablePatches = filteredAvailablePatches.length > 0 ? filteredAvailablePatches : patches

  const unitPrice = calculateCartItemUnitPrice({
    basePrice: pricing.currentPrice,
    patchCount: selectedPatches.length,
    hasFlocage,
  })
  const selectedPatchObjects = patches.filter((patch) => selectedPatches.includes(patch.code))
  const normalizedName = normalizeProductTextSeasons(product.name)
  const currentSlot: PackBuilderSlot = {
    key: `current-${product.id}`,
    productId: product.id,
    slug: product.slug,
    name: normalizedName,
    club: product.club,
    season: product.season,
    price: unitPrice,
    photo: product.photos[0] ?? '',
    size,
  }
  const suggestionSlots: PackBuilderSlot[] = packItems.map(({ suggestion, size }, index) => ({
    key: `suggestion-${suggestion.id}-${size}-${index}`,
    productId: suggestion.id,
    slug: suggestion.slug,
    name: suggestion.name,
    club: suggestion.club,
    season: suggestion.season,
    price: suggestion.price,
    photo: suggestion.photo,
    size,
    removable: true,
  }))
  const packSlots = [currentSlot, ...suggestionSlots].slice(0, 3)
  const packPricing = calculateCartPricing(packSlots.map((slot) => ({ price: slot.price, qty: 1 })))
  const packComplete = packSlots.length >= 3
  const builderSuggestions = packSuggestions.map(toBuilderSuggestion)

  useEffect(() => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: normalizeProductTextSeasons(product.name),
      price: pricing.currentPrice,
      league: product.league,
    })
  }, [pricing.currentPrice, product.id, product.league, product.name])

  const promptForSize = useCallback(() => {
    setError('Choisis ta taille pour continuer')
    setSizeOpenSignal((value) => value + 1)
    requestAnimationFrame(() => {
      sizeBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [])

  useEffect(() => {
    const handleSizeRequired = () => promptForSize()
    document.addEventListener('maillot:size-required', handleSizeRequired)
    return () => document.removeEventListener('maillot:size-required', handleSizeRequired)
  }, [promptForSize])

  useEffect(() => {
    const hasSizeIntent = openSizeOnLoad || new URLSearchParams(window.location.search).get('taille') === '1'
    if (!hasSizeIntent || didApplySizeIntent.current || size) return

    const timeoutId = window.setTimeout(() => {
      didApplySizeIntent.current = true
      promptForSize()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [openSizeOnLoad, promptForSize, size])

  const handleAdd = () => {
    if (!size) {
      promptForSize()
      return
    }

    setError('')

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
      qty: 1,
    })

    trackAddToCart({
      productId: product.id,
      productName: normalizedName,
      club: product.club,
      quantity: 1,
      size,
      patchCount: selectedPatches.length,
      hasFlocage,
      unitPrice,
      value: unitPrice,
    })

    if (packComplete) {
      packItems.slice(0, 2).forEach(({ suggestion, size: suggestionSize }) => {
        addItem({
          product_id: suggestion.id,
          slug: suggestion.slug,
          name: suggestion.name,
          club: suggestion.club,
          size: suggestionSize,
          patches: [],
          patch_names: [],
          flocage_name: null,
          flocage_number: null,
          price: suggestion.price,
          photo: suggestion.photo,
          qty: 1,
        })

        trackAddToCart({
          productId: suggestion.id,
          productName: suggestion.name,
          club: suggestion.club,
          quantity: 1,
          size: suggestionSize,
          patchCount: 0,
          hasFlocage: false,
          unitPrice: suggestion.price,
          value: suggestion.price,
        })
      })

      setPackItems([])
    }
  }

  const handleAddSuggestion = (suggestion: PackBuilderSuggestion, suggestionSize: string) => {
    setPackItems((items) => {
      if (items.length >= 2 || items.some((item) => item.suggestion.id === suggestion.id)) return items
      return [...items, { suggestion, size: suggestionSize }]
    })
  }

  const handleRemovePackSlot = (slot: PackBuilderSlot) => {
    setPackItems((items) => items.filter((item) => item.suggestion.id !== slot.productId))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div ref={sizeBlockRef}>
          <SizeSelector
            available={product.sizes}
            selected={size}
            onSelect={(nextSize) => {
              setSize(nextSize)
              setError('')
            }}
            openSignal={sizeOpenSignal}
            hasError={Boolean(error)}
          />
        </div>
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--grey)]">Numéro</label>
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

      <div className="border-t border-[var(--cream-3)] pt-3">
        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-red-600" aria-live="polite">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAdd}
            className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--black)] px-5 py-3 text-center text-[14px] font-bold uppercase leading-tight tracking-wider text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98] sm:text-[15px]"
          >
            {packComplete
              ? `Ajouter le pack au panier - ${formatEuro(packPricing.total)} au lieu de ${formatEuro(packPricing.subtotal)}`
              : `Ajouter au panier - ${formatEuro(unitPrice)}`}
          </button>

          <PackBuilderCard
            slots={packSlots}
            suggestions={builderSuggestions}
            onAddSuggestion={handleAddSuggestion}
            onRemoveSlot={handleRemovePackSlot}
            onCurrentSlotClick={promptForSize}
          />

          <div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method.name}
                  className="flex h-6 w-[38px] items-center justify-center rounded border border-[var(--cream-3)] bg-white px-1.5 shadow-xs"
                >
                  <Image
                    src={method.src}
                    alt={method.name}
                    width={34}
                    height={16}
                    className="object-contain"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
