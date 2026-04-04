import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { getLeagueDisplayName, resolveLeagueFilterParam } from '@/lib/catalog'
import { dedupeCatalogProducts, filterStandardCatalogProducts, getClubFilterOptions, searchCatalogProducts } from '@/lib/catalogPresentation'
import { applyProductFilters, parseProductAlphaFilter, parseProductDateFilter, parseProductTypeFilter } from '@/lib/productFilters'
import { getLeagues, getProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Tous les Maillots' }

interface ShopPageProps {
  searchParams: Promise<{ league?: string; club?: string; type?: string; q?: string; date?: string; alpha?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const leagues = await getLeagues()
  const resolvedLeague = resolveLeagueFilterParam(params.league, leagues)

  const rawProducts = await getProducts({
    league: resolvedLeague,
    club: params.club,
    type: parseProductTypeFilter(params.type),
  })

  const visibleProducts = dedupeCatalogProducts(filterStandardCatalogProducts(rawProducts))
  const searchedProducts = params.q ? searchCatalogProducts(visibleProducts, params.q) : visibleProducts
  const filteredProducts = applyProductFilters(searchedProducts, {
    type: parseProductTypeFilter(params.type),
    date: parseProductDateFilter(params.date),
    alpha: parseProductAlphaFilter(params.alpha),
  })
  const clubOptions = getClubFilterOptions(visibleProducts)

  const title = params.q
    ? `Resultats pour "${params.q}"`
    : params.club
      ? params.club
      : params.league
        ? getLeagueDisplayName(params.league, leagues) ?? resolvedLeague ?? params.league.toUpperCase()
        : 'TOUS LES MAILLOTS'

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title={title}
        subtitle={`${filteredProducts.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: 'Boutique' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <FilterSidebar leagues={leagues} clubs={clubOptions} showClub={Boolean(params.league || params.club)} />
        </Suspense>

        <div>
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-bebas text-4xl text-[var(--cream-3)]">Aucun maillot trouve</p>
            </div>
          ) : (
            <ProductsGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  )
}
