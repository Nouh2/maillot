import catalogEntities from '../../data/catalog-entities.json'
import type { Product } from '@/types/product'

type CatalogEntity = (typeof catalogEntities)[number]

type ProductIdentitySource = Pick<
  Product,
  'club' | 'name' | 'league' | 'country' | 'slug' | 'description' | 'source_title' | 'source_category_key'
>

type MatchSource = {
  normalized: string
  weight: number
}

type MatchResult = {
  entry: CatalogEntity
  score: number
}

const NOISY_CLUB_TOKENS = /\b(?:19\d{2}|20\d{2}|\d{4,6}|retro|special|edition|commemorative|anniversary|memorial|limited|champion(?:ship)?|joint|theme|patch|sponsors?|with|black|white|pink|blue|green|yellow|gold|silver|grey|gray|orange|purple|dragon|samurai|sakura|long|sleeves?|senior|sizes?|size|thirds?|cup|world|euro|national|team|matchday|lavender|diversity|field|player|version|goalie|goalkeeper|jersey)\b/gi

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeCatalogText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCaseWord(word: string): string {
  if (word.length <= 3 && /^[a-z]+$/i.test(word)) {
    return word.toUpperCase()
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function cleanupCatalogClubLabel(value: string): string {
  const separated = value
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/[_/.-]+/g, ' ')
  const cleaned = separated.replace(NOISY_CLUB_TOKENS, ' ').replace(/\s+/g, ' ').trim()

  if (!cleaned) return value.trim()

  return cleaned
    .split(' ')
    .map((word) => titleCaseWord(word))
    .join(' ')
}

function buildMatchSources(product: Partial<ProductIdentitySource>): MatchSource[] {
  return [
    { normalized: normalizeCatalogText(product.club ?? ''), weight: 600 },
    { normalized: normalizeCatalogText(product.name ?? ''), weight: 320 },
    { normalized: normalizeCatalogText(product.source_title ?? ''), weight: 280 },
    { normalized: normalizeCatalogText(product.slug ?? ''), weight: 220 },
    { normalized: normalizeCatalogText(product.description ?? ''), weight: 120 },
    { normalized: normalizeCatalogText(product.source_category_key ?? ''), weight: 80 },
  ].filter((source) => source.normalized.length > 0)
}

function matchesAlias(source: string, alias: string): boolean {
  if (!source || !alias) return false

  if (alias.length <= 4 || alias.includes(' ')) {
    return new RegExp(`(^| )${escapeRegExp(alias)}($| )`).test(source)
  }

  return source.includes(alias)
}

const MATCHABLE_ENTITIES = catalogEntities.map((entry) => ({
  entry,
  aliases: Array.from(
    new Set([entry.club, ...(entry.aliases ?? [])].map((alias) => normalizeCatalogText(alias)).filter(Boolean)),
  ).sort((left, right) => right.length - left.length),
}))

export function findCatalogEntity(product: Partial<ProductIdentitySource>): CatalogEntity | null {
  const sources = buildMatchSources(product)
  const leagueHint = product.league ?? ''
  let best: MatchResult | null = null

  for (const source of sources) {
    for (const candidate of MATCHABLE_ENTITIES) {
      for (const alias of candidate.aliases) {
        if (!matchesAlias(source.normalized, alias)) continue

        const score =
          alias.length * 100 +
          source.weight +
          (source.normalized === alias ? 40 : 0) +
          (leagueHint === candidate.entry.league ? 15 : 0)

        if (!best || score > best.score) {
          best = { entry: candidate.entry, score }
        }
      }
    }
  }

  return best?.entry ?? null
}

export function normalizeCatalogProduct<T extends ProductIdentitySource>(product: T): T {
  const entity = findCatalogEntity(product)
  const normalizedClub = entity?.club ?? cleanupCatalogClubLabel(product.club || product.name || '')

  return {
    ...product,
    club: normalizedClub || product.club,
    league: entity?.league ?? product.league,
    country: entity?.country ?? product.country,
  }
}

export function normalizeCatalogProducts<T extends ProductIdentitySource>(products: T[]): T[] {
  return products.map((product) => normalizeCatalogProduct(product))
}
