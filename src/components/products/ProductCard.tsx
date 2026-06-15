import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductMetaLine } from '@/lib/productLabels'
import { getProductDisplayClub, getProductDisplayName } from '@/lib/productDisplay'
import type { Product } from '@/types/product'
import { ProductFamilyBadge } from './ProductFamilyBadge'

export function ProductCard({
  product,
  priority = false,
  openSizeOnClick = false,
}: {
  product: Product
  priority?: boolean
  openSizeOnClick?: boolean
}) {
  const photo = product.photos[0]
  const displayName = getProductDisplayName(product)
  const displayClub = getProductDisplayClub(product)
  const productHref = `/shop/${product.slug}${openSizeOnClick ? '?taille=1' : ''}`
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  return (
    <Link href={productHref} className="group block">
      <div
        className="border border-[var(--cream-3)] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[var(--terra)] hover:shadow-[0_8px_24px_rgba(193,68,14,0.12)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--cream-2)]">
          {photo ? (
            <ExternalProductImage
              src={photo}
              alt={displayName}
              fill
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              fallbackMode="proxy"
              bunnyTransform="card"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : null}

          {product.is_featured ? (
            <div className="absolute top-3 left-3">
              <Badge>Bestseller</Badge>
            </div>
          ) : null}

          <div className={`absolute left-3 ${product.is_featured ? 'top-10' : 'top-3'}`}>
            <ProductFamilyBadge product={product} />
          </div>

          <div className="absolute right-3 bottom-3 left-3 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="bg-[var(--terra)] py-2 text-center font-condensed text-xs uppercase tracking-widest text-white">
              Voir le maillot →
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-1 font-condensed text-xs uppercase tracking-widest text-[var(--grey)]">{displayClub}</p>
          <p className="font-condensed text-sm font-semibold text-[var(--black)]">{getProductMetaLine(product)}</p>

          <div className="mt-3 flex items-end justify-between gap-3">
            <PriceDisplay
              currentPrice={formatEuro(pricing.currentPrice)}
              originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined}
              promoLabel={pricing.promoActive ? 'Promo' : undefined}
              size="sm"
            />

            {product.available_patches.length > 0 ? (
              <span className="text-xs text-[var(--grey)]">+{product.available_patches.length} patchs</span>
            ) : null}
          </div>

          <div className="mt-3 flex min-h-[40px] items-center justify-center rounded-md bg-[var(--black)] px-3 py-2 text-center font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors group-hover:bg-[var(--terra)]">
            Choisir ma taille - {formatEuro(pricing.currentPrice)}
          </div>
        </div>
      </div>
    </Link>
  )
}
