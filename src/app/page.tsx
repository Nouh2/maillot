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
import { getFeaturedProducts, getLeagues, getProducts } from '@/lib/supabase/queries'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Accueil | KITLAB - Maillots de Football Premium',
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

export default async function HomePage() {
  const leagues = (await getLeagues()).filter((league) => league.slug !== 'champions-league')
  const homeLeagues = leagues.slice(0, 4)

  const [featuredProducts, recentProducts, leagueProducts] = await Promise.all([
    getFeaturedProducts(12),
    getProducts({ concept: false, limit: 12 }),
    Promise.all(homeLeagues.map((league) => getProducts({ league: league.name, concept: false, limit: 8 }))),
  ])

  const homepagePool = dedupeProducts(featuredProducts, recentProducts, ...leagueProducts)
  const homeCatalogProducts = dedupeProducts(...leagueProducts)
  const heroProducts = Array.from({ length: 4 }, (_, index) => homepagePool[index] ?? null)
  const topProducts = homepagePool.slice(0, 3)

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
