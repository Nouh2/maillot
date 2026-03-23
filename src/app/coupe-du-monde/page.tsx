import type { Metadata } from 'next'
import { getWorldCupProducts } from '@/lib/supabase/queries'
import { ProductsGrid } from '@/components/products/ProductsGrid'

export const metadata: Metadata = {
  title: 'Maillots Coupe du Monde 2026',
  description: 'Tous les maillots officiels des équipes qualifiées pour la Coupe du Monde 2026',
}

export default async function CoupeDuMondePage() {
  const products = await getWorldCupProducts()

  // Grouper par équipe pour afficher le nombre de pays
  const teams = new Set(products.map((p) => p.club)).size

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <div className="relative overflow-hidden bg-[var(--black-2)] py-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }} />
        </div>
        <div className="relative z-10">
          <p className="font-condensed text-xs tracking-[6px] uppercase text-[var(--terra)] mb-3">
            ⚽ USA · Canada · Mexique 2026
          </p>
          <h1 className="font-bebas text-6xl md:text-8xl text-white leading-none">
            COUPE DU MONDE
          </h1>
          <p className="font-bebas text-4xl md:text-5xl text-[var(--terra)] mt-1">2026</p>
          <p className="text-[var(--grey-lt)] mt-4 font-condensed text-sm tracking-widest uppercase">
            {products.length} maillots · {teams} équipes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-bebas text-4xl text-[var(--cream-3)]">Aucun maillot trouvé</p>
          </div>
        ) : (
          <ProductsGrid products={products} />
        )}
      </div>
    </div>
  )
}
