'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { resolveLeagueFilterParam } from '@/lib/catalog'
import { getClubFilterOptions } from '@/lib/catalogPresentation'
import {
  applyProductFilters,
  parseProductAlphaFilter,
  parseProductDateFilter,
  parseProductTypeFilter,
} from '@/lib/productFilters'
import type { League, Product } from '@/types/product'

interface FilteredCollectionClientProps {
  title: string
  breadcrumbLabel: string
  products: Product[]
  leagues?: League[]
  emptyTitle?: string
  emptyDescription?: string
  showLeague?: boolean
  showClub?: boolean
  showType?: boolean
  showDate?: boolean
  showAlpha?: boolean
  compactHeader?: boolean
  showHeaderTrust?: boolean
  highlightProducts?: Product[]
  showConversionBreaks?: boolean
}

function CollectionLayout({
  title,
  breadcrumbLabel,
  products,
  leagues = [],
  clubs = [],
  emptyTitle = 'Aucun maillot trouvé',
  emptyDescription,
  showFilters = true,
  showLeague = true,
  showClub = false,
  showType = true,
  showDate = true,
  showAlpha = true,
  compactHeader = false,
  showHeaderTrust = false,
  highlightProducts = [],
  showConversionBreaks = false,
}: FilteredCollectionClientProps & {
  clubs?: string[]
  showFilters?: boolean
}) {
  return (
    <div className={`min-h-screen bg-[var(--cream)] ${showConversionBreaks ? 'pb-20 md:pb-0' : ''}`}>
      <CollectionHeader
        title={title}
        subtitle={`${products.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: breadcrumbLabel }]}
        compact={compactHeader}
      />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-10">
        {showHeaderTrust ? (
          <div className="mb-4">
            <TrustBadge className="w-full justify-between sm:w-auto sm:justify-start" />
          </div>
        ) : null}

        {showFilters ? (
          <FilterSidebar
            leagues={leagues}
            clubs={clubs}
            showLeague={showLeague}
            showClub={showClub}
            showType={showType}
            showDate={showDate}
            showAlpha={showAlpha}
          />
        ) : null}

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bebas text-4xl text-[var(--cream-3)]">{emptyTitle}</p>
            {emptyDescription ? <p className="mt-3 text-sm text-[var(--grey)]">{emptyDescription}</p> : null}
          </div>
        ) : (
          <>
            {highlightProducts.length > 0 ? (
              <section id="worldcup-best-sellers" className="mb-8 scroll-mt-24">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-[var(--terra)]">Best-sellers</p>
                    <h2 className="font-bebas text-4xl leading-none text-[var(--black)]">Les plus demandés</h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                  {highlightProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 4} openSizeOnClick={showConversionBreaks} />
                  ))}
                </div>
              </section>
            ) : null}

            <ProductsGrid
              products={products.filter((product) => !highlightProducts.some((highlight) => highlight.id === product.id))}
              showConversionBreaks={showConversionBreaks}
              openSizeOnClick={showConversionBreaks}
            />
          </>
        )}
      </div>
    </div>
  )
}

export function FilteredCollectionFallback(props: FilteredCollectionClientProps) {
  const products = applyProductFilters(props.products, {})

  return <CollectionLayout {...props} products={products} showFilters={false} />
}

export function FilteredCollectionClient(props: FilteredCollectionClientProps) {
  const searchParams = useSearchParams()

  const view = useMemo(() => {
    const league = props.showLeague === false
      ? undefined
      : resolveLeagueFilterParam(searchParams.get('league') || undefined, props.leagues ?? [])
    const club = props.showClub ? searchParams.get('club') || searchParams.get('equipe') || undefined : undefined
    const type = props.showType === false ? undefined : parseProductTypeFilter(searchParams.get('type') || undefined)

    const scopedProducts = props.products.filter((product) => {
      if (league && product.league !== league) return false
      if (club && product.club !== club) return false
      if (type && product.type !== type) return false
      return true
    })

    return {
      products: applyProductFilters(scopedProducts, {
        league,
        type,
        date: props.showDate === false ? undefined : parseProductDateFilter(searchParams.get('date') || undefined),
        alpha: props.showAlpha === false ? undefined : parseProductAlphaFilter(searchParams.get('alpha') || undefined),
      }),
      clubs: getClubFilterOptions(props.products),
    }
  }, [props, searchParams])

  return <CollectionLayout {...props} products={view.products} clubs={view.clubs} />
}
