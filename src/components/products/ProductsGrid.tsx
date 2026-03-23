// src/components/products/ProductsGrid.tsx
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
        <div className="text-center mb-10">
          {sub && <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-2">{sub}</p>}
          <h2 className="font-bebas text-5xl md:text-6xl text-[var(--black)]">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
