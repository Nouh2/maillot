import { ABANDONED_CART_PROMO_CODE } from '@/lib/promoCodes'

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
  | 'abandoned_cart_30m'
  | 'abandoned_cart_6h'
  | 'abandoned_cart_24h'
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

export type AbandonedCartStage = '30m' | '6h' | '24h'

type AbandonedCartItem = {
  name?: string | null
  slug?: string | null
  size?: string | null
  qty?: number | null
  price?: number | null
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.maillotaddict.fr'
}

function getLandingUrl(): string {
  return getBaseUrl()
}

function getSiteName(): string {
  const configuredName = process.env.NEXT_PUBLIC_SITE_NAME?.trim()
  if (!configuredName || /kitlab/i.test(configuredName)) return 'MAILLOT ADDICT'
  return configuredName
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

function encodeEmailCharacters(value: string): string {
  return value.replace(/[^\x00-\x7F]/g, (char) => `&#${char.codePointAt(0)};`)
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

  return `<a href="${cta.href}" style="display:inline-block;box-sizing:border-box;max-width:100%;padding:14px 22px;border-radius:999px;text-align:center;text-decoration:none;font-size:13px;line-height:1.25;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;${palette}">${escapeHtml(cta.label)}</a>`
}

function renderCtaGroup(primaryCta?: EmailCta, secondaryCta?: EmailCta): string {
  if (!primaryCta && !secondaryCta) return ''

  return [
    '<div style="margin:8px 0 24px;">',
    primaryCta ? `<div style="display:block;margin:0 0 12px;">${renderCta(primaryCta)}</div>` : '',
    secondaryCta ? `<div style="display:block;margin:0;">${renderCta(secondaryCta)}</div>` : '',
    '</div>',
  ].join('')
}

function renderEmailFrame(options: EmailFrameOptions): string {
  const supportEmail = getSupportEmail()

  return encodeEmailCharacters([
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '<head>',
    '<meta charset="UTF-8" />',
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
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
    '</td></tr>',
    '<tr><td style="padding:0;" bgcolor="#ffffff">',
    `<div style="padding:32px;background:#ffffff;">${options.sections.join('')}`,
    renderCtaGroup(options.primaryCta, options.secondaryCta),
    options.note
      ? `<div style="margin:24px 0 0;padding:16px 18px;border:1px solid #d8cfc4;border-radius:20px;background:#f5ede0;color:#3a2f28;font-size:13px;line-height:1.7;">${options.note}</div>`
      : '',
    `<div style="margin-top:28px;padding-top:20px;border-top:1px solid #e8dfd0;"><p style="margin:0 0 10px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c1440e;font-weight:700;">${escapeHtml(getSiteName())}</p><p style="margin:0;color:#3d3229;font-size:13px;line-height:1.7;">Sélection de maillots, paiement sécurisé et suivi partagé dès qu’il est disponible.</p>${supportEmail ? `<p style="margin:10px 0 0;color:#3d3229;font-size:13px;line-height:1.7;">Besoin d’aide ? Réponds à cet email ou écris à ${escapeHtml(supportEmail)}.</p>` : ''}</div>`,
    '</div>',
    '</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join(''))
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
    subject: `Commande confirmée ${params.orderNumber}`,
    preview: `Ta commande ${params.orderNumber} est bien confirmée. Le suivi sera partagé dès qu’il est disponible.`,
    html: renderEmailFrame({
      eyebrow: 'Commande confirmée',
      title: 'Commande validée',
      preview: `Ta commande ${params.orderNumber} est bien confirmée.`,
      intro: 'Ton paiement a bien été reçu. La commande passe maintenant en préparation avant transmission du suivi.',
      sections: [
        paragraph(customerGreeting(params)),
        paragraph(`Ta commande <strong>${escapeHtml(params.orderNumber)}</strong> est confirmée. Tu n’as rien d’autre à faire pour le moment.`),
        bulletList([
          'la référence est conservée pour le suivi',
          'le lien transporteur sera envoyé dès qu’il sera disponible',
          'ton espace compte peut regrouper tes commandes avec le même email',
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
      note: 'Garde cet email : il contient le point d’entrée le plus simple pour retrouver ta commande.',
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
      eyebrow: 'Expédition',
      title: 'Suivi disponible',
      preview: `Le suivi de ta commande ${params.orderNumber} est maintenant disponible.`,
      intro: 'Le transporteur a transmis les informations utiles. Tu peux maintenant consulter le suivi.',
      sections: [
        paragraph(customerGreeting(params)),
        paragraph(`Le suivi de la commande <strong>${escapeHtml(params.orderNumber)}</strong> est maintenant disponible.`),
        trackingNumber ? paragraph(`Numéro de suivi : <strong>${escapeHtml(trackingNumber)}</strong>`) : '',
        carrierLink
          ? paragraph(`Un lien transporteur direct est également disponible pour cette expédition.`)
          : paragraph('Le suivi détaillé est accessible depuis l’espace de suivi de commande.'),
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
      note: 'Si le transporteur met quelques heures à actualiser les étapes, c’est normal après la mise à disposition du suivi.',
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
    subject: 'Nous avons bien reçu ton message',
    preview: 'Le support a bien reçu ta demande et revient vers toi dès que possible.',
    html: renderEmailFrame({
      eyebrow: 'Support',
      title: 'Message bien reçu',
      preview: 'Le support a bien reçu ta demande.',
      intro: 'Ta demande est en file de traitement. Nous revenons vers toi rapidement avec une réponse claire.',
      sections: [
        paragraph(`Bonjour ${escapeHtml(params.customerName)},`),
        paragraph(`Nous avons bien reçu ton message au sujet de <strong>${escapeHtml(params.subject)}</strong>.`),
        orderReference ? paragraph(`Référence transmise : <strong>${escapeHtml(orderReference)}</strong>.`) : '',
      ],
      primaryCta: {
        label: 'Voir la page contact',
        href: `${getBaseUrl()}/contact`,
        tone: 'ghost',
      },
      note: 'Si ton message concerne une commande déjà expédiée, pense à conserver également le lien de suivi pour accélérer la réponse.',
    }),
  }
}

function accountWelcomeTemplate() {
  return {
    subject: 'Ton espace Maillot Addict est prêt',
    preview: 'Retrouve tes commandes et ton suivi depuis ton espace compte.',
    html: renderEmailFrame({
      eyebrow: 'Compte client',
      title: 'Espace prêt',
      preview: 'Retrouve tes commandes et ton suivi depuis ton espace compte.',
      intro: 'Ton accès compte est prêt. Il sert surtout à retrouver tes commandes et ton suivi sans fouiller dans tes emails.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Ton espace compte regroupe les commandes liées à ton email. Pratique si tu commandes plusieurs maillots ou si tu veux revenir au suivi plus tard.'),
        bulletList([
          'voir les commandes liées à ton email',
          'ouvrir le suivi sans rechercher un ancien message',
          'garder un point d’accès propre pour tes prochaines commandes',
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
    subject: `Commande livrée ${params.orderNumber}`,
    preview: `Ta commande ${params.orderNumber} devrait maintenant être arrivée.`,
    html: renderEmailFrame({
      eyebrow: 'Livraison',
      title: 'Commande livrée',
      preview: `Ta commande ${params.orderNumber} devrait maintenant être arrivée.`,
      intro: 'Le suivi indique que la commande est livrée ou en toute fin d’acheminement.',
      sections: [
        paragraph(customerGreeting(params)),
        paragraph(`La commande <strong>${escapeHtml(params.orderNumber)}</strong> devrait maintenant être arrivée.`),
        paragraph('Si tout est bon, profite du maillot. Si tu veux compléter avec un autre club ou une autre sélection, la boutique reste ouverte.'),
        paragraph('Si tu constates un souci, passe par la page contact pour que nous puissions regarder rapidement.'),
      ],
      primaryCta: {
        label: 'Contacter le support',
        href: `${getBaseUrl()}/contact`,
        tone: 'ghost',
      },
      secondaryCta: {
        label: 'Explorer la boutique',
        href: getLandingUrl(),
      },
    }),
  }
}

function abandonedCartTemplate() {
  return abandonedCartStageTemplate({ stage: '30m' })
}

function formatCartItems(items?: AbandonedCartItem[] | null): string {
  const normalizedItems = (items ?? [])
    .filter((item) => item?.name)
    .slice(0, 4)

  if (normalizedItems.length === 0) {
    return ''
  }

  const lines = normalizedItems.map((item) => {
    const qty = item.qty && item.qty > 1 ? ` x${item.qty}` : ''
    const size = item.size ? ` - Taille ${escapeHtml(item.size)}` : ''
    return `${escapeHtml(item.name!)}${size}${qty}`
  })

  return bulletList(lines)
}

function promoCodeBlock(code: string): string {
  return [
    '<div style="margin:0 0 18px;padding:18px 20px;border:1px solid #e8dfd0;border-radius:22px;background:#fff7ed;">',
    '<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#c1440e;font-weight:700;">Code panier</p>',
    `<p style="margin:0;color:#1c1712;font-size:28px;line-height:1;font-weight:900;letter-spacing:0.12em;">${escapeHtml(code)}</p>`,
    '<p style="margin:10px 0 0;color:#3d3229;font-size:13px;line-height:1.6;">-10 % appliqués automatiquement depuis le lien si tu veux finaliser aujourd’hui.</p>',
    '</div>',
  ].join('')
}

function getCartSummary(items?: AbandonedCartItem[] | null): { itemCount: number; total: number } {
  return (items ?? []).reduce(
    (summary, item) => {
      const qty = Number.isFinite(item.qty) && item.qty && item.qty > 0 ? item.qty : 1
      const price = Number.isFinite(item.price) && item.price ? item.price : 0

      return {
        itemCount: summary.itemCount + qty,
        total: summary.total + (price * qty),
      }
    },
    { itemCount: 0, total: 0 },
  )
}

function abandonedCartStageTemplate(params: {
  stage: AbandonedCartStage
  items?: AbandonedCartItem[] | null
}) {
  const resumeLink = `${getBaseUrl()}/panier`
  const promoResumeLink = `${getBaseUrl()}/panier?promo=${ABANDONED_CART_PROMO_CODE}`
  const landingLink = getLandingUrl()
  const summary = getCartSummary(params.items)
  const itemSummary = formatCartItems(params.items)
  const totalLine = summary.total > 0
    ? paragraph(`Panier estimé : <strong>${summary.total.toFixed(2)} EUR</strong>${summary.itemCount > 0 ? ` pour ${summary.itemCount} article${summary.itemCount > 1 ? 's' : ''}` : ''}.`)
    : ''

  if (params.stage === '6h') {
    return {
      subject: 'Toujours intéressé par ton maillot ?',
      preview: 'Ton panier est encore disponible, avec paiement sécurisé et suivi après expédition.',
      html: renderEmailFrame({
        eyebrow: 'Panier en attente',
        title: 'Toujours dispo',
        preview: 'Ton panier est encore disponible.',
        intro: 'Tu avais repéré un maillot plus tôt. Si c’était le bon, tu peux reprendre la commande sans repartir de zéro.',
        sections: [
          paragraph('Bonjour,'),
          paragraph('On te remet simplement le panier sous la main. Les tailles et options sélectionnées sont plus faciles à retrouver maintenant que plus tard.'),
          itemSummary,
          totalLine,
          paragraph('Le paiement passe par Stripe, et le suivi est transmis dès qu’il est disponible. Si tu hésitais encore, tu peux vérifier le panier avant de payer.'),
        ],
        primaryCta: {
          label: 'Vérifier mon panier',
          href: resumeLink,
          tone: 'terra',
        },
        secondaryCta: {
          label: 'Voir l’accueil',
          href: landingLink,
          tone: 'ghost',
        },
      }),
    }
  }

  if (params.stage === '24h') {
    return {
      subject: '10 % pour finaliser ton panier',
      preview: `Ton panier est encore accessible avec le code ${ABANDONED_CART_PROMO_CODE}.`,
      html: renderEmailFrame({
        eyebrow: 'Offre panier',
        title: '-10 % aujourd’hui',
        preview: `Ton panier est encore accessible avec le code ${ABANDONED_CART_PROMO_CODE}.`,
        intro: 'Dernière relance pour ton panier. Pour te laisser une vraie raison de trancher, on te laisse un code de 10 %.',
        sections: [
          paragraph('Bonjour,'),
          paragraph('Si le maillot te plaît toujours, utilise le code ci-dessous au paiement. Sinon, tu peux simplement ignorer cet email.'),
          promoCodeBlock(ABANDONED_CART_PROMO_CODE),
          itemSummary,
          totalLine,
          bulletList([
            'paiement sécurisé via Stripe',
            'flocage et patchs selon les modèles compatibles',
            'suivi transmis après expédition',
          ]),
        ],
        primaryCta: {
          label: 'Utiliser le code',
          href: promoResumeLink,
          tone: 'terra',
        },
        secondaryCta: {
          label: 'Voir l’accueil',
          href: landingLink,
          tone: 'ghost',
        },
        note: `Code ${ABANDONED_CART_PROMO_CODE} : la remise est appliquée automatiquement depuis ce lien panier.`,
      }),
    }
  }

  return {
    subject: 'Ton maillot est encore là',
    preview: 'Ton panier est sauvegardé. Tu peux reprendre la commande quand tu veux.',
    html: renderEmailFrame({
      eyebrow: 'Panier en attente',
      title: 'Tu étais presque',
      preview: 'Ton panier est encore en attente.',
      intro: 'Tu as commencé une commande sans aller jusqu’au paiement. On a gardé le panier accessible pour que tu puisses reprendre tranquillement.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Le maillot que tu avais sélectionné est toujours dans ton panier. Si tu voulais juste prendre le temps de vérifier, le récap est disponible en un clic.'),
        itemSummary,
        totalLine,
        bulletList([
          'sélection clubs et sélections',
          'options flocage et patchs selon les modèles',
          'paiement sécurisé via Stripe',
        ]),
      ],
      primaryCta: {
        label: 'Reprendre ma commande',
        href: `${getBaseUrl()}/panier`,
      },
      secondaryCta: {
        label: 'Voir l’accueil',
        href: landingLink,
        tone: 'ghost',
      },
    }),
  }
}

function postPurchaseTemplate() {
  return {
    subject: 'Garde le suivi sous la main',
    preview: 'Commandes, suivi et prochaines collections depuis ton espace Maillot Addict.',
    html: renderEmailFrame({
      eyebrow: 'Après achat',
      title: 'La suite',
      preview: 'Commandes, suivi et prochaines collections depuis ton espace Maillot Addict.',
      intro: 'Une fois la commande en route, le plus simple est de garder un point d’accès propre pour le suivi.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Merci encore pour ta commande. En attendant le suivi ou la réception, ton espace compte te permet de retrouver les infos utiles sans rechercher les emails.'),
        paragraph('Tu peux aussi garder la boutique sous la main si tu veux compléter plus tard avec un autre maillot.'),
      ],
      primaryCta: {
        label: 'Ouvrir mon compte',
        href: `${getBaseUrl()}/compte`,
      },
      secondaryCta: {
        label: 'Explorer les collections',
        href: getLandingUrl(),
        tone: 'ghost',
      },
    }),
  }
}

function winBackTemplate() {
  return {
    subject: 'Les collections Maillot Addict ont bougé',
    preview: 'Retourne voir les maillots clubs, sélections et concepts du moment.',
    html: renderEmailFrame({
      eyebrow: 'Retour boutique',
      title: 'Revenir jeter un œil',
      preview: 'Retourne voir les maillots clubs, sélections et concepts du moment.',
      intro: 'Le catalogue bouge régulièrement. Si tu n’es pas repassé depuis un moment, il y a probablement du nouveau à voir.',
      sections: [
        paragraph('Bonjour,'),
        paragraph('Nouveaux drops, sélections, concepts et modèles rétro : si tu voulais revenir jeter un œil, c’est le bon moment.'),
        paragraph('Pas besoin de choisir tout de suite. Reviens simplement voir les modèles qui ont été ajoutés.'),
      ],
      primaryCta: {
        label: 'Revenir sur la boutique',
        href: getLandingUrl(),
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
        label: 'Accusé support',
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
        label: 'Commande livrée',
        subject: template.subject,
        preview: template.preview,
        html: template.html,
      }
    }
    case 'abandoned_cart_30m':
    case 'abandoned_cart_6h':
    case 'abandoned_cart_24h': {
      const stage = templateId === 'abandoned_cart_6h'
        ? '6h'
        : templateId === 'abandoned_cart_24h'
          ? '24h'
          : '30m'
      const template = abandonedCartStageTemplate({
        stage,
        items: [
          {
            name: 'Belgique Maillot Exterieur 2026',
            size: 'M',
            qty: 1,
            price: 19.9,
          },
          {
            name: 'France Maillot Domicile 2026',
            size: 'L',
            qty: 1,
            price: 19.9,
          },
        ],
      })
      return {
        id: templateId,
        category: 'lifecycle',
        label: `Panier abandonné ${stage}`,
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
    'abandoned_cart_30m',
    'abandoned_cart_6h',
    'abandoned_cart_24h',
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

export async function sendAbandonedCartEmail(params: {
  to: string
  stage: AbandonedCartStage
  items?: AbandonedCartItem[] | null
}): Promise<boolean> {
  const template = abandonedCartStageTemplate(params)

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
