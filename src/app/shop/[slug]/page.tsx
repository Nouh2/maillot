import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getPatches } from '@/lib/supabase/queries'
import { PhotoGallery } from '@/components/products/PhotoGallery'
import { AddToCartForm } from '@/components/products/AddToCartForm'
import { Badge } from '@/components/ui/Badge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: `Achetez le ${product.name} - ${product.type} saison ${product.season}. Prix: ${product.price}€`,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <PhotoGallery photos={product.photos} name={product.name} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge>{product.league}</Badge>
              <Badge className="capitalize">{product.type}</Badge>
            </div>
            <h1 className="font-bebas text-4xl md:text-5xl text-[var(--black)] leading-tight mb-2">
              {product.name}
            </h1>
            <p className="text-[var(--grey)] font-condensed text-sm tracking-widest uppercase mb-4">
              {product.club} · {product.season}
            </p>
            <p className="font-bebas text-4xl text-[var(--terra)] mb-6">{product.price.toFixed(2)} €</p>

            {product.description && (
              <p className="text-[var(--grey)] text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            <AddToCartForm product={product} patches={patches} />

            <div className="mt-8 pt-6 border-t border-[var(--cream-3)] space-y-2">
              {[
                ['🚚', 'Livraison offerte dès 60€ · Expédition sous 24-48h'],
                ['🔒', 'Paiement 100% sécurisé via Stripe'],
                ['↩️', 'Retours acceptés sous 14 jours'],
              ].map(([icon, text]) => (
                <p key={text} className="text-sm text-[var(--grey)] flex gap-2">
                  <span>{icon}</span>
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
