const ITEMS = [
  '✓ 1 200+ Clients Satisfaits',
  '✓ Paiement Securise',
  '✓ Livraison 24/48h',
  '✓ Satisfait ou Rembourse',
  '✓ Flocage Disponible',
  '✓ Retours Gratuits',
  '✓ Catalogue Premium',
  '✓ SAV Reactif',
]

const ALL = [...ITEMS, ...ITEMS]

export function TrustScrollBar() {
  return (
    <div className="overflow-hidden bg-[var(--black)]">
      <div className="flex" style={{ animation: 'trust-scroll 20s linear infinite', width: 'max-content' }}>
        {ALL.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex-shrink-0 border-r border-white/10 px-5 py-2.5 font-condensed uppercase text-white"
            style={{ fontSize: 10, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
          >
            <span className="font-bold text-[var(--terra)]">{item.slice(0, 1)}</span>
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
