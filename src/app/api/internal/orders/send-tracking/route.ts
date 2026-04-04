import { NextRequest, NextResponse } from 'next/server'
import { requireOpsSession } from '@/lib/opsAuth'
import { sendTrackingEmailForOrder } from '@/lib/orders'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  let body: { orderId?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  if (!body.orderId) {
    return NextResponse.json({ error: 'orderId requis' }, { status: 400 })
  }

  const sent = await sendTrackingEmailForOrder(body.orderId)
  if (!sent) {
    return NextResponse.json({ error: 'Tracking manquant ou email indisponible' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
