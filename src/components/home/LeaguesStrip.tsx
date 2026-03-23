// src/components/home/LeaguesStrip.tsx
import Link from 'next/link'
import { Trophy, ArrowUpRight } from 'lucide-react'
import type { League } from '@/types/product'

export function LeaguesStrip({ leagues }: { leagues: League[] }) {
  return (
    <section className="bg-[var(--cream)] py-10 border-b border-[var(--black)]/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <h2 className="font-bebas text-5xl md:text-6xl text-[var(--black)] leading-none text-left">CHAMPIONNATS<br/><span className="text-[var(--grey)]">MAJEURS</span></h2>
        </div>
        <Link href="/shop" className="inline-flex items-center gap-2 font-condensed text-sm tracking-widest uppercase font-bold text-[var(--black)] hover:text-[var(--terra)] transition-colors pb-2">
          Voir tout <ArrowUpRight className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/ligue/${league.slug}`}
              className="flex-shrink-0 w-56 h-36 bg-[var(--white)] border border-[var(--black)]/10 p-5 flex flex-col justify-between group hover:border-[var(--black)] hover:shadow-xl transition-all duration-300 snap-start relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500">
                <Trophy className="w-28 h-28" />
              </div>
              <div className="flex justify-between items-start z-10">
                <div className="w-10 h-10 bg-[var(--black)] text-white flex items-center justify-center group-hover:bg-[var(--terra)] transition-colors duration-300">
                  <Trophy className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-[var(--grey-lt)] group-hover:text-[var(--black)] transition-colors duration-300" />
              </div>
              <span className="font-bebas text-2xl tracking-wide text-[var(--black)] relative z-10 group-hover:text-[var(--terra)] transition-colors duration-300">
                {league.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
