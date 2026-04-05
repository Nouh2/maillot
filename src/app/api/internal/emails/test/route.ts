import { NextRequest, NextResponse } from 'next/server'
import { requireOpsSession } from '@/lib/opsAuth'
import { sendEmailTemplateTest, type EmailTemplateId } from '@/lib/email'

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
}

const TEMPLATE_IDS: EmailTemplateId[] = [
  'order_paid',
  'tracking',
  'support_ack',
  'account_welcome',
  'delivered',
  'abandoned_cart',
  'post_purchase',
  'win_back',
]

export async function POST(request: NextRequest) {
  try {
    await requireOpsSession()
  } catch {
    return unauthorizedResponse()
  }

  let body: {
    to?: string
    templateId?: EmailTemplateId
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide' }, { status: 400 })
  }

  const to = body.to?.trim().toLowerCase()
  const templateId = body.templateId

  if (!to || !templateId || !TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ error: 'Template ou email invalide' }, { status: 400 })
  }

  const sent = await sendEmailTemplateTest({ to, templateId })
  if (!sent) {
    return NextResponse.json({ error: 'Impossible d envoyer le mail de test' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
