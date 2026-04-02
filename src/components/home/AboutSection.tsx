import { Star } from 'lucide-react'
import { LAUNCH_PROMO_ENABLED } from '@/lib/siteConfig'

const LIST_ITEMS = [
  { icon: 'Catalogue', text: 'Selection premium mise a jour en continu' },
  { icon: 'Avis', text: '4.5/5 sur nos avis clients' },
  { icon: 'Livraison', text: '6 EUR / 5 EUR / offerte des 3 maillots' },
]

export function AboutSection() {
  return (
    <section className="bg-[var(--cream)] px-4 py-10">
      <p className="mb-3 font-condensed text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--terra)]">MAILLOT ADDICT</p>

      <h2 className="font-condensed text-[26px] font-bold leading-snug text-[var(--black)]">
        Des maillots qui font{' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationColor: 'var(--terra)',
            textDecorationThickness: 3,
            textUnderlineOffset: 5,
          }}
        >
          la difference.
        </span>
      </h2>

      <p className="mt-3 text-[14px] leading-relaxed text-[var(--grey)]">
        On selectionne les maillots les plus demandes et on te guide pour choisir vite sans te perdre dans un catalogue. {LAUNCH_PROMO_ENABLED ? 'Prix promo, ' : ''}livraison lisible et vraie preuve sociale grace a vous.
      </p>

      <ul className="mt-5 space-y-3">
        {LIST_ITEMS.map((item) => (
          <li key={item.icon} className="flex items-center gap-3 font-condensed text-[14px] text-[var(--black)]">
            <span className="min-w-20 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--terra)]">{item.icon}</span>
            {item.text}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-4 rounded-xl bg-white p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mt-1 font-condensed text-[11px] text-[var(--grey)]">+1 200 clients satisfaits</p>
        </div>
        <div className="ml-auto text-right">
          <p className="font-condensed text-[13px] font-bold text-[var(--black)]">Excellent</p>
          <p className="font-condensed text-[12px] text-[var(--grey)]">4.5 / 5</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="font-condensed text-[52px] font-black leading-none text-[var(--black)]">+1 200</p>
        <p className="mt-2 font-condensed uppercase text-[var(--grey)]" style={{ fontSize: 12, letterSpacing: '0.12em' }}>
          Maillots livres
        </p>
      </div>
    </section>
  )
}
