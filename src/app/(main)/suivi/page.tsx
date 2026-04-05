import Link from 'next/link'

export default function SuiviPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="mb-2 font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)]">Espace client</p>
        <h1 className="font-bebas text-6xl text-white md:text-7xl">SUIVI DE COMMANDE</h1>
        <p className="mt-2 text-[var(--grey-lt)]">Le suivi public se fait desormais via un lien unique envoye par email.</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
          <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Option 1</p>
          <h2 className="mt-3 font-bebas text-4xl text-[var(--black)]">Utiliser le lien recu</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--grey)]">
            Chaque commande payee recoit un lien de suivi unique. Ouvre ce lien depuis l&apos;email de confirmation ou de suivi pour voir ton avancement.
          </p>
        </section>

        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 md:p-8">
          <p className="font-condensed text-xs uppercase tracking-[0.24em] text-[var(--grey)]">Option 2</p>
          <h2 className="mt-3 font-bebas text-4xl text-[var(--black)]">Passer par ton compte</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--grey)]">
            Connecte-toi avec le meme email que celui utilise pendant la commande pour retrouver automatiquement tout ton historique.
          </p>
          <div className="mt-6">
            <Link
              href="/compte"
              className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-6 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)]"
            >
              Ouvrir mon compte
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
