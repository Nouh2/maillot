import { LAUNCH_PROMO_CTA, LAUNCH_PROMO_DURATION_DAYS, LAUNCH_PROMO_ENABLED, LAUNCH_PROMO_LABEL, LAUNCH_PROMO_START_ISO } from './siteConfig'

export const FLOCAGE_PRICE = 5
export const PATCH_PRICE = 2.5
export const STANDARD_PRICE = 27.99
export const STANDARD_PROMO_PRICE = 19.99
export const RETRO_PRICE = 34.99
export const RETRO_PROMO_PRICE = 27.99

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

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

export function getProductPricing(params: { isRetro: boolean; now?: Date }) {
  const { isRetro, now = new Date() } = params
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
  if (itemCount >= 3) return 0
  if (itemCount === 2) return 5
  if (itemCount === 1) return 6
  return 0
}

export function calculateItemsSubtotal(items: Array<{ price: number; qty: number }>): number {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0)
}

export function calculateCartGrandTotal(items: Array<{ price: number; qty: number }>): number {
  const quantity = items.reduce((sum, item) => sum + item.qty, 0)
  return calculateItemsSubtotal(items) + calculateShippingAmount(quantity)
}

export function calculateCartItemUnitPrice(params: {
  basePrice: number
  patchCount: number
  hasFlocage: boolean
}): number {
  const { basePrice, patchCount, hasFlocage } = params

  return basePrice + (patchCount * PATCH_PRICE) + (hasFlocage ? FLOCAGE_PRICE : 0)
}
