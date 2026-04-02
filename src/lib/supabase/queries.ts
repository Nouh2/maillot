import type { Club, League, Patch, Product } from '@/types/product'
import { dedupeCatalogProducts, filterConceptProducts } from '@/lib/catalogPresentation'
import { normalizeCatalogProduct, normalizeCatalogProducts } from '@/lib/catalogEntityRegistry'
import { getSupabaseServerClient } from './server'

type ProductQueryPage = {
  data: Product[] | null
  error: unknown
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

export async function getProducts(filters?: {
  league?: string
  club?: string
  type?: string
  productKind?: Product['product_kind']
  featured?: boolean
  limit?: number
}): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()
  const rawProducts = await fetchAllProducts((from, to) => {
    let query = supabase.from('products').select('*').eq('is_active', true)

    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.productKind) query = query.eq('product_kind', filters.productKind)
    if (filters?.featured) query = query.eq('is_featured', true)

    return query.order('created_at', { ascending: false }).range(from, to)
  })

  let products = normalizeCatalogProducts(rawProducts)

  if (filters?.league) {
    products = products.filter((product) => product.league === filters.league)
  }

  if (filters?.club) {
    products = products.filter((product) => product.club === filters.club)
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
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).single()
  if (error) return null
  return normalizeCatalogProduct(data)
}

export async function getLeagues(): Promise<League[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('leagues').select('*').order('display_order')
  return data ?? []
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('leagues').select('*').eq('slug', slug).single()
  return data ?? null
}

export async function getWorldCupProducts(): Promise<Product[]> {
  const products = await getProducts({ league: 'Selections nationales' })
  return dedupeCatalogProducts(
    products.filter((product) => !product.is_retro && ['2026', '2026-2027'].includes(product.season)),
  )
}

export async function getRetroProducts(): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()
  const rawProducts = await fetchAllProducts((from, to) =>
    supabase.from('products').select('*').eq('is_active', true).eq('is_retro', true).order('created_at', { ascending: false }).range(from, to),
  )

  return dedupeCatalogProducts(normalizeCatalogProducts(rawProducts))
}

export async function getConceptProducts(): Promise<Product[]> {
  const products = await getProducts()
  return dedupeCatalogProducts(filterConceptProducts(products))
}

export async function getPatches(): Promise<Patch[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('patches').select('*')
  return data ?? []
}

export async function getClubs(leagueSlug?: string): Promise<Club[]> {
  const supabase = await getSupabaseServerClient()

  if (leagueSlug) {
    const { data: league } = await supabase.from('leagues').select('id').eq('slug', leagueSlug).single()
    if (!league) return []

    const { data } = await supabase.from('clubs').select('*').eq('league_id', league.id).order('name')
    return data ?? []
  }

  const { data } = await supabase.from('clubs').select('*').order('name')
  return data ?? []
}
