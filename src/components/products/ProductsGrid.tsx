// src/components/products/ProductsGrid.tsx
// Note : bien que ce composant n'ait pas de directive 'use client',
// il est implicitement côté client car ProductCard utilise 'use client'
// (useState pour le hover d'image). C'est acceptable — les données
// sont chargées dans le Server Component parent (page.tsx).
import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'

export function ProductsGrid({ products, title, sub }: {
  products: Product[]
  title?: string
  sub?: string
}) {
  return (
    <div>
      {title && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[var(--black)]/10 pb-6">
          <div>
            {sub && <p className="font-condensed text-xs sm:text-sm tracking-[0.3em] font-semibold uppercase text-[var(--terra)] mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[var(--terra)]"></span>
              {sub}
            </p>}
            <h2 className="font-bebas text-5xl md:text-7xl leading-none text-[var(--black)]">{title}</h2>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
