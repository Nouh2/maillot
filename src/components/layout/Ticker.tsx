'use client'

import { usePathname } from 'next/navigation'
const TICKER_ITEMS = [
  'LIVRAISON INCLUSE · 3 MAILLOTS = LE 3E A -50 %',
]

export function Ticker() {
  const pathname = usePathname()
  const isSelectionLanding = pathname === '/selection-maillots' || pathname === '/coupe-du-monde'

  if (isSelectionLanding) {
    return (
      <div className="w-full bg-[var(--terra)] px-4 py-2 text-center" role="region" aria-label="Offre du moment">
        <span className="font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white">
          Livraison incluse · 3 maillots = le 3e a -50 %
        </span>
      </div>
    )
  }

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="w-full max-w-full overflow-hidden bg-[var(--terra)] py-3" role="region" aria-label="Informations du site">
      <div className="ticker-track flex w-max gap-8 whitespace-nowrap md:gap-12">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-4 font-condensed text-sm uppercase tracking-[3px] text-white">
            {item}
            <span className="inline-block h-1 w-1 rounded-full bg-white/50" />
          </span>
        ))}
      </div>
    </div>
  )
}
