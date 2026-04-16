import type { Metadata } from 'next'
import { AboutSection } from '@/components/home/AboutSection'
import { BestsellersTabs } from '@/components/home/BestsellersTabs'
import { CollectionsTabs } from '@/components/home/CollectionsTabs'
import { CountdownBanner } from '@/components/home/CountdownBanner'
import { EmojiCategoryBar } from '@/components/home/EmojiCategoryBar'
import { HeroSlideshow } from '@/components/home/HeroSlideshow'
import { TikTokWall } from '@/components/home/TikTokWall'
import { LeaguesStrip } from '@/components/home/LeaguesStrip'
import { PromoStrip } from '@/components/home/PromoStrip'
import { ReassuranceBar } from '@/components/home/ReassuranceBar'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { TrustScrollBar } from '@/components/home/TrustScrollBar'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import {
  buildHomepageBestsellerTabs,
  buildHomepageCatalogSource,
  buildHomepageFastMoverGroups,
  getHomepageCurationAssignments,
} from '@/lib/homepageCuration'
import { getLeagues, getProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Accueil | MAILLOT ADDICT - Maillots de Football Premium',
  description: 'Catalogue premium de maillots de football - grands clubs, selections nationales et retro. Flocage et patchs disponibles.',
}
export const revalidate = 1800

export default async function HomePage() {
  const [allLeagues, rawCatalogProducts, assignments] = await Promise.all([
    getLeagues(),
    getProducts(),
    getHomepageCurationAssignments(),
  ])
  const source = buildHomepageCatalogSource(allLeagues, rawCatalogProducts)
  const bestsellersTabs = buildHomepageBestsellerTabs(source, assignments)
  const fastMoverGroups = buildHomepageFastMoverGroups(source, assignments)

  return (
    <>
      <EmojiCategoryBar leagues={allLeagues.filter((league) => league.slug !== 'champions-league')} />
      <HeroSlideshow heroProducts={source.heroProducts} />
      <PromoStrip />
      <BestsellersTabs tabs={bestsellersTabs} />
      <TrustScrollBar />
      <CollectionsTabs groups={fastMoverGroups} />
      <ReassuranceBar />
      <LeaguesStrip leagues={allLeagues.filter((league) => league.slug !== 'champions-league')} />
      <CountdownBanner />
      <WhyUsSection />
      <ReviewsSection />
      <TikTokWall />
      <AboutSection />
    </>
  )
}
