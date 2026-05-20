import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
loadDotenv(path.join(PROJECT_ROOT, '.env.local'))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com'
const BUNNY_CDN_BASE_URL = (process.env.BUNNY_CDN_BASE_URL || process.env.NEXT_PUBLIC_BUNNY_CDN_BASE_URL || '').replace(/\/+$/, '')
const YUPOO_BASE_URL = (process.env.YUPOO_REPAIR_BASE_URL || 'https://12345-67890.x.yupoo.com').replace(/\/+$/, '')
const CONCURRENCY = Math.max(1, Number(process.env.YUPOO_REPAIR_CONCURRENCY || '4'))
const LIMIT = Number(process.env.YUPOO_REPAIR_LIMIT || '0')
const DRY_RUN = process.argv.includes('--dry-run')
const ONLY_SLUGS = readArg('--only-slugs')
  .split(',')
  .map((slug) => slug.trim())
  .filter(Boolean)

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

if (!DRY_RUN && (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD || !BUNNY_CDN_BASE_URL)) {
  throw new Error('Missing Bunny environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function loadDotenv(filePath) {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

function readArg(name) {
  const prefix = `${name}=`
  const found = process.argv.find((arg) => arg.startsWith(prefix))
  return found ? found.slice(prefix.length) : ''
}

function extractAlbumId(description) {
  const match = String(description || '').match(/Ref catalogue:yupoo-category-supplier:(\d+)/)
  return match?.[1] || null
}

function hasBrokenYupooPhoto(photos) {
  return Array.isArray(photos) && photos.some((photo) => typeof photo === 'string' && photo.includes('photo.yupoo.com/12345-67890/'))
}

function isBunnyUrl(url) {
  return typeof url === 'string' && BUNNY_CDN_BASE_URL && url.startsWith(BUNNY_CDN_BASE_URL)
}

function parseAttributes(tag) {
  const attrs = {}
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*"([^"]*)"/g)) {
    attrs[match[1]] = match[2]
  }
  return attrs
}

function photoKey(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    return parts.length >= 2 ? parts.at(-2) : url
  } catch {
    return url
  }
}

function extFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase()
    return ext && ext.length <= 6 ? ext : ''
  } catch {
    return ''
  }
}

function extFromContentType(contentType) {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
  return '.jpg'
}

function buildObjectPath(slug, index, sourceUrl, contentType) {
  const ext = extFromUrl(sourceUrl) || extFromContentType(contentType)
  return `products/${slug}/${String(index + 1).padStart(2, '0')}${ext}`
}

function buildCdnUrl(objectPath) {
  return `${BUNNY_CDN_BASE_URL}/${objectPath}`
}

async function fetchAllProducts() {
  const rows = []
  const pageSize = 1000
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, description, photos, is_active, product_kind')
      .range(from, from + pageSize - 1)

    if (error) throw error
    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

async function fetchAlbumPhotos(albumId) {
  const albumUrl = `${YUPOO_BASE_URL}/albums/${albumId}?uid=1`
  const response = await fetch(albumUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: `${YUPOO_BASE_URL}/albums`,
    },
  })

  if (!response.ok) {
    throw new Error(`Album fetch failed: ${response.status}`)
  }

  const html = await response.text()
  const tags = html.match(/<img\b[^>]*>/g) || []
  const photos = []
  const seen = new Set()

  for (const tag of tags) {
    if (!tag.includes('image__img')) continue
    const attrs = parseAttributes(tag)
    const candidate = attrs['data-src'] || attrs['data-origin-src'] || attrs.src
    if (!candidate || !candidate.startsWith('https://photo.yupoo.com/12345-67890/')) continue
    if (!/\/big\.(jpe?g|png|webp)$/i.test(candidate)) continue

    const key = photoKey(candidate)
    if (seen.has(key)) continue
    seen.add(key)
    photos.push(candidate)
  }

  return { albumUrl, photos }
}

async function downloadImage(url, referer) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: referer,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`)
  }

  const contentType = (response.headers.get('content-type') || 'image/jpeg').split(';')[0].trim()
  if (!contentType.startsWith('image/')) {
    throw new Error(`Unexpected image content-type: ${contentType}`)
  }

  return { contentType, buffer: Buffer.from(await response.arrayBuffer()) }
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
    throw new Error(`Bunny upload failed: ${response.status} ${text}`)
  }
}

async function repairProduct(product) {
  const albumId = extractAlbumId(product.description)
  if (!albumId) return { status: 'skipped', reason: 'missing-album-id' }

  const existingPhotos = Array.isArray(product.photos) ? product.photos : []
  const { albumUrl, photos: sourcePhotos } = await fetchAlbumPhotos(albumId)
  if (sourcePhotos.length === 0) return { status: 'skipped', reason: 'no-source-photos' }

  const nextPhotos = []
  let uploaded = 0

  for (let index = 0; index < sourcePhotos.length; index += 1) {
    const existing = existingPhotos[index]
    if (isBunnyUrl(existing)) {
      nextPhotos.push(existing)
      continue
    }

    const sourceUrl = sourcePhotos[index]
    const dryContentType = sourceUrl.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const objectPath = buildObjectPath(product.slug, index, sourceUrl, dryContentType)
    nextPhotos.push(buildCdnUrl(objectPath))

    if (!DRY_RUN) {
      const { contentType, buffer } = await downloadImage(sourceUrl, albumUrl)
      const uploadPath = buildObjectPath(product.slug, index, sourceUrl, contentType)
      await uploadToBunny(uploadPath, buffer, contentType)
      nextPhotos[index] = buildCdnUrl(uploadPath)
      uploaded += 1
    }
  }

  if (!DRY_RUN) {
    const { error } = await supabase.from('products').update({ photos: nextPhotos }).eq('id', product.id)
    if (error) throw error
  }

  return {
    status: DRY_RUN ? 'dry-run' : 'updated',
    sourceCount: sourcePhotos.length,
    previousCount: existingPhotos.length,
    uploaded,
  }
}

async function main() {
  const rows = await fetchAllProducts()
  const targets = rows.filter((product) => {
    if (!product.is_active) return false
    if (!['jersey', 'goalkeeper'].includes(product.product_kind)) return false
    if (!hasBrokenYupooPhoto(product.photos)) return false
    if (!extractAlbumId(product.description)) return false
    if (ONLY_SLUGS.length > 0 && !ONLY_SLUGS.includes(product.slug)) return false
    return true
  })

  const limitedTargets = LIMIT > 0 ? targets.slice(0, LIMIT) : targets
  console.log(`Targets: ${limitedTargets.length}/${targets.length} active products with broken Yupoo photos`)

  let cursor = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let uploadedPhotos = 0

  async function worker() {
    while (cursor < limitedTargets.length) {
      const index = cursor
      cursor += 1
      const product = limitedTargets[index]

      try {
        const result = await repairProduct(product)
        if (result.status === 'updated' || result.status === 'dry-run') {
          updated += 1
          uploadedPhotos += result.uploaded || 0
          const label = result.status === 'dry-run' ? 'DRY' : 'UPDATED'
          console.log(`[${index + 1}/${limitedTargets.length}] ${label} ${product.slug} photos=${result.previousCount}->${result.sourceCount} uploaded=${result.uploaded}`)
        } else {
          skipped += 1
          console.log(`[${index + 1}/${limitedTargets.length}] SKIP ${product.slug}: ${result.reason}`)
        }
      } catch (error) {
        failed += 1
        console.error(`[${index + 1}/${limitedTargets.length}] FAIL ${product.slug}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, limitedTargets.length) }, () => worker()))
  console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed} uploaded_photos=${uploadedPhotos}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
