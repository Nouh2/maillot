import {
  LAUNCH_PROMO_CTA,
  LAUNCH_PROMO_DURATION_DAYS,
  LAUNCH_PROMO_ENABLED,
  LAUNCH_PROMO_LABEL,
  LAUNCH_PROMO_START_ISO,
  LOYALTY_CODE,
} from './siteConfig'

export const FLOCAGE_PRICE = 5
export const PATCH_PRICE = 2.5
export const FAN_JERSEY_PRICE = 19.9
export const PLAYER_JERSEY_PRICE = 27.99
export const STANDARD_PRICE = 27.99
export const STANDARD_PROMO_PRICE = 19.99
export const RETRO_PRICE = 34.99
export const RETRO_PROMO_PRICE = 27.99
export const STANDARD_SHIPPING_PRICE = 6
export const FREE_SHIPPING_THRESHOLD = 60
export const LOYALTY_DISCOUNT_RATE = 0.1

type PriceableCartItem = {
  price: number
  qty: number
}

type DiscountedUnitGroup = {
  sourceIndex: number
  unitAmount: number
  quantity: number
}

type CartPricingOptions = {
  promoCode?: string | null
  loyaltyEligible?: boolean
}

export type CartPricingBreakdown = {
  itemCount: number
  subtotal: number
  bundleDiscount: number
  loyaltyDiscount: number
  discountedSubtotal: number
  shipping: number
  total: number
  freeItemsCount: number
  freeShippingUnlocked: boolean
  loyaltyCodeRequested: boolean
  loyaltyCodeApplied: boolean
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
  now?: Date
}) {
  const { isRetro, isConcept = false, productKind, jerseyVersion = 'fan', now = new Date() } = params

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

export function normalizePromoCode(code?: string | null): string {
  return code?.trim().toUpperCase() ?? ''
}

export function isLoyaltyCode(value?: string | null): boolean {
  return normalizePromoCode(value) === LOYALTY_CODE
}

export function calculateShippingAmount(itemCount: number, discountedSubtotal = 0): number {
  if (itemCount <= 0) return 0
  if (discountedSubtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return STANDARD_SHIPPING_PRICE
}

export function calculateItemsSubtotal(items: PriceableCartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0)
}

export function calculateCartPricing(items: PriceableCartItem[], options: CartPricingOptions = {}): CartPricingBreakdown {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotalCents = items.reduce((sum, item) => sum + (toCents(item.price) * item.qty), 0)
  const freeItemsCount = Math.floor(itemCount / 3)
  const loyaltyCodeRequested = isLoyaltyCode(options.promoCode)
  const loyaltyCodeApplied = loyaltyCodeRequested && options.loyaltyEligible !== false

  const units = items.flatMap((item, sourceIndex) =>
    Array.from({ length: item.qty }, (_, unitIndex) => ({
      sourceIndex,
      priceCents: toCents(item.price),
      unitIndex,
    })),
  )

  const freeUnitKeys = new Set(
    [...units]
      .sort((left, right) => {
        if (left.priceCents !== right.priceCents) return left.priceCents - right.priceCents
        if (left.sourceIndex !== right.sourceIndex) return left.sourceIndex - right.sourceIndex
        return left.unitIndex - right.unitIndex
      })
      .slice(0, freeItemsCount)
      .map((unit) => `${unit.sourceIndex}:${unit.unitIndex}`),
  )

  let bundleDiscountCents = 0
  let loyaltyDiscountCents = 0
  let subtotalAfterBundleCents = 0
  const groupedUnits = new Map<string, DiscountedUnitGroup>()

  for (const unit of units) {
    const unitKey = `${unit.sourceIndex}:${unit.unitIndex}`
    const isFreeUnit = freeUnitKeys.has(unitKey)

    if (isFreeUnit) {
      bundleDiscountCents += unit.priceCents
    } else {
      subtotalAfterBundleCents += unit.priceCents
    }

    const payableCents = isFreeUnit
      ? 0
      : loyaltyCodeApplied
        ? Math.round(unit.priceCents * (1 - LOYALTY_DISCOUNT_RATE))
        : unit.priceCents

    if (!isFreeUnit && loyaltyCodeApplied) {
      loyaltyDiscountCents += unit.priceCents - payableCents
    }

    const groupKey = `${unit.sourceIndex}:${payableCents}`
    const existingGroup = groupedUnits.get(groupKey)

    if (existingGroup) {
      existingGroup.quantity += 1
    } else {
      groupedUnits.set(groupKey, {
        sourceIndex: unit.sourceIndex,
        unitAmount: fromCents(payableCents),
        quantity: 1,
      })
    }
  }

  const discountedSubtotalCents = subtotalCents - bundleDiscountCents - loyaltyDiscountCents
  const shippingCents = toCents(calculateShippingAmount(itemCount, fromCents(subtotalAfterBundleCents)))

  return {
    itemCount,
    subtotal: fromCents(subtotalCents),
    bundleDiscount: fromCents(bundleDiscountCents),
    loyaltyDiscount: fromCents(loyaltyDiscountCents),
    discountedSubtotal: fromCents(discountedSubtotalCents),
    shipping: fromCents(shippingCents),
    total: fromCents(discountedSubtotalCents + shippingCents),
    freeItemsCount,
    freeShippingUnlocked: shippingCents === 0 && itemCount > 0,
    loyaltyCodeRequested,
    loyaltyCodeApplied,
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
