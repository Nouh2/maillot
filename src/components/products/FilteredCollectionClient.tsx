'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
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
}: FilteredCollectionClientProps & {
  clubs?: string[]
  showFilters?: boolean
}) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title={title}
        subtitle={`${products.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: breadcrumbLabel }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
          <ProductsGrid products={products} />
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
    const club = props.showClub ? searchParams.get('club') || undefined : undefined
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
