import { NextRequest, NextResponse } from 'next/server'
import { dispatchPendingOrderEmails } from '@/lib/orders'

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.INTERNAL_CRON_SECRET?.trim()
  if (!expected) return false

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return bearer === expected
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const result = await dispatchPendingOrderEmails()
  return NextResponse.json({ ok: true, ...result })
}
