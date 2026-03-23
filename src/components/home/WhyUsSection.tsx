// src/components/home/WhyUsSection.tsx
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Zap, Trophy, Truck } from 'lucide-react'

const WHY_ITEMS = [
  { icon: Zap, title: 'Fournisseur direct', desc: 'Nous travaillons directement avec les fabricants pour vous garantir les meilleurs prix sans intermediaire.' },
  { icon: Trophy, title: 'Patchs officiels', desc: "Ajoutez les patchs LDC, Copa, FA Cup et bien d'autres a votre maillot selon l'eligibilite du club." },
  { icon: Truck, title: 'Livraison rapide', desc: "Expedition sous 24-48h. Livraison offerte des 60 EUR d'achats en France." },
] as const

export function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--black)] py-24 text-white">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,var(--black-2)_0%,transparent_70%)] opacity-50 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-16 flex flex-col justify-between gap-8 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)] sm:text-sm">
              <span className="h-[2px] w-8 bg-[var(--terra)]"></span>
              Prouver notre valeur
            </p>
            <h2 className="font-bebas text-6xl leading-none md:text-8xl">
              LA DIFFERENCE
              <br />
              KITLAB
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--grey-lt)]">
            L&apos;exigence du sport de haut niveau appliquee a notre service. Des produits authentiques, une logistique parfaitement maitrisee.
          </p>
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
                    <h3 className="mb-4 font-condensed text-xl font-bold uppercase tracking-widest text-white transition-colors duration-300 group-hover:text-[var(--terra)]">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--grey-lt)]">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
