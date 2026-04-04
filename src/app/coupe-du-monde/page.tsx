import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { dedupeCatalogProducts, getClubFilterOptions } from '@/lib/catalogPresentation'
import { applyProductFilters, parseProductAlphaFilter } from '@/lib/productFilters'
import { getWorldCupProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Maillots Coupe du Monde 2026',
  description: 'Tous les maillots officiels des equipes qualifiees pour la Coupe du Monde 2026',
}

interface CoupeDuMondePageProps {
  searchParams: Promise<{ club?: string; alpha?: string }>
}

export default async function CoupeDuMondePage({ searchParams }: CoupeDuMondePageProps) {
  const params = await searchParams
  const products = dedupeCatalogProducts(await getWorldCupProducts())
  const visibleProducts = params.club ? products.filter((product) => product.club === params.club) : products
  const filteredProducts = applyProductFilters(visibleProducts, {
    alpha: parseProductAlphaFilter(params.alpha),
  })
  const clubs = getClubFilterOptions(products)

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title="COUPE DU MONDE"
        subtitle={`${filteredProducts.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: 'Coupe du Monde' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <FilterSidebar clubs={clubs} showLeague={false} showClub showType={false} showDate={false} />
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
