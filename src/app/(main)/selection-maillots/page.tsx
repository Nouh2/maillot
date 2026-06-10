import type { Metadata } from 'next'
import Link from 'next/link'
import { BundleOffer } from '@/components/landing/BundleOffer'
import { CustomerProofStrip } from '@/components/landing/CustomerProofStrip'
import { FeaturedProductBrowser } from '@/components/landing/FeaturedProductBrowser'
import { TikTokWall } from '@/components/home/TikTokWall'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductBySlug } from '@/lib/supabase/queries'
import { normalizeProductTextSeasons } from '@/lib/season'

export const metadata: Metadata = {
  title: 'Sélection maillots du moment',
  description: 'Sélection mobile des maillots Maillot Addict les plus demandés: France, PSG, Espagne, Algérie et Maroc.',
}

const FEATURED_PRODUCT_SLUGS = [
  'france-maillot-exterieur-2026',
  'france-maillot-exterieur-version-joueur-2026',
  'espagne-maillot-exterieur-2026',
  'paris-saint-germain-maillot-domicile-2026-2027',
  'maillot-domicile-stadium-psg-25-26-flocage-champions-of-europe',
  'algerie-maillot-domicile-2026-219066038',
  'maroc-maillot-domicile-2026',
  'fc-barcelone-maillot-domicile-207893589',
  'fc-barcelone-maillot-domicile-edition-speciale-187049732',
  'fc-barcelone-maillot-domicile-2025-2026-219063956',
] as const

async function getFeaturedProducts() {
  const products = await Promise.all(FEATURED_PRODUCT_SLUGS.map((slug) => getProductBySlug(slug)))
  return products.filter((product) => product !== null)
}

export default async function FeaturedSelectionPage() {
  const products = await getFeaturedProducts()
  const heroProduct = products[0]
  const heroPricing = heroProduct
    ? getProductPricing({
        isRetro: heroProduct.is_retro,
        isConcept: heroProduct.is_concept,
        productKind: heroProduct.product_kind,
        jerseyVersion: heroProduct.jersey_version,
        productSlug: heroProduct.slug,
      })
    : null

  return (
    <main className="min-h-screen bg-[var(--cream)] pb-24 text-[var(--black)] md:pb-0">
      <section className="border-b border-[var(--cream-3)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-6 pt-4 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:gap-10 md:py-10">
          <div className="flex flex-col justify-center">
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.22em] text-[var(--terra)]">Sélection du moment</p>
            <h1 className="mt-2 font-bebas text-[56px] leading-[0.86] text-[var(--black)] sm:text-7xl md:text-8xl">
              FRANCE EXTÉRIEUR 2026
            </h1>
            <p className="mt-3 max-w-xl text-base font-semibold leading-relaxed text-[var(--black)]">
              Version fan à 19,90 €. Coupe classique confortable, flocage disponible, paiement sécurisé.
            </p>
            <div className="mt-4">
              <TrustBadge className="w-full justify-between" />
            </div>

            {heroProduct && heroPricing ? (
              <Link
                href={`/shop/${heroProduct.slug}`}
                className="mt-5 flex min-h-[54px] items-center justify-center rounded-md bg-[var(--terra)] px-5 py-4 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
              >
                Choisir ma taille - {formatEuro(heroPricing.currentPrice)}
              </Link>
            ) : (
              <Link
                href="/shop"
                className="mt-5 flex min-h-[54px] items-center justify-center rounded-md bg-[var(--terra)] px-5 py-4 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
              >
                Voir le shop
              </Link>
            )}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--grey)]">
              <span>Paiement sécurisé</span>
              <span>Suivi inclus</span>
              <span>Livraison 7-12 jours</span>
            </div>
          </div>

          {heroProduct && heroPricing ? (
            <Link href={`/shop/${heroProduct.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-lg bg-[var(--cream)]">
                <div className="relative aspect-[4/5] md:aspect-[5/6]">
                  {heroProduct.photos[0] ? (
                    <ExternalProductImage
                      src={heroProduct.photos[0]}
                      alt={heroProduct.name}
                      fill
                      priority
                      unoptimized
                      fallbackMode="proxy"
                      bunnyTransform="hero"
                      sizes="(max-width: 768px) 100vw, 48vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 text-white">
                  <p className="font-condensed text-xs uppercase tracking-[0.18em] text-white/75">Best-seller actuel</p>
                  <h2 className="mt-1 line-clamp-2 font-bebas text-3xl leading-none">{normalizeProductTextSeasons(heroProduct.name)}</h2>
                  <div className="mt-2">
                    <PriceDisplay
                      currentPrice={formatEuro(heroPricing.currentPrice)}
                      originalPrice={heroPricing.promoActive ? formatEuro(heroPricing.originalPrice) : undefined}
                      promoLabel={heroPricing.promoActive ? 'Promo' : undefined}
                      tone="light"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <CustomerProofStrip />

      <FeaturedProductBrowser products={products} />

      <TikTokWall />

      <BundleOffer />

      {heroProduct && heroPricing ? (
        <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--cream-3)] bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
          <Link
            href={`/shop/${heroProduct.slug}`}
            className="flex min-h-[52px] items-center justify-center rounded-md bg-[var(--terra)] px-4 py-3 font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white"
          >
            Choisir ma taille - {formatEuro(heroPricing.currentPrice)}
          </Link>
        </div>
      ) : null}
    </main>
  )
}
