import { NextRequest, NextResponse } from 'next/server'
import { requireOpsSession } from '@/lib/opsAuth'
import { getOpsOrders, updateOpsOrder } from '@/lib/orders'
import type { Order } from '@/types/order'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  const statusParam = request.nextUrl.searchParams.get('status')
  const statuses = statusParam
    ? statusParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean) as Array<Order['status']>
    : undefined

  const { data, error } = await getOpsOrders({ statuses, limit: 60 })

  if (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ orders: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  let body: {
    orderId?: string
    status?: Order['status']
    trackingNumber?: string | null
    trackingUrl?: string | null
    supplierReference?: string | null
    supplierStatus?: string | null
    sentToSupplier?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  if (!body.orderId) {
    return NextResponse.json({ error: 'orderId requis' }, { status: 400 })
  }

  const { data, error } = await updateOpsOrder({
    orderId: body.orderId,
    status: body.status,
    trackingNumber: body.trackingNumber,
    trackingUrl: body.trackingUrl,
    supplierReference: body.supplierReference,
    supplierStatus: body.supplierStatus,
    sentToSupplier: body.sentToSupplier,
  })

  if (error || !data) {
    return NextResponse.json({ error: 'Impossible de mettre a jour la commande' }, { status: 500 })
  }

  return NextResponse.json({ order: data })
}
