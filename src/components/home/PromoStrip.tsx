'use client'

import { useEffect, useState, type ReactNode } from 'react'

function TrustPilotBadge() {
  const StarIcon = () => (
    <svg viewBox="0 0 20 20" className="h-[11px] w-[11px] fill-white sm:h-[13px] sm:w-[13px]">
      <path d="M10 0l3.09 6.26L20 7.27l-5 4.87 1.18 6.86L10 15.77 3.82 19 5 12.14 0 7.27l6.91-1.01L10 0z" />
    </svg>
  )

  return (
    <div className="flex flex-row items-center justify-center gap-2 leading-tight">
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4].map((value) => (
          <div key={value} className="flex h-[18px] w-[18px] items-center justify-center bg-[#00b67a] sm:h-5 sm:w-5">
            {StarIcon()}
          </div>
        ))}
        <div className="relative flex h-[18px] w-[18px] items-center justify-center overflow-hidden bg-[#DCDCE6] sm:h-5 sm:w-5">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[#00b67a]" />
          <div className="relative z-10 flex items-center justify-center">{StarIcon()}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-[12px] font-bold tracking-wide text-white sm:text-[14px]">Excellent 4.5</span>
        <span className="text-[10px] text-white/60 sm:text-[12px]">|</span>
        <span className="text-[11px] font-medium tracking-wide text-white sm:text-[13px]">
          +1 200 clients satisfaits
        </span>
      </div>
    </div>
  )
}

const MESSAGES: ReactNode[] = [
  <span key="shipping" className="block py-2 font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white">
    LIVRAISON OFFERTE DES 60EUR - EXPEDITION 24/48H
  </span>,
  <TrustPilotBadge key="reviews" />,
  <span key="catalog" className="block py-2 font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white">
    CATALOGUE PREMIUM - TOUS LES GRANDS CLUBS
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
