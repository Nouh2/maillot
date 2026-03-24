// src/app/page.tsx
import { getProducts, getLeagues } from '@/lib/supabase/queries'
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
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accueil | KITLAB — Maillots de Football Premium',
  description: 'Plus de 390 maillots de football premium — grands clubs, toutes années. Flocage et patchs disponibles. Livraison rapide.',
}

export default async function HomePage() {
  // On charge assez de produits pour couvrir toutes les ligues dans les tabs
  const [allProducts, leagues] = await Promise.all([
    getProducts({ concept: false, limit: 60 }),
    getLeagues(),
  ])

  const featured = allProducts.filter((p) => p.is_featured)

  return (
    <>
      {/* Catégories emoji + Hero Slideshow */}
      <EmojiCategoryBar leagues={leagues} />
      <HeroSlideshow featured={featured.length ? featured : allProducts.slice(0, 4)} />

      {/* Barre promo rotative */}
      <PromoStrip />

      {/* Bestsellers tabbés (ligues réelles) */}
      <BestsellersTabs allProducts={allProducts} leagues={leagues} />

      {/* Barre trust défilante */}
      <TrustScrollBar />

      {/* Collections tabbées (ligues réelles) */}
      <CollectionsTabs allProducts={allProducts} leagues={leagues} />

      {/* Réassurance 6 icônes */}
      <ReassuranceBar />

      {/* Championnats */}
      <LeaguesStrip leagues={leagues} />

      {/* Countdown offre */}
      <CountdownBanner />

      {/* La différence KITLAB */}
      <WhyUsSection />

      {/* Avis carrousel */}
      <ReviewsSection />

      {/* Galerie sociale */}
      <InstagramWall />

      {/* À propos */}
      <AboutSection />
    </>
  )
}
