'use client'
// src/components/home/EmojiCategoryBar.tsx
import Link from 'next/link'
import type { League } from '@/types/product'

// Catégories spéciales fixes avec fallback slugs pour les images
const SPECIAL_CATS = [
  { slug: 'cdm-2026', label: 'CDM 2026', href: '/coupe-du-monde' },
  { slug: 'retro', label: 'Rétro', href: '/retro' },
]

export function EmojiCategoryBar({ leagues }: { leagues: League[] }) {
  // On prend les 6 premières ligues en excluant "Champions League"
  const leagueCats = leagues
    .filter(l => !l.slug.includes('champions-league'))
    .slice(0, 6)
    .map((l) => ({
      slug: l.slug,
      label: l.name,
      href: `/ligue/${l.slug}`,
    }))

  const all = [...SPECIAL_CATS, ...leagueCats]

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
            <div className="w-8 h-8 relative flex-shrink-0 flex items-center justify-center">
              <img 
                src={`/logos/${cat.slug}.png`}
                alt={cat.label}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback: masque l'icône si elle n'est pas encore uploadée dans public/logos
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="text-[15px] font-bold text-[var(--black)] whitespace-nowrap">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
