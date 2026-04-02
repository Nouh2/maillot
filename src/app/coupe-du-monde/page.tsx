import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Trophy } from 'lucide-react'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductsGrid } from '@/components/products/ProductsGrid'
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
  const teams = new Set(products.map((product) => product.club)).size
  const clubs = getClubFilterOptions(products)

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="relative overflow-hidden bg-[var(--black-2)] py-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--terra)]/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 backdrop-blur-sm">
              <Trophy className="h-7 w-7 text-[var(--terra)]" />
            </div>
            <Image src="/images/coupe_logo.jpg" alt="Coupe du Monde 2026" width={58} height={58} className="h-14 w-14 rounded-full object-cover" />
          </div>

          <p className="mb-3 font-condensed text-xs uppercase tracking-[6px] text-[var(--terra)]">USA - Canada - Mexique 2026</p>
          <h1 className="font-bebas text-6xl leading-none text-white md:text-8xl">COUPE DU MONDE</h1>
          <p className="mt-1 font-bebas text-4xl text-[var(--terra)] md:text-5xl">2026</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="font-bebas text-3xl text-white">{filteredProducts.length}</p>
              <p className="font-condensed text-[10px] uppercase tracking-[0.18em] text-white/60">Maillots visibles</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="font-bebas text-3xl text-white">{teams}</p>
              <p className="font-condensed text-[10px] uppercase tracking-[0.18em] text-white/60">Selections</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="font-bebas text-3xl text-white">2026</p>
              <p className="font-condensed text-[10px] uppercase tracking-[0.18em] text-white/60">Edition</p>
            </div>
          </div>
        </div>
      </div>

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
