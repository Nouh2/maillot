import type { Metadata } from 'next'
import Link from 'next/link'
import { BundleOffer } from '@/components/landing/BundleOffer'
import { CustomerProofStrip } from '@/components/landing/CustomerProofStrip'
import { FeaturedProductBrowser } from '@/components/landing/FeaturedProductBrowser'
import { TikTokWall } from '@/components/home/TikTokWall'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { FAN_JERSEY_PRICE, formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductBySlug } from '@/lib/supabase/queries'
import { normalizeProductTextSeasons } from '@/lib/season'

export const metadata: Metadata = {
  title: 'Les maillots à avoir cet été',
  description: 'Sélection limitée de maillots pour cet été: France, Espagne, Algérie, Maroc et best-sellers, livraison incluse.',
}

const FEATURED_PRODUCT_SLUGS = [
  'france-maillot-exterieur-2026',
  'france-maillot-exterieur-version-joueur-2026',
  'espagne-maillot-exterieur-2026',
  'algerie-maillot-domicile-2026-219066038',
  'maroc-maillot-domicile-2026',
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
      <section className="border-b border-[var(--cream-3)] bg-[linear-gradient(135deg,#d9f7f4_0%,#fff7e8_52%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 pb-5 pt-4 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:gap-10 md:py-8">
          <div className="flex flex-col justify-center">
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.22em] text-[var(--terra)]">Sélection limitée</p>
            <h1 className="mt-2 font-bebas text-[48px] leading-[0.9] text-[var(--black)] sm:text-7xl md:text-8xl">
              Les maillots à avoir cet été ☀️
            </h1>
            <p className="mt-3 max-w-xl text-base font-semibold leading-relaxed text-[var(--black)]">
              Sélection limitée — dès {formatEuro(FAN_JERSEY_PRICE)}, livraison incluse.
            </p>
            <div className="mt-3">
              <TrustBadge className="w-full justify-between sm:w-auto" />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--grey)]">
              <span>Paiement sécurisé</span>
              <span>Suivi inclus</span>
              <span>Livraison incluse</span>
            </div>

            {heroProduct && heroPricing ? (
              <Link
                href={`/shop/${heroProduct.slug}?taille=1`}
                className="mt-4 flex min-h-[50px] items-center justify-center rounded-md bg-[var(--terra)] px-5 py-3 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
              >
                Choisir ma taille - {formatEuro(heroPricing.currentPrice)}
              </Link>
            ) : (
              <Link
                href="/shop"
                className="mt-4 flex min-h-[50px] items-center justify-center rounded-md bg-[var(--terra)] px-5 py-3 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
              >
                Voir le shop
              </Link>
            )}
          </div>

          {heroProduct && heroPricing ? (
            <Link href={`/shop/${heroProduct.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-lg bg-[var(--cream)] shadow-[0_16px_40px_rgba(28,23,18,0.12)]">
                <div className="relative aspect-[4/5] max-h-[520px] md:aspect-[5/6]">
                  {heroProduct.photos[0] ? (
                    <ExternalProductImage
                      src={heroProduct.photos[0]}
                      alt={heroProduct.name}
                      fill
                      priority
                      fallbackMode="proxy"
                      bunnyTransform="hero"
                      sizes="(max-width: 768px) 100vw, 48vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 text-white">
                  <p className="font-condensed text-xs uppercase tracking-[0.18em] text-white/75">France en premier</p>
                  <h2 className="mt-1 line-clamp-2 font-bebas text-3xl leading-none">{normalizeProductTextSeasons(heroProduct.name)}</h2>
                  <div className="mt-2">
                    <PriceDisplay
                      currentPrice={formatEuro(heroPricing.currentPrice)}
                      originalPrice={heroPricing.promoActive ? formatEuro(heroPricing.originalPrice) : undefined}
                      promoLabel={heroPricing.promoActive ? 'Promo' : undefined}
                      tone="light"
                      size="sm"
                    />
                    <p className="mt-1 font-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Livraison incluse</p>
                  </div>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <FeaturedProductBrowser products={products} />

      <CustomerProofStrip />

      <TikTokWall />

      <BundleOffer />

      {heroProduct && heroPricing ? (
        <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-[var(--cream-3)] bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
          <Link
            href="#selection-products"
            className="flex min-h-[52px] items-center justify-center rounded-md bg-[var(--terra)] px-4 py-3 font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white"
          >
            Voir la sélection - dès {formatEuro(FAN_JERSEY_PRICE)}
          </Link>
        </div>
      ) : null}
    </main>
  )
}
