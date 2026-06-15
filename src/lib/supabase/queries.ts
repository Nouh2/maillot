import { unstable_cache } from 'next/cache'
import type { Club, League, Patch, Product } from '@/types/product'
import catalogEntities from '../../../data/catalog-entities.json'
import { dedupeCatalogProducts, filterConceptProducts } from '@/lib/catalogPresentation'
import { CATALOG_CACHE_TAG, toCatalogProduct } from '@/lib/catalogProducts'
import { FAN_JERSEY_PRICE, getProductPricing } from '@/lib/cartPricing'
import { NATIONAL_TEAMS_VALUE } from '@/lib/catalog'
import { isPlaceholderSeason } from '@/lib/season'
import {
  getProductDisplayClub,
  getProductDisplayName,
  hasPlaceholderSlug,
  isProductDisplayableInSuggestions,
} from '@/lib/productDisplay'
import { getSupabasePublicClient } from './server'

type ProductQueryPage = {
  data: Product[] | null
  error: unknown
}

type CatalogListRow = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'name'
  | 'club'
  | 'league'
  | 'country'
  | 'product_kind'
  | 'jersey_version'
  | 'type'
  | 'season'
  | 'price'
  | 'photos'
  | 'available_patches'
  | 'is_featured'
  | 'is_retro'
  | 'is_concept'
  | 'source_title'
  | 'source_category_key'
  | 'created_at'
> & {
  manual_override?: unknown
}

const CATALOG_REVALIDATE_SECONDS = 60 * 60 * 6
const STATIC_REVALIDATE_SECONDS = 86400
const CATALOG_LIST_SELECT =
  'id, slug, name, club, league, country, product_kind, jersey_version, type, season, price, photos, available_patches, is_featured, is_retro, is_concept, source_title, source_category_key, created_at, manual_override'
const CATALOG_LIST_SELECT_LEGACY =
  'id, slug, name, club, league, country, product_kind, type, season, price, photos, available_patches, is_featured, is_retro, is_concept, source_title, source_category_key, created_at'
const BLOCKED_PRODUCT_SLUGS = new Set(['portugal-maillot-domicile-2026-226332504'])
const NATIONAL_TEAM_CLUBS = new Set(
  catalogEntities
    .filter((entry) => entry.league === NATIONAL_TEAMS_VALUE)
    .map((entry) => normalizePackSuggestionText(entry.club)),
)

function isBlockedProductSlug(slug: string): boolean {
  return BLOCKED_PRODUCT_SLUGS.has(slug) || hasPlaceholderSlug(slug)
}

function normalizePackSuggestionText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isNationalTeamLikeProduct(product: Product): boolean {
  const normalizedLeague = normalizePackSuggestionText(product.league)
  const normalizedClub = normalizePackSuggestionText(product.club)
  const normalizedCountry = normalizePackSuggestionText(product.country)
  const normalizedSource = normalizePackSuggestionText(product.source_category_key)

  return (
    product.league === NATIONAL_TEAMS_VALUE ||
    normalizedLeague.includes('selection') ||
    normalizedLeague.includes('coupe du monde') ||
    normalizedSource.includes('selection') ||
    normalizedSource.includes('world cup') ||
    NATIONAL_TEAM_CLUBS.has(normalizedClub) ||
    NATIONAL_TEAM_CLUBS.has(normalizedCountry)
  )
}

function isMissingCatalogOptionalColumn(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    (error.message.includes('manual_override') || error.message.includes('jersey_version'))
  )
}

async function fetchAllProducts(
  queryFactory: (from: number, to: number) => PromiseLike<ProductQueryPage>,
): Promise<Product[]> {
  const pageSize = 1000
  const all: Product[] = []
  let from = 0

  while (true) {
    const { data, error } = await queryFactory(from, from + pageSize - 1)
    if (error) throw error

    const rows = (data ?? []) as Product[]
    all.push(...rows)

    if (rows.length < pageSize) break
    from += pageSize
  }

  return all
}

const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabasePublicClient()
    let rawProducts: Product[]

    try {
      rawProducts = await fetchAllProducts((from, to) =>
        supabase
          .from('products')
          .select(CATALOG_LIST_SELECT)
          .eq('is_active', true)
          .order('id', { ascending: true })
          .range(from, to),
      )
    } catch (error) {
      if (!isMissingCatalogOptionalColumn(error)) {
        throw error
      }

      rawProducts = await fetchAllProducts((from, to) =>
        supabase
          .from('products')
          .select(CATALOG_LIST_SELECT_LEGACY)
          .eq('is_active', true)
          .order('id', { ascending: true })
          .range(from, to),
      )
    }

    return (rawProducts as CatalogListRow[])
      .filter((row) => !isBlockedProductSlug(row.slug))
      .map((row) => toCatalogProduct(row, { photoLimit: 2 }))
  },
  ['catalog-products-v3'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
)

async function fetchRelatedProductCandidates(product: Product, limit: number): Promise<Product[]> {
  const supabase = getSupabasePublicClient()
  const rowsById = new Map<string, CatalogListRow>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function collect(applyFilters: (query: any) => any, expectedLimit: number) {
    try {
      const { data, error } = await applyFilters(supabase.from('products').select(CATALOG_LIST_SELECT))
        .eq('is_active', true)
        .neq('id', product.id)
        .order('created_at', { ascending: false })
        .limit(expectedLimit)

      if (error) throw error

      for (const row of (data ?? []) as CatalogListRow[]) {
        rowsById.set(row.id, row)
      }
    } catch (error) {
      if (!isMissingCatalogOptionalColumn(error)) {
        throw error
      }

      const { data } = await applyFilters(supabase.from('products').select(CATALOG_LIST_SELECT_LEGACY))
        .eq('is_active', true)
        .neq('id', product.id)
        .order('created_at', { ascending: false })
        .limit(expectedLimit)

      for (const row of (data ?? []) as CatalogListRow[]) {
        rowsById.set(row.id, row)
      }
    }
  }

  await collect((query) => query.eq('club', product.club), limit * 3)

  if (rowsById.size < limit) {
    await collect((query) => query.eq('league', product.league), limit * 3)
  }

  if (rowsById.size < limit) {
    await collect((query) => query.eq('is_featured', true), limit * 2)
  }

  return Array.from(rowsById.values())
    .filter((row) => !isBlockedProductSlug(row.slug))
    .map((row) => toCatalogProduct(row, { photoLimit: 2 }))
    .map((candidate) => {
      let score = 0

      if (candidate.club === product.club) score += 8
      if (candidate.league === product.league) score += 5
      if (candidate.product_kind === product.product_kind) score += 3
      if (candidate.type === product.type) score += 2
      if (candidate.season === product.season) score += 1
      if (candidate.is_retro === product.is_retro) score += 1

      return { candidate, score }
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return new Date(right.candidate.created_at).getTime() - new Date(left.candidate.created_at).getTime()
    })
    .map(({ candidate }) => candidate)
    .slice(0, limit)
}

const getCachedLeagues = unstable_cache(
  async (): Promise<League[]> => {
    const supabase = getSupabasePublicClient()
    const { data } = await supabase.from('leagues').select('*').order('display_order')
    return data ?? []
  },
  ['catalog-leagues'],
  { revalidate: STATIC_REVALIDATE_SECONDS },
)

const getCachedProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    if (isBlockedProductSlug(slug)) return null

    const supabase = getSupabasePublicClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null

    return toCatalogProduct(data as Product & { manual_override?: unknown })
  },
  ['catalog-product-by-slug-v3'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
)

const getCachedPatches = unstable_cache(
  async (): Promise<Patch[]> => {
    const supabase = getSupabasePublicClient()
    const { data } = await supabase.from('patches').select('*')
    return data ?? []
  },
  ['catalog-patches'],
  { revalidate: STATIC_REVALIDATE_SECONDS },
)

const getCachedClubs = unstable_cache(
  async (leagueSlug?: string): Promise<Club[]> => {
    const supabase = getSupabasePublicClient()

    if (leagueSlug) {
      const { data: league } = await supabase.from('leagues').select('id').eq('slug', leagueSlug).single()
      const leagueRow = league as { id: string } | null
      if (!leagueRow) return []

      const { data } = await supabase.from('clubs').select('*').eq('league_id', leagueRow.id).order('name')
      return data ?? []
    }

    const { data } = await supabase.from('clubs').select('*').order('name')
    return data ?? []
  },
  ['catalog-clubs'],
  { revalidate: STATIC_REVALIDATE_SECONDS },
)

const getCachedSearchSuggestions = unstable_cache(
  async (): Promise<string[]> => {
    const suggestions = Array.from(
      new Set([
        'PSG',
        ...catalogEntities.map((entry) => entry.club),
      ]),
    ).sort((left, right) => left.localeCompare(right, 'fr-FR', { sensitivity: 'base' }))

    return ['PSG', ...suggestions.filter((suggestion) => suggestion !== 'PSG')]
  },
  ['catalog-search-suggestions-v3'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
)

export async function getProducts(filters?: {
  league?: string
  club?: string
  type?: string
  productKind?: Product['product_kind']
  featured?: boolean
  limit?: number
}): Promise<Product[]> {
  let products = await getCachedProducts()

  if (filters?.league) {
    products = products.filter((product) => product.league === filters.league)
  }

  if (filters?.club) {
    products = products.filter((product) => product.club === filters.club)
  }

  if (filters?.type) {
    products = products.filter((product) => product.type === filters.type)
  }

  if (filters?.productKind) {
    products = products.filter((product) => product.product_kind === filters.productKind)
  }

  if (filters?.featured) {
    products = products.filter((product) => product.is_featured)
  }

  if (filters?.limit) {
    products = products.slice(0, filters.limit)
  }

  return products
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getProducts({
    featured: true,
    limit,
  })
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  try {
    return await fetchRelatedProductCandidates(product, limit)
  } catch (error) {
    console.error('Related products fetch failed:', product.slug, error)
    return []
  }
}

function isFanPackSuggestion(product: Product): boolean {
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })
  const normalizedClub = normalizePackSuggestionText(product.club)

  return (
    product.product_kind === 'jersey' &&
    product.jersey_version === 'fan' &&
    !product.is_retro &&
    !product.is_concept &&
    isNationalTeamLikeProduct(product) &&
    NATIONAL_TEAM_CLUBS.has(normalizedClub) &&
    pricing.currentPrice === FAN_JERSEY_PRICE
  )
}

function isEligiblePackSuggestion(product: Product): boolean {
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  return (
    product.product_kind === 'jersey' &&
    !product.is_retro &&
    !product.is_concept &&
    pricing.currentPrice >= FAN_JERSEY_PRICE
  )
}

const PACK_SUGGESTION_PRIORITY = [
  {
    slug: 'paris-saint-germain-maillot-domicile-2026-2027',
    clubAliases: ['paris saint germain', 'psg'],
    bonusTerms: ['back', '2026 2027', '26 27', '25 26'],
  },
  {
    slug: 'portugal-maillot-exterieur-version-joueur-2026',
    clubAliases: ['portugal'],
    type: 'exterieur',
  },
  {
    slug: 'espagne-maillot-exterieur-2026',
    clubAliases: ['espagne'],
  },
] as const

function packSuggestionPriorityRank(product: Product) {
  const text = normalizePackSuggestionText(`${product.slug} ${product.name} ${product.club} ${product.country} ${product.season} ${product.type}`)
  const club = normalizePackSuggestionText(product.club)

  const exactRank = PACK_SUGGESTION_PRIORITY.findIndex((priority) => priority.slug === product.slug)
  if (exactRank !== -1) return exactRank

  const termRank = PACK_SUGGESTION_PRIORITY.findIndex((priority) => {
    const clubMatches = priority.clubAliases.some((alias) => club === normalizePackSuggestionText(alias))
    const typeMatches = !('type' in priority) || product.type === priority.type
    return clubMatches && typeMatches
  })
  if (termRank === -1) return PACK_SUGGESTION_PRIORITY.length + 20

  const priority = PACK_SUGGESTION_PRIORITY[termRank]
  const hasBonus = 'bonusTerms' in priority && priority.bonusTerms.some((term) => text.includes(normalizePackSuggestionText(term)))
  return termRank + (hasBonus ? 0 : 0.25)
}

function isPreferredPackSuggestion(product: Product) {
  const rank = packSuggestionPriorityRank(product)
  if (rank >= PACK_SUGGESTION_PRIORITY.length) return false

  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  return (
    product.product_kind === 'jersey' &&
    !product.is_retro &&
    !product.is_concept &&
    pricing.currentPrice >= FAN_JERSEY_PRICE
  )
}

function toDisplaySafePackSuggestion(product: Product): Product {
  return {
    ...product,
    name: getProductDisplayName(product),
    club: getProductDisplayClub(product),
    season: isPlaceholderSeason(product.season) ? '' : product.season,
  }
}

function dedupePackSuggestions(products: Product[]): Product[] {
  const seen = new Set<string>()
  const deduped: Product[] = []

  for (const product of products) {
    const signature = [
      normalizePackSuggestionText(product.name),
      normalizePackSuggestionText(product.league),
      normalizePackSuggestionText(product.club),
      product.is_retro ? 'retro' : 'standard',
      product.is_concept ? 'concept' : product.jersey_version,
    ].join('|')

    if (seen.has(signature)) continue

    seen.add(signature)
    deduped.push(product)
  }

  return deduped
}

function scoreContextualPackSuggestion(candidate: Product, product: Product): number {
  let score = 0

  if (normalizePackSuggestionText(candidate.club) === normalizePackSuggestionText(product.club)) score += 50
  if (normalizePackSuggestionText(candidate.country) === normalizePackSuggestionText(product.country)) score += 20
  if (normalizePackSuggestionText(candidate.league) === normalizePackSuggestionText(product.league)) score += 16
  if (candidate.product_kind === product.product_kind) score += 8
  if (candidate.jersey_version === product.jersey_version) score += 6
  if (candidate.season === product.season && !isPlaceholderSeason(candidate.season)) score += 5
  if (candidate.type !== product.type) score += 4
  if (candidate.is_featured) score += 2

  return score
}

export async function getPackSuggestionProducts(product?: Product | null, limit = 6): Promise<Product[]> {
  const currentSlug = product?.slug
  const primaryLeague = product?.league || NATIONAL_TEAMS_VALUE
  const products = await getProducts({ productKind: 'jersey' })
  const eligibleProducts = products
    .filter((candidate) => candidate.slug !== currentSlug)
    .filter(isEligiblePackSuggestion)

  const contextualProducts = product
    ? eligibleProducts
        .map((candidate) => ({ candidate, score: scoreContextualPackSuggestion(candidate, product) }))
        .filter(({ score }) => score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) return right.score - left.score
          return new Date(right.candidate.created_at).getTime() - new Date(left.candidate.created_at).getTime()
        })
        .map(({ candidate }) => candidate)
    : []

  const preferredProducts = eligibleProducts
    .filter(isPreferredPackSuggestion)
    .sort((left, right) => {
      const rankDiff = packSuggestionPriorityRank(left) - packSuggestionPriorityRank(right)
      if (rankDiff !== 0) return rankDiff
      if (left.jersey_version !== right.jersey_version) return left.jersey_version === 'fan' ? -1 : 1
      if (left.type !== right.type) return left.type === 'exterieur' ? -1 : 1
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })

  const scoredProducts = eligibleProducts
    .filter(isFanPackSuggestion)
    .map((candidate) => {
      let score = 0

      if (candidate.league === primaryLeague) score += 20
      if (candidate.league === NATIONAL_TEAMS_VALUE) score += 10
      if (candidate.is_featured) score += 5
      if (product && candidate.country === product.country) score += 2

      return { candidate, score }
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return new Date(right.candidate.created_at).getTime() - new Date(left.candidate.created_at).getTime()
    })

  return dedupePackSuggestions([
    ...contextualProducts,
    ...preferredProducts,
    ...scoredProducts.map(({ candidate }) => candidate),
  ])
    .filter(isProductDisplayableInSuggestions)
    .map(toDisplaySafePackSuggestion)
    .slice(0, limit)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getCachedProductBySlug(slug)
}

export async function getLeagues(): Promise<League[]> {
  return getCachedLeagues()
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  const leagues = await getCachedLeagues()
  return leagues.find((league) => league.slug === slug) ?? null
}

export async function getWorldCupProducts(): Promise<Product[]> {
  const products = await getProducts({ league: 'Selections nationales' })
  return dedupeCatalogProducts(
    products.filter((product) => !product.is_retro && ['2026', '2026-2027'].includes(product.season)),
  )
}

export async function getRetroProducts(): Promise<Product[]> {
  const products = await getCachedProducts()
  return dedupeCatalogProducts(products.filter((product) => product.is_retro))
}

export async function getConceptProducts(): Promise<Product[]> {
  const products = await getCachedProducts()
  return dedupeCatalogProducts(filterConceptProducts(products))
}

export async function getPatches(): Promise<Patch[]> {
  return getCachedPatches()
}

export async function getClubs(leagueSlug?: string): Promise<Club[]> {
  return getCachedClubs(leagueSlug)
}

export async function getSearchSuggestions(): Promise<string[]> {
  return getCachedSearchSuggestions()
}
