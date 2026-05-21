import Link from 'next/link'
import { getOrderByStripeSessionId, getOrderDisplayReference, synchronizeOrderFromCheckoutSession } from '@/lib/orders'
import { getStripe } from '@/lib/stripe'
import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'
import { OrderConfirmedClient } from './OrderConfirmedClient'

export const metadata = { title: 'Commande confirmée' }

interface OrderConfirmedPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function OrderConfirmedPage({ searchParams }: OrderConfirmedPageProps) {
  const params = await searchParams
  const sessionId = params.session_id?.trim()
  let order = null

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        order = await synchronizeOrderFromCheckoutSession(session, {
          runPostProcessing: false,
        })
      } else {
        const { data } = await getOrderByStripeSessionId(sessionId)
        order = data
      }
    } catch (error) {
      console.error('Failed to load confirmation session:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
      <OrderConfirmedClient
        purchase={order && order.total_amount !== null && order.total_amount !== undefined
          ? {
              dedupeKey: `purchase:${order.id}`,
              orderNumber: getOrderDisplayReference(order),
              value: order.total_amount,
              items: order.items,
              sourceChannel: order.source_channel,
            }
          : undefined}
      />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mb-6 text-7xl">OK</div>
        <h1 className="mb-4 font-bebas text-5xl text-[var(--black)] md:text-6xl">COMMANDE CONFIRMEE</h1>
        <p className="mb-2 leading-relaxed text-[var(--grey)]">
          Merci pour votre commande. Un email de confirmation vient d’être envoyé si l’adresse de paiement est valide.
        </p>
        <p className="mb-8 text-sm text-[var(--grey)]">
          {SHIPPING_DELAY_LABEL} · Suivi par lien unique et espace compte
        </p>

        {order ? (
          <div className="mb-8 rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 text-left">
            <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Reference</p>
            <p className="mt-2 font-mono text-sm text-[var(--black)]">{getOrderDisplayReference(order)}</p>
            <p className="mt-4 text-sm text-[var(--grey)]">Total {order.total_amount?.toFixed(2)} EUR</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/suivi/${order.public_tracking_token}`}
                className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-5 py-3 text-center font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)]"
              >
                Voir le suivi
              </Link>
              <Link
                href="/compte"
                className="inline-flex items-center justify-center rounded-full border border-[var(--cream-3)] px-5 py-3 text-center font-condensed text-sm uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:border-[var(--black)]"
              >
                Créer ou ouvrir mon compte
              </Link>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[var(--terra)] px-6 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--black)]"
          >
            Continuer mes achats
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-[var(--cream-3)] px-6 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:border-[var(--black)]"
          >
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  )
}
