import type { Metadata } from 'next'
import Link from 'next/link'
import { AccountAuthForm } from '@/components/account/AccountAuthForm'
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Mon Compte' }

interface AccountPageProps {
  searchParams: Promise<{ error?: string }>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente',  color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  paid:      { label: 'Payée',       color: 'text-blue-700 bg-blue-50 border-blue-200' },
  shipped:   { label: 'Expédiée',    color: 'text-purple-700 bg-purple-50 border-purple-200' },
  delivered: { label: 'Livrée',      color: 'text-green-700 bg-green-50 border-green-200' },
  cancelled: { label: 'Annulée',     color: 'text-red-700 bg-red-50 border-red-200' },
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const authError = params.error === 'auth'

  // Récupérer les commandes si connecté
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = []
  if (user?.email) {
    const service = getSupabaseServiceClient() as any
    const { data } = await service
      .from('orders')
      .select('id, status, total_amount, created_at, items')
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false })
      .limit(10)
    orders = data ?? []
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

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6">

        {/* Bloc auth */}
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <p className="font-condensed text-xs tracking-[0.28em] uppercase text-[var(--grey)]">
              {user ? 'Etat de session' : 'Connexion'}
            </p>
            <h2 className="mt-3 font-bebas text-5xl leading-none text-[var(--black)]">
              {user ? 'Mon espace' : 'Accéder à mon compte'}
            </h2>

            {authError && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Le lien de connexion n&apos;a pas pu être validé. Réessaie avec un nouveau lien.
              </p>
            )}

            {user ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] bg-[var(--cream)] p-5">
                  <p className="font-condensed text-xs tracking-[0.24em] uppercase text-[var(--grey)]">Email</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--black)]">{user.email}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/suivi"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-5 py-3 font-condensed text-sm tracking-[0.22em] uppercase text-white hover:bg-[var(--terra)] transition-colors"
                  >
                    Suivi de commande
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-full border border-[var(--cream-3)] px-5 py-3 font-condensed text-sm tracking-[0.22em] uppercase text-[var(--black)] hover:border-[var(--black)] transition-colors sm:w-auto"
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
              <p>Entre ton <strong>email</strong>, reçois un lien de connexion instantané — aucun mot de passe à retenir.</p>
              <p>Une fois connecté, retrouve l&apos;historique de toutes tes commandes directement ici.</p>
              <p>Tu peux aussi suivre une commande sans compte via <Link href="/suivi" className="text-[var(--terra)] underline underline-offset-4">Suivi commande</Link>.</p>
            </div>
          </aside>
        </div>

        {/* Historique des commandes */}
        {user && (
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
            <h2 className="font-bebas text-4xl text-[var(--black)] mb-6">Mes commandes</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-condensed text-sm uppercase tracking-widest text-[var(--grey)]">Aucune commande pour le moment</p>
                <Link href="/shop" className="mt-4 inline-block rounded-full bg-[var(--terra)] px-6 py-3 font-condensed text-sm tracking-widest uppercase text-white hover:bg-[var(--black)] transition-colors">
                  Découvrir les maillots
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status] ?? { label: order.status, color: 'text-gray-600 bg-gray-50 border-gray-200' }
                  return (
                    <div key={order.id} className="border border-[var(--cream-3)] p-4 rounded-2xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-xs text-[var(--grey)]">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-[var(--grey)] mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="mt-2 text-sm text-[var(--black)]">
                            {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block border text-xs font-condensed px-3 py-1 tracking-widest uppercase rounded-full ${s.color}`}>
                            {s.label}
                          </span>
                          <p className="font-bebas text-2xl text-[var(--terra)] mt-1">{order.total_amount?.toFixed(2)} €</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[var(--cream-3)] space-y-1">
                        {order.items?.map((item: { name: string; size: string; qty: number; price: number; patch_name?: string }, i: number) => (
                          <p key={i} className="text-xs text-[var(--grey)]">
                            {item.name} — T.{item.size}{item.patch_name ? ` + ${item.patch_name}` : ''}{item.qty > 1 ? ` ×${item.qty}` : ''}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
