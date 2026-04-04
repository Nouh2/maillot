type EmailPayload = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

type OrderEmailContext = {
  customerName?: string | null
  orderNumber: string
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
}

function getTransactionalSender(): string | null {
  return process.env.TRANSACTIONAL_EMAIL_FROM?.trim() || null
}

function getSupportEmail(): string | null {
  return process.env.SUPPORT_EMAIL?.trim() || process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;color:#1a1a1a;line-height:1.6;font-size:15px;">${text}</p>`
}

function renderEmailFrame(title: string, body: string): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '<body style="margin:0;background:#f7f0e6;font-family:Arial,sans-serif;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #eadfce;">',
    '<tr><td style="padding:32px;">',
    '<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#c1440e;font-weight:700;">Maillot Addict</p>',
    `<h1 style="margin:0 0 24px;color:#121212;font-size:34px;line-height:1;">${title}</h1>`,
    body,
    '</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('')
}

async function sendWithResend(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = getTransactionalSender()

  if (!apiKey || !from) {
    return false
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
    }),
  })

  if (!response.ok) {
    console.error('Resend email failed:', await response.text())
    return false
  }

  return true
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<boolean> {
  try {
    return await sendWithResend(payload)
  } catch (error) {
    console.error('Transactional email failed:', error)
    return false
  }
}

function customerGreeting(context: OrderEmailContext): string {
  return context.customerName?.trim()
    ? `Bonjour ${escapeHtml(context.customerName.trim())},`
    : 'Bonjour,'
}

export async function sendOrderPaidEmail(params: {
  to: string
  customerName?: string | null
  orderNumber: string
  trackingToken: string
}): Promise<boolean> {
  const trackingLink = `${getBaseUrl()}/suivi/${params.trackingToken}`
  const body = [
    paragraph(customerGreeting(params)),
    paragraph(`Votre commande <strong>${escapeHtml(params.orderNumber)}</strong> a bien ete confirmee.`),
    paragraph('Nous la preparons maintenant pour transmission au fournisseur. Vous recevrez un nouvel email des que le suivi sera disponible.'),
    `<p style="margin:0 0 24px;"><a href="${trackingLink}" style="display:inline-block;background:#121212;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;">Suivre ma commande</a></p>`,
    paragraph('Merci pour votre confiance.'),
  ].join('')

  return sendTransactionalEmail({
    to: params.to,
    subject: `Commande confirmee ${params.orderNumber}`,
    html: renderEmailFrame('Commande confirmee', body),
    replyTo: getSupportEmail() ?? undefined,
  })
}

export async function sendTrackingEmail(params: {
  to: string
  customerName?: string | null
  orderNumber: string
  trackingToken: string
  trackingUrl?: string | null
  trackingNumber?: string | null
}): Promise<boolean> {
  const publicTrackingLink = `${getBaseUrl()}/suivi/${params.trackingToken}`
  const trackingNumber = params.trackingNumber?.trim()
  const carrierLink = params.trackingUrl?.trim()

  const body = [
    paragraph(customerGreeting(params)),
    paragraph(`Le suivi de votre commande <strong>${escapeHtml(params.orderNumber)}</strong> est maintenant disponible.`),
    trackingNumber ? paragraph(`Numero de suivi: <strong>${escapeHtml(trackingNumber)}</strong>`) : '',
    `<p style="margin:0 0 12px;"><a href="${publicTrackingLink}" style="display:inline-block;background:#c1440e;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;">Voir le suivi</a></p>`,
    carrierLink
      ? `<p style="margin:0 0 24px;"><a href="${carrierLink}" style="color:#c1440e;text-decoration:underline;">Ouvrir le lien transporteur</a></p>`
      : '',
    paragraph('Si vous avez la moindre question, repondez a cet email ou passez par la page contact.'),
  ].join('')

  return sendTransactionalEmail({
    to: params.to,
    subject: `Suivi disponible ${params.orderNumber}`,
    html: renderEmailFrame('Suivi disponible', body),
    replyTo: getSupportEmail() ?? undefined,
  })
}

export async function sendSupportAckEmail(params: {
  to: string
  customerName: string
  subject: string
  orderNumber?: string
}): Promise<boolean> {
  const supportEmail = getSupportEmail()
  const orderReference = params.orderNumber?.trim()

  const body = [
    paragraph(`Bonjour ${escapeHtml(params.customerName)},`),
    paragraph(`Nous avons bien recu votre message au sujet de <strong>${escapeHtml(params.subject)}</strong>.`),
    orderReference ? paragraph(`Reference transmise: <strong>${escapeHtml(orderReference)}</strong>.`) : '',
    paragraph('Le support revient vers vous des que possible.'),
    supportEmail ? paragraph(`Si besoin, vous pouvez egalement nous ecrire sur ${escapeHtml(supportEmail)}.`) : '',
  ].join('')

  return sendTransactionalEmail({
    to: params.to,
    subject: 'Nous avons bien recu votre message',
    html: renderEmailFrame('Message bien recu', body),
    replyTo: supportEmail ?? undefined,
  })
}
