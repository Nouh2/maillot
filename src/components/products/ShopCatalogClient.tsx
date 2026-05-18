'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { getLeagueDisplayName, resolveLeagueFilterParam } from '@/lib/catalog'
import {
  dedupeCatalogProducts,
  filterStandardCatalogProducts,
  getClubFilterOptions,
  searchCatalogProducts,
} from '@/lib/catalogPresentation'
import {
  applyProductFilters,
  parseProductAlphaFilter,
  parseProductDateFilter,
  parseProductTypeFilter,
} from '@/lib/productFilters'
import type { League, Product } from '@/types/product'

interface ShopCatalogClientProps {
  products: Product[]
  leagues: League[]
}

function EmptyCatalogState() {
  return (
    <div className="py-20 text-center">
      <p className="font-bebas text-4xl text-[var(--cream-3)]">Aucun maillot trouve</p>
    </div>
  )
}

function ShopCatalogLayout({
  title,
  products,
  leagues = [],
  clubs = [],
  showFilters = true,
  showClub = false,
}: {
  title: string
  products: Product[]
  leagues?: League[]
  clubs?: string[]
  showFilters?: boolean
  showClub?: boolean
}) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title={title}
        subtitle={`${products.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: 'Boutique' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {showFilters ? <FilterSidebar leagues={leagues} clubs={clubs} showClub={showClub} /> : null}

        <div>{products.length === 0 ? <EmptyCatalogState /> : <ProductsGrid products={products} />}</div>
      </div>
    </div>
  )
}

export function ShopCatalogFallback({ products }: { products: Product[] }) {
  const visibleProducts = dedupeCatalogProducts(filterStandardCatalogProducts(products))
  const filteredProducts = applyProductFilters(visibleProducts, {})

  return <ShopCatalogLayout title="TOUS LES MAILLOTS" products={filteredProducts} showFilters={false} />
}

export function ShopCatalogClient({ products, leagues }: ShopCatalogClientProps) {
  const searchParams = useSearchParams()

  const view = useMemo(() => {
    const leagueParam = searchParams.get('league') || undefined
    const clubParam = searchParams.get('club') || undefined
    const queryParam = searchParams.get('q')?.trim() || undefined
    const typeFilter = parseProductTypeFilter(searchParams.get('type') || undefined)
    const resolvedLeague = resolveLeagueFilterParam(leagueParam, leagues)

    const collectionProducts = dedupeCatalogProducts(
      filterStandardCatalogProducts(
        products.filter((product) => {
          if (resolvedLeague && product.league !== resolvedLeague) return false
          if (clubParam && product.club !== clubParam) return false
          if (typeFilter && product.type !== typeFilter) return false
          return true
        }),
      ),
    )

    const searchedProducts = queryParam ? searchCatalogProducts(collectionProducts, queryParam) : collectionProducts
    const filteredProducts = applyProductFilters(searchedProducts, {
      type: typeFilter,
      date: parseProductDateFilter(searchParams.get('date') || undefined),
      alpha: parseProductAlphaFilter(searchParams.get('alpha') || undefined),
    })

    const title = queryParam
      ? `Resultats pour "${queryParam}"`
      : clubParam
        ? clubParam
        : leagueParam
          ? getLeagueDisplayName(leagueParam, leagues) ?? resolvedLeague ?? leagueParam.toUpperCase()
          : 'TOUS LES MAILLOTS'

    return {
      title,
      filteredProducts,
      clubOptions: getClubFilterOptions(collectionProducts),
      showClub: Boolean(leagueParam || clubParam),
    }
  }, [leagues, products, searchParams])

  return (
    <ShopCatalogLayout
      title={view.title}
      products={view.filteredProducts}
      leagues={leagues}
      clubs={view.clubOptions}
      showClub={view.showClub}
    />
  )
}
