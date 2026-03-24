'use client'
// src/components/home/CategorySlider.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { League } from '@/types/product'

export function CategorySlider({ leagues }: { leagues: League[] }) {
  const pathname = usePathname()

  const items = [
    { label: 'Tous', href: '/shop' },
    ...leagues.map((l) => ({ label: l.name, href: `/ligue/${l.slug}` })),
    { label: 'Rétro', href: '/retro' },
  ]

  return (
    <div className="bg-[var(--cream)] border-b border-[var(--black)]/5">
      <div
        className="flex gap-2 overflow-x-auto px-4 py-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((cat) => {
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
