import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { getLeagueBySlug, getLeagueColor } from '@/lib/catalog'
import { dedupeCatalogProducts, filterStandardCatalogProducts, getClubFilterOptions } from '@/lib/catalogPresentation'
import { applyProductFilters, parseProductAlphaFilter } from '@/lib/productFilters'
import { getLeagues, getProducts } from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ club?: string; alpha?: string }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = getLeagueBySlug(slug, leagues)
  if (!league) return {}
  return { title: `Maillots ${league.name}` }
}

export default async function LeaguePage({ params, searchParams }: Props) {
  const [{ slug }, filters] = await Promise.all([params, searchParams])
  const leagues = await getLeagues()
  const league = getLeagueBySlug(slug, leagues)
  if (!league) notFound()

  const products = await getProducts({ league: league.name, club: filters.club })
  const visibleProducts = dedupeCatalogProducts(filterStandardCatalogProducts(products))
  const filteredProducts = applyProductFilters(visibleProducts, {
    alpha: parseProductAlphaFilter(filters.alpha),
  })
  const clubs = getClubFilterOptions(visibleProducts)

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title={league.name}
        subtitle={`${filteredProducts.length} maillots`}
        color={getLeagueColor()}
        breadcrumb={[{ label: league.name }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Suspense fallback={null}>
          <FilterSidebar clubs={clubs} showLeague={false} showClub showType={false} showDate={false} />
        </Suspense>

        {filteredProducts.length > 0 ? (
          <ProductsGrid products={filteredProducts} />
        ) : (
          <p className="py-20 text-center text-[var(--grey)]">Aucun maillot disponible pour ce championnat.</p>
        )}
      </div>
    </div>
  )
}
