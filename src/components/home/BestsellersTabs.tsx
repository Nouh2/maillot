'use client'
// src/components/home/BestsellersTabs.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { proxyImage } from '@/lib/images'
import { getProductMetaLine } from '@/lib/productLabels'
import type { Product } from '@/types/product'

const TABS = ['Tous', 'Ligue 1', 'Premier League', 'La Liga']

const LEAGUE_MAP: Record<string, string> = {
  'Ligue 1': 'Ligue 1',
  'Premier League': 'Premier League',
  'La Liga': 'La Liga',
}

export function BestsellersTabs({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState('Tous')

  const filtered = activeTab === 'Tous'
    ? products.slice(0, 8)
    : products.filter((p) => p.league === LEAGUE_MAP[activeTab]).slice(0, 6)

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <section className="px-4 pt-8 pb-4 bg-[var(--cream)]">
      {/* Titre */}
      <h2 className="font-condensed text-[26px] font-normal text-[var(--black)] leading-tight">
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
      <p className="text-[13px] text-[var(--grey)] mt-1 font-condensed">
        Une sélection courte des bestsellers qui partent le plus.
      </p>

      {/* Tabs */}
      <div className="flex gap-5 mt-4 overflow-x-auto border-b border-[var(--cream-3)]" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-condensed text-[12px] uppercase tracking-wide pb-2 whitespace-nowrap border-b-2 -mb-px transition-all ${
              activeTab === tab
                ? 'text-[var(--black)] font-bold border-[var(--black)]'
                : 'text-[var(--grey-lt)] border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grille mixte */}
      {featured ? (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Carte featured — hauteur 2 rangées */}
          <Link
            href={`/shop/${featured.slug}`}
            className="row-span-2 relative overflow-hidden bg-[var(--cream-2)]"
            style={{ borderRadius: 2, aspectRatio: 'auto' }}
          >
            {featured.photos[0] && (
              <Image
                src={proxyImage(featured.photos[0])}
                alt={featured.name}
                fill
                unoptimized
                className="object-cover"
                sizes="45vw"
              />
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.88) 0%, transparent 55%)' }}
            />
            <div className="absolute bottom-0 left-0 p-3">
              <p className="font-condensed text-[10px] uppercase tracking-widest text-white/60 mb-1">Sélection</p>
              <p className="font-condensed text-[15px] font-bold text-white uppercase leading-tight">
                Les Plus<br />Demandées
              </p>
              <p className="font-condensed text-[11px] text-[var(--terra)] mt-2 font-semibold uppercase tracking-wide">
                Voir tout →
              </p>
            </div>
          </Link>

          {/* 2 cartes normales */}
          {rest.slice(0, 2).map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="relative bg-[var(--cream-2)] overflow-hidden block"
              style={{ borderRadius: 2 }}
            >
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
                {/* Icône panier */}
                <div
                  className="absolute bottom-2 right-2 flex items-center justify-center bg-[var(--black)] text-white shadow-md"
                  style={{ width: 28, height: 28, borderRadius: '50%' }}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="px-2 py-1.5">
                <p className="font-condensed text-[11px] text-[var(--black)] truncate">{getProductMetaLine(product)}</p>
                <p className="font-condensed text-[13px] font-semibold text-[var(--black)]">{product.price.toFixed(2)} €</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="font-condensed text-sm text-[var(--grey)] mt-6 text-center py-8">
          Aucun produit dans cette catégorie
        </p>
      )}

      {/* Voir plus */}
      <Link
        href="/shop"
        className="block w-full mt-4 py-3 text-center font-condensed text-[12px] uppercase tracking-[0.15em] text-[var(--black)] border border-[var(--black)] hover:bg-[var(--black)] hover:text-white transition-colors"
        style={{ borderRadius: 2 }}
      >
        Voir tous les bestsellers
      </Link>
    </section>
  )
}
