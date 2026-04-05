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

export type EmailTemplateId =
  | 'order_paid'
  | 'tracking'
  | 'support_ack'
  | 'account_welcome'
  | 'delivered'
  | 'abandoned_cart'
  | 'post_purchase'
  | 'win_back'

export type EmailTemplatePreview = {
  id: EmailTemplateId
  category: 'transactional' | 'lifecycle'
  label: string
  subject: string
  preview: string
  html: string
}

type EmailCta = {
  label: string
  href: string
  tone?: 'dark' | 'terra' | 'ghost'
}

type EmailFrameOptions = {
  eyebrow: string
  title: string
  preview: string
  intro?: string
  sections: string[]
  primaryCta?: EmailCta
  secondaryCta?: EmailCta
  note?: string
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
}

function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'MAILLOT ADDICT'
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
  return `<p style="margin:0 0 16px;color:#1a1209;line-height:1.7;font-size:15px;">${text}</p>`
}

function bulletList(items: string[]): string {
  const listItems = items.map((item) => `<li style="margin:0 0 10px;">${item}</li>`).join('')
  return `<ul style="margin:0 0 18px;padding-left:20px;color:#1a1209;line-height:1.7;font-size:15px;">${listItems}</ul>`
}

function renderCta(cta: EmailCta): string {
  const palette =
    cta.tone === 'terra'
      ? 'background:#c1440e;color:#ffffff;border:1px solid #c1440e;'
      : cta.tone === 'ghost'
        ? 'background:#ffffff;color:#1c1712;border:1px solid #e8dfd0;'
        : 'background:#1c1712;color:#ffffff;border:1px solid #1c1712;'

  return `<a href="${cta.href}" style="display:inline-block;padding:14px 22px;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;font-weight:700;${palette}">${escapeHtml(cta.label)}</a>`
}

function renderEmailFrame(options: EmailFrameOptions): string {
  const supportEmail = getSupportEmail()

  return [
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '<head>',
    '<meta charSet="utf-8" />',
    '<meta name="color-scheme" content="light only" />',
    '<meta name="supported-color-schemes" content="light only" />',
    `<title>${escapeHtml(options.title)}</title>`,
    '</head>',
    `<body style="margin:0;background:#f7f0e6;font-family:Arial,sans-serif;color:#1c1712;">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preview)}</div>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f7f0e6;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #eadfce;border-radius:28px;overflow:hidden;">',
    '<tr><td style="padding:0;" bgcolor="#1c1712">',
    '<div style="padding:32px;background:#1c1712;background-image:linear-gradient(135deg,#1c1712 0%,#2e2820 65%,#472d1d 100%);color:#ffffff;">',
    `<p style="margin:0 0 12px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#e8956d;-webkit-text-fill-color:#e8956d;font-weight:700;">${escapeHtml(options.eyebrow)}</p>`,
    `<p style="margin:0;font-size:40px;line-height:0.95;font-weight:900;color:#ffffff;-webkit-text-fill-color:#ffffff;text-transform:uppercase;">${escapeHtml(options.title)}</p>`,
    options.intro
      ? `<p style="margin:18px 0 0;max-width:520px;font-size:15px;line-height:1.7;color:#ede8e2;-webkit-text-fill-color:#ede8e2;">${options.intro}</p>`
      : '',
    '</div>',
    `<div style="padding:32px;">${options.sections.join('')}`,
    options.primaryCta || options.secondaryCta
      ? `<div style="margin:8px 0 24px;">${options.primaryCta ? renderCta(options.primaryCta) : ''}${options.primaryCta && options.secondaryCta ? '<span style="display:inline-block;width:10px;"></span>' : ''}${options.secondaryCta ? renderCta(options.secondaryCta) : ''}</div>`
      : '',
    options.note
      ? `<div style="margin:24px 0 0;padding:16px 18px;border:1px solid #d8cfc4;border-radius:20px;background:#f5ede0;color:#3a2f28;font-size:13px;line-height:1.7;">${options.note}</div>`
      : '',
    `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #e8dfd0;"><p style="margin:0 0 10px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c1440e;font-weight:700;">${escapeHtml(getSiteName())}</p><p style="margin:0;color:#3d3229;font-size:13px;line-height:1.7;">Paiement securise, suivi partage des qu il est disponible, et support centralise pour les questions de commande.</p>${supportEmail ? `<p style="margin:10px 0 0;color:#3d3229;font-size:13px;line-height:1.7;">Besoin d aide ? Reponds a cet email ou ecris a ${escapeHtml(supportEmail)}.</p>` : ''}</div>`,
    '</div>',
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

function orderPaidTemplate(params: {
  customerName?: string | null
  orderNumber: string
  trackingToken: string
}) {
  const trackingLink = `${getBaseUrl()}/suivi/${params.trackingToken}`

  return {
    subject: `Commande confirmee ${params.orderNumber}`,
    preview: `Ta commande ${params.orderNumber} est bien confirmee. Le suivi sera partage des qu il est disponible.`,
    html: renderEmailFrame({
      eyebrow: 'Commande confirmee',
      title: 'Commande validee',
      preview: `Ta commande ${params.orderNumber} est bien confirmee.`,
      intro: 'Ton paiement a bien ete recu. Nous preparons maintenant la commande pour transmission et suivi.',
      sections: [
        paragraph(customerGreeting(params)),
        paragraph(`Ta commande <strong>${escapeHtml(params.orderNumber)}</strong> a bien ete confirmee.`),
        bulletList([
          'un email de confirmation vient d etre enregistre',
          'ta reference de commande est conservee pour le suivi',
          'tu recevras un nouvel email des que le lien transporteur sera disponible',
        ]),
      ],
      primaryCta: {
        label: 'Suivre ma commande',
        href: trackingLink,
      },
      secondaryCta: {
        label: 'Voir la FAQ',
        href: `${getBaseUrl()}/faq`,
        tone: 'ghost',
      },
      note: 'Garde cet email: il contient le point d entree pour suivre la commande et retrouver facilement la reference.',
    }),
  }
}

function trackingTemplate(params: {
  customerName?: string | null
  orderNumber: string
  trackingToken: string
  trackingUrl?: string | null
  trackingNumber?: string | null
}) {
  const publicTrackingLink = `${getBaseUrl()}/suivi/${params.trackingToken}`
  const trackingNumber = params.trackingNumber?.trim()
  const carrierLink = params.trackingUrl?.trim()

  return {
    subject: `Suivi disponible ${params.orderNumber}`,
    preview: `Le suivi de ta commande ${params.orderNumber} est maintenant disponible.`,
    html: renderEmailFrame({
      eyebrow: 'Expedition',
      title: 'Suivi disponible',
      preview: `Le suivi de ta commande ${params.orderNumber} est maintenant disponible.`,
      intro: 'Le transporteur a transmis les informations utiles. Tu peux maintenant consulter le suivi.',
      sections: [
        paragraph(customerGreeting(params)),
        paragraph(`Le suivi de la commande <strong>${escapeHtml(params.orderNumber)}</strong> est maintenant disponible.`),
        trackingNumber ? paragraph(`Numero de suivi: <strong>${escapeHtml(trackingNumber)}</strong>`) : '',
        carrierLink
          ? paragraph(`Un lien transporteur direct est egalement disponible pour cette expedition.`)
          : paragraph('Le suivi detaille est accessible depuis l espace de suivi de commande.'),
      ],
      primaryCta: {
        label: 'Voir le suivi',
        href: publicTrackingLink,
        tone: 'terra',
      },
      secondaryCta: carrierLink
        ? {
            label: 'Lien transporteur',
            href: carrierLink,
            tone: 'ghost',
          }
        : undefined,
      note: 'Si le transporteur met quelques heures a actualiser les etapes, c est normal apres la mise a disposition du suivi.',
    }),
  }
}

function supportAckTemplate(params: {
  customerName: string
  subject: string
  orderNumber?: string
}) {
  const orderReference = params.orderNumber?.trim()

  return {
    subject: 'Nous avons bien recu ton message',
    preview: 'Le support a bien recu ta demande et revient vers toi des que possible.',
    html: renderEmailFrame({
      eyebrow: 'Support',
      title: 'Message bien recu',
      preview: 'Le support a bien recu ta demande.',
      intro: 'Ta demande est en file de traitement. Nous revenons vers toi rapidement avec une reponse claire.',
      sections: [
        paragraph(`Bonjour ${escapeHtml(params.customerName)},`),
        paragraph(`Nous avons bien recu ton message au sujet de <strong>${escapeHtml(params.subject)}</strong>.`),
        orderReference ? paragraph(`Reference transmise: <strong>${escapeHtml(orderReference)}</strong>.`) : '',
      ],
      primaryCta: {
        label: 'Voir la page contact',
        href: `${getBaseUrl()}/contact`,
        tone: 'ghost',
      },
      note: 'Si ton message concerne une commande deja expediee, pense a conserver egalement le lien de suivi pour accelerer la reponse.',
    }),
  }
}

function accountWelcomeTemplate() {
  return {
    subject: 'Ton espace Maillot Addict est pret',
    preview: 'Retrouve tes commandes et ton suivi depuis ton espace compte.',
    html: renderEmailFrame({
      eyebrow: 'Compte client',
      title: 'Espace pret',
      preview: 'Retrouve tes commandes et ton suivi depuis ton espace compte.',
      intro: 'Ton acces compte est pret. Tu peux y retrouver automatiquement les commandes liees au meme email.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Ton espace compte te permet de retrouver plus facilement tes commandes, ton suivi et les prochaines etapes apres achat.'),
        bulletList([
          'voir les commandes liees a ton email',
          'ouvrir le suivi sans rechercher un ancien message',
          'garder un point d acces propre pour tes prochaines commandes',
        ]),
      ],
      primaryCta: {
        label: 'Ouvrir mon compte',
        href: `${getBaseUrl()}/compte`,
      },
    }),
  }
}

function deliveredTemplate(params: {
  customerName?: string | null
  orderNumber: string
}) {
  return {
    subject: `Commande livree ${params.orderNumber}`,
    preview: `Ta commande ${params.orderNumber} devrait maintenant etre arrivee.`,
    html: renderEmailFrame({
      eyebrow: 'Livraison',
      title: 'Commande livree',
      preview: `Ta commande ${params.orderNumber} devrait maintenant etre arrivee.`,
      intro: 'Le suivi indique que la commande est livree ou en toute fin d acheminement.',
      sections: [
        paragraph(customerGreeting(params)),
        paragraph(`La commande <strong>${escapeHtml(params.orderNumber)}</strong> devrait maintenant etre arrivee.`),
        paragraph('Si tout est bon, profite du maillot. Si tu constates un souci, passe directement par la page contact pour que nous puissions regarder rapidement.'),
      ],
      primaryCta: {
        label: 'Contacter le support',
        href: `${getBaseUrl()}/contact`,
        tone: 'ghost',
      },
      secondaryCta: {
        label: 'Explorer la boutique',
        href: `${getBaseUrl()}/shop`,
      },
    }),
  }
}

function abandonedCartTemplate() {
  return {
    subject: 'Ton panier Maillot Addict t attend',
    preview: 'Ton maillot est encore en attente. Reprends la commande quand tu veux.',
    html: renderEmailFrame({
      eyebrow: 'Panier en attente',
      title: 'Tu etais presque',
      preview: 'Ton panier est encore en attente.',
      intro: 'Tu as commence une commande sans aller jusqu au paiement. Le panier peut etre repris quand tu veux.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Ton panier Maillot Addict est toujours la. Si tu voulais finaliser, tu peux reprendre la commande en quelques clics.'),
        bulletList([
          'catalogue premium clubs et selections',
          'flocage et patchs selon les modeles',
          'paiement securise via Stripe',
        ]),
      ],
      primaryCta: {
        label: 'Reprendre ma commande',
        href: `${getBaseUrl()}/panier`,
      },
      secondaryCta: {
        label: 'Voir la boutique',
        href: `${getBaseUrl()}/shop`,
        tone: 'ghost',
      },
    }),
  }
}

function postPurchaseTemplate() {
  return {
    subject: 'Bien recu ? Voici quoi regarder ensuite',
    preview: 'Commandes, suivi et prochaines collections depuis ton espace Maillot Addict.',
    html: renderEmailFrame({
      eyebrow: 'Apres achat',
      title: 'La suite',
      preview: 'Commandes, suivi et prochaines collections depuis ton espace Maillot Addict.',
      intro: 'Une fois la commande en route, le plus simple est de garder un point d acces propre pour le suivi et les prochaines collections.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Merci encore pour ta commande. En attendant le suivi ou la reception, tu peux deja retrouver tes commandes depuis ton espace compte et jeter un oeil aux autres collections.'),
      ],
      primaryCta: {
        label: 'Ouvrir mon compte',
        href: `${getBaseUrl()}/compte`,
      },
      secondaryCta: {
        label: 'Explorer les collections',
        href: `${getBaseUrl()}/shop`,
        tone: 'ghost',
      },
    }),
  }
}

function winBackTemplate() {
  return {
    subject: 'Les collections Maillot Addict ont bouge',
    preview: 'Retourne voir les maillots clubs, selections et concepts du moment.',
    html: renderEmailFrame({
      eyebrow: 'Retour boutique',
      title: 'Revenir jeter un oeil',
      preview: 'Retourne voir les maillots clubs, selections et concepts du moment.',
      intro: 'Le catalogue bouge regulierement. Si tu n es pas repasse depuis un moment, il y a probablement du nouveau a voir.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Nouveaux drops, nouvelles selections, nouvelles idees de maillots: si tu voulais revenir jeter un oeil, c est le bon moment.'),
      ],
      primaryCta: {
        label: 'Revenir sur la boutique',
        href: `${getBaseUrl()}/shop`,
      },
      secondaryCta: {
        label: 'Voir les concepts',
        href: `${getBaseUrl()}/concept`,
        tone: 'ghost',
      },
    }),
  }
}

function buildEmailTemplatePreview(templateId: EmailTemplateId): EmailTemplatePreview {
  const sampleOrderNumber = 'MA-260405-AB12CD'
  const sampleTrackingToken = 'demo-tracking-token'
  const sampleTrackingNumber = 'YT123456789FR'
  const sampleTrackingUrl = 'https://maillotaddict.fr/suivi/demo-tracking-token'

  switch (templateId) {
    case 'order_paid': {
      const template = orderPaidTemplate({
        customerName: 'Noe',
        orderNumber: sampleOrderNumber,
        trackingToken: sampleTrackingToken,
      })
      return {
        id: templateId,
        category: 'transactional',
        label: 'Confirmation de commande',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'tracking': {
      const template = trackingTemplate({
        customerName: 'Noe',
        orderNumber: sampleOrderNumber,
        trackingToken: sampleTrackingToken,
        trackingNumber: sampleTrackingNumber,
        trackingUrl: sampleTrackingUrl,
      })
      return {
        id: templateId,
        category: 'transactional',
        label: 'Suivi disponible',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'support_ack': {
      const template = supportAckTemplate({
        customerName: 'Noe',
        subject: 'Question sur ma commande',
        orderNumber: sampleOrderNumber,
      })
      return {
        id: templateId,
        category: 'transactional',
        label: 'Accuse support',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'account_welcome': {
      const template = accountWelcomeTemplate()
      return {
        id: templateId,
        category: 'lifecycle',
        label: 'Bienvenue compte',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'delivered': {
      const template = deliveredTemplate({
        customerName: 'Noe',
        orderNumber: sampleOrderNumber,
      })
      return {
        id: templateId,
        category: 'transactional',
        label: 'Commande livree',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'abandoned_cart': {
      const template = abandonedCartTemplate()
      return {
        id: templateId,
        category: 'lifecycle',
        label: 'Panier abandonne',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'post_purchase': {
      const template = postPurchaseTemplate()
      return {
        id: templateId,
        category: 'lifecycle',
        label: 'Post-achat',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'win_back': {
      const template = winBackTemplate()
      return {
        id: templateId,
        category: 'lifecycle',
        label: 'Win-back',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
  }
}

export function getEmailTemplatePreviews(): EmailTemplatePreview[] {
  return ([
    'order_paid',
    'tracking',
    'support_ack',
    'account_welcome',
    'delivered',
    'abandoned_cart',
    'post_purchase',
    'win_back',
  ] as const).map((templateId) => buildEmailTemplatePreview(templateId))
}

export async function sendEmailTemplateTest(params: {
  to: string
  templateId: EmailTemplateId
}): Promise<boolean> {
  const preview = buildEmailTemplatePreview(params.templateId)

  return sendTransactionalEmail({
    to: params.to,
    subject: `[Test] ${preview.subject}`,
    html: preview.html,
    replyTo: getSupportEmail() ?? undefined,
  })
}

export async function sendOrderPaidEmail(params: {
  to: string
  customerName?: string | null
  orderNumber: string
  trackingToken: string
}): Promise<boolean> {
  const template = orderPaidTemplate(params)

  return sendTransactionalEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
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
  const template = trackingTemplate(params)

  return sendTransactionalEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    replyTo: getSupportEmail() ?? undefined,
  })
}

export async function sendSupportAckEmail(params: {
  to: string
  customerName: string
  subject: string
  orderNumber?: string
}): Promise<boolean> {
  const template = supportAckTemplate(params)

  return sendTransactionalEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    replyTo: getSupportEmail() ?? undefined,
  })
}
