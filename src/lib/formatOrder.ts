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

function formatCountry(countryCode?: string | null): string {
  const cleaned = countryCode?.trim()
  if (!cleaned) return 'Non renseigne'

  try {
    const displayNames = new Intl.DisplayNames(['fr-FR'], { type: 'region' })
    return escapeHtml(displayNames.of(cleaned.toUpperCase()) ?? cleaned.toUpperCase())
  } catch {
    return escapeHtml(cleaned.toUpperCase())
  }
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

  const addressLines = order.shipping_address
    ? [
        formatField(order.shipping_address.street),
        order.shipping_address.line2 ? formatField(order.shipping_address.line2) : null,
        [order.shipping_address.postal_code, order.shipping_address.city]
          .filter(Boolean)
          .map((value) => escapeHtml(value!))
          .join(' ') || null,
        order.shipping_address.state ? formatField(order.shipping_address.state) : null,
        formatCountry(order.shipping_address.country),
      ].filter(Boolean)
    : ['Non renseigne']

  return [
    `<b>NOUVELLE COMMANDE ${escapeHtml(order.order_number)}</b>`,
    '',
    '<b>CLIENT</b>',
    `Nom / prenom : ${formatField(order.customer_name)}`,
    `Email : ${formatField(order.customer_email)}`,
    `Telephone : ${formatField(order.customer_phone)}`,
    '',
    '<b>LIVRAISON</b>',
    ...addressLines,
    '',
    '<b>DETAIL COMMANDE</b>',
    itemLines,
    '',
    `<b>TOTAL : ${order.total_amount != null ? order.total_amount.toFixed(2) : 'N/A'} EUR</b>`,
    `Canal : ${formatField(order.source_channel)}`,
    `Commande le ${escapeHtml(date)}`,
  ].join('\n')
}
