import { getSupabaseServerClient } from './server'
import type { Product, League, Club, Patch } from '@/types/product'

export async function getProducts(filters?: {
  league?: string
  club?: string
  type?: string
  featured?: boolean
  q?: string
  limit?: number
}): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (filters?.league) query = query.eq('league', filters.league)
  if (filters?.club) query = query.eq('club', filters.club)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.featured) query = query.eq('is_featured', true)
  if (filters?.q) {
    const searchTerm = `%${filters.q}%`
    query = query.or(`name.ilike.${searchTerm},club.ilike.${searchTerm},league.ilike.${searchTerm},country.ilike.${searchTerm},season.ilike.${searchTerm}`)
  }
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data
}

export async function getLeagues(): Promise<League[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('leagues')
    .select('*')
    .order('display_order')
  return data ?? []
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('leagues')
    .select('*')
    .eq('slug', slug)
    .single()
  return data ?? null
}

export async function getWorldCupProducts(): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('league', 'Selections nationales')
    .in('season', ['2026', '2026-2027'])
    .order('club')
  if (error) throw error
  return data ?? []
}

export async function getPatches(): Promise<Patch[]> {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('patches').select('*')
  return data ?? []
}

export async function getClubs(leagueSlug?: string): Promise<Club[]> {
  const supabase = await getSupabaseServerClient()

  // Note: Supabase JS v2 ne supporte pas le filtrage par join via dot-notation.
  // On résout d'abord le league_id, puis on filtre les clubs.
  if (leagueSlug) {
    const { data: league } = await supabase
      .from('leagues')
      .select('id')
      .eq('slug', leagueSlug)
      .single()
    if (!league) return []
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .eq('league_id', league.id)
      .order('name')
    return data ?? []
  }

  const { data } = await supabase.from('clubs').select('*').order('name')
  return data ?? []
}
