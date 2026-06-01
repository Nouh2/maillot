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
export const FAN_JERSEY_PRICE = 19.9
export const PLAYER_JERSEY_PRICE = 27.99
export const STANDARD_PRICE = 27.99
export const STANDARD_PROMO_PRICE = 19.99
export const RETRO_PRICE = 34.99
export const RETRO_PROMO_PRICE = 27.99
export const STANDARD_SHIPPING_PRICE = 6

const FIXED_PRODUCT_PRICES: Record<string, number> = {
  'maillot-domicile-stadium-psg-25-26-flocage-champions-of-europe': 30,
  'maillot-exterieur-stadium-psg-25-26-flocage-champions-of-europe': 30,
  'maillot-psg-jordan-night-edition-stadium-25-26-flocage-champions-of-europe': 30,
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
  amountAfterPromoCents: number
}

type CartPricingOptions = {
  promoCode?: string | null
}

export type CartPricingBreakdown = {
  itemCount: number
  subtotal: number
  discount: number
  shipping: number
  total: number
  promoCode: string | null
  promoDiscountRate: number
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

export const FREE_SHIPPING_MIN_ITEMS = 3

export function calculateShippingAmount(itemCount: number): number {
  if (itemCount <= 0) return 0
  if (itemCount >= FREE_SHIPPING_MIN_ITEMS) return 0
  return STANDARD_SHIPPING_PRICE
}

export function calculateItemsSubtotal(items: PriceableCartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0)
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
      units.push({ sourceIndex, unitCents, amountAfterPromoCents })
    }
  }

  const discountCents = promoDiscountCents
  const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents)

  const groupedUnits = new Map<string, DiscountedUnitGroup>()
  units.forEach((unit) => {
    const groupKey = `${unit.sourceIndex}:${unit.amountAfterPromoCents}`
    const existingGroup = groupedUnits.get(groupKey)
    if (existingGroup) {
      existingGroup.quantity += 1
      return
    }

    groupedUnits.set(groupKey, {
      sourceIndex: unit.sourceIndex,
      unitAmount: fromCents(unit.amountAfterPromoCents),
      quantity: 1,
    })
  })

  const shippingCents = toCents(calculateShippingAmount(itemCount))

  return {
    itemCount,
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    shipping: fromCents(shippingCents),
    total: fromCents(discountedSubtotalCents + shippingCents),
    promoCode: promoDiscountRate > 0 ? promoCode : null,
    promoDiscountRate,
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
