'use client'

import { CircleDollarSign, Package, Truck } from 'lucide-react'

export function ProductTrustBadges() {
  const badges = [
    {
      icon: <Package className="h-5 w-5" />,
      text: 'Reference',
      subtext: 'de commande',
    },
    {
      icon: <CircleDollarSign className="h-5 w-5" />,
      text: 'Paiement',
      subtext: 'securise',
    },
    {
      icon: <Truck className="h-5 w-5" />,
      text: 'Suivi',
      subtext: 'expedition',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex h-20 flex-col items-center justify-center rounded-xl border border-[#E5E5E5] bg-white p-2 text-center transition-colors hover:border-[var(--black)] sm:h-24 sm:p-3"
        >
          <div className="mb-1.5 text-[var(--black)] sm:mb-2">{badge.icon}</div>
          <div className="flex flex-col leading-tight">
            <span className="font-bebas text-[14px] uppercase tracking-wide text-[var(--black)] sm:text-[15px]">
              {badge.text}
            </span>
            <span className="font-bebas text-[14px] uppercase tracking-wide text-[var(--black)] sm:text-[15px]">
              {badge.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
