import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const TICKER_ITEMS = [
  'OFFRE COUPE DU MONDE - 4E MAILLOT OFFERT',
  'LIVRAISON OFFERTE DES 3 MAILLOTS',
  'MIX LIBRE: CLUBS + SELECTIONS + RETRO',
  'FLOCAGE + PATCHS POUR UN MAILLOT UNIQUE',
  'PAIEMENT SECURISE + SUIVI INCLUS',
  SHIPPING_DELAY_LABEL.toUpperCase(),
]

export function Ticker() {
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
