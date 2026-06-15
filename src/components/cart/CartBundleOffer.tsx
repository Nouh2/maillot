'use client'

import Link from 'next/link'
import { PackBuilderCard, type PackBuilderSlot, type PackBuilderSuggestion } from '@/components/bundle/PackBuilderCard'
import { SummerPackCard } from '@/components/bundle/SummerPackCard'
import { calculateCartPricing, getProductPricing } from '@/lib/cartPricing'
import { normalizeProductTextSeasons } from '@/lib/season'
import { trackAddToCart } from '@/lib/tracking'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

function getProjectedMaxReward(items: { price: number; qty: number }[]) {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const unitPrices = items.flatMap((item) => Array.from({ length: Math.max(0, item.qty) }, () => item.price))

  if (itemCount >= 3) {
    return calculateCartPricing(items).packDiscount
  }

  if (unitPrices.length === 0) {
    return 12.95
  }

  const cheapestPrice = Math.min(...unitPrices)
  const projectedItems = [...items, { price: cheapestPrice, qty: Math.max(0, 3 - itemCount) }]

  return calculateCartPricing(projectedItems).packDiscount
}

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

function expandCartSlots(items: CartItem[]): PackBuilderSlot[] {
  return items
    .flatMap((item) =>
      Array.from({ length: Math.max(0, item.qty) }, (_, index) => ({
        key: `cart-${item.product_id}-${item.size}-${index}`,
        productId: item.product_id,
        slug: item.slug,
        name: normalizeProductTextSeasons(item.name),
        club: item.club,
        price: item.price,
        photo: item.photo,
        size: item.size,
        removable: true,
      })),
    )
    .slice(0, 3)
}

export function CartBundleOffer({ compact = false, packSuggestions = [] }: { compact?: boolean; packSuggestions?: Product[] }) {
  const { items, promoCode, addItem, updateQty } = useCartStore()
  const pricing = calculateCartPricing(items, { promoCode })
  const maxRewardAmount = getProjectedMaxReward(items)
  const builderSuggestions = packSuggestions.map(toBuilderSuggestion)
  const builderSlots = expandCartSlots(items)

  const handleAddSuggestion = (suggestion: PackBuilderSuggestion, size: string) => {
    addItem({
      product_id: suggestion.id,
      slug: suggestion.slug,
      name: suggestion.name,
      club: suggestion.club,
      size,
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
      size,
      patchCount: 0,
      hasFlocage: false,
      unitPrice: suggestion.price,
      value: suggestion.price,
    })
  }

  const handleRemoveSlot = (slot: PackBuilderSlot) => {
    const item = items.find((cartItem) => cartItem.product_id === slot.productId && cartItem.size === slot.size)
    if (!item) return
    updateQty(item, item.qty - 1)
  }

  if (builderSuggestions.length > 0 && pricing.itemCount > 0 && pricing.itemCount < 3) {
    return (
      <PackBuilderCard
        slots={builderSlots}
        suggestions={builderSuggestions}
        onAddSuggestion={handleAddSuggestion}
        onRemoveSlot={handleRemoveSlot}
      />
    )
  }

  return (
    <div>
      <SummerPackCard pricing={pricing} maxRewardAmount={maxRewardAmount} />

      {!compact && pricing.itemCount < 3 ? (
        <Link
          href="/shop"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[var(--terra)] px-4 py-3 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-white transition-transform active:scale-[0.98]"
        >
          Completer mon pack
        </Link>
      ) : null}
    </div>
  )
}
