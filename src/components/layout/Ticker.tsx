const TICKER_ITEMS = [
  'LIVRAISON OFFERTE DÈS 60€',
  'REAL MADRID', 'PSG', 'MANCHESTER CITY', 'BARCELONA',
  'JUVENTUS', 'BAYERN MUNICH', 'ARSENAL', 'LIVERPOOL',
  'PAIEMENT SÉCURISÉ', 'MAILLOTS PREMIUM',
]

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div
      className="overflow-hidden py-3 bg-[var(--terra)]"
      role="region"
      aria-label="Informations du site"
    >
      <div className="ticker-track flex gap-12 whitespace-nowrap w-max">
        {items.map((item, i) => (
          <span key={i} className="font-condensed text-sm tracking-[3px] uppercase text-white flex items-center gap-4">
            {item}
            <span className="w-1 h-1 rounded-full bg-white/50 inline-block" />
          </span>
        ))}
      </div>
    </div>
  )
}
