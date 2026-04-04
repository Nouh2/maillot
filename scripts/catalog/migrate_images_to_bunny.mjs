import { createClient } from '@supabase/supabase-js'
import path from 'node:path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com'
const BUNNY_CDN_BASE_URL = process.env.BUNNY_CDN_BASE_URL
const DOWNLOAD_DELAY_MS = Number(process.env.BUNNY_IMAGE_MIGRATION_DELAY_MS || '150')
const LIMIT = Number(process.env.BUNNY_IMAGE_MIGRATION_LIMIT || '0')
const CONCURRENCY = Math.max(1, Number(process.env.BUNNY_IMAGE_MIGRATION_CONCURRENCY || '4'))
const ACTIVE_ONLY = process.env.BUNNY_IMAGE_MIGRATION_ACTIVE_ONLY !== 'false'
const MAX_PHOTOS_PER_PRODUCT = Math.max(0, Number(process.env.BUNNY_IMAGE_MIGRATION_MAX_PHOTOS || '0'))
const ONLY_SLUGS = (process.env.BUNNY_IMAGE_MIGRATION_ONLY_SLUGS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_CDN_BASE_URL) {
  throw new Error('Missing Bunny environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const CDN_BASE_URL = BUNNY_CDN_BASE_URL.replace(/\/+$/, '')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitizeSegment(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'item'
}

function extFromContentType(contentType) {
  if (!contentType) return '.jpg'
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('avif')) return '.avif'
  if (contentType.includes('gif')) return '.gif'
  return '.jpg'
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname).toLowerCase()
    return ext && ext.length <= 5 ? ext : ''
  } catch {
    return ''
  }
}

function buildObjectPath(product, index, sourceUrl, contentType) {
  const slug = sanitizeSegment(product.slug || product.id)
  const ext = extFromUrl(sourceUrl) || extFromContentType(contentType)
  return `products/${slug}/${String(index + 1).padStart(2, '0')}${ext}`
}

function buildCdnUrl(objectPath) {
  return `${CDN_BASE_URL}/${objectPath}`
}

async function fetchAllProducts() {
  const pageSize = 1000
  const rows = []
  let from = 0

  while (true) {
    let query = supabase
      .from('products')
      .select('id, slug, photos, is_active')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (ACTIVE_ONLY) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error
    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://www.yupoo.com/',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const arrayBuffer = await response.arrayBuffer()
  return { contentType, buffer: Buffer.from(arrayBuffer) }
}

async function uploadToBunny(objectPath, buffer, contentType) {
  const uploadUrl = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${objectPath}`
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      AccessKey: BUNNY_STORAGE_PASSWORD,
      'Content-Type': contentType,
    },
    body: buffer,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Bunny upload failed: ${response.status} ${response.statusText} ${text}`)
  }
}

async function updateProductPhotos(productId, photos) {
  const { error } = await supabase.from('products').update({ photos }).eq('id', productId)
  if (error) throw error
}

function needsMigration(url) {
  return typeof url === 'string' && url.startsWith('http') && !url.startsWith(CDN_BASE_URL)
}

async function migrateProduct(product) {
  const sourcePhotos = Array.isArray(product.photos) ? product.photos : []
  if (sourcePhotos.length === 0) return { status: 'skipped', reason: 'no-photos' }
  const targetPhotos = MAX_PHOTOS_PER_PRODUCT > 0 ? sourcePhotos.slice(0, MAX_PHOTOS_PER_PRODUCT) : sourcePhotos
  if (!targetPhotos.some(needsMigration)) return { status: 'skipped', reason: 'already-migrated' }

  const nextPhotos = [...sourcePhotos]

  for (let index = 0; index < targetPhotos.length; index += 1) {
    const sourceUrl = targetPhotos[index]
    if (!needsMigration(sourceUrl)) {
      continue
    }

    const { contentType, buffer } = await downloadImage(sourceUrl)
    const objectPath = buildObjectPath(product, index, sourceUrl, contentType)
    await uploadToBunny(objectPath, buffer, contentType)
    nextPhotos[index] = buildCdnUrl(objectPath)
    await sleep(DOWNLOAD_DELAY_MS)
  }

  await updateProductPhotos(product.id, nextPhotos)
  return { status: 'updated', photos: targetPhotos.length }
}

async function main() {
  const products = await fetchAllProducts()
  const filteredProducts = ONLY_SLUGS.length > 0 ? products.filter((product) => ONLY_SLUGS.includes(product.slug)) : products
  const targetProducts = LIMIT > 0 ? filteredProducts.slice(0, LIMIT) : filteredProducts

  let updated = 0
  let skipped = 0
  let failed = 0
  let cursor = 0

  async function worker() {
    while (cursor < targetProducts.length) {
      const index = cursor
      cursor += 1
      const product = targetProducts[index]

      try {
        const result = await migrateProduct(product)
        if (result.status === 'updated') {
          updated += 1
          console.log(`[${index + 1}/${targetProducts.length}] UPDATED ${product.slug} (${result.photos} photos)`)
        } else {
          skipped += 1
        }
      } catch (error) {
        failed += 1
        console.error(`[${index + 1}/${targetProducts.length}] FAILED ${product.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targetProducts.length) }, () => worker()))

  console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
