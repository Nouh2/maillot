import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUNNY_CDN_BASE_URL = (process.env.BUNNY_CDN_BASE_URL || 'https://maillotaddict.b-cdn.net').replace(/\/+$/, '')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function fetchAllProducts() {
  const pageSize = 1000
  const rows = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, photos, is_active')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throw error
    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

function summarize(products) {
  let fullyMigrated = 0
  let partiallyMigrated = 0
  let notMigrated = 0
  let totalPhotos = 0
  let bunnyPhotos = 0
  let activeProducts = 0
  let activeFullyMigrated = 0
  let activeNotMigrated = 0
  let activeFirstTwoCovered = 0

  for (const product of products) {
    const photos = Array.isArray(product.photos) ? product.photos : []
    const migratedCount = photos.filter((url) => typeof url === 'string' && url.startsWith(BUNNY_CDN_BASE_URL)).length
    const firstTwo = photos.slice(0, 2)
    const firstTwoCovered =
      firstTwo.length > 0 &&
      firstTwo.every((url) => typeof url === 'string' && url.startsWith(BUNNY_CDN_BASE_URL))

    totalPhotos += photos.length
    bunnyPhotos += migratedCount

    if (photos.length === 0 || migratedCount === 0) {
      notMigrated += 1
    } else if (migratedCount === photos.length) {
      fullyMigrated += 1
    } else {
      partiallyMigrated += 1
    }

    if (product.is_active) {
      activeProducts += 1
      if (photos.length > 0 && migratedCount === photos.length) {
        activeFullyMigrated += 1
      } else {
        activeNotMigrated += 1
      }
      if (firstTwoCovered) {
        activeFirstTwoCovered += 1
      }
    }
  }

  return {
    products: products.length,
    fullyMigrated,
    partiallyMigrated,
    notMigrated,
    totalPhotos,
    bunnyPhotos,
    activeProducts,
    activeFullyMigrated,
    activeNotMigrated,
    activeFirstTwoCovered,
  }
}

const products = await fetchAllProducts()
console.log(JSON.stringify(summarize(products), null, 2))
