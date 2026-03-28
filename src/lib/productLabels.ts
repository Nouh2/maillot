import type { Product } from '@/types/product'
import { normalizeSeasonLabel } from '@/lib/season'

export const PRODUCT_TYPE_LABELS: Record<Product['type'], string> = {
  domicile: 'Domicile',
  exterieur: 'Exterieur',
  third: 'Third',
}

export const PRODUCT_KIND_LABELS: Record<Product['product_kind'], string> = {
  jersey: 'Maillot',
  goalkeeper: 'Gardien',
  training: 'Training',
  pre_match: 'Avant-match',
  lifestyle: 'Lifestyle',
  jacket: 'Veste',
  pants: 'Pantalon',
  shorts: 'Short',
  set: 'Ensemble',
  vest: 'Debardeur',
}

export function getProductTypeLabel(type: Product['type']): string {
  return PRODUCT_TYPE_LABELS[type]
}

export function getProductKindLabel(kind: Product['product_kind']): string {
  return PRODUCT_KIND_LABELS[kind]
}

export function showProductType(kind: Product['product_kind']): boolean {
  return kind === 'jersey' || kind === 'goalkeeper'
}

export function getProductMetaLine(
  product: Pick<Product, 'product_kind' | 'type' | 'season'>
): string {
  const parts = [getProductKindLabel(product.product_kind)]
  if (showProductType(product.product_kind)) {
    parts.push(getProductTypeLabel(product.type))
  }
  if (product.season) {
    parts.push(normalizeSeasonLabel(product.season))
  }
  return parts.join(' - ')
}
