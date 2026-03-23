import type { Order } from '@/types/order'

export function formatOrderMessage(order: Order): string {
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const itemLines = order.items.map((item) =>
    `• <b>${item.name}</b>\n  Taille : ${item.size}${item.patch ? ` | Patch : ${item.patch}` : ''}\n  Prix : ${item.price.toFixed(2)} €${item.qty > 1 ? ` × ${item.qty}` : ''}`
  ).join('\n\n')

  const addr = order.shipping_address
  const addrStr = addr
    ? `${addr.street}\n${addr.postal_code} ${addr.city}, ${addr.country}`
    : 'Non renseignée'

  return `🛒 <b>NOUVELLE COMMANDE — #${order.id.slice(-8).toUpperCase()}</b>

👤 <b>CLIENT</b>
Nom : ${order.customer_name ?? 'N/A'}
Email : ${order.customer_email ?? 'N/A'}
Téléphone : ${order.customer_phone ?? 'N/A'}

📦 <b>COMMANDE</b>
${itemLines}

💰 <b>TOTAL : ${order.total_amount != null ? order.total_amount.toFixed(2) : 'N/A'} €</b>

📍 <b>LIVRAISON</b>
${addrStr}

🕐 Commandé le ${date}`
}
