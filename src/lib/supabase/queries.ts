import { unstable_cache } from 'next/cache'
import type { Club, League, Patch, Product } from '@/types/product'
import { dedupeCatalogProducts, filterConceptProducts } from '@/lib/catalogPresentation'
import { normalizeCatalogProduct, normalizeCatalogProducts } from '@/lib/catalogEntityRegistry'
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
>

const CATALOG_REVALIDATE_SECONDS = 1800
const STATIC_REVALIDATE_SECONDS = 86400

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

function toCachedCatalogProduct(row: CatalogListRow): Product {
  return {
    ...row,
    description: null,
    sizes: [],
    available_patches: Array.isArray(row.available_patches) ? row.available_patches : [],
    photos: Array.isArray(row.photos) ? row.photos.slice(0, 2) : [],
    stock: 0,
    is_active: true,
    source_provider: null,
    source_album_id: null,
    source_album_url: null,
    last_synced_at: null,
  }
}

const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = getSupabasePublicClient()
    const rawProducts = await fetchAllProducts((from, to) =>
      supabase
        .from('products')
        .select(
          'id, slug, name, club, league, country, product_kind, type, season, price, photos, available_patches, is_featured, is_retro, is_concept, source_title, source_category_key, created_at',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to),
    )

    return normalizeCatalogProducts((rawProducts as CatalogListRow[]).map(toCachedCatalogProduct))
  },
  ['catalog-products'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
)

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
    const supabase = getSupabasePublicClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) return null

    return normalizeCatalogProduct(data)
  },
  ['catalog-product-by-slug'],
  { revalidate: CATALOG_REVALIDATE_SECONDS },
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
