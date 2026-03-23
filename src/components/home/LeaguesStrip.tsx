// src/components/home/LeaguesStrip.tsx
import Link from 'next/link'
import type { League } from '@/types/product'

export function LeaguesStrip({ leagues }: { leagues: League[] }) {
  return (
    <section className="bg-[var(--cream-2)] py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="font-condensed text-xs tracking-[4px] uppercase text-[var(--grey)] mb-6 text-center">Championnats disponibles</p>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {leagues.map((league) => (
            <Link
              key={league.id}
              href={`/ligue/${league.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm group-hover:shadow-md group-hover:border-[var(--terra)] border-2 border-transparent transition-all">
                {league.flag_emoji}
              </div>
              <span className="font-condensed text-xs tracking-wider uppercase text-[var(--grey)] group-hover:text-[var(--terra)] transition-colors whitespace-nowrap">
                {league.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
