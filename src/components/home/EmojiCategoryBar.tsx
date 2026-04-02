'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { League } from '@/types/product'

const SPECIAL_CATS_START = [{ slug: 'cdm-2026', label: 'CDM 2026', href: '/coupe-du-monde', image: '/images/coupe_logo.jpg' }]
const SPECIAL_CATS_END = [{ slug: 'retro', label: 'Retro', href: '/retro', image: null }]

const LEAGUE_IMAGES: Record<string, string> = {
  bundesliga: '/images/bundes.jpg',
  'serie-a': '/images/seria.jpg',
  'ligue-1': '/images/ligue1.jpg',
  'premier-league': '/images/premiere.jpg',
  'la-liga': '/images/liga.jpg',
  'liga-portugal': '/globe.svg',
  'reste-du-monde': '/images/reste_du_monde.jpg',
}

const LEAGUE_IMAGE_SCALE: Record<string, string> = {
  bundesliga: 'scale-[1.08]',
  'serie-a': 'scale-[1.06]',
  'ligue-1': 'scale-[1.28]',
  'premier-league': 'scale-[1.18]',
  'la-liga': 'scale-[1.06]',
  'liga-portugal': 'scale-[0.92]',
  'reste-du-monde': 'scale-[1.12]',
  'cdm-2026': 'scale-[1.18]',
}

export function EmojiCategoryBar({ leagues }: { leagues: League[] }) {
  const leagueCategories = leagues
    .filter((league) => !league.slug.includes('champions-league'))
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
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--cream-3)] bg-[var(--cream)]">
                <div className={`relative h-5 w-5 ${LEAGUE_IMAGE_SCALE[category.slug] ?? 'scale-100'}`}>
                  <Image src={category.image} alt={category.label} fill sizes="20px" className="object-contain" />
                </div>
              </div>
            ) : null}
            <span className="whitespace-nowrap text-[15px] font-bold text-[var(--black)]">{category.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
