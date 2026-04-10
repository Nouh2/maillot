import type { Product } from '@/types/product'
import { applyProductManualOverride } from '@/lib/productOverrides'
import { normalizeCatalogProduct } from '@/lib/catalogEntityRegistry'

export const CATALOG_CACHE_TAG = 'catalog-products'

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
    type: row.type ?? 'domicile',
    season: row.season ?? 'A definir',
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

  if (!options?.photoLimit) {
    return mergedProduct
  }

  return {
    ...mergedProduct,
    photos: mergedProduct.photos.slice(0, options.photoLimit),
  }
}
