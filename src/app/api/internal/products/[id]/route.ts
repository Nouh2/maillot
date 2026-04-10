import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CATALOG_CACHE_TAG } from '@/lib/catalogProducts'
import { getOpsProductById, saveOpsProductDraft } from '@/lib/opsCatalog'
import { requireOpsSession } from '@/lib/opsAuth'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    const product = await getOpsProductById(id)

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  let body: { draft?: unknown }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  try {
    const { id } = await params
    const product = await saveOpsProductDraft(id, body.draft)

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }

    revalidateTag(CATALOG_CACHE_TAG, { expire: 0 })
    revalidatePath('/ops/catalogue')

    return NextResponse.json({ product })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    const status = message.includes('invalide') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
