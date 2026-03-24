'use client'
// src/components/home/EmojiCategoryBar.tsx
import Link from 'next/link'

const CATEGORIES = [
  { icon: '🏆', label: 'CDM 2026', href: '/coupe-du-monde' },
  { icon: '✨', label: 'Nouveautés', href: '/shop' },
  { icon: '⏳', label: 'Rétro', href: '/retro' },
  { icon: '🇫🇷', label: 'Ligue 1', href: '/ligue/ligue-1' },
  { icon: '🇪🇸', label: 'La Liga', href: '/ligue/la-liga' },
  { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', label: 'Premier League', href: '/ligue/premier-league' },
  { icon: '🇮🇹', label: 'Serie A', href: '/ligue/serie-a' },
  { icon: '🇩🇪', label: 'Bundesliga', href: '/ligue/bundesliga' },
]

export function EmojiCategoryBar() {
  return (
    <div
      className="bg-[var(--cream)] border-b border-[var(--black)]/5"
      style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
    >
      <div className="flex gap-1 px-4 py-2.5" style={{ width: 'max-content' }}>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="flex flex-col items-center gap-1 px-3 py-1.5 hover:bg-[var(--cream-2)] rounded transition-colors"
            style={{ minWidth: 56 }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.icon}</span>
            <span
              className="text-[var(--black)] font-condensed uppercase whitespace-nowrap"
              style={{ fontSize: 10, letterSpacing: '0.06em' }}
            >
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
