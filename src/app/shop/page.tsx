import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { getLeagueDisplayName, resolveLeagueFilterParam } from '@/lib/catalog'
import {
  applyProductFilters,
  parseProductAlphaFilter,
  parseProductDateFilter,
  parseProductTypeFilter,
} from '@/lib/productFilters'

export const metadata: Metadata = { title: 'Tous les Maillots' }

interface ShopPageProps {
  searchParams: Promise<{ league?: string; type?: string; sort?: string; q?: string; date?: string; alpha?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const leagues = await getLeagues()
  const resolvedLeague = resolveLeagueFilterParam(params.league, leagues)
  const products = await getProducts({
    league: resolvedLeague,
    type: parseProductTypeFilter(params.type),
    concept: false,
    q: params.q,
  })
  const filteredProducts = applyProductFilters(products, {
    type: parseProductTypeFilter(params.type),
    date: parseProductDateFilter(params.date),
    alpha: parseProductAlphaFilter(params.alpha),
  })

  const title = params.q
    ? `Resultats pour "${params.q}"`
    : params.league
      ? getLeagueDisplayName(params.league, leagues) ?? resolvedLeague ?? params.league.toUpperCase()
      : 'TOUS LES MAILLOTS'

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] px-4 py-12 text-center">
        <p className="mb-2 font-condensed text-xs uppercase tracking-[4px] text-[var(--terra)]">Notre catalogue</p>
        <h1 className="mx-auto max-w-4xl break-words font-bebas text-5xl text-white md:text-7xl">{title}</h1>
        <p className="mt-2 text-[var(--grey-lt)]">{filteredProducts.length} maillots disponibles</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <FilterSidebar leagues={leagues} />
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
