import Link from 'next/link'
import { CheckCircle2, ShieldCheck, Truck, Zap } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const WHY_ITEMS = [
  {
    icon: Zap,
    title: 'Sélection qui convertit',
    desc: 'On garde uniquement les maillots les plus demandés - pas de catalogue infini. Tu trouves vite, tu commandes vite.',
  },
  {
    icon: ShieldCheck,
    title: 'Qualité vérifiée',
    desc: 'Chaque référence est triée sur le volet : flocage propre, tissu solide, coutures nettes. Aucun compromis sur la finition.',
  },
  {
    icon: Truck,
    title: 'Livraison sans friction',
    desc: 'Suivi partagé dès l’expédition. 1 maillot -> 6 EUR · 2 -> 5 EUR · gratuite dès 3. Simple, transparent, fiable.',
  },
] as const

const STATS = [
  { value: '+ de 1000', label: 'clients satisfaits' },
  { value: '4.8 / 5', label: 'note moyenne' },
  { value: '+ de 1000', label: 'maillots livrés' },
] as const

export function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--black)] py-16 text-white">
      <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,var(--black-2)_0%,transparent_70%)] opacity-50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-8 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)] sm:text-sm">
              <span className="h-[2px] w-8 bg-[var(--terra)]" />
              Pourquoi nous choisir
            </p>
            <h2 className="font-bebas text-5xl leading-none md:text-7xl">
              PLUS DE 1000 FANS
              <br />
              NOUS FONT CONFIANCE
            </h2>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <p className="max-w-sm text-sm leading-relaxed text-[var(--grey-lt)]">
              On n’est pas un gros catalogue généraliste. On est une boutique spécialisée, taillée pour ceux qui savent
              ce qu’ils veulent.
            </p>
            <Link
              href="/shop"
              className="mt-2 inline-flex items-center gap-2 rounded-none border border-white/20 px-5 py-2.5 font-condensed text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-[var(--terra)] hover:text-[var(--terra)]"
            >
              Voir le catalogue →
            </Link>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
          {STATS.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center gap-1 px-2 py-5 text-center">
              <p className="whitespace-nowrap font-bebas text-2xl leading-none text-[var(--terra)] sm:text-4xl">
                {stat.value}
              </p>
              <p className="font-condensed text-[9px] uppercase tracking-wider text-white/50 sm:text-[10px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {WHY_ITEMS.map((item, index) => {
            const Icon = item.icon
            return (
              <ScrollReveal key={item.title}>
                <div className="group relative">
                  <span className="absolute -left-6 -top-10 z-0 select-none font-bebas text-[10rem] leading-none text-white/[0.02] transition-colors duration-500 group-hover:text-[var(--terra)]/[0.04]">
                    0{index + 1}
                  </span>
                  <div className="relative z-10 flex flex-col items-start pt-6">
                    <div className="mb-8 flex h-16 w-16 rotate-3 items-center justify-center border border-white/5 bg-[var(--black-2)] transition-all duration-500 group-hover:-rotate-3 group-hover:border-[var(--terra)]/30">
                      <Icon strokeWidth={1.5} className="h-8 w-8 text-white transition-colors duration-500 group-hover:text-[var(--terra)]" />
                    </div>
                    <h3 className="mb-4 font-condensed text-xl font-bold uppercase tracking-widest text-white transition-colors duration-300 group-hover:text-[var(--terra)]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--grey-lt)]">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-8">
          {[
            'Paiement 100% sécurisé via Stripe',
            'Retour sous 14 jours',
            'Suivi partagé dès l’expédition',
            'Flocage et patchs disponibles',
          ].map((item) => (
            <span key={item} className="flex items-center gap-2 font-condensed text-[11px] uppercase tracking-wider text-white/40">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--terra)]" strokeWidth={2} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
