import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const currentFile = fileURLToPath(import.meta.url)
const rootDir = path.resolve(path.dirname(currentFile), '..', '..')
const envPath = path.join(rootDir, '.env.local')

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

function normalizeText(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function expandTwoDigitYear(value) {
  const currentYear = new Date().getFullYear()
  const pivot = (currentYear + 5) % 100
  return value <= pivot ? 2000 + value : 1900 + value
}

function extractCompactSeason(name) {
  const match = name.match(/\b(?!19|20)(\d{2})(\d{2})\b/)
  if (!match) return null

  const start = expandTwoDigitYear(Number.parseInt(match[1], 10))
  const end = expandTwoDigitYear(Number.parseInt(match[2], 10))

  if (end < start) return null
  return `${start}-${end}`
}

function buildSignature(product) {
  return [
    normalizeText(product.name),
    normalizeText(product.league),
    normalizeText(product.club),
    product.is_retro ? 'retro' : 'standard',
  ].join('|')
}

function scoreProduct(product) {
  const photosScore = Array.isArray(product.photos) ? product.photos.length : 0
  const explicitSeasonScore = product.season && product.season.toLowerCase() !== 'a definir' ? 4 : 0
  const compactSeasonScore = extractCompactSeason(product.name) ? 2 : 0
  const featuredScore = product.is_featured ? 3 : 0
  return photosScore + explicitSeasonScore + compactSeasonScore + featuredScore + product.name.length / 100
}

function pickCanonicalProduct(products) {
  return [...products].sort((left, right) => scoreProduct(right) - scoreProduct(left))[0]
}

async function fetchAllProducts(supabase) {
  const pageSize = 1000
  const products = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id,slug,name,club,league,season,type,product_kind,is_retro,is_featured,photos,is_active')
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

  const groups = new Map()
  for (const product of products) {
    const signature = buildSignature(product)
    if (!groups.has(signature)) groups.set(signature, [])
    groups.get(signature).push(product)
  }

  const duplicateGroups = [...groups.values()].filter((group) => group.length > 1)
  const productsToDeactivate = []
  const seasonUpdates = []

  for (const group of duplicateGroups) {
    const canonical = pickCanonicalProduct(group)
    for (const product of group) {
      if (product.id !== canonical.id) {
        productsToDeactivate.push(product.id)
      }
    }
  }

  for (const product of products) {
    if ((product.season ?? '').toLowerCase() !== 'a definir') continue
    const compactSeason = extractCompactSeason(product.name)
    if (!compactSeason) continue
    seasonUpdates.push({ id: product.id, season: compactSeason })
  }

  console.log(JSON.stringify({
    activeProducts: products.length,
    duplicateGroups: duplicateGroups.length,
    productsToDeactivate: productsToDeactivate.length,
    seasonBackfills: seasonUpdates.length,
    sampleDuplicateGroups: duplicateGroups.slice(0, 10).map((group) => ({
      canonical: pickCanonicalProduct(group).slug,
      count: group.length,
      slugs: group.map((product) => product.slug),
    })),
    sampleSeasonBackfills: seasonUpdates.slice(0, 10),
    mode: apply ? 'apply' : 'report',
  }, null, 2))

  if (!apply) return

  for (const update of seasonUpdates) {
    const { error } = await supabase.from('products').update({ season: update.season }).eq('id', update.id)
    if (error) throw error
  }

  for (let index = 0; index < productsToDeactivate.length; index += 100) {
    const chunk = productsToDeactivate.slice(index, index + 100)
    const { error } = await supabase.from('products').update({ is_active: false }).in('id', chunk)
    if (error) throw error
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
