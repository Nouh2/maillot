'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductMetaLine } from '@/lib/productLabels'
import type { HomepageFastMoverGroup } from '@/types/homepageCuration'

export function CollectionsTabs({ groups }: { groups: HomepageFastMoverGroup[] }) {
  const [activeCountry, setActiveCountry] = useState(groups[0]?.key ?? '')
  const activeGroup = groups.find((group) => group.key === activeCountry) ?? groups[0]
  const display = activeGroup?.products ?? []

  return (
    <section className="bg-[var(--cream)] px-4 pt-6 pb-8 md:px-6 md:pt-10 md:pb-12">
      <div className="mx-auto max-w-7xl">
      <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[var(--terra-lt)] px-3 py-1">
        <span className="font-condensed text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--terra)]">
          ⚽ Coupe du Monde 2026
        </span>
      </div>
      <h2 className="font-condensed text-[26px] md:text-4xl font-bold leading-tight text-[var(--black)]">
        Les maillots qui{' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationColor: 'var(--terra)',
            textDecorationThickness: 3,
            textUnderlineOffset: 5,
          }}
        >
          partent vite.
        </span>
      </h2>
      <p className="mt-1 font-condensed text-[13px] text-[var(--grey)]">
        Sélection pays par pays — les plus demandés en stock limité.
      </p>

      <div className="mt-3 flex gap-4 border-b border-[var(--cream-3)]" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        {groups.map((group) => (
          <button
            key={group.key}
            onClick={() => setActiveCountry(group.key)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-2 font-condensed text-[11px] uppercase tracking-wide transition-all ${
              activeCountry === group.key ? 'border-[var(--black)] font-bold text-[var(--black)]' : 'border-transparent text-[var(--grey-lt)]'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {display.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {display.map((product) => {
            const pricing = getProductPricing({
              isRetro: product.is_retro,
              isConcept: product.is_concept,
              productKind: product.product_kind,
              jerseyVersion: product.jersey_version,
            })

            return (
              <Link key={product.id} href={`/shop/${product.slug}`} className="block overflow-hidden" style={{ borderRadius: 2 }}>
                <div className="relative bg-[var(--cream-2)]">
                  <div className="relative" style={{ aspectRatio: '3/4' }}>
                    {product.photos[0] ? (
                      <ExternalProductImage src={product.photos[0]} alt={product.name} fill unoptimized fallbackMode="proxy" bunnyTransform="card" className="object-cover" sizes="(min-width: 768px) 33vw, 45vw" />
                    ) : null}
                    <div
                      className="absolute bottom-2 right-2 flex items-center justify-center bg-[var(--black)] text-white shadow-md"
                      style={{ width: 32, height: 32, borderRadius: '50%' }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 pb-3">
                  <p className="truncate font-condensed text-[12px] leading-snug text-[var(--black)]">{getProductMetaLine(product)}</p>
                  <PriceDisplay
                    currentPrice={formatEuro(pricing.currentPrice)}
                    originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined}
                    promoLabel={pricing.promoActive ? 'Promo' : undefined}
                    size="sm"
                    className="mt-1"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="py-8 text-center font-condensed text-sm text-[var(--grey)]">Collection bientot disponible</p>
      )}

      {activeGroup ? (
        <Link
          href={activeGroup.href}
          className="mt-4 block w-full border border-[var(--black)] py-3 text-center font-condensed text-[12px] uppercase tracking-[0.15em] text-[var(--black)] transition-colors hover:bg-[var(--black)] hover:text-white"
          style={{ borderRadius: 2 }}
        >
          Voir tous les maillots {activeGroup.label}
        </Link>
      ) : null}
      </div>
    </section>
  )
}
