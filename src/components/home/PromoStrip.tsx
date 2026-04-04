'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { LAUNCH_PROMO_ENABLED, SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const MESSAGES: ReactNode[] = [
  ...(LAUNCH_PROMO_ENABLED
    ? [
        <span key="launch" className="block py-2 font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white">
          OFFRE DE LANCEMENT - PRIX PROMO PENDANT 7 JOURS
        </span>,
      ]
    : [
        <span key="catalog" className="block py-2 font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white">
          CATALOGUE PREMIUM - MAILLOTS CLUBS ET SELECTIONS
        </span>,
      ]),
  <span key="shipping" className="block py-2 font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white">
    {SHIPPING_DELAY_LABEL.toUpperCase()} - SUIVI PAR LIEN UNIQUE
  </span>,
  <span key="support" className="block py-2 font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white">
    PAIEMENT CARTE VIA STRIPE - SUPPORT CLIENT PAR EMAIL ET TELEGRAM
  </span>,
]

export function PromoStrip() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((current) => (current + 1) % MESSAGES.length)
        setVisible(true)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-[44px] items-center justify-center overflow-hidden bg-[var(--black)] px-4">
      <div className="flex w-full items-center justify-center transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
        {MESSAGES[index]}
      </div>
    </div>
  )
}
