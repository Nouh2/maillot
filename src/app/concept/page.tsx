import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { CollectionHeader } from '@/components/products/CollectionHeader'
import { applyProductFilters, parseProductAlphaFilter } from '@/lib/productFilters'
import { getConceptProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Maillots Concept',
  description: 'Selection manuelle de maillots concept et editions creatives.',
}

interface ConceptPageProps {
  searchParams: Promise<{ alpha?: string }>
}

export default async function ConceptPage({ searchParams }: ConceptPageProps) {
  const params = await searchParams
  const products = await getConceptProducts()
  const filteredProducts = applyProductFilters(products, {
    alpha: parseProductAlphaFilter(params.alpha),
  })

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <CollectionHeader
        title="MAILLOTS CONCEPT"
        subtitle={`${filteredProducts.length} maillots`}
        color="#c1440e"
        breadcrumb={[{ label: 'Concept' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <FilterSidebar showLeague={false} showType={false} showDate={false} />
        </Suspense>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bebas text-4xl text-[var(--cream-3)]">Selection concept en cours</p>
            <p className="mt-3 text-sm text-[var(--grey)]">Les maillots concept sont desormais separes du retro et seront ajoutes manuellement.</p>
          </div>
        ) : (
          <ProductsGrid products={filteredProducts} />
        )}
      </div>
    </div>
  )
}
