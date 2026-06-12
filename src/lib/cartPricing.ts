import {
  LAUNCH_PROMO_CTA,
  LAUNCH_PROMO_DURATION_DAYS,
  LAUNCH_PROMO_ENABLED,
  LAUNCH_PROMO_LABEL,
  LAUNCH_PROMO_START_ISO,
} from './siteConfig'
import { getPromoDiscountRate, normalizePromoCode } from './promoCodes'

export const FLOCAGE_PRICE = 5
export const PATCH_PRICE = 2.5
export const FAN_JERSEY_PRICE = 25.9
export const PLAYER_JERSEY_PRICE = 33.99
export const STANDARD_PRICE = 33.99
export const STANDARD_PROMO_PRICE = 25.99
export const RETRO_PRICE = 40.99
export const RETRO_PROMO_PRICE = 33.99
export const PACK_TWO_ITEMS_DISCOUNT = 5
export const PACK_HALF_PRICE_GROUP_SIZE = 3
export const PACK_HALF_PRICE_RATE = 0.5

const FIXED_PRODUCT_PRICES: Record<string, number> = {
  'maillot-domicile-stadium-psg-25-26-flocage-champions-of-europe': 36,
  'maillot-exterieur-stadium-psg-25-26-flocage-champions-of-europe': 36,
  'maillot-psg-jordan-night-edition-stadium-25-26-flocage-champions-of-europe': 36,
}

type PriceableCartItem = {
  price: number
  qty: number
}

type DiscountedUnitGroup = {
  sourceIndex: number
  unitAmount: number
  quantity: number
}

type DiscountableUnit = {
  sourceIndex: number
  unitCents: number
  amountAfterDiscountCents: number
}

export type PackDiscountTier = 'none' | 'two_items' | 'half_every_three'

type CartPricingOptions = {
  promoCode?: string | null
}

export type CartPricingBreakdown = {
  itemCount: number
  subtotal: number
  discount: number
  promoDiscount: number
  packDiscount: number
  packDiscountTier: PackDiscountTier
  packDiscountedItemCount: number
  shipping: number
  total: number
  promoCode: string | null
  promoDiscountRate: number
  discountSource: 'promo_code' | 'pack' | null
  freeShippingUnlocked: boolean
  discountedUnitGroups: DiscountedUnitGroup[]
}

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

function toCents(value: number): number {
  return Math.round(value * 100)
}

function fromCents(value: number): number {
  return value / 100
}

function getPromoWindowEnd(): number {
  if (!LAUNCH_PROMO_START_ISO) return 0
  const start = new Date(LAUNCH_PROMO_START_ISO).getTime()
  const duration = LAUNCH_PROMO_DURATION_DAYS * 24 * 60 * 60 * 1000
  return start + duration
}

export function isLaunchPromoActive(now = new Date()): boolean {
  if (!LAUNCH_PROMO_ENABLED || !LAUNCH_PROMO_START_ISO) return false
  const start = new Date(LAUNCH_PROMO_START_ISO).getTime()
  const current = now.getTime()

  if (Number.isNaN(start)) return false

  return current >= start && current < getPromoWindowEnd()
}

export function formatEuro(value: number): string {
  return euroFormatter.format(value)
}

export function getProductPricing(params: {
  isRetro: boolean
  isConcept?: boolean
  productKind?: 'jersey' | string
  jerseyVersion?: 'fan' | 'player' | string
  productSlug?: string | null
  now?: Date
}) {
  const { isRetro, isConcept = false, productKind, jerseyVersion = 'fan', productSlug, now = new Date() } = params
  const fixedProductPrice = productSlug ? FIXED_PRODUCT_PRICES[productSlug] : undefined

  if (typeof fixedProductPrice === 'number') {
    return {
      originalPrice: fixedProductPrice,
      currentPrice: fixedProductPrice,
      promoPrice: fixedProductPrice,
      promoActive: false,
      promoLabel: null,
      promoDescription: null,
    }
  }

  if (!isRetro && !isConcept && productKind === 'jersey') {
    const jerseyPrice = jerseyVersion === 'player' ? PLAYER_JERSEY_PRICE : FAN_JERSEY_PRICE

    return {
      originalPrice: jerseyPrice,
      currentPrice: jerseyPrice,
      promoPrice: jerseyPrice,
      promoActive: false,
      promoLabel: null,
      promoDescription: null,
    }
  }

  const originalPrice = isRetro ? RETRO_PRICE : STANDARD_PRICE
  const promoPrice = isRetro ? RETRO_PROMO_PRICE : STANDARD_PROMO_PRICE
  const promoActive = isLaunchPromoActive(now)

  return {
    originalPrice,
    currentPrice: promoActive ? promoPrice : originalPrice,
    promoPrice,
    promoActive,
    promoLabel: promoActive ? LAUNCH_PROMO_LABEL : null,
    promoDescription: promoActive ? LAUNCH_PROMO_CTA : null,
  }
}

export function calculateShippingAmount(itemCount: number): number {
  void itemCount
  return 0
}

export function calculateItemsSubtotal(items: PriceableCartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0)
}

function getHalfPriceDiscountCents(unitCents: number): number {
  return Math.floor(unitCents * PACK_HALF_PRICE_RATE)
}

function calculateFlatPackAllocations(units: DiscountableUnit[], discountCents: number): number[] {
  const allocations = Array(units.length).fill(0) as number[]
  let remainingCents = discountCents
  const sortedUnitIndexes = units
    .map((unit, index) => ({ index, capacityCents: getHalfPriceDiscountCents(unit.unitCents) }))
    .filter((unit) => unit.capacityCents > 0)
    .sort((a, b) => units[a.index].unitCents - units[b.index].unitCents)

  for (const { index, capacityCents } of sortedUnitIndexes) {
    if (remainingCents <= 0) break
    const allocationCents = Math.min(capacityCents, remainingCents)
    allocations[index] = allocationCents
    remainingCents -= allocationCents
  }

  return allocations
}

function calculatePackDiscount(units: DiscountableUnit[], itemCount: number): {
  tier: PackDiscountTier
  discountCents: number
  discountedItemCount: number
  allocations: number[]
} {
  if (itemCount < 2 || units.length === 0) {
    return { tier: 'none', discountCents: 0, discountedItemCount: 0, allocations: Array(units.length).fill(0) }
  }

  if (itemCount === 2) {
    const discountCents = Math.min(toCents(PACK_TWO_ITEMS_DISCOUNT), units.reduce((sum, unit) => sum + getHalfPriceDiscountCents(unit.unitCents), 0))
    const allocations = calculateFlatPackAllocations(units, discountCents)

    return {
      tier: discountCents > 0 ? 'two_items' : 'none',
      discountCents,
      discountedItemCount: discountCents > 0 ? 2 : 0,
      allocations,
    }
  }

  const discountedItemCount = Math.floor(itemCount / PACK_HALF_PRICE_GROUP_SIZE)
  const allocations = Array(units.length).fill(0) as number[]
  const sortedUnitIndexes = units
    .map((unit, index) => ({ index, unitCents: unit.unitCents }))
    .sort((a, b) => a.unitCents - b.unitCents)
    .slice(0, discountedItemCount)

  for (const { index } of sortedUnitIndexes) {
    allocations[index] = getHalfPriceDiscountCents(units[index].unitCents)
  }

  return {
    tier: discountedItemCount > 0 ? 'half_every_three' : 'none',
    discountCents: allocations.reduce((sum, allocation) => sum + allocation, 0),
    discountedItemCount,
    allocations,
  }
}

export function calculateCartPricing(items: PriceableCartItem[], options: CartPricingOptions = {}): CartPricingBreakdown {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotalCents = items.reduce((sum, item) => sum + (toCents(item.price) * item.qty), 0)
  const promoCode = normalizePromoCode(options.promoCode)
  const promoDiscountRate = getPromoDiscountRate(promoCode)
  const units: DiscountableUnit[] = []
  let promoDiscountCents = 0

  for (const [sourceIndex, item] of items.entries()) {
    const quantity = Math.max(0, Math.floor(item.qty))
    const unitCents = toCents(item.price)
    const amountAfterPromoCents = Math.max(0, Math.round(unitCents * (1 - promoDiscountRate)))
    promoDiscountCents += Math.max(0, unitCents - amountAfterPromoCents) * quantity

    for (let index = 0; index < quantity; index += 1) {
      units.push({ sourceIndex, unitCents, amountAfterDiscountCents: unitCents })
    }
  }

  const packDiscount = calculatePackDiscount(units, itemCount)
  const shouldApplyPromo = promoDiscountCents > 0 && promoDiscountCents >= packDiscount.discountCents
  const shouldApplyPack = packDiscount.discountCents > 0 && !shouldApplyPromo
  const discountSource = shouldApplyPromo ? 'promo_code' : shouldApplyPack ? 'pack' : null
  const discountCents = shouldApplyPromo ? promoDiscountCents : shouldApplyPack ? packDiscount.discountCents : 0
  const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents)

  if (shouldApplyPromo) {
    for (const unit of units) {
      unit.amountAfterDiscountCents = Math.max(0, Math.round(unit.unitCents * (1 - promoDiscountRate)))
    }
  } else if (shouldApplyPack) {
    const allocations = packDiscount.allocations
    units.forEach((unit, index) => {
      unit.amountAfterDiscountCents = Math.max(0, unit.unitCents - allocations[index])
    })
  }

  const groupedUnits = new Map<string, DiscountedUnitGroup>()
  units.forEach((unit) => {
    const groupKey = `${unit.sourceIndex}:${unit.amountAfterDiscountCents}`
    const existingGroup = groupedUnits.get(groupKey)
    if (existingGroup) {
      existingGroup.quantity += 1
      return
    }

    groupedUnits.set(groupKey, {
      sourceIndex: unit.sourceIndex,
      unitAmount: fromCents(unit.amountAfterDiscountCents),
      quantity: 1,
    })
  })

  const shippingCents = toCents(calculateShippingAmount(itemCount))

  return {
    itemCount,
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    promoDiscount: fromCents(promoDiscountCents),
    packDiscount: fromCents(packDiscount.discountCents),
    packDiscountTier: packDiscount.tier,
    packDiscountedItemCount: packDiscount.discountedItemCount,
    shipping: fromCents(shippingCents),
    total: fromCents(discountedSubtotalCents + shippingCents),
    promoCode: shouldApplyPromo ? promoCode : null,
    promoDiscountRate,
    discountSource,
    freeShippingUnlocked: shippingCents === 0 && itemCount > 0,
    discountedUnitGroups: Array.from(groupedUnits.values()),
  }
}

export function calculateCartGrandTotal(items: PriceableCartItem[], options: CartPricingOptions = {}): number {
  return calculateCartPricing(items, options).total
}

export function calculateCartItemUnitPrice(params: {
  basePrice: number
  patchCount: number
  hasFlocage: boolean
}): number {
  const { basePrice, patchCount, hasFlocage } = params

  return basePrice + (patchCount * PATCH_PRICE) + (hasFlocage ? FLOCAGE_PRICE : 0)
}
