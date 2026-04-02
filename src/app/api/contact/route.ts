import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramContactNotification } from '@/lib/telegram'

type ContactPayload = {
  name?: string
  email?: string
  orderNumber?: string
  subject?: string
  message?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: NextRequest) {
  let body: ContactPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const name = normalizeValue(body.name)
  const email = normalizeValue(body.email)
  const orderNumber = normalizeValue(body.orderNumber)
  const subject = normalizeValue(body.subject)
  const message = normalizeValue(body.message)

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Merci de remplir tous les champs obligatoires.' }, { status: 400 })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Merci de renseigner une adresse email valide.' }, { status: 400 })
  }

  if (name.length > 120 || email.length > 160 || orderNumber.length > 80 || subject.length > 140 || message.length > 2000) {
    return NextResponse.json({ error: 'Un ou plusieurs champs dépassent la longueur autorisée.' }, { status: 400 })
  }

  const delivered = await sendTelegramContactNotification({
    name,
    email,
    orderNumber,
    subject,
    message,
  })

  if (!delivered) {
    return NextResponse.json({ error: 'Service client temporairement indisponible. Merci de réessayer plus tard.' }, { status: 503 })
  }

  return NextResponse.json({ ok: true })
}
