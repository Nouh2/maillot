import { NextRequest, NextResponse } from 'next/server'
import { getOpsProductSummaries } from '@/lib/opsCatalog'
import { requireOpsSession } from '@/lib/opsAuth'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const products = await getOpsProductSummaries({
      q: searchParams.get('q')?.trim() || undefined,
      league: searchParams.get('league')?.trim() || undefined,
      status: (searchParams.get('status') as 'all' | 'active' | 'inactive' | null) ?? undefined,
      retro: (searchParams.get('retro') as 'all' | 'true' | 'false' | null) ?? undefined,
      concept: (searchParams.get('concept') as 'all' | 'true' | 'false' | null) ?? undefined,
    })

    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
