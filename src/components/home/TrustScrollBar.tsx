import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const ITEMS = [
  '+ de 1000 clients satisfaits',
  '★ Note 4.5/5 — Excellent',
  'Paiement 100% sécurisé',
  `${SHIPPING_DELAY_LABEL}`,
  '+ de 1000 maillots livrés',
  'Flocage & patchs disponibles',
  'Retour sous 14 jours',
  'Suivi transmis dès expédition',
  'Boutique française depuis 2024',
]

const ALL_ITEMS = [...ITEMS, ...ITEMS]

export function TrustScrollBar() {
  return (
    <div className="overflow-hidden border-y border-white/5 bg-[var(--black)]">
      <div className="flex" style={{ animation: 'trust-scroll 22s linear infinite', width: 'max-content' }}>
        {ALL_ITEMS.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex flex-shrink-0 items-center gap-2 border-r border-white/10 px-5 py-2.5 font-condensed uppercase text-white"
            style={{ fontSize: 10, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--terra)]" />
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes trust-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
