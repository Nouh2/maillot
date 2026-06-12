'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductMetaLine } from '@/lib/productLabels'
import type { HomepageBestsellerTab } from '@/types/homepageCuration'

import { TrustBadge } from '@/components/ui/TrustBadge'

const FEATURED_TAB_IMAGES: Record<string, string> = {
  all: '/images/tous.jpg',
  'ligue-1': '/images/ligue1tous.jpg',
  'premier-league': '/images/pltous.jpg',
  'la-liga': '/images/ligatous.jpg',
  bundesliga: '/images/bundesligatous.jpg',
}

export function BestsellersTabs({
  tabs,
}: {
  tabs: HomepageBestsellerTab[]
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? 'all')
  const activeGroup = tabs.find((tab) => tab.key === activeTab) ?? tabs[0]
  const rest = activeGroup?.cards ?? []
  const collectionHref = activeGroup?.href ?? '/shop'
  const featuredTabImage = activeGroup ? FEATURED_TAB_IMAGES[activeGroup.key] ?? FEATURED_TAB_IMAGES.all : FEATURED_TAB_IMAGES.all

  return (
    <section className="bg-[var(--cream)] px-4 pt-8 pb-4 md:px-6 md:pt-12 md:pb-8">
      <div className="mx-auto max-w-7xl">
      <div className="mb-4">
        <TrustBadge />
      </div>
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
      <p className="mt-1 font-condensed text-[13px] text-[var(--grey)]">Une sélection courte des bestsellers qui partent le plus.</p>

      <div className="mt-4 flex gap-5 border-b border-[var(--cream-3)]" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-2 font-condensed text-[12px] uppercase tracking-wide transition-all ${
              activeTab === tab.key ? 'border-[var(--black)] font-bold text-[var(--black)]' : 'border-transparent text-[var(--grey-lt)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeGroup ? (
        <>
          {/* Mobile : featured card + 2 petites */}
          <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
            <Link href={collectionHref} className="relative row-span-2 block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2, minHeight: 200 }}>
              <Image
                src={featuredTabImage}
                alt={`Les plus demandés ${activeGroup?.label ?? ''}`.trim()}
                fill
                priority
                className="object-cover object-center"
                sizes="45vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.88) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 left-0 p-3">
                <p className="mb-1 font-condensed text-[10px] uppercase tracking-widest text-white/60">Sélection</p>
                <p className="font-condensed text-[15px] font-bold uppercase leading-tight text-white">Les Plus<br />Demandes</p>
                <p className="mt-2 font-condensed text-[11px] font-semibold uppercase tracking-wide text-[var(--terra)]">Voir tout →</p>
              </div>
            </Link>
            {rest.slice(0, 2).map((product, index) => {
              const pricing = getProductPricing({
                isRetro: product.is_retro,
                isConcept: product.is_concept,
                productKind: product.product_kind,
                jerseyVersion: product.jersey_version,
                productSlug: product.slug,
              })
              return (
                <Link key={product.id} href={`/shop/${product.slug}`} className="relative block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2 }}>
                  <div className="relative" style={{ aspectRatio: '3/4' }}>
                    {product.photos[0] ? (
                      <ExternalProductImage
                        src={product.photos[0]}
                        alt={product.name}
                        fill
                        loading="eager"
                        fetchPriority={index < 2 ? 'high' : 'auto'}
                        fallbackMode="proxy"
                        bunnyTransform="card"
                        className="object-cover"
                        sizes="45vw"
                      />
                    ) : null}
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
              <Image
                src={featuredTabImage}
                alt={`Les plus demandés ${activeGroup?.label ?? ''}`.trim()}
                fill
                priority
                className="object-cover object-center"
                sizes="25vw"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.88) 0%, transparent 55%)' }} />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="mb-1 font-condensed text-[10px] uppercase tracking-widest text-white/60">Sélection</p>
                <p className="font-condensed text-base font-bold uppercase leading-tight text-white">Les Plus<br />Demandes</p>
                <p className="mt-2 font-condensed text-[11px] font-semibold uppercase tracking-wide text-[var(--terra)]">Voir tout →</p>
              </div>
              <div className="absolute inset-0" style={{ aspectRatio: '3/4' }} />
            </Link>
            {rest.slice(0, 3).map((product, index) => {
              const pricing = getProductPricing({
                isRetro: product.is_retro,
                isConcept: product.is_concept,
                productKind: product.product_kind,
                jerseyVersion: product.jersey_version,
                productSlug: product.slug,
              })
              return (
                <Link key={product.id} href={`/shop/${product.slug}`} className="relative block overflow-hidden bg-[var(--cream-2)]" style={{ borderRadius: 2 }}>
                  <div className="relative" style={{ aspectRatio: '3/4' }}>
                    {product.photos[0] ? (
                      <ExternalProductImage
                        src={product.photos[0]}
                        alt={product.name}
                        fill
                        loading="eager"
                        fetchPriority={index < 3 ? 'high' : 'auto'}
                        fallbackMode="proxy"
                        bunnyTransform="card"
                        className="object-cover"
                        sizes="25vw"
                      />
                    ) : null}
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
        <p className="mt-6 py-8 text-center font-condensed text-sm text-[var(--grey)]">Aucun maillot dans cette catégorie</p>
      )}

      <Link
        href={collectionHref}
        className="mt-4 block w-full border border-[var(--black)] py-3 text-center font-condensed text-[12px] uppercase tracking-[0.15em] text-[var(--black)] transition-colors hover:bg-[var(--black)] hover:text-white"
        style={{ borderRadius: 2 }}
      >
        Voir tous les maillots {activeGroup?.key !== 'all' ? activeGroup?.label : ''}
      </Link>
      </div>
    </section>
  )
}
