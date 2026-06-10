'use client'

import { BadgeCheck, Truck, Type } from 'lucide-react'

export function ProductTrustBadges() {
  const badges = [
    {
      icon: <Truck className="h-4 w-4 sm:h-5 sm:w-5" />,
      text: 'Livraison',
      subtext: 'offerte',
    },
    {
      icon: <Type className="h-4 w-4 sm:h-5 sm:w-5" />,
      text: 'Flocage',
      subtext: 'nom + numéro',
    },
    {
      icon: <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
      text: 'Patchs',
      subtext: 'maillot',
    },
  ]

  return (
    <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-2">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex min-h-[78px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-[#E5E5E5] bg-white px-1.5 py-2 text-center transition-colors hover:border-[var(--black)] sm:min-h-[92px] sm:px-3 sm:py-3"
        >
          <div className="mb-1 shrink-0 text-[var(--black)] sm:mb-2">{badge.icon}</div>
          <div className="flex max-w-full min-w-0 flex-col leading-[0.95]">
            <span className="max-w-full whitespace-normal break-words font-bebas text-[12px] uppercase tracking-normal text-[var(--black)] sm:text-[15px] sm:tracking-wide">
              {badge.text}
            </span>
            <span className="max-w-full whitespace-normal break-words font-bebas text-[12px] uppercase tracking-normal text-[var(--black)] sm:text-[15px] sm:tracking-wide">
              {badge.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
