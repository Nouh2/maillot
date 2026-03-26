// src/components/home/AboutSection.tsx
import { Star } from 'lucide-react'

const LIST_ITEMS = [
  { icon: '🎽', text: '+390 maillots disponibles' },
  { icon: '⭐', text: '4.5/5 sur nos avis clients' },
  { icon: '🚚', text: 'Livraison gratuite dès 60€' },
]

export function AboutSection() {
  return (
    <section className="px-4 py-10 bg-[var(--cream)]">
      {/* Petit label */}
      <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--terra)] mb-3">
        KITLAB
      </p>

      {/* Titre avec mot souligné */}
      <h2 className="font-condensed text-[26px] font-bold text-[var(--black)] leading-snug">
        Des maillots qui font{' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationColor: 'var(--terra)',
            textDecorationThickness: 3,
            textUnderlineOffset: 5,
          }}
        >
          la différence.
        </span>
      </h2>

      {/* Description */}
      <p className="text-[14px] text-[var(--grey)] mt-3 leading-relaxed">
        On sélectionne les maillots les plus demandés et on te guide pour choisir vite — sans te perdre
        dans un catalogue. Livraison rapide, offre pack, et vraie preuve sociale grâce à vous.
      </p>

      {/* Liste icônes */}
      <ul className="mt-5 space-y-3">
        {LIST_ITEMS.map((item, i) => (
          <li key={i} className="flex items-center gap-3 font-condensed text-[14px] text-[var(--black)]">
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.text}
          </li>
        ))}
      </ul>

      {/* Widget rating */}
      <div
        className="mt-6 bg-white rounded-xl p-4 flex items-center gap-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
      >
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="font-condensed text-[11px] text-[var(--grey)] mt-1">+1 200 clients satisfaits</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-condensed text-[13px] font-bold text-[var(--black)]">Excellent</p>
          <p className="font-condensed text-[12px] text-[var(--grey)]">4.5 / 5</p>
        </div>
      </div>

      {/* Grand chiffre */}
      <div className="mt-8 text-center">
        <p
          className="font-condensed font-black text-[var(--black)] leading-none"
          style={{ fontSize: 52 }}
        >
          +1 200
        </p>
        <p
          className="font-condensed uppercase text-[var(--grey)] mt-2"
          style={{ fontSize: 12, letterSpacing: '0.12em' }}
        >
          Maillots livrés
        </p>
      </div>
    </section>
  )
}
