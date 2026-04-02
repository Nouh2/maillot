import type { Product } from '@/types/product'
import { compareProductsByRecency } from './productFilters'
import { expandCompactSeasonLabel, isPlaceholderSeason, resolveProductSeasonLabel } from './season'
import { normalizeCatalogProduct, normalizeCatalogText } from './catalogEntityRegistry'

const NATIONAL_TEAM_ALIASES: Record<string, string[]> = {
  france: ['france', 'equipe de france', 'bleus'],
  allemagne: ['allemagne', 'germany', 'dfb'],
  angleterre: ['angleterre', 'england', 'three lions'],
  argentine: ['argentine', 'argentina', 'albiceleste'],
  bresil: ['bresil', 'brazil', 'brasil', 'selecao'],
  espagne: ['espagne', 'spain', 'seleccion'],
  italie: ['italie', 'italy', 'azzurri'],
  japon: ['japon', 'japan'],
  maroc: ['maroc', 'morocco'],
  mexique: ['mexique', 'mexico'],
  paysbas: ['pays bas', 'pays-bas', 'netherlands', 'holland'],
  portugal: ['portugal', 'selecao'],
  etatsunis: ['etats unis', 'etats-unis', 'usa', 'united states'],
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

function matchesNationalTeamAlias(product: Product, normalizedQuery: string): boolean {
  const normalized = normalizeCatalogProduct(product)
  if (normalized.league !== 'Selections nationales') return false

  return Object.entries(NATIONAL_TEAM_ALIASES).some(([, aliases]) => {
    if (!aliases.includes(normalizedQuery)) return false

    const club = normalizeCatalogText(normalized.club)
    const name = normalizeCatalogText(normalized.name)

    return aliases.some((alias) => club.includes(alias) || name.includes(alias))
  })
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

  return Array.from(chosen.values()).sort(compareProductsByRecency)
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

  if (products.some((product) => matchesNationalTeamAlias(product, normalizedQuery))) {
    return products.filter((product) => matchesNationalTeamAlias(product, normalizedQuery))
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
