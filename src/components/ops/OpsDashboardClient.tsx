'use client'

import { useMemo, useState } from 'react'
import type { Order } from '@/types/order'

type OpsDashboardClientProps = {
  initialOrders: Order[]
}

type OrderFormState = {
  supplierReference: string
  supplierStatus: string
  trackingNumber: string
  trackingUrl: string
  status: Order['status']
}

const STATUS_OPTIONS: Array<Order['status']> = ['paid', 'shipped', 'delivered', 'cancelled']
const DEFAULT_TRACKING_URL = 'https://parcelsapp.com/fr'

function getTrackingUrlValue(trackingUrl?: string | null, fallback = DEFAULT_TRACKING_URL) {
  return trackingUrl?.trim() || fallback
}

function buildInitialForms(orders: Order[]): Record<string, OrderFormState> {
  return Object.fromEntries(
    orders.map((order) => [
      order.id,
      {
        supplierReference: order.supplier_reference ?? '',
        supplierStatus: order.supplier_status ?? '',
        trackingNumber: order.tracking_number ?? '',
        trackingUrl: getTrackingUrlValue(order.tracking_url),
        status: order.status,
      },
    ]),
  )
}

function statusLabel(status: Order['status']) {
  switch (status) {
    case 'paid':
      return 'Payee'
    case 'shipped':
      return 'Expediee'
    case 'delivered':
      return 'Livree'
    case 'cancelled':
      return 'Annulee'
    default:
      return 'En attente'
  }
}

export function OpsDashboardClient({ initialOrders }: OpsDashboardClientProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [forms, setForms] = useState<Record<string, OrderFormState>>(() => buildInitialForms(initialOrders))
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'shipped'>('all')

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders
    return orders.filter((order) => order.status === activeFilter)
  }, [activeFilter, orders])

  function updateForm(orderId: string, patch: Partial<OrderFormState>) {
    setForms((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        ...patch,
      },
    }))
  }

  function syncOrderIntoState(updatedOrder: Order) {
    setOrders((current) => current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
    setForms((current) => {
      const existingForm = current[updatedOrder.id]

      return {
        ...current,
        [updatedOrder.id]: {
          supplierReference: updatedOrder.supplier_reference ?? '',
          supplierStatus: updatedOrder.supplier_status ?? '',
          trackingNumber: updatedOrder.tracking_number ?? '',
          trackingUrl: getTrackingUrlValue(updatedOrder.tracking_url, existingForm?.trackingUrl ?? DEFAULT_TRACKING_URL),
          status: updatedOrder.status,
        },
      }
    })
  }

  async function saveOrder(orderId: string, options?: { sentToSupplier?: boolean }): Promise<Order | null> {
    const form = forms[orderId]
    if (!form) return null

    setBusyOrderId(orderId)
    setMessage(null)

    try {
      const response = await fetch('/api/internal/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: form.status,
          supplierReference: form.supplierReference,
          supplierStatus: form.supplierStatus,
          trackingNumber: form.trackingNumber,
          trackingUrl: form.trackingUrl,
          sentToSupplier: options?.sentToSupplier === true,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(data?.error ?? 'Mise à jour impossible')
        return null
      }

      syncOrderIntoState(data.order)
      setMessage('Commande mise à jour')
      return data.order as Order
    } catch {
      setMessage('Mise à jour impossible')
      return null
    } finally {
      setBusyOrderId(null)
    }
  }

  async function sendTracking(orderId: string) {
    const savedOrder = await saveOrder(orderId)
    if (!savedOrder) {
      return
    }

    setBusyOrderId(orderId)

    try {
      const response = await fetch('/api/internal/orders/send-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(data?.error ?? 'Envoi impossible')
        return
      }

      syncOrderIntoState({
        ...savedOrder,
        status: savedOrder.status === 'paid' ? 'shipped' : savedOrder.status,
        shipped_at:
          savedOrder.status === 'paid' && !savedOrder.shipped_at ? new Date().toISOString() : savedOrder.shipped_at,
        tracking_email_sent_at: new Date().toISOString(),
      })
      setMessage('Email de suivi envoyé')
    } catch {
      setMessage('Envoi impossible')
    } finally {
      setBusyOrderId(null)
    }
  }

  async function logout() {
    await fetch('/api/internal/auth/logout', { method: 'POST' })
    window.location.href = '/ops/login'
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Ops mobile</p>
            <h1 className="mt-2 font-bebas text-4xl text-[var(--black)]">Commandes</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'paid', 'shipped'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] ${
                  activeFilter === filter
                    ? 'bg-[var(--black)] text-white'
                    : 'border border-[var(--cream-3)] text-[var(--black)]'
                }`}
              >
                {filter === 'all' ? 'Toutes' : filter === 'paid' ? 'À payer fournisseur' : 'Expédiées'}
              </button>
            ))}
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-[var(--cream-3)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)]"
            >
              Quitter
            </button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-[var(--terra)]">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const form = forms[order.id]
          const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
          const isBusy = busyOrderId === order.id

          return (
            <article key={order.id} className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-[var(--grey)]">{order.order_number}</p>
                  <p className="mt-1 text-xs text-[var(--grey)]">
                    {new Date(order.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className="rounded-full bg-[var(--terra-lt)] px-3 py-1 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--terra)]">
                  {statusLabel(order.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-[var(--cream)] p-4 text-sm text-[var(--black)]">
                <p>{order.customer_name || 'Nom non renseigné'} · {order.customer_email || 'Email absent'}</p>
                <p>{itemCount} article(s) · {order.total_amount?.toFixed(2)} EUR</p>
                <p>{order.customer_phone || 'Telephone absent'}</p>
                <p className="text-xs text-[var(--grey)]">
                  {order.items.map((item) => `${item.name} x${item.qty}`).join(' · ')}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.supplierReference}
                    onChange={(event) => updateForm(order.id, { supplierReference: event.target.value })}
                    placeholder="Reference fournisseur"
                    className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
                  />
                  <input
                    value={form.supplierStatus}
                    onChange={(event) => updateForm(order.id, { supplierStatus: event.target.value })}
                    placeholder="Statut fournisseur"
                    className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.trackingNumber}
                    onChange={(event) => updateForm(order.id, { trackingNumber: event.target.value })}
                    placeholder="Numéro de suivi"
                    className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
                  />
                  <select
                    value={form.status}
                    onChange={(event) => updateForm(order.id, { status: event.target.value as Order['status'] })}
                    className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  value={form.trackingUrl}
                  onChange={(event) => updateForm(order.id, { trackingUrl: event.target.value })}
                  placeholder="Lien de suivi WhatsApp / transporteur"
                  className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
                />
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => saveOrder(order.id, { sentToSupplier: true })}
                  className="rounded-full border border-[var(--cream-3)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)] disabled:opacity-60"
                >
                  Envoye fournisseur
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => saveOrder(order.id)}
                  className="rounded-full border border-[var(--cream-3)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)] disabled:opacity-60"
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => sendTracking(order.id)}
                  className="rounded-full bg-[var(--black)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-white disabled:opacity-60"
                >
                  Envoyer le suivi
                </button>
              </div>

              <div className="mt-4 text-xs text-[var(--grey)]">
                {order.tracking_email_sent_at
                  ? `Dernier email de suivi envoyé le ${new Date(order.tracking_email_sent_at).toLocaleString('fr-FR')}`
                  : 'Aucun email de suivi envoyé pour cette commande'}
              </div>
            </article>
          )
        })}

        {filteredOrders.length === 0 ? (
          <div className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-8 text-center text-sm text-[var(--grey)]">
            Aucune commande pour ce filtre.
          </div>
        ) : null}
      </div>
    </div>
  )
}
