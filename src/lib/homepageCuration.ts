import { unstable_cache } from 'next/cache'
import { dedupeCatalogProducts, filterStandardCatalogProducts } from '@/lib/catalogPresentation'
import { sortProductsByDefaultOrder } from '@/lib/productFilters'
import { getSupabasePublicClient, getSupabaseServiceClient } from '@/lib/supabase/server'
import type {
  HomepageBestsellerTab,
  HomepageCurationAssignment,
  HomepageCurationEditorGroup,
  HomepageCurationEditorSection,
  HomepageCurationProductOption,
  HomepageCurationSection,
  HomepageFastMoverGroup,
} from '@/types/homepageCuration'
import type { League, Product } from '@/types/product'

export const HOMEPAGE_CURATION_CACHE_TAG = 'homepage-curation'
const HOMEPAGE_CURATION_REVALIDATE_SECONDS = 60 * 60 * 6
const TOP_MOMENT_SLOT_LABELS = ['Grande carte', 'Carte 2', 'Carte 3', 'Carte 4'] as const
const FAST_MOVER_SLOT_LABELS = ['Carte 1', 'Carte 2', 'Carte 3', 'Carte 4', 'Carte 5', 'Carte 6'] as const

type HomepageCatalogSource = {
  allCatalogProducts: Product[]
  homeLeagues: League[]
  homeLeagueProducts: Array<{
    key: string
    label: string
    href: string
    candidateProducts: Product[]
    curatedFallbackProducts: Product[]
  }>
  topProducts: Product[]
  worldCupProducts: Product[]
  heroProducts: Array<Product | null>
}

function service() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getSupabaseServiceClient() as any
}

function isMissingHomepageCurationTable(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    (error.message.includes('homepage_curation_slots') || error.message.includes('relation'))
  )
}

function dedupeProducts(...groups: Product[][]): Product[] {
  return dedupeCatalogProducts(groups.flat())
}

function pickNewestProducts(products: Product[], limit: number, distinctKey?: (product: Product) => string): Product[] {
  const sorted = sortProductsByDefaultOrder(products)

  if (!distinctKey) return sorted.slice(0, limit)

  const picked: Product[] = []
  const seenKeys = new Set<string>()
  const seenIds = new Set<string>()

  for (const product of sorted) {
    const key = distinctKey(product)
    if (seenKeys.has(key)) continue
    picked.push(product)
    seenKeys.add(key)
    seenIds.add(product.id)
    if (picked.length === limit) return picked
  }

  for (const product of sorted) {
    if (seenIds.has(product.id)) continue
    picked.push(product)
    if (picked.length === limit) return picked
  }

  return picked
}

function toGroupKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getAssignmentsByGroup(assignments: HomepageCurationAssignment[], section: HomepageCurationSection) {
  const map = new Map<string, Array<string | null>>()

  for (const assignment of assignments) {
    if (assignment.section !== section) continue
    const slots = map.get(assignment.group_key) ?? []
    slots[assignment.slot_index] = assignment.product_id
    map.set(assignment.group_key, slots)
  }

  return map
}

function resolveOrderedSlots(
  slotCount: number,
  assignments: Array<string | null | undefined>,
  fallbackBySlot: Array<Product | null | undefined>,
  fallbackPool: Product[],
  productsById: Map<string, Product>,
): Array<Product | null> {
  const resolved = new Array<Product | null>(slotCount).fill(null)
  const usedIds = new Set<string>()
  let poolIndex = 0

  for (let index = 0; index < slotCount; index += 1) {
    const productId = assignments[index]
    if (!productId) continue
    const product = productsById.get(productId)
    if (!product || usedIds.has(product.id)) continue
    resolved[index] = product
    usedIds.add(product.id)
  }

  for (let index = 0; index < slotCount; index += 1) {
    if (resolved[index]) continue

    const exactFallback = fallbackBySlot[index]
    if (exactFallback === null) {
      resolved[index] = null
      continue
    }

    if (exactFallback && !usedIds.has(exactFallback.id)) {
      resolved[index] = exactFallback
      usedIds.add(exactFallback.id)
      continue
    }

    while (poolIndex < fallbackPool.length) {
      const candidate = fallbackPool[poolIndex]
      poolIndex += 1
      if (usedIds.has(candidate.id)) continue
      resolved[index] = candidate
      usedIds.add(candidate.id)
      break
    }
  }

  return resolved
}

const getCachedHomepageCurationAssignments = unstable_cache(
  async (): Promise<HomepageCurationAssignment[]> => {
    const supabase = getSupabasePublicClient()
    const { data, error } = await supabase
      .from('homepage_curation_slots')
      .select('section, group_key, slot_index, product_id')
      .order('section')
      .order('group_key')
      .order('slot_index')

    if (error) {
      if (isMissingHomepageCurationTable(error)) {
        return []
      }
      throw error
    }

    return (data ?? []) as HomepageCurationAssignment[]
  },
  ['homepage-curation'],
  { revalidate: HOMEPAGE_CURATION_REVALIDATE_SECONDS, tags: [HOMEPAGE_CURATION_CACHE_TAG] },
)

export async function getHomepageCurationAssignments(): Promise<HomepageCurationAssignment[]> {
  return getCachedHomepageCurationAssignments()
}

export async function replaceHomepageCurationAssignments(
  assignmentsInput: HomepageCurationAssignment[],
): Promise<HomepageCurationAssignment[]> {
  const normalizedAssignments = assignmentsInput
    .filter((assignment) => assignment.group_key && assignment.product_id)
    .map((assignment) => ({
      section: assignment.section,
      group_key: assignment.group_key,
      slot_index: assignment.slot_index,
      product_id: assignment.product_id,
    }))
    .sort((left, right) => {
      if (left.section !== right.section) return left.section.localeCompare(right.section)
      if (left.group_key !== right.group_key) return left.group_key.localeCompare(right.group_key)
      return left.slot_index - right.slot_index
    })

  const deleteQuery = await service().from('homepage_curation_slots').delete().neq('section', '')
  if (deleteQuery.error) {
    if (isMissingHomepageCurationTable(deleteQuery.error)) {
      throw new Error('La migration Supabase 20260411121500_homepage_curation_slots.sql doit etre appliquee avant la sauvegarde home')
    }
    throw deleteQuery.error
  }

  if (normalizedAssignments.length === 0) {
    return []
  }

  const insertQuery = await service()
    .from('homepage_curation_slots')
    .insert(normalizedAssignments)
    .select('section, group_key, slot_index, product_id')
    .order('section')
    .order('group_key')
    .order('slot_index')

  if (insertQuery.error) {
    if (isMissingHomepageCurationTable(insertQuery.error)) {
      throw new Error('La migration Supabase 20260411121500_homepage_curation_slots.sql doit etre appliquee avant la sauvegarde home')
    }
    throw insertQuery.error
  }

  return (insertQuery.data ?? []) as HomepageCurationAssignment[]
}

export async function getHomepageCurationAssignmentsForOps(): Promise<HomepageCurationAssignment[]> {
  const { data, error } = await service()
    .from('homepage_curation_slots')
    .select('section, group_key, slot_index, product_id')
    .order('section')
    .order('group_key')
    .order('slot_index')

  if (error) {
    if (isMissingHomepageCurationTable(error)) {
      return []
    }
    throw error
  }

  return (data ?? []) as HomepageCurationAssignment[]
}

export function buildHomepageCatalogSource(allLeagues: League[], rawCatalogProducts: Product[]): HomepageCatalogSource {
  const leagues = allLeagues.filter((league) => league.slug !== 'champions-league')
  const homeLeagues = leagues.slice(0, 4)
  const allCatalogProducts = dedupeCatalogProducts(filterStandardCatalogProducts(rawCatalogProducts))
  const worldCupProducts = dedupeCatalogProducts(
    allCatalogProducts.filter((product) => product.league === 'Selections nationales' && ['2026', '2026-2027'].includes(product.season)),
  )
  const recentProducts = sortProductsByDefaultOrder(allCatalogProducts)
  const preMatchProducts = allCatalogProducts.filter((product) => product.product_kind === 'pre_match')

  const homeLeagueProducts = homeLeagues.map((league) => ({
    key: league.slug,
    label: league.name,
    href: `/ligue/${league.slug}`,
    candidateProducts: allCatalogProducts.filter((product) => product.league === league.name),
    curatedFallbackProducts: pickNewestProducts(
      allCatalogProducts.filter((product) => product.league === league.name),
      8,
      (product) => product.club,
    ),
  }))

  const homeCatalogProducts = dedupeProducts(...homeLeagueProducts.map((group) => group.curatedFallbackProducts))
  const topProducts = pickNewestProducts(homeCatalogProducts, 3, (product) => `${product.league}:${product.club}`)
  const latestPreMatch = pickNewestProducts(preMatchProducts, 1)[0] ?? null
  const heroProducts = [recentProducts[0] ?? null, recentProducts[1] ?? null, recentProducts[2] ?? null, latestPreMatch]

  return {
    allCatalogProducts,
    homeLeagues,
    homeLeagueProducts,
    topProducts,
    worldCupProducts,
    heroProducts,
  }
}

export function buildHomepageBestsellerTabs(
  source: HomepageCatalogSource,
  assignments: HomepageCurationAssignment[],
): HomepageBestsellerTab[] {
  const productsById = new Map(source.allCatalogProducts.map((product) => [product.id, product]))
  const assignmentsByGroup = getAssignmentsByGroup(assignments, 'top_moment')

  const allSlots = resolveOrderedSlots(
    TOP_MOMENT_SLOT_LABELS.length,
    assignmentsByGroup.get('all') ?? [],
    [null, ...source.topProducts],
    source.topProducts,
    productsById,
  )

  const allTab: HomepageBestsellerTab = {
    key: 'all',
    label: 'Tous',
    href: '/shop',
    featuredProduct: allSlots[0],
    cards: allSlots.slice(1).filter((product): product is Product => Boolean(product)),
  }

  const leagueTabs = source.homeLeagueProducts.map((group) => {
    const slots = resolveOrderedSlots(
      TOP_MOMENT_SLOT_LABELS.length,
      assignmentsByGroup.get(group.key) ?? [],
      group.curatedFallbackProducts.length > 0
        ? [group.curatedFallbackProducts[0], ...group.curatedFallbackProducts.slice(1, 4)]
        : [],
      group.curatedFallbackProducts,
      productsById,
    )

    return {
      key: group.key,
      label: group.label,
      href: group.href,
      featuredProduct: slots[0],
      cards: slots.slice(1).filter((product): product is Product => Boolean(product)),
    }
  })

  return [allTab, ...leagueTabs]
}

export function buildHomepageFastMoverGroups(
  source: HomepageCatalogSource,
  assignments: HomepageCurationAssignment[],
): HomepageFastMoverGroup[] {
  const productsById = new Map(source.worldCupProducts.map((product) => [product.id, product]))
  const assignmentsByGroup = getAssignmentsByGroup(assignments, 'fast_movers')
  const countries = Array.from(new Set(source.worldCupProducts.map((product) => product.club))).sort((left, right) =>
    left.localeCompare(right, 'fr-FR', { sensitivity: 'base' }),
  )

  return countries.map((country) => {
    const key = toGroupKey(country)
    const defaultProducts = source.worldCupProducts.filter((product) => product.club === country).slice(0, FAST_MOVER_SLOT_LABELS.length)
    const slots = resolveOrderedSlots(
      FAST_MOVER_SLOT_LABELS.length,
      assignmentsByGroup.get(key) ?? [],
      defaultProducts,
      defaultProducts,
      productsById,
    )

    return {
      key,
      label: country,
      href: `/coupe-du-monde?club=${encodeURIComponent(country)}`,
      products: slots.filter((product): product is Product => Boolean(product)),
    }
  })
}

export function buildHomepageCurationEditorSections(
  source: HomepageCatalogSource,
  assignments: HomepageCurationAssignment[],
): HomepageCurationEditorSection[] {
  const bestsellerTabs = buildHomepageBestsellerTabs(source, assignments)
  const fastMoverGroupsWithDisplay = buildHomepageFastMoverGroups(source, assignments)
  const assignmentsByTopMomentGroup = getAssignmentsByGroup(assignments, 'top_moment')
  const assignmentsByFastMoversGroup = getAssignmentsByGroup(assignments, 'fast_movers')

  const topMomentGroups: HomepageCurationEditorGroup[] = [
    {
      key: 'all',
      label: 'Tous',
      description: 'Grande carte de section et 3 cartes produits visibles sur desktop.',
      href: '/shop',
      slot_labels: [...TOP_MOMENT_SLOT_LABELS],
      assignments: Array.from({ length: TOP_MOMENT_SLOT_LABELS.length }, (_, index) => assignmentsByTopMomentGroup.get('all')?.[index] ?? null),
      displayed_product_ids: (() => {
        const tab = bestsellerTabs.find((entry) => entry.key === 'all')
        return [tab?.featuredProduct?.id ?? null, ...(tab?.cards.map((product) => product.id) ?? [])]
      })(),
      suggested_product_ids: source.allCatalogProducts.slice(0, 24).map((product) => product.id),
    },
    ...source.homeLeagueProducts.map((group) => ({
      key: group.key,
      label: group.label,
      description: `Selection manuelle pour l onglet ${group.label}.`,
      href: group.href,
      slot_labels: [...TOP_MOMENT_SLOT_LABELS],
      assignments: Array.from({ length: TOP_MOMENT_SLOT_LABELS.length }, (_, index) => assignmentsByTopMomentGroup.get(group.key)?.[index] ?? null),
      displayed_product_ids: (() => {
        const tab = bestsellerTabs.find((entry) => entry.key === group.key)
        return [tab?.featuredProduct?.id ?? null, ...(tab?.cards.map((product) => product.id) ?? [])]
      })(),
      suggested_product_ids: group.candidateProducts.slice(0, 32).map((product) => product.id),
    })),
  ]

  const fastMoverCountries = Array.from(new Set(source.worldCupProducts.map((product) => product.club))).sort((left, right) =>
    left.localeCompare(right, 'fr-FR', { sensitivity: 'base' }),
  )

  const fastMoverGroups: HomepageCurationEditorGroup[] = fastMoverCountries.map((country) => {
    const key = toGroupKey(country)
    const displayedGroup = fastMoverGroupsWithDisplay.find((group) => group.key === key)
    return {
      key,
      label: country,
      description: `Ordre manuel des maillots affiches pour ${country}.`,
      href: `/coupe-du-monde?club=${encodeURIComponent(country)}`,
      slot_labels: [...FAST_MOVER_SLOT_LABELS],
      assignments: Array.from({ length: FAST_MOVER_SLOT_LABELS.length }, (_, index) => assignmentsByFastMoversGroup.get(key)?.[index] ?? null),
      displayed_product_ids: displayedGroup?.products.map((product) => product.id) ?? [],
      suggested_product_ids: source.worldCupProducts.filter((product) => product.club === country).slice(0, 32).map((product) => product.id),
    }
  })

  return [
    {
      id: 'top_moment',
      label: 'Top du moment',
      description: 'Controle la grande carte et les cartes produits par onglet.',
      groups: topMomentGroups,
    },
    {
      id: 'fast_movers',
      label: 'Maillots qui partent vite',
      description: 'Controle l ordre des cartes par pays pour le bloc Coupe du Monde 2026.',
      groups: fastMoverGroups,
    },
  ]
}

export function toHomepageCurationProductOptions(products: HomepageCurationProductOption[]): HomepageCurationProductOption[] {
  return products
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      league: product.league,
      season: product.season,
      photos: product.photos.slice(0, 1),
      is_active: product.is_active,
      is_retro: product.is_retro,
      is_concept: product.is_concept,
    }))
    .sort((left, right) => right.season.localeCompare(left.season, 'fr-FR'))
}
