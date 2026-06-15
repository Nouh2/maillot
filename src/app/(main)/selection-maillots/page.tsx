import type { Metadata } from 'next'
import Link from 'next/link'
import { BundleOffer } from '@/components/landing/BundleOffer'
import { CustomerProofStrip } from '@/components/landing/CustomerProofStrip'
import { FeaturedProductBrowser } from '@/components/landing/FeaturedProductBrowser'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { TrustBadge } from '@/components/ui/TrustBadge'
import { FAN_JERSEY_PRICE, formatEuro, getProductPricing } from '@/lib/cartPricing'
import { getProductBySlug, getProducts, getWorldCupProducts } from '@/lib/supabase/queries'
import { normalizeProductTextSeasons } from '@/lib/season'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Les maillots à avoir cet été',
  description: 'Sélection limitée de maillots pour cet été: France, Espagne, Algérie, Maroc et best-sellers, livraison incluse.',
}

const FEATURED_PRODUCT_SLUGS = [
  'france-maillot-exterieur-2026',
  'paris-saint-germain-maillot-domicile-2026-2027',
  'maroc-maillot-domicile-2026',
  'algerie-maillot-domicile-2026-219066038',
  'espagne-maillot-exterieur-2026',
  'angleterre-maillot-domicile-2026',
  'belgique-maillot-exterieur-2026',
] as const

const PRODUCT_PRIORITY = [
  { slug: 'france-maillot-exterieur-2026', club: 'france' },
  { slug: 'paris-saint-germain-maillot-domicile-2026-2027', club: 'paris saint germain', aliases: ['psg', 'paris'] },
  { slug: 'maroc-maillot-domicile-2026', club: 'maroc' },
  { slug: 'algerie-maillot-domicile-2026-219066038', club: 'algerie' },
  { slug: 'espagne-maillot-exterieur-2026', club: 'espagne' },
  { club: 'angleterre' },
  { slug: 'belgique-maillot-exterieur-2026', club: 'belgique' },
] as const

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function isSummerCandidate(product: Product) {
  const pricing = getProductPricing({
    isRetro: product.is_retro,
    isConcept: product.is_concept,
    productKind: product.product_kind,
    jerseyVersion: product.jersey_version,
    productSlug: product.slug,
  })

  return (
    product.product_kind === 'jersey' &&
    !product.is_retro &&
    !product.is_concept &&
    product.photos.length > 0 &&
    pricing.currentPrice >= FAN_JERSEY_PRICE
  )
}

function sortSummerProducts(products: Product[]) {
  return [...products].sort((left, right) => {
    const leftScore = getSummerPriorityRank(left)
    const rightScore = getSummerPriorityRank(right)

    if (leftScore !== rightScore) return leftScore - rightScore
    if (left.is_featured !== right.is_featured) return left.is_featured ? -1 : 1
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}

function getSummerPriorityRank(product: Product) {
  const priorityIndex = getSummerPriorityGroup(product)

  if (priorityIndex === -1) return PRODUCT_PRIORITY.length + 20

  const seasonRank = product.season === '2026' || product.season === '2026-2027' ? 0 : 0.5
  const typeRank = product.type === 'exterieur' ? 0 : product.type === 'domicile' ? 0.1 : 0.2
  const fanRank = product.jersey_version === 'fan' ? 0 : 0.05
  return priorityIndex + seasonRank + typeRank + fanRank
}

function getSummerPriorityGroup(product: Product) {
  const text = normalize(`${product.club} ${product.country} ${product.name} ${product.slug} ${product.season}`)
  const club = normalize(product.club)

  return PRODUCT_PRIORITY.findIndex((priority) => {
    if ('slug' in priority && priority.slug === product.slug) return true
    const clubMatches = club === normalize(priority.club)
    const aliasMatches = 'aliases' in priority ? priority.aliases.some((alias) => club === normalize(alias) || text.includes(normalize(alias))) : false
    return clubMatches || aliasMatches
  })
}

async function getFeaturedProducts() {
  const pinnedProducts = (await Promise.all(FEATURED_PRODUCT_SLUGS.map((slug) => getProductBySlug(slug)))).filter(
    (product): product is Product => product !== null,
  )
  const fallbackProducts = await getWorldCupProducts()
  const broadFallbackProducts = await getProducts({ productKind: 'jersey' })
  const byId = new Map<string, Product>()

  ;[...pinnedProducts, ...sortSummerProducts(fallbackProducts), ...sortSummerProducts(broadFallbackProducts.filter(isSummerCandidate))].forEach(
    (product) => {
      if (!byId.has(product.id)) byId.set(product.id, product)
    },
  )

  const seenGroups = new Set<number>()

  return sortSummerProducts([...byId.values()])
    .filter((product) => {
      const group = getSummerPriorityGroup(product)
      if (group === -1) return false
      if (seenGroups.has(group)) return false
      seenGroups.add(group)
      return true
    })
    .slice(0, PRODUCT_PRIORITY.length)
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

            {!heroProduct || !heroPricing ? (
              <Link
                href="/shop"
                className="mt-4 flex min-h-[50px] items-center justify-center rounded-md bg-[var(--terra)] px-5 py-3 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
              >
                Voir le shop
              </Link>
            ) : null}
          </div>

          {heroProduct && heroPricing ? (
            <div className="space-y-3">
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
              <Link
                href={`/shop/${heroProduct.slug}?taille=1`}
                className="flex min-h-[50px] items-center justify-center rounded-md bg-[var(--terra)] px-5 py-3 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
              >
                Choisir ma taille - {formatEuro(heroPricing.currentPrice)}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <FeaturedProductBrowser products={products} />

      <CustomerProofStrip />

      <BundleOffer />

      {heroProduct && heroPricing ? (
        <div className="fixed inset-x-0 bottom-[var(--ma-sticky-bottom-offset)] z-[80] border-t border-[var(--cream-3)] bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
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
