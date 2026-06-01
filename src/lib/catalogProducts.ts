import type { Product } from '@/types/product'
import { applyProductManualOverride } from '@/lib/productOverrides'
import { normalizeCatalogProduct } from '@/lib/catalogEntityRegistry'

export const CATALOG_CACHE_TAG = 'catalog-products'

const PSG_2026_2027_HOME_SLUG = 'paris-saint-germain-maillot-domicile-2026-2027'
const PSG_2026_2027_HOME_COVER = '/psg%20maillot.png'

function isUnavailablePlaceholderPhoto(url: string): boolean {
  return url.includes('photo.yupoo.com/12345-67890/')
}

function normalizeProductPhotos(photos: string[]): string[] {
  return photos
    .map((photo) => photo.trim())
    .filter((photo) => photo && !isUnavailablePlaceholderPhoto(photo))
}

function applyProductPhotoOverrides(product: Product): Product {
  if (product.slug !== PSG_2026_2027_HOME_SLUG) {
    return product
  }

  return {
    ...product,
    photos: [
      PSG_2026_2027_HOME_COVER,
      ...product.photos.filter((photo) => photo !== PSG_2026_2027_HOME_COVER && photo !== '/psg maillot.png'),
    ],
  }
}

export function toCatalogProduct(
  row: Partial<Product> & { manual_override?: unknown },
  options?: { photoLimit?: number; includeManualOverride?: boolean },
): Product {
  const baseProduct: Product = {
    ...row,
    id: row.id ?? '',
    slug: row.slug ?? '',
    name: row.name ?? '',
    club: row.club ?? '',
    league: row.league ?? '',
    country: row.country ?? '',
    product_kind: row.product_kind ?? 'jersey',
    jersey_version: row.jersey_version ?? 'fan',
    type: row.type ?? 'domicile',
    season: row.season ?? 'À définir',
    price: typeof row.price === 'number' ? row.price : 0,
    description: row.description ?? null,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    available_patches: Array.isArray(row.available_patches) ? row.available_patches : [],
    photos: Array.isArray(row.photos) ? row.photos : [],
    stock: typeof row.stock === 'number' ? row.stock : 0,
    is_active: row.is_active ?? true,
    is_featured: row.is_featured ?? false,
    is_retro: row.is_retro ?? false,
    is_concept: row.is_concept ?? false,
    source_provider: row.source_provider ?? null,
    source_album_id: row.source_album_id ?? null,
    source_album_url: row.source_album_url ?? null,
    source_category_key: row.source_category_key ?? null,
    source_title: row.source_title ?? null,
    last_synced_at: row.last_synced_at ?? null,
    created_at: row.created_at ?? new Date(0).toISOString(),
  }

  const normalizedProduct = normalizeCatalogProduct(baseProduct)
  const mergedProduct =
    options?.includeManualOverride === false
      ? normalizedProduct
      : applyProductManualOverride(normalizedProduct, row.manual_override)
  const productWithPhotoOverrides = applyProductPhotoOverrides(mergedProduct)
  const productWithAvailablePhotos = {
    ...productWithPhotoOverrides,
    photos: normalizeProductPhotos(productWithPhotoOverrides.photos),
  }

  if (!options?.photoLimit) {
    return productWithAvailablePhotos
  }

  return {
    ...productWithAvailablePhotos,
    photos: productWithAvailablePhotos.photos.slice(0, options.photoLimit),
  }
}
