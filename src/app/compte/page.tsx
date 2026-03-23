import type { Metadata } from 'next'
import Link from 'next/link'
import { AccountAuthForm } from '@/components/account/AccountAuthForm'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Compte',
}

interface AccountPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const authError = params.error === 'auth'

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="mb-2 font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)]">Espace client</p>
        <h1 className="font-bebas text-6xl text-white md:text-7xl">COMPTE</h1>
        <p className="mt-2 text-[var(--grey-lt)]">
          {user ? 'Session connectee avec Supabase.' : 'Connexion securisee par Supabase.'}
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
          <p className="font-condensed text-xs tracking-[0.28em] uppercase text-[var(--grey)]">
            {user ? 'Etat de session' : 'Connexion'}
          </p>
          <h2 className="mt-3 font-bebas text-5xl leading-none text-[var(--black)]">
            {user ? 'Mon espace' : 'Acceder a mon compte'}
          </h2>

          {authError && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Le lien de connexion n&apos;a pas pu etre valide. Reessaie avec un nouveau lien.
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
                  className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-5 py-3 font-condensed text-sm tracking-[0.22em] uppercase text-white"
                >
                  Suivre ma commande
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full border border-[var(--cream-3)] px-5 py-3 font-condensed text-sm tracking-[0.22em] uppercase text-[var(--black)] sm:w-auto"
                  >
                    Se deconnecter
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
          <p className="font-condensed text-xs tracking-[0.28em] uppercase text-[var(--terra)]">Mobile first</p>
          <h2 className="mt-3 font-bebas text-5xl leading-none text-[var(--black)]">Depuis le menu</h2>
          <div className="mt-5 space-y-4 text-sm text-[var(--black-2)]">
            <p>
              Le bloc <strong>Compte</strong> du menu hamburger lit maintenant la session Supabase en direct.
            </p>
            <p>
              Si tu es connecte, il affiche ton email et la deconnexion. Sinon, il renvoie vers cette page pour t&apos;envoyer un lien magique.
            </p>
            <p>
              Tu peux aussi passer par <Link href="/suivi" className="text-[var(--terra)] underline underline-offset-4">Suivi commande</Link> sans quitter le parcours mobile.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
