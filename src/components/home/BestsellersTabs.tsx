'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductMetaLine } from '@/lib/productLabels'
import type { League, Product } from '@/types/product'

interface LeagueProductGroup {
  leagueName: string
  products: Product[]
}

export function BestsellersTabs({
  leagueProductGroups,
  leagues,
  topProducts = [],
}: {
  leagueProductGroups: LeagueProductGroup[]
  leagues: League[]
  topProducts?: (Product | null)[]
}) {
  const topLeagues = leagues.slice(0, 4)
  const tabs = ['Tous', ...topLeagues.map((league) => league.name)]
  const [activeTab, setActiveTab] = useState('Tous')

  const filtered =
    activeTab === 'Tous'
      ? (topProducts.filter(Boolean) as Product[])
      : leagueProductGroups.find((group) => group.leagueName === activeTab)?.products ?? []

  const featured = filtered[0]
  const rest = filtered.slice(1)
  const activeLeague = leagues.find((league) => league.name === activeTab)
  const collectionHref = activeTab === 'Tous' ? '/shop' : `/ligue/${activeLeague?.slug ?? ''}`

  return (
    <section className="bg-[var(--cream)] px-4 pt-8 pb-4 md:px-6 md:pt-12 md:pb-8">
      <div className="mx-auto max-w-7xl">
      <h2 className="font-condensed text-[26px] md:text-4xl font-normal leading-tight text-[var(--black)]">
        Le top du{' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationColor: 'var(--terra)',
            textDecorationThickness: 3,
            textUnderlineOffset: 5,
          }}
        >
          moment
        </span>
      </h2>
      <p className="mt-1 font-condensed text-[13px] text-[var(--grey)]">Une selection courte des bestsellers qui partent le plus.</p>

      <div className="mt-4 flex gap-5 border-b border-[var(--cream-3)]" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-2 font-condensed text-[12px] uppercase tracking-wide transition-all ${
              activeTab === tab ? 'border-[var(--black)] font-bold text-[var(--black)]' : 'border-transparent text-[var(--grey-lt)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {featured ? (
        <>
          {/* Mobile : featured card + 2 petites */}
          <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <Link href={collectionHref} className="relative row-span-2 block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2, minHeight: 200 }}>
              {activeTab === 'Tous' ? (
                <Image src="/images/france-kit.jpg" alt="Les plus demandes" fill className="object-cover object-top" sizes="45vw" />
              ) : featured.photos[0] ? (
                <ExternalProductImage src={featured.photos[0]} alt={featured.name} fill unoptimized fallbackMode="proxy" bunnyTransform="grid" className="object-cover" sizes="45vw" />
              ) : null}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.88) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="mb-1 font-condensed text-[10px] uppercase tracking-widest text-white/60">Selection</p>
                <p className="font-condensed text-[15px] font-bold uppercase leading-tight text-white">Les Plus<br />Demandes</p>
                <p className="mt-2 font-condensed text-[11px] font-semibold uppercase tracking-wide text-[var(--terra)]">Voir tout →</p>
              </div>
            </Link>
            {rest.slice(0, 2).map((product) => {
              const pricing = getProductPricing({ isRetro: product.is_retro })
              return (
                <Link key={product.id} href={`/shop/${product.slug}`} className="relative block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2 }}>
                  <div className="relative" style={{ aspectRatio: '3/4' }}>
                    {product.photos[0] ? <ExternalProductImage src={product.photos[0]} alt={product.name} fill unoptimized fallbackMode="proxy" bunnyTransform="card" className="object-cover" sizes="45vw" /> : null}
                    <div className="absolute bottom-2 right-2 flex items-center justify-center bg-[var(--black)] text-white shadow-md" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="truncate font-condensed text-[11px] text-[var(--black)]">{getProductMetaLine(product)}</p>
                    <PriceDisplay currentPrice={formatEuro(pricing.currentPrice)} originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined} promoLabel={pricing.promoActive ? 'Promo' : undefined} size="sm" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Desktop : grille 4 colonnes */}
          <div className="mt-3 hidden md:grid md:grid-cols-4 lg:grid-cols-4 gap-4">
            <Link href={collectionHref} className="relative block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2 }}>
              {activeTab === 'Tous' ? (
                <Image src="/images/france-kit.jpg" alt="Les plus demandes" fill className="object-cover object-top" sizes="25vw" />
              ) : featured.photos[0] ? (
                <ExternalProductImage src={featured.photos[0]} alt={featured.name} fill unoptimized fallbackMode="proxy" bunnyTransform="grid" className="object-cover" sizes="25vw" />
              ) : null}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.88) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="mb-1 font-condensed text-[10px] uppercase tracking-widest text-white/60">Selection</p>
                <p className="font-condensed text-base font-bold uppercase leading-tight text-white">Les Plus<br />Demandes</p>
                <p className="mt-2 font-condensed text-[11px] font-semibold uppercase tracking-wide text-[var(--terra)]">Voir tout →</p>
              </div>
              <div className="absolute inset-0" style={{ aspectRatio: '3/4' }} />
            </Link>
            {rest.slice(0, 3).map((product) => {
              const pricing = getProductPricing({ isRetro: product.is_retro })
              return (
                <Link key={product.id} href={`/shop/${product.slug}`} className="relative block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2 }}>
                  <div className="relative" style={{ aspectRatio: '3/4' }}>
                    {product.photos[0] ? <ExternalProductImage src={product.photos[0]} alt={product.name} fill unoptimized fallbackMode="proxy" bunnyTransform="card" className="object-cover" sizes="25vw" /> : null}
                    <div className="absolute bottom-2 right-2 flex items-center justify-center bg-[var(--black)] text-white shadow-md" style={{ width: 32, height: 32, borderRadius: '50%' }}>
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <p className="truncate font-condensed text-[12px] text-[var(--black)]">{product.club}</p>
                    <p className="truncate font-condensed text-[11px] text-[var(--grey)]">{getProductMetaLine(product)}</p>
                    <PriceDisplay currentPrice={formatEuro(pricing.currentPrice)} originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined} promoLabel={pricing.promoActive ? 'Promo' : undefined} size="sm" />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      ) : (
        <p className="mt-6 py-8 text-center font-condensed text-sm text-[var(--grey)]">Aucun maillot dans cette categorie</p>
      )}

      <Link
        href={collectionHref}
        className="mt-4 block w-full border border-[var(--black)] py-3 text-center font-condensed text-[12px] uppercase tracking-[0.15em] text-[var(--black)] transition-colors hover:bg-[var(--black)] hover:text-white"
        style={{ borderRadius: 2 }}
      >
        Voir tous les maillots {activeTab !== 'Tous' ? activeTab : ''}
      </Link>
      </div>
    </section>
  )
}
