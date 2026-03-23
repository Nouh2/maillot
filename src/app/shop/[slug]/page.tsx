import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getPatches } from '@/lib/supabase/queries'
import { PhotoGallery } from '@/components/products/PhotoGallery'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { Badge } from '@/components/ui/Badge'
import { Truck, ShieldCheck, Undo } from 'lucide-react'
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
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <PhotoGallery photos={product.photos} name={product.name} />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge>{product.league}</Badge>
              <Badge>{getProductKindLabel(product.product_kind)}</Badge>
              {showProductType(product.product_kind) && <Badge>{getProductTypeLabel(product.type)}</Badge>}
            </div>
            <h1 className="mb-2 font-bebas text-4xl leading-tight text-[var(--black)] md:text-5xl">
              {product.name}
            </h1>
            <p className="mb-4 font-condensed text-sm uppercase tracking-widest text-[var(--grey)]">
              {product.club} · {getProductMetaLine(product)}
            </p>
            <p className="mb-8 font-bebas text-5xl tracking-tight text-[var(--black)]">{product.price.toFixed(2)} EUR</p>

            {product.description && (() => {
              const cleanDesc = product.description
                .split('|')
                .map((part) => part.trim())
                .filter((part) => !part.toLowerCase().includes('yupoo'))
                .join(' | ')

              if (!cleanDesc) return null

              return (
                <p className="mb-8 text-base leading-relaxed text-[var(--grey)]">{cleanDesc}</p>
              )
            })()}

            <AddToCartForm product={product} patches={patches} />

            <div className="mt-12 space-y-4 border-t-2 border-[var(--black)] pt-8">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 shrink-0 text-[var(--black)]" strokeWidth={1.5} />
                <div>
                  <h4 className="font-condensed font-bold uppercase tracking-wider text-[var(--black)]">Livraison Express</h4>
                  <p className="mt-0.5 text-sm text-[var(--grey)]">Offerte des 60 EUR d&apos;achat. Expedition sous 24-48h.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--black)]" strokeWidth={1.5} />
                <div>
                  <h4 className="font-condensed font-bold uppercase tracking-wider text-[var(--black)]">Paiement securise</h4>
                  <p className="mt-0.5 text-sm text-[var(--grey)]">Transactions 100% securisees via Stripe.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Undo className="h-6 w-6 shrink-0 text-[var(--black)]" strokeWidth={1.5} />
                <div>
                  <h4 className="font-condensed font-bold uppercase tracking-wider text-[var(--black)]">Retours simplifies</h4>
                  <p className="mt-0.5 text-sm text-[var(--grey)]">Echanges ou remboursements sous 14 jours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
