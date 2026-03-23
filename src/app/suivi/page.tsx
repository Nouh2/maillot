'use client'
import { useState } from 'react'

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  items: Array<{ name: string; size: string; qty: number; price: number; patch_name?: string }>
  shipping_address: { street: string; city: string; postal_code: string; country: string } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  paid:      { label: 'Payée',       color: 'text-blue-600 bg-blue-50 border-blue-200' },
  shipped:   { label: 'Expédiée',    color: 'text-purple-600 bg-purple-50 border-purple-200' },
  delivered: { label: 'Livrée',      color: 'text-green-600 bg-green-50 border-green-200' },
  cancelled: { label: 'Annulée',     color: 'text-red-600 bg-red-50 border-red-200' },
}

export default function SuiviPage() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrders(null)

    const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError('Impossible de récupérer les commandes. Vérifiez votre email.')
      return
    }
    setOrders(data.orders ?? [])
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)] mb-2">Espace client</p>
        <h1 className="font-bebas text-6xl md:text-7xl text-white">SUIVI DE COMMANDE</h1>
        <p className="text-[var(--grey-lt)] mt-2">Entrez votre email pour retrouver vos commandes</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSearch} className="bg-white border border-[var(--cream-3)] p-6 mb-8">
          <label className="block font-condensed text-xs tracking-[0.28em] uppercase text-[var(--grey)] mb-2">
            Email de commande
          </label>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
              className="flex-1 border border-[var(--cream-3)] px-4 py-3 bg-white font-condensed text-sm focus:border-[var(--terra)] outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[var(--terra)] text-white font-condensed text-sm tracking-widest uppercase hover:bg-[var(--black)] transition-colors disabled:opacity-60"
            >
              {loading ? '...' : 'Chercher'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>

        {orders !== null && (
          orders.length === 0 ? (
            <p className="text-center text-[var(--grey)] py-10 font-condensed uppercase tracking-widest">
              Aucune commande trouvée pour cet email.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)]">
                {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
              </p>
              {orders.map((order) => {
                const s = STATUS_LABELS[order.status] ?? { label: order.status, color: 'text-gray-600 bg-gray-50 border-gray-200' }
                return (
                  <div key={order.id} className="bg-white border border-[var(--cream-3)] p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-condensed text-xs text-[var(--grey)] tracking-widest uppercase mb-1">Commande</p>
                        <p className="font-mono text-xs text-[var(--black)]">{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-[var(--grey)] mt-1">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block border text-xs font-condensed px-3 py-1 tracking-widest uppercase ${s.color}`}>
                          {s.label}
                        </span>
                        <p className="font-bebas text-2xl text-[var(--terra)] mt-1">{order.total_amount?.toFixed(2)} €</p>
                      </div>
                    </div>

                    <div className="border-t border-[var(--cream-3)] pt-4 space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[var(--black)]">
                            {item.name} — T.{item.size}
                            {item.patch_name ? ` + ${item.patch_name}` : ''}
                            {item.qty > 1 ? ` ×${item.qty}` : ''}
                          </span>
                          <span className="font-condensed text-[var(--grey)]">{(item.price * item.qty).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>

                    {order.shipping_address && (
                      <div className="mt-3 pt-3 border-t border-[var(--cream-3)] text-xs text-[var(--grey)]">
                        Livraison : {order.shipping_address.street}, {order.shipping_address.postal_code} {order.shipping_address.city}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
