import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { resolveLeagueFilterParam } from '@/lib/catalog'
import {
  applyProductFilters,
  parseProductAlphaFilter,
  parseProductDateFilter,
  parseProductTypeFilter,
} from '@/lib/productFilters'
import { getLeagues, getRetroProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Maillots Retro',
  description: 'Collection de maillots de football retro et vintage.',
}

interface RetroPageProps {
  searchParams: Promise<{ league?: string; type?: string; date?: string; alpha?: string }>
}

export default async function RetroPage({ searchParams }: RetroPageProps) {
  const params = await searchParams
  const leagues = await getLeagues()
  const resolvedLeague = resolveLeagueFilterParam(params.league, leagues)
  const products = await getRetroProducts()
  const filteredProducts = applyProductFilters(products, {
    league: resolvedLeague,
    type: parseProductTypeFilter(params.type),
    date: parseProductDateFilter(params.date),
    alpha: parseProductAlphaFilter(params.alpha),
  })

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title="MAILLOTS RETRO"
        subtitle={`${filteredProducts.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: 'Retro' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <FilterSidebar leagues={leagues} />
        </Suspense>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bebas text-4xl text-[var(--cream-3)]">Aucun maillot trouve</p>
          </div>
        ) : (
          <ProductsGrid products={filteredProducts} />
        )}
      </div>
    </div>
  )
}
