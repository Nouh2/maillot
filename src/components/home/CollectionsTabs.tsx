'use client'
// src/components/home/CollectionsTabs.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { proxyImage } from '@/lib/images'
import { getProductMetaLine } from '@/lib/productLabels'
import type { Product, League } from '@/types/product'

interface LeagueProductGroup {
  leagueName: string
  products: Product[]
}

export function CollectionsTabs({
  leagueProductGroups,
  leagues,
}: {
  leagueProductGroups: LeagueProductGroup[]
  leagues: League[]
}) {
  // Tabs : les 4 premières ligues (les plus fournies)
  const topLeagues = leagues.slice(0, 4)
  const [activeTab, setActiveTab] = useState(topLeagues[0]?.name ?? '')

  const display = (leagueProductGroups.find((group) => group.leagueName === activeTab)?.products ?? []).slice(0, 6)

  const activeLeague = leagues.find((l) => l.name === activeTab)

  return (
    <section className="px-4 pt-6 pb-8 bg-[var(--cream)]">
      {/* Titre */}
      <h2 className="font-condensed text-[26px] font-normal text-[var(--black)] leading-tight">
        Nos Collections{' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationColor: 'var(--terra)',
            textDecorationThickness: 3,
            textUnderlineOffset: 5,
          }}
        >
          Phares
        </span>
      </h2>
      <p className="text-[13px] text-[var(--grey)] mt-1 font-condensed">
        Des collections pensées pour se démarquer.
      </p>

      {/* Tabs */}
      <div
        className="flex gap-4 mt-3 border-b border-[var(--cream-3)]"
        style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
      >
        {topLeagues.map((league) => (
          <button
            key={league.id}
            onClick={() => setActiveTab(league.name)}
            className={`font-condensed text-[11px] uppercase tracking-wide pb-2 whitespace-nowrap border-b-2 -mb-px transition-all ${
              activeTab === league.name
                ? 'text-[var(--black)] font-bold border-[var(--black)]'
                : 'text-[var(--grey-lt)] border-transparent'
            }`}
          >
            {league.flag_emoji && league.flag_emoji.length <= 4 ? `${league.flag_emoji} ` : ''}{league.name}
          </button>
        ))}
      </div>

      {/* Grille 2 colonnes */}
      {display.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {display.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="block overflow-hidden"
              style={{ borderRadius: 2 }}
            >
              <div className="bg-[var(--cream-2)] relative">
                <div className="relative" style={{ aspectRatio: '3/4' }}>
                  {product.photos[0] && (
                    <Image
                      src={proxyImage(product.photos[0])}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="45vw"
                    />
                  )}
                  <div
                    className="absolute bottom-2 right-2 flex items-center justify-center bg-[var(--black)] text-white shadow-md"
                    style={{ width: 32, height: 32, borderRadius: '50%' }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="pt-2 pb-3">
                <p className="font-condensed text-[12px] text-[var(--black)] leading-snug truncate">
                  {getProductMetaLine(product)}
                </p>
                <p className="font-condensed text-[13px] font-semibold text-[var(--black)] mt-0.5">
                  {product.price.toFixed(2)} €
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="font-condensed text-sm text-[var(--grey)] text-center py-8">
          Collection bientôt disponible
        </p>
      )}

      {/* Lien voir tout pour la ligue active */}
      {activeLeague && (
        <Link
          href={`/ligue/${activeLeague.slug}`}
          className="block w-full mt-4 py-3 text-center font-condensed text-[12px] uppercase tracking-[0.15em] text-[var(--black)] border border-[var(--black)] hover:bg-[var(--black)] hover:text-white transition-colors"
          style={{ borderRadius: 2 }}
        >
          Voir tous les maillots {activeLeague.name}
        </Link>
      )}
    </section>
  )
}
