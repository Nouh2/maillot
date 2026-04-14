import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { PhotoGallery } from '@/components/products/PhotoGallery'
import { ProductTrustBadges } from '@/components/products/ProductTrustBadges'
import { StickyAddToCart } from '@/components/products/StickyAddToCart'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductKindLabel, getProductMetaLine, getProductTypeLabel, showProductType } from '@/lib/productLabels'
import { normalizeProductTextSeasons, resolveProductSeasonLabel } from '@/lib/season'
import { getPatches, getProductBySlug, getProducts } from '@/lib/supabase/queries'

export const revalidate = 3600 // re-build toutes les heures

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const productDescriptor = `${getProductKindLabel(product.product_kind)}${
    showProductType(product.product_kind) ? ` ${getProductTypeLabel(product.type)}` : ''
  }`
  const pricing = getProductPricing({ isRetro: product.is_retro })
  const season = resolveProductSeasonLabel(product)

  return {
    title: normalizeProductTextSeasons(product.name),
    description: [
      `Achetez le ${normalizeProductTextSeasons(product.name)}`,
      productDescriptor,
      season ? `saison ${season}` : null,
      `prix ${formatEuro(pricing.currentPrice)}`,
    ]
      .filter(Boolean)
      .join(' - '),
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, patches] = await Promise.all([getProductBySlug(slug), getPatches()])
  if (!product) notFound()

  const pricing = getProductPricing({ isRetro: product.is_retro })

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--cream)] md:pb-0">
      <StickyAddToCart
        productName={normalizeProductTextSeasons(product.name)}
        currentPrice={pricing.currentPrice}
        originalPrice={pricing.promoActive ? pricing.originalPrice : null}
        promoLabel={pricing.promoLabel}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <div className="grid gap-2 md:grid-cols-2 md:gap-16">
          <div className="min-w-0">
            <nav className="mb-4 flex items-center gap-2 font-condensed text-[10px] uppercase tracking-wider text-[var(--grey)] sm:text-xs">
              <Link href="/" className="transition-colors hover:text-[var(--black)]">
                Maison
              </Link>
              <span className="opacity-30">|</span>
              <span className="truncate">{product.league}</span>
              <span className="opacity-30">|</span>
              <span className="truncate font-bold text-[var(--black)]">{normalizeProductTextSeasons(product.name)}</span>
            </nav>

            <PhotoGallery photos={product.photos} name={normalizeProductTextSeasons(product.name)} />

            <div className="mt-6 flex justify-center md:justify-start">
              <TrustBadge />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="mb-2 font-bebas text-4xl leading-tight text-[var(--black)] md:text-5xl">
              {normalizeProductTextSeasons(product.name)}
            </h1>
            <p className="mb-4 font-condensed text-sm uppercase tracking-widest text-[var(--grey)]">
              {product.club} · {getProductMetaLine(product)}
            </p>

            <PriceDisplay
              currentPrice={formatEuro(pricing.currentPrice)}
              originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined}
              promoLabel={pricing.promoLabel ?? undefined}
              size="lg"
              className="mb-8"
            />

            {product.description
              ? (() => {
                  const cleanDescription = product.description
                    .split('|')
                    .map((part) => part.trim())
                    .filter((part) => {
                      const lowered = part.toLowerCase()
                      return !lowered.includes('yupoo') && !lowered.startsWith('ref catalogue:')
                    })
                    .join(' | ')
                    .replace(/kitlab/gi, 'MAILLOT ADDICT')

                  if (!cleanDescription) return null

                  return <p className="mb-8 text-base leading-relaxed text-[var(--grey)]">{cleanDescription}</p>
                })()
              : null}

            <div id="product-cta-sentinel" />

            <div className="mb-8">
              <ProductTrustBadges />
            </div>

            <AddToCartForm product={product} patches={patches} />
            <div className="h-28 md:hidden" />
          </div>
        </div>
      </div>
    </div>
  )
}
