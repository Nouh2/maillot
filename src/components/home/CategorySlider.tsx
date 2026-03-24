'use client'
// src/components/home/CategorySlider.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CATEGORIES = [
  { label: 'Tous', href: '/shop' },
  { label: 'Ligue 1', href: '/ligue/ligue-1' },
  { label: 'Premier League', href: '/ligue/premier-league' },
  { label: 'La Liga', href: '/ligue/la-liga' },
  { label: 'Bundesliga', href: '/ligue/bundesliga' },
  { label: 'Serie A', href: '/ligue/serie-a' },
  { label: 'Champions League', href: '/ligue/champions-league' },
  { label: 'Équipes Nationales', href: '/ligue/equipes-nationales' },
  { label: 'Rétro', href: '/retro' },
]

export function CategorySlider() {
  const pathname = usePathname()

  return (
    <div className="bg-[var(--cream)] border-b border-[var(--black)]/5">
      <div
        className="flex gap-2 overflow-x-auto px-4 py-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = pathname === cat.href
          return (
            <Link
              key={cat.label}
              href={cat.href}
              className={`flex-shrink-0 px-4 py-2 font-condensed text-[11px] uppercase tracking-[0.1em] border transition-colors duration-200 ${
                isActive
                  ? 'bg-[var(--black)] text-white border-[var(--black)]'
                  : 'bg-transparent text-[var(--black)] border-[var(--black)] hover:bg-[var(--black)] hover:text-white'
              }`}
              style={{ borderRadius: '2px' }}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
