'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CartButton } from '@/components/cart/CartButton'

const LEAGUES = [
  { name: 'Ligue 1', slug: 'ligue-1', flag: '🇫🇷' },
  { name: 'Premier League', slug: 'premier-league', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga', slug: 'la-liga', flag: '🇪🇸' },
  { name: 'Bundesliga', slug: 'bundesliga', flag: '🇩🇪' },
  { name: 'Serie A', slug: 'serie-a', flag: '🇮🇹' },
  { name: 'Sélections', slug: 'selections', flag: '🌍' },
]

export function Navbar() {
  const [leaguesOpen, setLeaguesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--cream-3)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bebas text-3xl tracking-widest text-[var(--black)] hover:text-[var(--terra)] transition-colors">
          KITLAB
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="font-condensed text-sm tracking-widest uppercase text-[var(--black)] hover:text-[var(--terra)] transition-colors">
            Tous les Maillots
          </Link>
          <div className="relative" onMouseEnter={() => setLeaguesOpen(true)} onMouseLeave={() => setLeaguesOpen(false)}>
            <button className="font-condensed text-sm tracking-widest uppercase text-[var(--black)] hover:text-[var(--terra)] transition-colors flex items-center gap-1">
              Championnats
              <svg className={`w-3 h-3 transition-transform ${leaguesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {leaguesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[var(--cream-3)] shadow-lg py-2">
                {LEAGUES.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/ligue/${l.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 font-condensed text-sm tracking-wide uppercase hover:bg-[var(--cream)] hover:text-[var(--terra)] transition-colors"
                  >
                    <span>{l.flag}</span>
                    {l.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <CartButton />
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--cream-3)] px-4 py-4 space-y-4">
          <Link href="/shop" onClick={() => setMobileOpen(false)} className="block font-condensed tracking-widest uppercase text-sm">Tous les Maillots</Link>
          {LEAGUES.map((l) => (
            <Link key={l.slug} href={`/ligue/${l.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-condensed tracking-wide uppercase text-sm text-[var(--grey)]">
              <span>{l.flag}</span>{l.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
