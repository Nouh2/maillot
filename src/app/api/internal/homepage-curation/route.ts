import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import {
  buildHomepageCatalogSource,
  buildHomepageCurationEditorSections,
  getHomepageCurationAssignmentsForOps,
  HOMEPAGE_CURATION_CACHE_TAG,
  replaceHomepageCurationAssignments,
} from '@/lib/homepageCuration'
import { requireOpsSession } from '@/lib/opsAuth'
import { getOpsProductSummaries } from '@/lib/opsCatalog'
import { getLeagues, getProducts } from '@/lib/supabase/queries'
import type { HomepageCurationAssignment } from '@/types/homepageCuration'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}

function isValidAssignment(input: unknown): input is HomepageCurationAssignment {
  return (
    typeof input === 'object' &&
    input !== null &&
    'section' in input &&
    'group_key' in input &&
    'slot_index' in input &&
    'product_id' in input &&
    (input.section === 'top_moment' || input.section === 'fast_movers') &&
    typeof input.group_key === 'string' &&
    typeof input.slot_index === 'number' &&
    Number.isInteger(input.slot_index) &&
    input.slot_index >= 0 &&
    typeof input.product_id === 'string'
  )
}

export async function GET() {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  try {
    const [rawCatalogProducts, allLeagues, productOptions, assignments] = await Promise.all([
      getProducts(),
      getLeagues(),
      getOpsProductSummaries(),
      getHomepageCurationAssignmentsForOps(),
    ])

    const source = buildHomepageCatalogSource(allLeagues, rawCatalogProducts)
    const sections = buildHomepageCurationEditorSections(source, assignments)

    return NextResponse.json({ sections, productOptions })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  let body: { assignments?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  if (!Array.isArray(body.assignments) || !body.assignments.every(isValidAssignment)) {
    return NextResponse.json({ error: 'Payload curation invalide' }, { status: 400 })
  }

  try {
    const [rawCatalogProducts, allLeagues] = await Promise.all([getProducts(), getLeagues()])
    const assignments = await replaceHomepageCurationAssignments(body.assignments)
    const sections = buildHomepageCurationEditorSections(
      buildHomepageCatalogSource(allLeagues, rawCatalogProducts),
      assignments,
    )

    revalidateTag(HOMEPAGE_CURATION_CACHE_TAG, { expire: 0 })
    revalidatePath('/')
    revalidatePath('/ops/landing')

    return NextResponse.json({ sections })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    const status = message.includes('invalide') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

