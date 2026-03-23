// src/components/products/ProductCard.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { getProductMetaLine } from '@/lib/productLabels'
import { proxyImage } from '@/lib/images'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const photo = proxyImage(hovered && product.photos[1] ? product.photos[1] : product.photos[0])

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div
        className="bg-white border border-[var(--cream-3)] hover:border-[var(--terra)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(193,68,14,0.12)] transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--cream)]">
          {photo && (
            <Image
              src={photo}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          {product.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge>Bestseller</Badge>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-[var(--terra)] text-white text-center py-2 font-condensed text-xs tracking-widest uppercase">
              Voir le maillot →
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="font-condensed text-xs tracking-widest uppercase text-[var(--grey)] mb-1">{product.club}</p>
          <p className="font-condensed text-sm font-semibold text-[var(--black)]">{getProductMetaLine(product)}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="font-condensed text-lg font-bold text-[var(--terra)]">{product.price.toFixed(2)} €</p>
            {product.available_patches.length > 0 && (
              <span className="text-xs text-[var(--grey)]">+{product.available_patches.length} patchs</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
