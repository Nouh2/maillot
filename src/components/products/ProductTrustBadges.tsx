'use client'

import { Package, Truck, CircleDollarSign } from 'lucide-react'

export function ProductTrustBadges() {
  const badges = [
    {
      icon: <Package className="w-5 h-5" />,
      text: "Plus de",
      subtext: "1200 Clients"
    },
    {
      icon: <CircleDollarSign className="w-5 h-5" />,
      text: "Satisfait ou",
      subtext: "Remboursé"
    },
    {
      icon: <Truck className="w-5 h-5" />,
      text: "Livraison",
      subtext: "rapide + suivi"
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {badges.map((badge, i) => (
        <div 
          key={i} 
          className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-[#E5E5E5] rounded-xl text-center aspect-square sm:aspect-auto sm:h-28 transition-colors hover:border-[var(--black)]"
        >
          <div className="mb-2 sm:mb-3 text-[var(--black)]">
            {badge.icon}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bebas text-[14px] sm:text-[15px] text-[var(--black)] uppercase tracking-wide">
              {badge.text}
            </span>
            <span className="font-bebas text-[14px] sm:text-[15px] text-[var(--black)] uppercase tracking-wide">
              {badge.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
