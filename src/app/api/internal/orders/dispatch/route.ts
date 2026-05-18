import { NextRequest, NextResponse } from 'next/server'
import { dispatchPendingLifecycleEmails } from '@/lib/orders'

function isAuthorized(request: NextRequest): boolean {
  const allowedSecrets = [
    process.env.CRON_SECRET?.trim(),
    process.env.INTERNAL_CRON_SECRET?.trim(),
  ].filter(Boolean)
  if (allowedSecrets.length === 0) return false

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(bearer && allowedSecrets.includes(bearer))
}

async function dispatch(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const result = await dispatchPendingLifecycleEmails()
  return NextResponse.json({ ok: true, ...result })
}

export async function GET(request: NextRequest) {
  return dispatch(request)
}

export async function POST(request: NextRequest) {
  return dispatch(request)
}
