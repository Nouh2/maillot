import type { Product } from '@/types/product'
import { extractSeasonKey, normalizeSeasonLabel, resolveProductSeasonLabel } from '@/lib/season'
import { normalizeCatalogProduct, normalizeCatalogText } from '@/lib/catalogEntityRegistry'

export const VALID_PRODUCT_TYPES = ['domicile', 'exterieur', 'third'] as const
export const VALID_DATE_FILTERS = ['recent', 'oldest'] as const
export const VALID_ALPHA_FILTERS = ['az', 'za'] as const

export type ProductTypeFilter = (typeof VALID_PRODUCT_TYPES)[number]
export type ProductDateFilter = (typeof VALID_DATE_FILTERS)[number]
export type ProductAlphaFilter = (typeof VALID_ALPHA_FILTERS)[number]

const PRODUCT_NAME_COLLATOR = new Intl.Collator('fr-FR', {
  numeric: true,
  sensitivity: 'base',
})
const DEFERRED_SEASON_LABEL = '2026-2027'

export function parseProductTypeFilter(value: string | undefined): ProductTypeFilter | undefined {
  if (value && (VALID_PRODUCT_TYPES as readonly string[]).includes(value)) {
    return value as ProductTypeFilter
  }

  return undefined
}

export function parseProductDateFilter(value: string | undefined): ProductDateFilter | undefined {
  if (value && (VALID_DATE_FILTERS as readonly string[]).includes(value)) {
    return value as ProductDateFilter
  }

  return undefined
}

export function parseProductAlphaFilter(value: string | undefined): ProductAlphaFilter | undefined {
  if (value && (VALID_ALPHA_FILTERS as readonly string[]).includes(value)) {
    return value as ProductAlphaFilter
  }

  return undefined
}

function toTimestamp(value: string): number {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getCurrentSeasonKey(): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  return month >= 6 ? year + 1 : year
}

function isDeferredSeason(product: Pick<Product, 'season' | 'name' | 'club'>): boolean {
  const resolvedSeason = normalizeSeasonLabel(resolveProductSeasonLabel(product))
  return resolvedSeason === DEFERRED_SEASON_LABEL
}

function compareProductsByDeferredSeason(
  left: Pick<Product, 'season' | 'name' | 'club'>,
  right: Pick<Product, 'season' | 'name' | 'club'>,
): number {
  const leftDeferred = isDeferredSeason(left)
  const rightDeferred = isDeferredSeason(right)

  if (leftDeferred === rightDeferred) {
    return 0
  }

  return leftDeferred ? 1 : -1
}

function getProductSeasonSortKey(product: Pick<Product, 'season' | 'name' | 'club' | 'is_retro'>): number | null {
  const seasonKey = extractSeasonKey(resolveProductSeasonLabel(product))
  if (seasonKey !== null) {
    return seasonKey
  }

  return product.is_retro ? null : getCurrentSeasonKey()
}

export function compareProductsByCreatedAt(
  left: Pick<Product, 'created_at'>,
  right: Pick<Product, 'created_at'>,
): number {
  return toTimestamp(right.created_at) - toTimestamp(left.created_at)
}

export function compareProductsAlphabetically(
  left: Pick<Product, 'name' | 'club'>,
  right: Pick<Product, 'name' | 'club'>,
): number {
  const leftProduct = normalizeCatalogProduct({
    ...left,
    club: left.club,
    name: left.name,
    league: '',
    country: '',
    slug: '',
    description: null,
    source_title: null,
    source_category_key: null,
  })
  const rightProduct = normalizeCatalogProduct({
    ...right,
    club: right.club,
    name: right.name,
    league: '',
    country: '',
    slug: '',
    description: null,
    source_title: null,
    source_category_key: null,
  })

  const byClub = PRODUCT_NAME_COLLATOR.compare(
    normalizeCatalogText(leftProduct.club),
    normalizeCatalogText(rightProduct.club),
  )
  if (byClub !== 0) {
    return byClub
  }

  return PRODUCT_NAME_COLLATOR.compare(left.name, right.name)
}

export function compareProductsByDefaultOrder(
  left: Pick<Product, 'name' | 'club' | 'season' | 'created_at' | 'is_retro'>,
  right: Pick<Product, 'name' | 'club' | 'season' | 'created_at' | 'is_retro'>,
): number {
  const byDeferredSeason = compareProductsByDeferredSeason(left, right)
  if (byDeferredSeason !== 0) {
    return byDeferredSeason
  }

  const leftSeason = getProductSeasonSortKey(left)
  const rightSeason = getProductSeasonSortKey(right)

  if (leftSeason !== null && rightSeason !== null && leftSeason !== rightSeason) {
    return rightSeason - leftSeason
  }

  if (leftSeason !== null && rightSeason === null) {
    return -1
  }

  if (leftSeason === null && rightSeason !== null) {
    return 1
  }

  const byName = compareProductsAlphabetically(left, right)
  if (byName !== 0) {
    return byName
  }

  return compareProductsByCreatedAt(left, right)
}

export function compareProductsByRecency(left: Pick<Product, 'season' | 'created_at'>, right: Pick<Product, 'season' | 'created_at'>): number {
  const byDeferredSeason = compareProductsByDeferredSeason(
    { ...left, name: '', club: '' },
    { ...right, name: '', club: '' },
  )
  if (byDeferredSeason !== 0) {
    return byDeferredSeason
  }

  const leftSeason = extractSeasonKey(left.season)
  const rightSeason = extractSeasonKey(right.season)

  if (leftSeason !== null && rightSeason !== null && leftSeason !== rightSeason) {
    return rightSeason - leftSeason
  }

  if (leftSeason !== null && rightSeason === null) {
    return -1
  }

  if (leftSeason === null && rightSeason !== null) {
    return 1
  }

  return compareProductsByCreatedAt(left, right)
}

export function sortProductsByRecency<T extends Pick<Product, 'season' | 'created_at'>>(products: T[]): T[] {
  return [...products].sort(compareProductsByRecency)
}

export function sortProductsByDefaultOrder<T extends Pick<Product, 'name' | 'club' | 'season' | 'created_at' | 'is_retro'>>(products: T[]): T[] {
  return [...products].sort(compareProductsByDefaultOrder)
}

export function applyProductFilters(
  products: Product[],
  filters: {
    league?: string
    type?: ProductTypeFilter
    date?: ProductDateFilter
    alpha?: ProductAlphaFilter
  },
): Product[] {
  const filteredByLeague = filters.league
    ? products.filter((product) => product.league === filters.league)
    : products

  const filtered = filters.type
    ? filteredByLeague.filter((product) => product.type === filters.type)
    : filteredByLeague

  return [...filtered].sort((left, right) => {
    const byDeferredSeason = compareProductsByDeferredSeason(left, right)
    if (byDeferredSeason !== 0) {
      return byDeferredSeason
    }

    if (filters.alpha) {
      const byName = compareProductsAlphabetically(left, right)
      if (byName !== 0) {
        return filters.alpha === 'az' ? byName : -byName
      }
    }

    if (filters.date) {
      const byCreatedAt = compareProductsByCreatedAt(left, right)
      if (byCreatedAt !== 0) {
        return filters.date === 'oldest' ? -byCreatedAt : byCreatedAt
      }
    }

    if (!filters.date) {
      const byDefault = compareProductsByDefaultOrder(left, right)
      if (byDefault !== 0) {
        return byDefault
      }
    }

    const byName = compareProductsAlphabetically(left, right)
    if (byName !== 0) {
      return filters.alpha === 'za' ? -byName : byName
    }

    return compareProductsByDefaultOrder(left, right)
  })
}
