// src/components/products/ProductsGrid.tsx
// Note : bien que ce composant n'ait pas de directive 'use client',
// il est implicitement côté client car ProductCard utilise 'use client'
// (useState pour le hover d'image). C'est acceptable — les données
// sont chargées dans le Server Component parent (page.tsx).
import { Fragment } from 'react'
import { ProductCard } from './ProductCard'
import { BundleOffer } from '@/components/landing/BundleOffer'
import { CustomerProofStrip } from '@/components/landing/CustomerProofStrip'
import type { Product } from '@/types/product'

export function ProductsGrid({ products, title, sub, showConversionBreaks = false, openSizeOnClick = false }: {
  products: Product[]
  title?: string
  sub?: string
  showConversionBreaks?: boolean
  openSizeOnClick?: boolean
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
        {products.map((p, index) => (
          <Fragment key={p.id}>
            <ProductCard product={p} priority={index < 4} openSizeOnClick={openSizeOnClick} />
            {showConversionBreaks && index === 7 ? (
              <div key="bundle-offer-break" className="col-span-2 -mx-4 md:col-span-3 lg:col-span-4">
                <BundleOffer />
              </div>
            ) : null}
            {showConversionBreaks && index === 15 ? (
              <div key="customer-proof-break" className="col-span-2 -mx-4 md:col-span-3 lg:col-span-4">
                <CustomerProofStrip />
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
