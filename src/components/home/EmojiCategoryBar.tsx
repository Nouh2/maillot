'use client'
// src/components/home/EmojiCategoryBar.tsx
import Link from 'next/link'
import type { League } from '@/types/product'

// Catégories spéciales fixes
const SPECIAL_CATS_START = [
  { slug: 'cdm-2026', label: 'CDM 2026', href: '/coupe-du-monde', image: '/images/coupe_logo.jpg' },
]
const SPECIAL_CATS_END = [
  { slug: 'retro', label: 'Rétro', href: '/retro', image: null },
]

// Mapping slug ligue → image logo
const LEAGUE_IMAGES: Record<string, string> = {
  'bundesliga':     '/images/bundes.jpg',
  'serie-a':        '/images/seria.jpg',
  'ligue-1':        '/images/ligue1.jpg',
  'premier-league': '/images/premiere.jpg',
  'la-liga':        '/images/liga.jpg',
  'reste-du-monde': '/images/reste_du_monde.jpg',
}

export function EmojiCategoryBar({ leagues }: { leagues: League[] }) {
  // On prend les 6 premières ligues en excluant "Champions League"
  const leagueCats = leagues
    .filter(l => !l.slug.includes('champions-league'))
    .slice(0, 6)
    .map((l) => ({
      slug: l.slug,
      label: l.name,
      href: `/ligue/${l.slug}`,
      image: LEAGUE_IMAGES[l.slug] ?? null,
    }))

  const all = [...SPECIAL_CATS_START, ...leagueCats, ...SPECIAL_CATS_END]

  return (
    <div
      className="bg-white border-b border-[#E5E5E5]"
      style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
    >
      <div className="flex gap-8 px-6 py-3" style={{ width: 'max-content' }}>
        {all.map((cat) => (
          <Link
            key={cat.href + cat.label}
            href={cat.href}
            className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            {cat.image && (
              <div className="w-6 h-6 relative flex-shrink-0">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <span className="text-[15px] font-bold text-[var(--black)] whitespace-nowrap">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
