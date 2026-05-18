export const ABANDONED_CART_PROMO_CODE = 'ADDICT10'
export const ABANDONED_CART_PROMO_RATE = 0.1

export function normalizePromoCode(code?: string | null): string | null {
  const normalized = code?.trim().toUpperCase()
  return normalized || null
}

export function getPromoDiscountRate(code?: string | null): number {
  return normalizePromoCode(code) === ABANDONED_CART_PROMO_CODE ? ABANDONED_CART_PROMO_RATE : 0
}

export function isSupportedPromoCode(code?: string | null): boolean {
  return getPromoDiscountRate(code) > 0
}
