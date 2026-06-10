import type { Order } from '@/types/order'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatField(value?: string | null): string {
  const cleaned = value?.trim()
  return cleaned ? escapeHtml(cleaned) : 'Non renseigne'
}

function formatPlainField(value?: string | null): string {
  const cleaned = value?.trim()
  return cleaned || 'Non renseigne'
}

function formatPlainCountry(countryCode?: string | null): string {
  const cleaned = countryCode?.trim()
  if (!cleaned) return 'Non renseigne'

  try {
    const displayNames = new Intl.DisplayNames(['fr-FR'], { type: 'region' })
    return displayNames.of(cleaned.toUpperCase()) ?? cleaned.toUpperCase()
  } catch {
    return cleaned.toUpperCase()
  }
}

export function formatOrderCustomerDetails(order: Order, options: { html?: boolean } = {}): string {
  const address = order.shipping_address
  const street = [address?.street, address?.line2]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
  const lines = [
    ['Name', formatPlainField(order.customer_name)],
    ['Address', formatPlainField(street)],
    ['City', formatPlainField(address?.city)],
    ['Province', formatPlainField(address?.state)],
    ['Cap', formatPlainField(address?.postal_code)],
    ['Telephone number', formatPlainField(order.customer_phone)],
    ['State', formatPlainCountry(address?.country)],
  ]

  return lines
    .map(([label, value]) => `${label}: ${options.html ? escapeHtml(value) : value}`)
    .join('\n')
}

export function formatOrderMessage(order: Order): string {
  const date = new Date(order.created_at).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const itemLines = order.items.map((item, index) => {
    const patches = item.patch_names?.length
      ? item.patch_names
      : item.patches?.length
        ? item.patches
        : []
    const flocageParts = [item.flocage_name, item.flocage_number ? `#${item.flocage_number}` : null]
      .filter(Boolean)
      .map((value) => escapeHtml(value!))

    return [
      `<b>Maillot ${index + 1}</b>`,
      `Modele : ${escapeHtml(item.name)}`,
      `Taille : ${escapeHtml(item.size)}`,
      `Quantite : ${item.qty}`,
      `Patchs : ${patches.length > 0 ? patches.map((patch) => escapeHtml(patch)).join(', ') : 'Aucun patch'}`,
      `Flocage : ${flocageParts.length > 0 ? flocageParts.join(' ') : 'Aucun'}`,
      `Prix unitaire : ${item.price.toFixed(2)} EUR`,
      `Sous-total : ${(item.price * item.qty).toFixed(2)} EUR`,
    ].join('\n')
  }).join('\n\n')

  return [
    `<b>NOUVELLE COMMANDE ${escapeHtml(order.order_number)}</b>`,
    '',
    '<b>INFOS CLIENT</b>',
    formatOrderCustomerDetails(order, { html: true }),
    '',
    '<b>DETAIL COMMANDE</b>',
    itemLines,
    '',
    `<b>TOTAL : ${order.total_amount != null ? order.total_amount.toFixed(2) : 'N/A'} EUR</b>`,
    `Canal : ${formatField(order.source_channel)}`,
    `Campagne : ${formatField(order.utm_campaign)}`,
    `Mot cle / ciblage : ${formatField(order.utm_term)}`,
    `Commande le ${escapeHtml(date)}`,
  ].join('\n')
}
