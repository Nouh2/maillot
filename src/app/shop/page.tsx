import { Suspense } from 'react'
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tous les Maillots' }

interface ShopPageProps {
  searchParams: Promise<{ league?: string; type?: string; sort?: string }>
}

const VALID_TYPES = ['domicile', 'exterieur', 'third'] as const
type ProductType = (typeof VALID_TYPES)[number]

function parseType(value: string | undefined): ProductType | undefined {
  if (value && (VALID_TYPES as readonly string[]).includes(value)) {
    return value as ProductType
  }
  return undefined
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const [products, leagues] = await Promise.all([
    getProducts({ league: params.league, type: parseType(params.type) }),
    getLeagues(),
  ])

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="font-condensed text-xs tracking-[4px] uppercase text-[var(--terra)] mb-2">Notre catalogue</p>
        <h1 className="font-bebas text-6xl md:text-7xl text-white">TOUS LES MAILLOTS</h1>
        <p className="text-[var(--grey-lt)] mt-2">{products.length} maillots disponibles</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <Suspense fallback={null}>
            <FilterSidebar leagues={leagues} />
          </Suspense>
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-bebas text-4xl text-[var(--cream-3)]">Aucun maillot trouvé</p>
              </div>
            ) : (
              <ProductsGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
