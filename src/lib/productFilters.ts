import type { Product } from '@/types/product'

export const VALID_PRODUCT_TYPES = ['domicile', 'exterieur', 'third'] as const
export const VALID_DATE_FILTERS = ['recent', 'oldest'] as const
export const VALID_ALPHA_FILTERS = ['az', 'za'] as const

export type ProductTypeFilter = (typeof VALID_PRODUCT_TYPES)[number]
export type ProductDateFilter = (typeof VALID_DATE_FILTERS)[number]
export type ProductAlphaFilter = (typeof VALID_ALPHA_FILTERS)[number]

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

  if (!filters.date && !filters.alpha) {
    return filtered
  }

  const collator = new Intl.Collator('fr-FR', {
    numeric: true,
    sensitivity: 'base',
  })

  return [...filtered].sort((left, right) => {
    if (filters.alpha) {
      const byName = collator.compare(left.name, right.name)
      if (byName !== 0) {
        return filters.alpha === 'az' ? byName : -byName
      }
    }

    if (filters.date) {
      const byCreatedAt = toTimestamp(left.created_at) - toTimestamp(right.created_at)
      if (byCreatedAt !== 0) {
        return filters.date === 'oldest' ? byCreatedAt : -byCreatedAt
      }
    }

    return 0
  })
}
