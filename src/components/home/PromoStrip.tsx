'use client'
// src/components/home/PromoStrip.tsx
import { useState, useEffect, ReactNode } from 'react'
import { Star } from 'lucide-react'

function TrustPilotBadge() {
  const StarIcon = () => (
    <svg viewBox="0 0 20 20" className="h-[11px] w-[11px] sm:h-[13px] sm:w-[13px] fill-white">
      <path d="M10 0l3.09 6.26L20 7.27l-5 4.87 1.18 6.86L10 15.77 3.82 19 5 12.14 0 7.27l6.91-1.01L10 0z" />
    </svg>
  );

  return (
    <div className="flex flex-row items-center justify-center gap-2 leading-tight">
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-[18px] w-[18px] sm:h-5 sm:w-5 items-center justify-center bg-[#00b67a]">
            {StarIcon()}
          </div>
        ))}
        {/* Half star */}
        <div className="relative flex h-[18px] w-[18px] sm:h-5 sm:w-5 items-center justify-center overflow-hidden bg-[#DCDCE6]">
          <div className="absolute bottom-0 left-0 top-0 w-1/2 bg-[#00b67a]" />
          <div className="relative z-10 flex items-center justify-center">
            {StarIcon()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-[12px] sm:text-[14px] font-bold text-white tracking-wide">
          Excellent 4.5
        </span>
        <span className="text-white/60 text-[10px] sm:text-[12px]">|</span>
        <span className="text-[11px] sm:text-[13px] font-medium text-white tracking-wide">
          +1 000 clients satisfaits
        </span>
      </div>
    </div>
  )
}

const MESSAGES: ReactNode[] = [
  <span key="1" className="font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white block py-2">
    LIVRAISON OFFERTE DÈS 60€ · EXPÉDITION 24/48H
  </span>,
  <TrustPilotBadge key="2" />,
  <span key="3" className="font-condensed text-[13px] font-bold uppercase tracking-[0.05em] text-white block py-2">
    390+ MAILLOTS · TOUS LES GRANDS CLUBS
  </span>,
]

export function PromoStrip() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[var(--black)] px-4 min-h-[44px] flex items-center justify-center overflow-hidden">
      <div
        className="w-full flex justify-center items-center transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {MESSAGES[index]}
      </div>
    </div>
  )
}
