// src/components/home/TrustScrollBar.tsx
const ITEMS = [
  '✓ 1 000+ Clients Satisfaits',
  '✓ Paiement Sécurisé',
  '✓ Livraison 24/48h',
  '✓ Satisfait ou Remboursé',
  '✓ Flocage Disponible',
  '✓ Retours Gratuits',
  '✓ 390+ Maillots',
  '✓ SAV Réactif',
]

// On duplique pour faire une boucle continue
const ALL = [...ITEMS, ...ITEMS]

export function TrustScrollBar() {
  return (
    <div className="bg-[var(--black)] overflow-hidden">
      <div
        className="flex"
        style={{ animation: 'trust-scroll 20s linear infinite', width: 'max-content' }}
      >
        {ALL.map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 font-condensed uppercase text-white px-5 py-2.5 border-r border-white/10"
            style={{ fontSize: 10, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
          >
            <span className="text-[var(--terra)] font-bold">{item.slice(0, 1)}</span>
            {item.slice(1)}
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
