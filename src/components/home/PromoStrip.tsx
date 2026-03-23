// src/components/home/PromoStrip.tsx
import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'

export function PromoStrip() {
  return (
    <div className="bg-[var(--terra)] py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center">
        <div className="flex items-center gap-2 text-white">
          <Flame className="w-4 h-4 shrink-0" />
          <span className="font-condensed text-sm font-bold uppercase tracking-[0.15em]">
            Livraison offerte dès 60&nbsp;€ · Flocage disponible · Tous les grands clubs
          </span>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1 font-condensed text-sm uppercase tracking-widest text-white/80 underline-offset-4 hover:text-white hover:underline transition-colors whitespace-nowrap"
        >
          En profiter <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
