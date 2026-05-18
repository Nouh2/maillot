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
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(envPath)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

// Récupérer tous les produits jersey_version=player dont le manual_override contient jersey_version=fan
const { data: products, error: fetchError } = await supabase
  .from('products')
  .select('id, name, club, jersey_version, manual_override')
  .eq('jersey_version', 'player')

if (fetchError) {
  console.error('Erreur lecture :', fetchError.message)
  process.exit(1)
}

if (!products || products.length === 0) {
  console.log('Aucun produit player trouve.')
  process.exit(0)
}

// Filtrer ceux dont manual_override écrase jersey_version avec 'fan'
const toFix = products.filter((p) => {
  const mo = p.manual_override
  return mo && typeof mo === 'object' && mo.jersey_version === 'fan'
})

console.log(`${products.length} produits player en base, ${toFix.length} avec manual_override jersey_version=fan a corriger.`)

if (toFix.length === 0) {
  console.log('Rien a corriger.')
  process.exit(0)
}

// Pour chacun, retirer jersey_version du manual_override et le forcer a player
let fixed = 0
let errors = 0

for (const product of toFix) {
  const { jersey_version: _removed, ...cleanOverride } = product.manual_override
  const newOverride = Object.keys(cleanOverride).length > 0 ? cleanOverride : null

  const { error } = await supabase
    .from('products')
    .update({ manual_override: newOverride, jersey_version: 'player' })
    .eq('id', product.id)

  if (error) {
    console.error(`  ERREUR [${product.id}] ${product.name} : ${error.message}`)
    errors++
  } else {
    console.log(`  OK [${product.id}] ${product.name} (${product.club})`)
    fixed++
  }
}

console.log(`\nTermine : ${fixed} corriges, ${errors} erreurs.`)
