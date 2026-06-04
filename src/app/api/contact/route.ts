import { NextRequest, NextResponse } from 'next/server'
import { sendSupportAckEmail } from '@/lib/email'
import { createSupportTicket, setSupportTicketTelegramMessage } from '@/lib/support'
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
    return NextResponse.json({ error: 'Corps de requete invalide.' }, { status: 400 })
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
    return NextResponse.json({ error: 'Un ou plusieurs champs depassent la longueur autorisee.' }, { status: 400 })
  }

  const ticket = await createSupportTicket({
    name,
    email,
    orderNumber,
    subject,
    message,
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Service client temporairement indisponible. Merci de reessayer plus tard.' }, { status: 503 })
  }

  const telegramDelivery = await sendTelegramContactNotification({
    ticketId: ticket.id,
    name,
    email,
    orderNumber,
    subject,
    message,
  })

  if (!telegramDelivery.delivered) {
    return NextResponse.json({ error: 'Service client temporairement indisponible. Merci de reessayer plus tard.' }, { status: 503 })
  }

  if (telegramDelivery.chatId && telegramDelivery.messageId) {
    await setSupportTicketTelegramMessage({
      ticketId: ticket.id,
      chatId: telegramDelivery.chatId,
      messageId: telegramDelivery.messageId,
    })
  }

  await sendSupportAckEmail({
    to: email,
    customerName: name,
    subject,
    orderNumber,
  })

  return NextResponse.json({ ok: true })
}
