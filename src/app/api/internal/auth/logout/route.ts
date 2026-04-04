import { NextResponse } from 'next/server'
import { clearOpsSession } from '@/lib/opsAuth'

export async function POST() {
  await clearOpsSession()
  return NextResponse.json({ ok: true })
}
