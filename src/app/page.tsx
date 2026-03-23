// src/app/page.tsx
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/home/HeroSection'
import { LeaguesStrip } from '@/components/home/LeaguesStrip'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import { ReassuranceBar } from '@/components/home/ReassuranceBar'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { PromoStrip } from '@/components/home/PromoStrip'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accueil | KITLAB — Maillots de Football Premium',
  description: 'Plus de 390 maillots de football premium — grands clubs, toutes années. Flocage et patchs disponibles. Livraison rapide.',
}

export default async function HomePage() {
  const [featured, leagues] = await Promise.all([
    getProducts({ featured: true, concept: false, limit: 8 }),
    getLeagues(),
  ])

  return (
    <>
      <HeroSection featured={featured} />
      <PromoStrip />
      <LeaguesStrip leagues={leagues} />
      <ReassuranceBar />

      <section className="py-10 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <ProductsGrid
              products={featured.slice(0, 8)}
              title="BESTSELLERS"
              sub="Les plus populaires"
            />
          </ScrollReveal>
        </div>
      </section>

      <WhyUsSection />
      <ReviewsSection />
    </>
  )
}
