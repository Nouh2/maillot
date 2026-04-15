import type { Product } from '@/types/product'
import { resolveProductSeasonLabel } from '@/lib/season'

export type ProductFamily = 'fan' | 'player' | 'concept' | 'retro' | 'other'

export const JERSEY_VERSION_LABELS: Record<Product['jersey_version'], string> = {
  fan: 'Fan',
  player: 'Player',
}

export const PRODUCT_FAMILY_LABELS: Record<ProductFamily, string> = {
  fan: 'Maillot fan',
  player: 'Maillot player',
  concept: 'Maillot concept',
  retro: 'Maillot retro',
  other: 'Produit',
}

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

export function getProductFamily(
  product: Pick<Product, 'product_kind' | 'jersey_version' | 'is_retro' | 'is_concept'>
): ProductFamily {
  if (product.is_retro) return 'retro'
  if (product.is_concept) return 'concept'
  if (product.product_kind === 'jersey') return product.jersey_version === 'player' ? 'player' : 'fan'
  return 'other'
}

export function getProductFamilyLabel(
  product: Pick<Product, 'product_kind' | 'jersey_version' | 'is_retro' | 'is_concept'>
): string {
  return PRODUCT_FAMILY_LABELS[getProductFamily(product)]
}

export function getProductMetaLine(
  product: Pick<Product, 'product_kind' | 'type' | 'season' | 'name' | 'club'>
): string {
  const parts = [getProductKindLabel(product.product_kind)]
  if (showProductType(product.product_kind)) {
    parts.push(getProductTypeLabel(product.type))
  }
  const seasonLabel = resolveProductSeasonLabel(product)
  if (seasonLabel) {
    parts.push(seasonLabel)
  }
  return parts.join(' - ')
}
