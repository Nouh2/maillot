import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { getLeagueBySlug } from '@/lib/catalog'
import { getProducts, getLeagues } from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = getLeagueBySlug(slug, leagues)
  if (!league) return {}
  return { title: `Maillots ${league.name}` }
}

export default async function LeaguePage({ params }: Props) {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = getLeagueBySlug(slug, leagues)
  if (!league) notFound()

  const products = await getProducts({ league: league.name, concept: false })

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header ligue */}
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="mb-3 text-4xl">{league.flag_emoji}</p>
        <h1 className="font-bebas text-6xl text-white md:text-7xl">{league.name}</h1>
        <p className="mt-2 text-[var(--grey-lt)]">{products.length} maillots disponibles</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {products.length > 0 ? (
          <ProductsGrid products={products} />
        ) : (
          <p className="py-20 text-center text-[var(--grey)]">Aucun maillot disponible pour ce championnat.</p>
        )}
      </div>
    </div>
  )
}
