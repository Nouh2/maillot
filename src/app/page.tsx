// src/app/page.tsx
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { HeroSection } from '@/components/home/HeroSection'
import { LeaguesStrip } from '@/components/home/LeaguesStrip'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { WhyUsSection } from '@/components/home/WhyUsSection'
import { ReassuranceBar } from '@/components/home/ReassuranceBar'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'Maillots de football premium — 390+ clubs, livraison rapide, patchs disponibles.',
}

export default async function HomePage() {
  const [featured, leagues] = await Promise.all([
    getProducts({ featured: true, limit: 8 }),
    getLeagues(),
  ])

  return (
    <>
      <HeroSection featured={featured} />
      <LeaguesStrip leagues={leagues} />
      <ReassuranceBar />

      <section className="py-20 bg-[var(--cream)]">
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
