import type { Product } from '@/types/product'
import { compareProductsByRecency, sortProductsByDefaultOrder } from './productFilters'
import { expandCompactSeasonLabel, isPlaceholderSeason, resolveProductSeasonLabel } from './season'
import { normalizeCatalogProduct, normalizeCatalogText } from './catalogEntityRegistry'
import catalogEntities from '../../data/catalog-entities.json'

// Build national team lookup from all Selections nationales entries in the catalog
const NATIONAL_TEAM_QUERY_MAP = new Map<string, string>()

for (const entry of catalogEntities) {
  if (entry.league !== 'Selections nationales') continue
  const clubNorm = normalizeCatalogText(entry.club)
  NATIONAL_TEAM_QUERY_MAP.set(clubNorm, entry.club)
  for (const alias of (entry as { aliases?: string[] }).aliases ?? []) {
    NATIONAL_TEAM_QUERY_MAP.set(normalizeCatalogText(alias), entry.club)
  }
}

function resolveNationalTeamClub(normalizedQuery: string): string | null {
  return NATIONAL_TEAM_QUERY_MAP.get(normalizedQuery) ?? null
}

function matchesNationalTeamClub(product: Product, canonicalClub: string): boolean {
  const normalized = normalizeCatalogProduct(product)
  if (normalized.league !== 'Selections nationales') return false
  return normalizeCatalogText(normalized.club) === normalizeCatalogText(canonicalClub)
}

function getProductSignature(product: Product): string {
  const normalized = normalizeCatalogProduct(product)
  return [
    normalizeCatalogText(normalized.name),
    normalizeCatalogText(normalized.league),
    normalizeCatalogText(normalized.club),
    normalized.is_retro ? 'retro' : 'standard',
  ].join('|')
}

function scoreProductCompleteness(product: Product): number {
  const photoCount = product.photos.length
  const seasonScore = isPlaceholderSeason(product.season) ? 0 : 4
  const titleSeasonScore = expandCompactSeasonLabel(product.name) ? 2 : 0
  const featuredScore = product.is_featured ? 3 : 0
  const nameScore = product.name.length / 100

  return photoCount + seasonScore + titleSeasonScore + featuredScore + nameScore
}

function isBetterCatalogCandidate(next: Product, current: Product): boolean {
  const scoreGap = scoreProductCompleteness(next) - scoreProductCompleteness(current)
  if (scoreGap !== 0) return scoreGap > 0

  return compareProductsByRecency(next, current) < 0
}

function isExactLeagueQuery(normalizedQuery: string, product: Product): boolean {
  return normalizeCatalogText(normalizeCatalogProduct(product).league) === normalizedQuery
}

function getSearchHaystack(product: Product): string {
  const normalized = normalizeCatalogProduct(product)
  return [
    normalized.name,
    normalized.club,
    resolveProductSeasonLabel(normalized),
    normalized.product_kind,
    normalized.type,
  ]
    .map(normalizeCatalogText)
    .join(' ')
}

export function dedupeCatalogProducts(products: Product[]): Product[] {
  const chosen = new Map<string, Product>()

  for (const product of products) {
    const signature = getProductSignature(product)
    const current = chosen.get(signature)

    if (!current || isBetterCatalogCandidate(product, current)) {
      chosen.set(signature, product)
    }
  }

  return sortProductsByDefaultOrder(Array.from(chosen.values()))
}

export function isConceptProduct(product: Product): boolean {
  return product.is_concept === true
}

export function filterStandardCatalogProducts(products: Product[]): Product[] {
  return products.filter((product) => !product.is_retro && !isConceptProduct(product))
}

export function filterConceptProducts(products: Product[]): Product[] {
  return products.filter((product) => !product.is_retro && isConceptProduct(product))
}

export function searchCatalogProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = normalizeCatalogText(query)
  if (!normalizedQuery) return products

  // If query matches a national team name or alias → return ONLY that country's team products
  const nationalTeamClub = resolveNationalTeamClub(normalizedQuery)
  if (nationalTeamClub) {
    const nationalTeamResults = products.filter((product) => matchesNationalTeamClub(product, nationalTeamClub))
    if (nationalTeamResults.length > 0) return nationalTeamResults
    // Fall through to standard search if no results in catalog
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean)

  return products.filter((product) => {
    if (isExactLeagueQuery(normalizedQuery, product)) {
      return true
    }

    const haystack = getSearchHaystack(product)
    return tokens.every((token) => haystack.includes(token))
  })
}

export function getClubFilterOptions(products: Product[]): string[] {
  const clubs = new Set<string>()

  for (const product of products) {
    clubs.add(normalizeCatalogProduct(product).club)
  }

  return Array.from(clubs).sort((left, right) =>
    left.localeCompare(right, 'fr-FR', { sensitivity: 'base' }),
  )
}
