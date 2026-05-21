import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackEventOnMount } from '@/components/analytics/TrackEventOnMount'
import { AccountAuthForm } from '@/components/account/AccountAuthForm'
import { getOrdersForAccount } from '@/lib/orders'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Mon Compte' }

interface OrderItem {
  name: string
  size: string
  qty: number
  price: number
  patch_names?: string[]
}

interface AccountOrder {
  id: string
  order_number: string
  public_tracking_token: string
  status: string
  total_amount: number | null
  created_at: string
  items: OrderItem[] | null
  tracking_number?: string | null
  tracking_url?: string | null
}

interface AccountPageProps {
  searchParams: Promise<{ error?: string; auth?: string }>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  paid: { label: 'Payee', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  shipped: { label: 'Expediee', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  delivered: { label: 'Livree', color: 'text-green-700 bg-green-50 border-green-200' },
  cancelled: { label: 'Annulee', color: 'text-red-700 bg-red-50 border-red-200' },
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const authError = params.error === 'auth'
  const authSuccess = params.auth === 'success'

  let orders: AccountOrder[] = []
  if (user?.email) {
    const { data } = await getOrdersForAccount(user.id, user.email)
    orders = (data as AccountOrder[] | null) ?? []
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="mb-2 font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)]">Espace client</p>
        <h1 className="font-bebas text-6xl text-white md:text-7xl">MON COMPTE</h1>
        <p className="mt-2 text-[var(--grey-lt)]">
          {user ? `Connecté en tant que ${user.email}` : 'Connexion sécurisée par Supabase'}
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        {authSuccess ? <TrackEventOnMount event="account_authenticated" /> : null}
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <p className="font-condensed text-xs tracking-[0.28em] uppercase text-[var(--grey)]">
              {user ? 'Etat de session' : 'Connexion'}
            </p>
            <h2 className="mt-3 font-bebas text-5xl leading-none text-[var(--black)]">
              {user ? 'Mon espace' : 'Accéder à mon compte'}
            </h2>

            {authError ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Le lien de connexion n’a pas pu être validé. Réessaye avec un nouveau lien.
              </p>
            ) : null}

            {authSuccess ? (
              <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Connexion réussie. Tes commandes ont été rattachées à ton compte.
              </p>
            ) : null}

            {user ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-[var(--cream)] p-5">
                  <p className="font-condensed text-xs tracking-[0.24em] uppercase text-[var(--grey)]">Email</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--black)]">{user.email}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/suivi"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-5 py-3 font-condensed text-sm tracking-[0.22em] uppercase text-white transition-colors hover:bg-[var(--terra)]"
                  >
                    Suivi de commande
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full border border-[var(--cream-3)] px-5 py-3 font-condensed text-sm tracking-[0.22em] uppercase text-[var(--black)] transition-colors hover:border-[var(--black)] sm:w-auto"
                    >
                      Se déconnecter
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <AccountAuthForm />
              </div>
            )}
          </section>

          <aside className="rounded-[2rem] border border-[var(--cream-3)] bg-[var(--terra-lt)] p-6 md:p-8">
            <p className="font-condensed text-xs tracking-[0.28em] uppercase text-[var(--terra)]">Comment ça marche</p>
            <h2 className="mt-3 font-bebas text-5xl leading-none text-[var(--black)]">Lien magique</h2>
            <div className="mt-5 space-y-4 text-sm text-[var(--black-2)]">
              <p>Entre ton email, reçois un lien de connexion instantané sans mot de passe.</p>
              <p>Une fois connecté, retrouve tout l’historique de tes commandes et les liens de suivi.</p>
              <p>Si tu n’as pas encore de compte, tes commandes sont rattachées automatiquement au premier login avec le même email.</p>
            </div>
          </aside>
        </div>

        {user ? (
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <h2 className="mb-6 font-bebas text-4xl text-[var(--black)]">Mes commandes</h2>

            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-condensed text-sm uppercase tracking-widest text-[var(--grey)]">Aucune commande pour le moment</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-block rounded-full bg-[var(--terra)] px-6 py-3 font-condensed text-sm tracking-widest uppercase text-white transition-colors hover:bg-[var(--black)]"
                >
                  Découvrir les maillots
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = STATUS_LABELS[order.status] ?? {
                    label: order.status,
                    color: 'text-gray-600 bg-gray-50 border-gray-200',
                  }

                  return (
                    <article key={order.id} className="rounded-2xl border border-[var(--cream-3)] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-mono text-xs text-[var(--grey)]">{order.order_number}</p>
                          <p className="mt-0.5 text-xs text-[var(--grey)]">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="mt-2 text-sm text-[var(--black)]">
                            {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-condensed uppercase tracking-widest ${status.color}`}>
                            {status.label}
                          </span>
                          <p className="mt-1 font-bebas text-2xl text-[var(--terra)]">{order.total_amount?.toFixed(2)} EUR</p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 border-t border-[var(--cream-3)] pt-3">
                        {order.items?.map((item, index) => (
                          <p key={index} className="text-xs text-[var(--grey)]">
                            {item.name} - T.{item.size}
                            {item.patch_names?.length ? ` + ${item.patch_names.join(', ')}` : ''}
                            {item.qty > 1 ? ` x${item.qty}` : ''}
                          </p>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Link
                          href={`/suivi/${order.public_tracking_token}`}
                          className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-white transition-colors hover:bg-[var(--terra)]"
                        >
                          Voir le suivi
                        </Link>
                        {order.tracking_url ? (
                          <Link
                            href={order.tracking_url}
                            className="inline-flex items-center justify-center rounded-full border border-[var(--cream-3)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)] transition-colors hover:border-[var(--black)]"
                          >
                            Lien transporteur
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  )
}
