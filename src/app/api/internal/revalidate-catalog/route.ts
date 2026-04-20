import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { CATALOG_CACHE_TAG } from '@/lib/catalogProducts'
import { requireOpsSession } from '@/lib/opsAuth'

export async function POST() {
  try {
    await requireOpsSession()
  } catch {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  revalidateTag(CATALOG_CACHE_TAG)

  return NextResponse.json({ ok: true, tag: CATALOG_CACHE_TAG })
}
