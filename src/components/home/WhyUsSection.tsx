// src/components/home/WhyUsSection.tsx
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const WHY_ITEMS = [
  { icon: '⚡', title: 'Fournisseur direct', desc: 'Nous travaillons directement avec les fabricants pour vous garantir les meilleurs prix sans intermédiaire.' },
  { icon: '🏆', title: 'Patchs officiels', desc: "Ajoutez les patchs LDC, Copa, FA Cup et bien d'autres à votre maillot selon l'éligibilité du club." },
  { icon: '🚚', title: 'Livraison rapide', desc: "Expédition sous 24-48h. Livraison offerte dès 60€ d'achats en France métropolitaine." },
] as const

export function WhyUsSection() {
  return (
    <section className="py-20 bg-[var(--black-2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-3">Pourquoi nous choisir</p>
          <h2 className="font-bebas text-5xl md:text-6xl text-white">LA DIFFÉRENCE KITLAB</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {WHY_ITEMS.map((item) => (
            <ScrollReveal key={item.title}>
              <div className="bg-[var(--black-3)] p-8 border border-white/10 hover:border-[var(--terra)] transition-colors group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bebas text-2xl text-white mb-3 group-hover:text-[var(--terra)] transition-colors">{item.title}</h3>
                <p className="text-[var(--grey-lt)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
