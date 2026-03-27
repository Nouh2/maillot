import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getPatches } from '@/lib/supabase/queries'
import { PhotoGallery } from '@/components/products/PhotoGallery'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { StickyAddToCart } from '@/components/products/StickyAddToCart'
import { ProductTrustBadges } from '@/components/products/ProductTrustBadges'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { getProductKindLabel, getProductMetaLine, getProductTypeLabel, showProductType } from '@/lib/productLabels'

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

  return {
    title: product.name,
    description: `Achetez le ${product.name} - ${productDescriptor} saison ${product.season}. Prix: ${product.price} EUR`,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, patches] = await Promise.all([
    getProductBySlug(slug),
    getPatches(),
  ])
  if (!product) notFound()

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--cream)] md:pb-0">
      <StickyAddToCart productName={product.name} price={product.price} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <div className="grid gap-2 md:grid-cols-2 md:gap-16">
          <div className="min-w-0">
            {/* Breadcrumbs */}
            <nav className="mb-4 flex items-center gap-2 font-condensed text-[10px] sm:text-xs uppercase tracking-wider text-[var(--grey)]">
              <Link href="/" className="hover:text-[var(--black)] transition-colors">Maison</Link>
              <span className="opacity-30">|</span>
              <span className="truncate">{product.league}</span>
              <span className="opacity-30">|</span>
              <span className="truncate font-bold text-[var(--black)]">{product.name}</span>
            </nav>

            <PhotoGallery photos={product.photos} name={product.name} />

            {/* Social Proof / Rating */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex h-5.5 w-5.5 items-center justify-center rounded-sm overflow-hidden"
                    style={{
                      background: i < 4
                        ? '#00b67a'
                        : 'linear-gradient(90deg, #00b67a 50%, #dcdce0 50%)'
                    }}
                  >
                    <Star className="h-3.5 w-3.5 fill-white text-white" />
                  </div>
                ))}
              </div>
              <p className="font-condensed text-[13px] font-bold text-[var(--black)] whitespace-nowrap">
                Noté 4.5/5 sur plus de 1200 clients
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="mb-2 font-bebas text-4xl leading-tight text-[var(--black)] md:text-5xl">
              {product.name}
            </h1>
            <p className="mb-4 font-condensed text-sm uppercase tracking-widest text-[var(--grey)]">
              {product.club} · {getProductMetaLine(product)}
            </p>
            <p className="mb-8 font-bebas text-3xl md:text-5xl tracking-tight text-[var(--black)]">{product.price.toFixed(2)} EUR</p>

            {product.description && (() => {
              const cleanDesc = product.description
                .split('|')
                .map((part) => part.trim())
                .filter((part) => {
                  const lowered = part.toLowerCase()
                  return !lowered.includes('yupoo') && !lowered.startsWith('ref catalogue:')
                })
                .join(' | ')
                .replace(/kitlab/gi, 'MAILLOT ADDICT')

              if (!cleanDesc) return null

              return (
                <p className="mb-8 text-base leading-relaxed text-[var(--grey)]">{cleanDesc}</p>
              )
            })()}

            {/* Sentinel pour le sticky CTA mobile */}
            <div id="product-cta-sentinel" />
            <div className="mb-8">
              <ProductTrustBadges />
            </div>
            <AddToCartForm product={product} patches={patches} />
            {/* Espace pour le sticky bar mobile */}
            <div className="h-28 md:hidden" />
          </div>
        </div>
      </div>
    </div>
  )
}
