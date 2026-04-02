'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { League } from '@/types/product'

const SPECIAL_CATS_START = [{ slug: 'cdm-2026', label: 'CDM 2026', href: '/coupe-du-monde', image: '/images/coupe_logo.jpg' }]
const SPECIAL_CATS_END: { slug: string; label: string; href: string; image: string | null }[] = []

const LEAGUE_IMAGES: Record<string, string> = {
  bundesliga: '/images/bundes.jpg',
  'serie-a': '/images/seria.jpg',
  'ligue-1': '/images/ligue1.jpg',
  'premier-league': '/images/premiere.jpg',
  'la-liga': '/images/liga.jpg',
  'liga-portugal': '/globe.svg',
  'reste-du-monde': '/images/reste_du_monde.jpg',
}

const LEAGUE_IMAGE_WIDTHS: Record<string, string> = {
  'cdm-2026': '60%',
  bundesliga: '80%',
  'serie-a': '80%',
  'ligue-1': '70%',
  'la-liga': '80%',
  'premier-league': '70%',
}

export function EmojiCategoryBar({ leagues }: { leagues: League[] }) {
  const leagueCategories = leagues
    .filter((league) => !league.slug.includes('champions-league') && league.slug !== 'liga-portugal')
    .slice(0, 6)
    .map((league) => ({
      slug: league.slug,
      label: league.name,
      href: `/ligue/${league.slug}`,
      image: LEAGUE_IMAGES[league.slug] ?? null,
    }))

  const allCategories = [...SPECIAL_CATS_START, ...leagueCategories, ...SPECIAL_CATS_END]

  return (
    <div className="border-b border-[#E5E5E5] bg-white" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
      <div className="flex gap-8 px-6 py-3" style={{ width: 'max-content' }}>
        {allCategories.map((category) => (
          <Link key={category.href + category.label} href={category.href} className="flex items-center gap-2.5 transition-opacity hover:opacity-70">
            {category.image ? (
              <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-[var(--cream-3)] flex items-center justify-center">
                <Image
                  src={category.image}
                  alt={category.label}
                  width={22}
                  height={22}
                  className="object-contain"
                  style={{ width: LEAGUE_IMAGE_WIDTHS[category.slug] ?? '100%' }}
                />
              </div>
            ) : null}
            <span className="whitespace-nowrap text-[15px] font-bold text-[var(--black)]">{category.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
