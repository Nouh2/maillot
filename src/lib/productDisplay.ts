import { normalizeProductTextSeasons, resolveProductSeasonLabel } from '@/lib/season'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

type ProductLike = Pick<Product, 'name' | 'club' | 'country' | 'type' | 'season' | 'is_retro' | 'product_kind'> & {
  slug?: Product['slug']
  jersey_version?: Product['jersey_version']
}

const PLACEHOLDER_RE = /\ba\s+d[eé]finir\b/i

const PRODUCT_TYPE_DISPLAY: Record<Product['type'], string> = {
  domicile: 'Domicile',
  exterieur: 'Extérieur',
  third: 'Third',
}

const PRODUCT_KIND_DISPLAY: Record<Product['product_kind'], string> = {
  jersey: 'Maillot',
  goalkeeper: 'Gardien',
  training: 'Training',
  pre_match: 'Avant-match',
  lifestyle: 'Lifestyle',
  jacket: 'Veste',
  pants: 'Pantalon',
  shorts: 'Short',
  set: 'Ensemble',
  vest: 'Débardeur',
}

export function normalizeVisibleText(value: string): string {
  return normalizeProductTextSeasons(value)
    .replace(/\bAlgerie\b/g, 'Algérie')
    .replace(/\bBresil\b/g, 'Brésil')
    .replace(/\bExterieur\b/g, 'Extérieur')
    .replace(/\bexterieur\b/g, 'extérieur')
    .replace(/\bSecurite\b/g, 'Sécurité')
    .replace(/\bsecurisee\b/g, 'sécurisée')
    .replace(/\bsecurise\b/g, 'sécurisé')
    .replace(/\bdefinir\b/g, 'définir')
    .replace(/\bA definir\b/g, 'À définir')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasPlaceholderText(value: string | null | undefined): boolean {
  return !value?.trim() || PLACEHOLDER_RE.test(value)
}

export function hasPlaceholderSlug(value: string | null | undefined): boolean {
  return /^a-definir(?:-|$)/i.test(value ?? '')
}

function getSafeEntityName(product: Pick<ProductLike, 'club' | 'country'>): string {
  if (!hasPlaceholderText(product.club)) return normalizeVisibleText(product.club)
  if (!hasPlaceholderText(product.country)) return normalizeVisibleText(product.country)
  return ''
}

export function hasInvalidProductIdentity(product: Pick<ProductLike, 'name' | 'club'>): boolean {
  return hasPlaceholderText(product.name) || hasPlaceholderText(product.club)
}

export function isProductDisplayableInSuggestions(product: Pick<ProductLike, 'name' | 'club' | 'slug'>): boolean {
  return !hasPlaceholderSlug(product.slug) && !hasInvalidProductIdentity(product)
}

export function getProductDisplayClub(product: Pick<ProductLike, 'club' | 'country'>): string {
  return getSafeEntityName(product) || 'Maillot Addict'
}

export function getProductDisplayName(product: ProductLike): string {
  if (!hasPlaceholderText(product.name)) {
    return normalizeVisibleText(product.name)
  }

  const parts = [
    getSafeEntityName(product),
    PRODUCT_KIND_DISPLAY[product.product_kind] ?? 'Produit',
    PRODUCT_TYPE_DISPLAY[product.type],
    product.is_retro ? 'Rétro' : null,
    resolveProductSeasonLabel(product),
  ]

  return parts.filter(Boolean).join(' ').trim() || 'Maillot de football'
}

export function getCartItemDisplayName(item: Pick<CartItem, 'name'>): string {
  if (hasPlaceholderText(item.name)) return 'Maillot de football'
  return normalizeVisibleText(item.name)
}
