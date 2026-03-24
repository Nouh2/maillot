'use client'
// src/components/home/EmojiCategoryBar.tsx
import Link from 'next/link'
import type { League } from '@/types/product'

// Catégories spéciales fixes
const SPECIAL_CATS = [
  { icon: '🏆', label: 'CDM 2026', href: '/coupe-du-monde' },
  { icon: '✨', label: 'Nouveautés', href: '/shop' },
  { icon: '⏳', label: 'Rétro', href: '/retro' },
]

export function EmojiCategoryBar({ leagues }: { leagues: League[] }) {
  // On prend les 6 premières ligues avec leur emoji de drapeau
  const leagueCats = leagues.slice(0, 6).map((l) => ({
    icon: l.flag_emoji,
    label: l.name,
    href: `/ligue/${l.slug}`,
  }))

  const all = [...SPECIAL_CATS, ...leagueCats]

  return (
    <div
      className="bg-[var(--cream)] border-b border-[var(--black)]/5"
      style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
    >
      <div className="flex gap-1 px-4 py-2.5" style={{ width: 'max-content' }}>
        {all.map((cat) => (
          <Link
            key={cat.href + cat.label}
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
