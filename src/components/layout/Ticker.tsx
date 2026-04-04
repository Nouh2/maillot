import { LAUNCH_PROMO_ENABLED, SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const TICKER_ITEMS = [
  ...(LAUNCH_PROMO_ENABLED ? ['OFFRE DE LANCEMENT - PRIX PROMO 7 JOURS'] : ['CATALOGUE PREMIUM CLUBS + SELECTIONS']),
  SHIPPING_DELAY_LABEL.toUpperCase(),
  'FLOCAGE DISPONIBLE +5 EUR',
  'PAIEMENT SECURISE',
  'SUIVI PAR LIEN UNIQUE',
  'COMPTE CLIENT OPTIONNEL',
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
