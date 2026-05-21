import { getLeagueFilterOptions } from '@/lib/catalog'
import { toCatalogProduct } from '@/lib/catalogProducts'
import { normalizeCatalogText } from '@/lib/catalogEntityRegistry'
import {
  getManualOverrideFieldList,
  hasManualOverride,
  normalizeProductManualOverride,
  PRODUCT_MANUAL_OVERRIDE_FIELDS,
} from '@/lib/productOverrides'
import { getLeagues } from '@/lib/supabase/queries'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import type { League, Product } from '@/types/product'
import type { OpsProductDetail, OpsProductDraft, OpsProductSummary, ProductManualOverride } from '@/types/productAdmin'

const VALID_PRODUCT_KINDS: Product['product_kind'][] = [
  'jersey',
  'goalkeeper',
  'training',
  'pre_match',
  'lifestyle',
  'jacket',
  'pants',
  'shorts',
  'set',
  'vest',
]

const VALID_PRODUCT_TYPES: Product['type'][] = ['domicile', 'exterieur', 'third']
const VALID_JERSEY_VERSIONS: Product['jersey_version'][] = ['fan', 'player']

const OPS_PRODUCT_LIST_SELECT = [
  'id',
  'slug',
  'name',
  'club',
  'league',
  'country',
  'product_kind',
  'jersey_version',
  'type',
  'season',
  'photos',
  'is_active',
  'is_retro',
  'is_concept',
  'source_provider',
  'source_title',
  'last_synced_at',
  'created_at',
  'manual_override',
  'manual_override_updated_at',
].join(', ')

type ProductRow = Product & {
  manual_override?: unknown
  manual_override_updated_at?: string | null
}

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

function isMissingOptionalCatalogColumn(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    (error.message.includes('manual_override') || error.message.includes('jersey_version'))
  )
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => normalizeString(entry))
    .filter((entry): entry is string => Boolean(entry))
}

function sameValue(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => item === right[index])
  }

  return left === right
}

function toOpsProductSummary(row: ProductRow): OpsProductSummary {
  const product = toCatalogProduct(row, { photoLimit: 2 })

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    club: product.club,
    league: product.league,
    season: product.season,
    product_kind: product.product_kind,
    jersey_version: product.jersey_version,
    photos: product.photos,
    is_active: product.is_active,
    is_retro: product.is_retro,
    is_concept: product.is_concept,
    created_at: product.created_at,
    has_manual_override: hasManualOverride(row.manual_override),
    manual_override_updated_at: row.manual_override_updated_at ?? null,
    source_provider: product.source_provider,
    source_title: product.source_title,
    last_synced_at: product.last_synced_at,
  }
}

function toOpsProductDetail(row: ProductRow): OpsProductDetail {
  const product = toCatalogProduct(row)

  return {
    ...product,
    has_manual_override: hasManualOverride(row.manual_override),
    manual_override_fields: getManualOverrideFieldList(row.manual_override),
    manual_override_updated_at: row.manual_override_updated_at ?? null,
  }
}

function matchesOpsProductQuery(summary: OpsProductSummary, query: string): boolean {
  const normalizedQuery = normalizeCatalogText(query)
  if (!normalizedQuery) return true

  const haystack = normalizeCatalogText(
    [summary.name, summary.club, summary.league, summary.slug, summary.season].filter(Boolean).join(' '),
  )

  return normalizedQuery.split(' ').every((token) => haystack.includes(token))
}

export async function getOpsLeagueOptions(): Promise<League[]> {
  const leagues = await getLeagues()
  return getLeagueFilterOptions(leagues)
}

export async function getOpsProductSummaries(filters?: {
  q?: string
  league?: string
  status?: 'all' | 'active' | 'inactive'
  retro?: 'all' | 'true' | 'false'
  concept?: 'all' | 'true' | 'false'
}): Promise<OpsProductSummary[]> {
  let data: ProductRow[] | null = null

  const initialQuery = await service()
    .from('products')
    .select(OPS_PRODUCT_LIST_SELECT)
    .order('created_at', { ascending: false })

  if (initialQuery.error && isMissingOptionalCatalogColumn(initialQuery.error)) {
    const fallbackQuery = await service()
      .from('products')
      .select(OPS_PRODUCT_LIST_SELECT.replace('jersey_version, ', '').replace(', manual_override, manual_override_updated_at', ''))
      .order('created_at', { ascending: false })

    if (fallbackQuery.error) {
      throw fallbackQuery.error
    }

    data = fallbackQuery.data as ProductRow[] | null
  } else if (initialQuery.error) {
    throw initialQuery.error
  } else {
    data = initialQuery.data as ProductRow[] | null
  }

  return (data ?? [])
    .map(toOpsProductSummary)
    .filter((summary) => {
      if (filters?.league && summary.league !== filters.league) return false
      if (filters?.status === 'active' && !summary.is_active) return false
      if (filters?.status === 'inactive' && summary.is_active) return false
      if (filters?.retro === 'true' && !summary.is_retro) return false
      if (filters?.retro === 'false' && summary.is_retro) return false
      if (filters?.concept === 'true' && !summary.is_concept) return false
      if (filters?.concept === 'false' && summary.is_concept) return false
      if (filters?.q && !matchesOpsProductQuery(summary, filters.q)) return false
      return true
    })
}

export async function getOpsProductById(productId: string): Promise<OpsProductDetail | null> {
  const { data, error } = await service()
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return toOpsProductDetail(data as ProductRow)
}

function deriveCountryFromLeagueName(leagueName: string, leagues: League[]): string | null {
  const match = leagues.find((league) => league.name === leagueName)
  return match?.country ?? null
}

function sanitizeDraftValue(
  value: unknown,
  baseProduct: Product,
  leagues: League[],
): OpsProductDraft {
  const name = normalizeString((value as OpsProductDraft | null)?.name)
  const club = normalizeString((value as OpsProductDraft | null)?.club)
  const league = normalizeString((value as OpsProductDraft | null)?.league)
  const season = normalizeString((value as OpsProductDraft | null)?.season)
  const productKind = normalizeString((value as OpsProductDraft | null)?.product_kind) as Product['product_kind'] | null
  const jerseyVersion = normalizeString((value as OpsProductDraft | null)?.jersey_version) as Product['jersey_version'] | null
  const type = normalizeString((value as OpsProductDraft | null)?.type) as Product['type'] | null
  const isRetro = (value as OpsProductDraft | null)?.is_retro
  const isConcept = (value as OpsProductDraft | null)?.is_concept
  const isActive = (value as OpsProductDraft | null)?.is_active
  const photos = normalizeStringArray((value as OpsProductDraft | null)?.photos)

  if (!name || !club || !league || !season || !productKind || !jerseyVersion || !type) {
    throw new Error('Champs produit invalides')
  }

  if (!VALID_PRODUCT_KINDS.includes(productKind)) {
    throw new Error('Type de produit invalide')
  }

  if (!VALID_JERSEY_VERSIONS.includes(jerseyVersion)) {
    throw new Error('Version de maillot invalide')
  }

  if (!VALID_PRODUCT_TYPES.includes(type)) {
    throw new Error('Variation de maillot invalide')
  }

  if (typeof isRetro !== 'boolean' || typeof isConcept !== 'boolean' || typeof isActive !== 'boolean') {
    throw new Error('Toggles produit invalides')
  }

  const country = deriveCountryFromLeagueName(league, leagues) ?? baseProduct.country

  return {
    name,
    club,
    league,
    country,
    season,
    product_kind: productKind,
    jersey_version: jerseyVersion,
    type,
    is_retro: isRetro,
    is_concept: isConcept,
    is_active: isActive,
    photos,
  }
}

export async function saveOpsProductDraft(productId: string, draftInput: unknown): Promise<OpsProductDetail | null> {
  const { data, error } = await service()
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const row = data as ProductRow
  const baseProduct = toCatalogProduct(row, { includeManualOverride: false })
  const leagues = await getOpsLeagueOptions()
  const draft = sanitizeDraftValue(draftInput, baseProduct, leagues)

  const nextManualOverride: ProductManualOverride = {}
  for (const field of PRODUCT_MANUAL_OVERRIDE_FIELDS) {
    if (!sameValue(draft[field], baseProduct[field])) {
      ;(nextManualOverride as Record<string, unknown>)[field] = draft[field]
    }
  }

  const normalizedManualOverride = normalizeProductManualOverride(nextManualOverride)
  const hasOverride = hasManualOverride(normalizedManualOverride)

  const { data: updatedRow, error: updateError } = await service()
    .from('products')
    .update({
      is_active: draft.is_active,
      is_concept: draft.is_concept,
      manual_override: normalizedManualOverride,
      manual_override_updated_at: hasOverride ? new Date().toISOString() : null,
    })
    .eq('id', productId)
    .select('*')
    .single()

  if (updateError) {
    if (isMissingOptionalCatalogColumn(updateError)) {
      throw new Error('Les migrations Supabase catalogue doivent être appliquées avant la sauvegarde produit')
    }
    throw updateError
  }

  return toOpsProductDetail(updatedRow as ProductRow)
}

export async function deleteOpsProductFromSite(productId: string): Promise<OpsProductDetail | null> {
  const { data: updatedRow, error } = await service()
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)
    .select('*')
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!updatedRow) {
    return null
  }

  return toOpsProductDetail(updatedRow as ProductRow)
}
