import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { PhotoGallery } from '@/components/products/PhotoGallery'
import { ProductConversionProof } from '@/components/products/ProductConversionProof'
import { ProductDetailsPanels } from '@/components/products/ProductDetailsPanels'
import { ProductFamilyBadge } from '@/components/products/ProductFamilyBadge'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { StickyAddToCart } from '@/components/products/StickyAddToCart'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductKindLabel, getProductMetaLine, getProductTypeLabel, showProductType } from '@/lib/productLabels'
import { normalizeProductTextSeasons, resolveProductSeasonLabel } from '@/lib/season'
import { getPatches, getProductBySlug, getRelatedProducts } from '@/lib/supabase/queries'
import type { Product } from '@/types/product'

export const revalidate = 86400

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ taille?: string | string[] }>
}

const IMPORTED_PRODUCT_DESCRIPTION_PATTERN =
  /\s*Produit import[eé] automatiquement depuis le catalogue fournisseur et h[eé]berg[eé] sur (?:KITLAB|MAILLOT ADDICT)\.?/i

function getProductSalesSentence(product: Product): string {
  const club = product.club?.trim()
  const colors = club ? `les couleurs de ${club}` : 'tes couleurs'
  return `Sélectionné pour son style et ses détails soignés, parfait pour porter ${colors} les jours de match, au quotidien ou dans une collection de passionné.`
}

function getProductDisplayDescription(product: Product): string | null {
  if (!product.description) return null

  const cleanDescription = product.description
    .split('|')
    .map((part) => part.trim())
    .filter((part) => {
      const lowered = part.toLowerCase()
      return !lowered.includes('yupoo') && !lowered.startsWith('ref catalogue:')
    })
    .join(' | ')
    .replace(IMPORTED_PRODUCT_DESCRIPTION_PATTERN, ` ${getProductSalesSentence(product)}`)
    .replace(/kitlab/gi, 'MAILLOT ADDICT')
    .replace(/\s+/g, ' ')
    .trim()

  return cleanDescription || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const productDescriptor = `${getProductKindLabel(product.product_kind)}${
    showProductType(product.product_kind) ? ` ${getProductTypeLabel(product.type)}` : ''
  }`
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })
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

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const sizeIntent = resolvedSearchParams?.taille
  const openSizeOnLoad = Array.isArray(sizeIntent) ? sizeIntent.includes('1') : sizeIntent === '1'
  const [product, patches] = await Promise.all([getProductBySlug(slug), getPatches()])
  if (!product) notFound()

  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })
  const relatedProducts = await getRelatedProducts(product)
  const productDescription = getProductDisplayDescription(product)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--cream)] md:pb-0">
      <StickyAddToCart
        productName={normalizeProductTextSeasons(product.name)}
        currentPrice={pricing.currentPrice}
        originalPrice={pricing.promoActive ? pricing.originalPrice : null}
        promoLabel={pricing.promoLabel}
      />

      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 md:pt-12">
        <div className="grid gap-1 md:grid-cols-2 md:gap-12">
          <div className="min-w-0">
            <nav className="mb-2 flex items-center gap-2 font-condensed text-[10px] uppercase tracking-wider text-[var(--grey)] sm:text-xs">
              <Link href="/" className="transition-colors hover:text-[var(--black)]">
                Maison
              </Link>
              <span className="opacity-30">|</span>
              <span className="truncate">{product.league}</span>
              <span className="opacity-30">|</span>
              <span className="truncate font-bold text-[var(--black)]">{normalizeProductTextSeasons(product.name)}</span>
            </nav>

            <PhotoGallery photos={product.photos} name={normalizeProductTextSeasons(product.name)} />

            <div className="mt-3 flex justify-center md:justify-start">
              <TrustBadge />
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-2">
              <ProductFamilyBadge product={product} />
            </div>
            <h1 className="mb-1 font-bebas text-[34px] leading-[0.95] text-[var(--black)] md:text-5xl">
              {normalizeProductTextSeasons(product.name)}
            </h1>
            <p className="mb-2 font-condensed text-xs uppercase tracking-widest text-[var(--grey)] md:text-sm">
              {product.club} · {getProductMetaLine(product)}
            </p>

            <PriceDisplay
              currentPrice={formatEuro(pricing.currentPrice)}
              originalPrice={pricing.promoActive ? formatEuro(pricing.originalPrice) : undefined}
              promoLabel={pricing.promoLabel ?? undefined}
              size="lg"
              className="mb-3"
            />

            <div id="product-cta-sentinel" />

            <AddToCartForm product={product} patches={patches} openSizeOnLoad={openSizeOnLoad} />

            <div className="mt-5">
              <ProductConversionProof />
            </div>

            <ProductDetailsPanels product={product} />

            {productDescription ? (
              <p className="mt-5 text-sm leading-relaxed text-[var(--grey)] md:text-base">{productDescription}</p>
            ) : null}
            <div className="h-20" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24">
        {relatedProducts.length > 0 ? (
          <section className="border-t border-[var(--cream-3)] pt-10 md:pt-14">
            <ProductsGrid
              products={relatedProducts}
              sub={product.club}
              title="Vous pourriez aimer"
            />
          </section>
        ) : null}
      </div>
    </div>
  )
}
