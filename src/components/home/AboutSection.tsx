import Link from 'next/link'
import { ArrowRight, ShieldCheck, Ticket, Truck } from 'lucide-react'
import { LAUNCH_PROMO_ENABLED } from '@/lib/siteConfig'

const LIST_ITEMS = [
  { icon: ShieldCheck, text: 'Paiement 100% securise via Stripe' },
  { icon: Ticket, text: 'Suivi partage des l expedition' },
  { icon: Truck, text: 'Livraison offerte des 60 EUR d achats' },
]

export function AboutSection() {
  return (
    <section className="bg-[var(--cream)] px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl md:grid md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--terra)]/25 bg-[var(--terra-lt)] px-4 py-1.5">
            <span className="text-base">FR</span>
            <span className="font-condensed text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--terra)]">
              Boutique francaise · Confiance depuis 2024
            </span>
          </div>

          <h2 className="font-condensed text-[26px] font-bold leading-snug text-[var(--black)] md:text-4xl">
            Des maillots qui font{' '}
            <span
              style={{
                textDecoration: 'underline',
                textDecorationColor: 'var(--terra)',
                textDecorationThickness: 3,
                textUnderlineOffset: 5,
              }}
            >
              vraiment la difference.
            </span>
          </h2>

          <p className="mt-4 text-[14px] leading-relaxed text-[var(--grey)]">
            On a construit MAILLOT ADDICT pour les vrais passionnes : une selection resserree des maillots les plus
            recherches, un parcours d&apos;achat clair, et un suivi transmis sans friction.{' '}
            {LAUNCH_PROMO_ENABLED ? 'Prix promo en cours, ' : ''}
            pas de mauvaises surprises.
          </p>

          <ul className="mt-6 space-y-3">
            {LIST_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.text} className="flex items-center gap-3 text-[14px] text-[var(--black)]">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--terra-lt)] text-[var(--terra)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-condensed">{item.text}</span>
                </li>
              )
            })}
          </ul>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-none bg-[var(--black)] px-7 py-3.5 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)]"
          >
            Voir le catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-0">
          <div className="rounded-xl bg-[var(--terra)] p-5 text-white">
            <p className="font-bebas text-4xl leading-none">+ de 10000</p>
            <p className="mt-1 font-condensed text-[11px] uppercase tracking-wider text-white/75">Maillots livres</p>
          </div>
          <div className="rounded-xl bg-[var(--black)] p-5 text-white">
            <p className="font-bebas text-4xl leading-none">+ de 1000</p>
            <p className="mt-1 font-condensed text-[11px] uppercase tracking-wider text-white/75">Clients satisfaits</p>
          </div>
        </div>
      </div>
    </section>
  )
}
