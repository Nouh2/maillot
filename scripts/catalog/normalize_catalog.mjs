import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const currentFile = fileURLToPath(import.meta.url)
const rootDir = path.resolve(path.dirname(currentFile), '..', '..')
const envPath = path.join(rootDir, '.env.local')
const registryPath = path.join(rootDir, 'data', 'catalog-entities.json')

const catalogEntities = JSON.parse(fs.readFileSync(registryPath, 'utf8'))

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function normalizeCatalogText(value) {
  return (value ?? '')
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesAlias(source, alias) {
  if (!source || !alias) return false
  if (alias.length <= 4 || alias.includes(' ')) {
    return new RegExp(`(^| )${escapeRegExp(alias)}($| )`).test(source)
  }
  return source.includes(alias)
}

const matchableEntities = catalogEntities.map((entry) => ({
  entry,
  aliases: Array.from(new Set([entry.club, ...(entry.aliases ?? [])].map((alias) => normalizeCatalogText(alias)).filter(Boolean))).sort(
    (left, right) => right.length - left.length,
  ),
}))

function findCatalogEntity(product) {
  const sources = [
    { normalized: normalizeCatalogText(product.club), weight: 600 },
    { normalized: normalizeCatalogText(product.name), weight: 320 },
    { normalized: normalizeCatalogText(product.source_title), weight: 280 },
    { normalized: normalizeCatalogText(product.slug), weight: 220 },
    { normalized: normalizeCatalogText(product.description), weight: 120 },
    { normalized: normalizeCatalogText(product.source_category_key), weight: 80 },
  ].filter((source) => source.normalized.length > 0)

  let best = null
  for (const source of sources) {
    for (const candidate of matchableEntities) {
      for (const alias of candidate.aliases) {
        if (!matchesAlias(source.normalized, alias)) continue

        const score =
          source.weight +
          alias.length * 10 +
          (source.normalized === alias ? 40 : 0) +
          (product.league === candidate.entry.league ? 15 : 0)

        if (!best || score > best.score) {
          best = { entry: candidate.entry, score }
        }
      }
    }
  }

  return best?.entry ?? null
}

async function fetchAllProducts(supabase) {
  const pageSize = 1000
  const products = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id,slug,name,club,league,country,description,source_title,source_category_key,is_active')
      .eq('is_active', true)
      .range(from, from + pageSize - 1)

    if (error) throw error

    products.push(...(data ?? []))
    if (!data || data.length < pageSize) break
    from += pageSize
  }

  return products
}

async function main() {
  loadEnvFile(envPath)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const apply = process.argv.includes('--apply')

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing')
  }

  const supabase = createClient(url, key)
  const products = await fetchAllProducts(supabase)
  const updates = []

  for (const product of products) {
    const entity = findCatalogEntity(product)
    if (!entity) continue

    const nextClub = entity.club
    const nextLeague = entity.league
    const nextCountry = entity.country

    if (nextClub !== product.club || nextLeague !== product.league || nextCountry !== product.country) {
      updates.push({
        id: product.id,
        slug: product.slug,
        from: { club: product.club, league: product.league, country: product.country },
        to: { club: nextClub, league: nextLeague, country: nextCountry },
      })
    }
  }

  console.log(
    JSON.stringify(
      {
        reviewed: products.length,
        updates: updates.length,
        sample: updates.slice(0, 40),
        mode: apply ? 'apply' : 'report',
      },
      null,
      2,
    ),
  )

  if (!apply) return

  for (let index = 0; index < updates.length; index += 100) {
    const chunk = updates.slice(index, index + 100)
    for (const update of chunk) {
      const { error } = await supabase
        .from('products')
        .update(update.to)
        .eq('id', update.id)

      if (error) throw error
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
