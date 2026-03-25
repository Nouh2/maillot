export const FLOCAGE_PRICE = 15
export const PATCH_PRICE = 2.5

export function calculateCartItemUnitPrice(params: {
  basePrice: number
  patchCount: number
  hasFlocage: boolean
}): number {
  const { basePrice, patchCount, hasFlocage } = params

  return basePrice + (patchCount * PATCH_PRICE) + (hasFlocage ? FLOCAGE_PRICE : 0)
}
