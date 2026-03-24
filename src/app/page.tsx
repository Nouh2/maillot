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
  const [allProducts, leagues] = await Promise.all([
    getProducts({ concept: false, limit: 32 }),
    getLeagues(),
  ])

  const featured = allProducts.filter((p) => p.is_featured).slice(0, 8)
  const products = allProducts

  return (
    <>
      {/* Section A — Catégories + Hero Slideshow */}
      <EmojiCategoryBar />
      <HeroSlideshow featured={featured.length ? featured : allProducts.slice(0, 4)} />

      {/* Barre promo rotative */}
      <PromoStrip />

      {/* Section B — Bestsellers tabbés avec grille mixte */}
      <BestsellersTabs products={featured.length ? featured : allProducts.slice(0, 8)} />

      {/* Barre trust défilante (Section C) */}
      <TrustScrollBar />

      {/* Section C — Collections tabbées */}
      <CollectionsTabs products={products} />

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

      {/* À propos (Section D) */}
      <AboutSection />
    </>
  )
}
