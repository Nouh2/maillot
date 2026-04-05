import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TrackEventOnMount } from '@/components/analytics/TrackEventOnMount'
import { getOrderByTrackingToken, getOrderDisplayReference } from '@/lib/orders'
import type { Order } from '@/types/order'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  paid: { label: 'Payee', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  shipped: { label: 'Expediee', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  delivered: { label: 'Livree', color: 'text-green-700 bg-green-50 border-green-200' },
  cancelled: { label: 'Annulee', color: 'text-red-700 bg-red-50 border-red-200' },
}

export default async function TrackingTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { data } = await getOrderByTrackingToken(token)

  if (!data) {
    notFound()
  }

  const order = data as Order
  const status = STATUS_LABELS[order.status] ?? {
    label: order.status,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="mb-2 font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)]">Suivi public</p>
        <h1 className="font-bebas text-6xl text-white md:text-7xl">{getOrderDisplayReference(order)}</h1>
        <p className="mt-2 text-[var(--grey-lt)]">Derniere mise a jour de votre commande</p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <TrackEventOnMount event="tracking_viewed" params={{ order_number: getOrderDisplayReference(order), status: order.status }} />
        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Statut actuel</p>
              <h2 className="mt-3 font-bebas text-5xl text-[var(--black)]">{status.label}</h2>
              <p className="mt-3 text-sm text-[var(--grey)]">
                Commande passee le{' '}
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <span className={`inline-flex rounded-full border px-4 py-2 text-xs font-condensed uppercase tracking-widest ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--cream)] p-4">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Commande</p>
              <p className="mt-2 text-sm text-[var(--black)]">{order.items.length} article(s)</p>
              <p className="mt-1 text-sm text-[var(--black)]">Total {order.total_amount?.toFixed(2)} EUR</p>
            </div>
            <div className="rounded-2xl bg-[var(--cream)] p-4">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Suivi transporteur</p>
              <p className="mt-2 text-sm text-[var(--black)]">{order.tracking_number || 'Bientot disponible'}</p>
              {order.tracking_url ? (
                <Link href={order.tracking_url} className="mt-3 inline-flex text-sm text-[var(--terra)] underline underline-offset-4">
                  Ouvrir le lien de suivi
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
          <h2 className="font-bebas text-4xl text-[var(--black)]">Articles</h2>
          <div className="mt-5 space-y-3">
            {order.items.map((item: Order['items'][number], index: number) => (
              <div key={`${item.product_id}-${index}`} className="rounded-2xl border border-[var(--cream-3)] p-4">
                <p className="text-sm font-semibold text-[var(--black)]">{item.name}</p>
                <p className="mt-1 text-xs text-[var(--grey)]">
                  Taille {item.size}
                  {item.patch_names?.length ? ` · Patchs ${item.patch_names.join(', ')}` : ''}
                  {item.flocage_name || item.flocage_number
                    ? ` · Flocage ${[item.flocage_name, item.flocage_number].filter(Boolean).join(' #')}`
                    : ''}
                </p>
                <p className="mt-2 text-xs text-[var(--grey)]">
                  Quantite {item.qty} · {(item.price * item.qty).toFixed(2)} EUR
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
          <h2 className="font-bebas text-4xl text-[var(--black)]">Besoin d&apos;aide ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--grey)]">
            Si tu as une question sur cette commande, utilise la page contact et indique la reference {getOrderDisplayReference(order)}.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-6 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)]"
            >
              Contacter le support
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
