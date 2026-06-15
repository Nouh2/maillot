'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductMetaLine } from '@/lib/productLabels'
import { getProductDisplayClub, getProductDisplayName } from '@/lib/productDisplay'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

type FilterKey = 'all' | 'africa' | 'europe' | 'south-america' | 'fan' | 'player' | 'home' | 'away'

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Tous' },
  { key: 'africa', label: 'Afrique' },
  { key: 'europe', label: 'Europe' },
  { key: 'south-america', label: 'Amérique du Sud' },
  { key: 'fan', label: 'Fan 25,90 €' },
  { key: 'player', label: 'Player 33,99 €' },
  { key: 'home', label: 'Domicile' },
  { key: 'away', label: 'Extérieur' },
]

const AFRICA_TERMS = [
  'afrique',
  'algerie',
  'algérie',
  'maroc',
  'senegal',
  'sénégal',
  'cameroun',
  'cote d ivoire',
  'côte d ivoire',
  'cote-divoire',
  'tunisie',
  'nigeria',
  'ghana',
  'egypte',
  'égypte',
]
const SOUTH_AMERICA_TERMS = [
  'amerique du sud',
  'amérique du sud',
  'argentine',
  'bresil',
  'brésil',
  'colombie',
  'uruguay',
  'chili',
  'perou',
  'pérou',
  'paraguay',
  'equateur',
  'équateur',
]
const EUROPE_TERMS = [
  'europe',
  'france',
  'espagne',
  'portugal',
  'italie',
  'allemagne',
  'angleterre',
  'belgique',
  'pays-bas',
  'croatie',
  'psg',
  'paris',
  'barcelone',
  'real madrid',
  'bayern',
  'arsenal',
  'chelsea',
  'liverpool',
  'manchester',
]

function productHaystack(product: Product) {
  return `${product.name} ${product.club} ${product.country} ${product.league} ${product.slug}`.toLowerCase()
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

function matchesFilter(product: Product, filter: FilterKey) {
  const haystack = productHaystack(product)

  if (filter === 'all') return true
  if (filter === 'africa') return includesAny(haystack, AFRICA_TERMS)
  if (filter === 'south-america') return includesAny(haystack, SOUTH_AMERICA_TERMS)
  if (filter === 'europe') return includesAny(haystack, EUROPE_TERMS) && !includesAny(haystack, AFRICA_TERMS) && !includesAny(haystack, SOUTH_AMERICA_TERMS)
  if (filter === 'fan') return product.jersey_version === 'fan'
  if (filter === 'player') return product.jersey_version === 'player'
  if (filter === 'home') return product.type === 'domicile'
  if (filter === 'away') return product.type === 'exterieur'

  return true
}

function ProductTile({ product, priority = false }: { product: Product; priority?: boolean }) {
  const sizeHref = `/shop/${product.slug}?taille=1`
  const displayName = getProductDisplayName(product)
  const displayClub = getProductDisplayClub(product)
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  return (
    <article className="h-full overflow-hidden rounded-lg border border-[var(--cream-3)] bg-white transition-transform active:scale-[0.99] md:hover:-translate-y-1">
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--cream)]">
          {product.photos[0] ? (
            <ExternalProductImage
              src={product.photos[0]}
              alt={displayName}
              fill
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              fallbackMode="proxy"
              bunnyTransform={priority ? 'hero' : 'card'}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <p className="font-condensed text-[11px] uppercase tracking-[0.16em] text-[var(--terra)]">{displayClub}</p>
        <h2 className="mt-1 line-clamp-2 min-h-[2.4em] text-sm font-bold leading-tight text-[var(--black)] sm:text-base">
          {displayName}
        </h2>
        <p className="mt-1 text-xs text-[var(--grey)]">{getProductMetaLine(product)}</p>
        <div className="mt-3">
          <PriceDisplay
            currentPrice={formatEuro(pricing.currentPrice)}
            originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined}
            promoLabel={pricing.promoActive ? 'Promo' : undefined}
            size="sm"
          />
          <p className="mt-1 font-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--terra)]">
            Livraison incluse
          </p>
        </div>
        <div className="mt-3 grid gap-2">
          <Link
            href={sizeHref}
            className="flex min-h-[42px] items-center justify-center rounded-md bg-[var(--black)] px-3 py-2 text-center font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            Choisir ma taille - {formatEuro(pricing.currentPrice)}
          </Link>
          <Link
            href={`/shop/${product.slug}`}
            className="flex min-h-[36px] items-center justify-center rounded-md border border-[var(--cream-3)] px-3 py-2 text-center font-condensed text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--grey)]"
          >
            Voir le maillot
          </Link>
        </div>
      </div>
    </article>
  )
}

export function FeaturedProductBrowser({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const availableFilters = useMemo(
    () => FILTERS.filter((filter) => filter.key === 'all' || products.some((product) => matchesFilter(product, filter.key))),
    [products],
  )
  const visibleProducts = useMemo(() => products.filter((product) => matchesFilter(product, activeFilter)), [activeFilter, products])

  return (
    <section id="selection-products" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-7 sm:px-6 md:py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-condensed text-xs uppercase tracking-[0.22em] text-[var(--terra)]">Sélection été</p>
          <h2 className="mt-1 font-bebas text-4xl leading-none md:text-6xl">Choisis ton maillot</h2>
        </div>
      </div>

      <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {availableFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.12em] transition-colors',
              activeFilter === filter.key
                ? 'border-[var(--black)] bg-[var(--black)] text-white'
                : 'border-[var(--cream-3)] bg-white text-[var(--black)]',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-lg border border-[var(--cream-3)] bg-white p-4 text-sm leading-relaxed text-[var(--grey)]">
        <strong className="text-[var(--black)]">Version fan</strong> : coupe classique confortable.{' '}
        <strong className="text-[var(--black)]">Version player</strong> : coupe plus ajustée, style performance.
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {visibleProducts.map((product, index) => (
            <ProductTile key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--cream-3)] bg-white p-6 text-center">
          <p className="font-bebas text-3xl text-[var(--black)]">Aucun maillot dans ce filtre</p>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="mt-4 inline-flex rounded-md bg-[var(--black)] px-5 py-3 font-condensed text-xs font-bold uppercase tracking-[0.18em] text-white"
          >
            Voir toute la sélection
          </button>
        </div>
      )}
    </section>
  )
}
