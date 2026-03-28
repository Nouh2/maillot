import type { Metadata } from 'next'
import { EmojiCategoryBar } from '@/components/home/EmojiCategoryBar'
import { HeroSlideshow } from '@/components/home/HeroSlideshow'
import { LeaguesStrip } from '@/components/home/LeaguesStrip'
import { BestsellersTabs } from '@/components/home/BestsellersTabs'
import { TrustScrollBar } from '@/components/home/TrustScrollBar'
import { CollectionsTabs } from '@/components/home/CollectionsTabs'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import { ReassuranceBar } from '@/components/home/ReassuranceBar'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { InstagramWall } from '@/components/home/InstagramWall'
import { CountdownBanner } from '@/components/home/CountdownBanner'
import { AboutSection } from '@/components/home/AboutSection'
import { PromoStrip } from '@/components/home/PromoStrip'
import { sortProductsByRecency } from '@/lib/productFilters'
import { getLeagues, getProducts } from '@/lib/supabase/queries'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Accueil | MAILLOT ADDICT - Maillots de Football Premium',
  description: 'Catalogue premium de maillots de football - grands clubs, selections nationales et retro. Flocage et patchs disponibles.',
}

function dedupeProducts(...groups: Product[][]): Product[] {
  const seen = new Set<string>()
  const products: Product[] = []

  for (const group of groups) {
    for (const product of group) {
      if (seen.has(product.id)) continue
      seen.add(product.id)
      products.push(product)
    }
  }

  return products
}

function pickNewestProducts(
  products: Product[],
  limit: number,
  distinctKey?: (product: Product) => string,
): Product[] {
  const sorted = sortProductsByRecency(products)

  if (!distinctKey) {
    return sorted.slice(0, limit)
  }

  const picked: Product[] = []
  const seenKeys = new Set<string>()
  const seenIds = new Set<string>()

  for (const product of sorted) {
    const key = distinctKey(product)
    if (seenKeys.has(key)) continue
    picked.push(product)
    seenKeys.add(key)
    seenIds.add(product.id)
    if (picked.length === limit) return picked
  }

  for (const product of sorted) {
    if (seenIds.has(product.id)) continue
    picked.push(product)
    if (picked.length === limit) return picked
  }

  return picked
}

export default async function HomePage() {
  const leagues = (await getLeagues()).filter((league) => league.slug !== 'champions-league')
  const homeLeagues = leagues.slice(0, 4)

  const [recentProducts, leagueProducts, preMatchProducts] = await Promise.all([
    getProducts({ concept: false, limit: 36 }),
    Promise.all(homeLeagues.map((league) => getProducts({ league: league.name, concept: false, limit: 24 }))),
    getProducts({ concept: false, productKind: 'pre_match', limit: 16 }),
  ])

  const homeLeagueProducts = leagueProducts.map((products) =>
    pickNewestProducts(products, 8, (product) => product.club),
  )
  const homeCatalogProducts = dedupeProducts(...homeLeagueProducts)
  const topProducts = pickNewestProducts(homeCatalogProducts, 3, (product) => `${product.league}:${product.club}`)
  const latestPreMatch = pickNewestProducts(preMatchProducts, 1)[0] ?? null
  const heroProducts = [recentProducts[0] ?? null, recentProducts[1] ?? null, recentProducts[2] ?? null, latestPreMatch]

  return (
    <>
      <EmojiCategoryBar leagues={leagues} />
      <HeroSlideshow heroProducts={heroProducts} />
      <PromoStrip />
      <BestsellersTabs allProducts={homeCatalogProducts} leagues={homeLeagues} topProducts={topProducts} />
      <TrustScrollBar />
      <CollectionsTabs allProducts={homeCatalogProducts} leagues={homeLeagues} />
      <ReassuranceBar />
      <LeaguesStrip leagues={leagues} />
      <CountdownBanner />
      <WhyUsSection />
      <ReviewsSection />
      <InstagramWall />
      <AboutSection />
    </>
  )
}
