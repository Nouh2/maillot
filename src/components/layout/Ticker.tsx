'use client'

import { usePathname } from 'next/navigation'
import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const TICKER_ITEMS = [
  'LIVRAISON INCLUSE SUR TOUS LES MAILLOTS',
  'PACK 3 MAILLOTS - REMISE IMMEDIATE',
  'MIX LIBRE: CLUBS + SELECTIONS + RETRO',
  'FLOCAGE + PATCHS POUR UN MAILLOT UNIQUE',
  'PAIEMENT SECURISE + SUIVI INCLUS',
  SHIPPING_DELAY_LABEL.toUpperCase(),
]

export function Ticker() {
  const pathname = usePathname()
  const isSelectionLanding = pathname === '/selection-maillots' || pathname === '/coupe-du-monde'

  if (isSelectionLanding) {
    return (
      <div className="w-full bg-[var(--terra)] px-4 py-2 text-center" role="region" aria-label="Offre du moment">
        <span className="font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white">
          Livraison incluse
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
