import { NextRequest, NextResponse } from 'next/server'
import { createOpsSession, validateOpsCredentials } from '@/lib/opsAuth'

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  const username = body.username?.trim() || ''
  const password = body.password || ''

  if (!validateOpsCredentials(username, password)) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }

  await createOpsSession(username)
  return NextResponse.json({ ok: true })
}
