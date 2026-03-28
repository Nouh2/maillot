import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { resolveLeagueFilterParam } from '@/lib/catalog'
import { normalizeSeasonLabel } from '@/lib/season'
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

  const clubs = new Set(filteredProducts.map((product) => product.club)).size
  const seasons = [...new Set(filteredProducts.map((product) => normalizeSeasonLabel(product.season)))].sort().reverse()
  const oldestSeason = seasons[seasons.length - 1]

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="relative overflow-hidden bg-[var(--black-2)] py-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, white 0, white 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
        <div className="relative z-10">
          <p className="mb-3 font-condensed text-xs uppercase tracking-[6px] text-[var(--terra)]">
            Collection vintage
          </p>
          <h1 className="font-bebas text-6xl leading-none text-white md:text-8xl">
            MAILLOTS RETRO
          </h1>
          <p className="mt-1 font-bebas text-4xl text-[var(--terra)] md:text-5xl">VINTAGE</p>
          <p className="mt-4 font-condensed text-sm uppercase tracking-widest text-[var(--grey-lt)]">
            {filteredProducts.length} maillots - {clubs} clubs{oldestSeason ? ` - depuis ${oldestSeason}` : ''}
          </p>
        </div>
      </div>

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
