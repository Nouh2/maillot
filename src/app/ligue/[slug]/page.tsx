import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts, getLeagues } from '@/lib/supabase/queries'
import { ProductsGrid } from '@/components/products/ProductsGrid'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = leagues.find((l) => l.slug === slug)
  if (!league) return {}
  return { title: `Maillots ${league.name}` }
}

export default async function LeaguePage({ params }: Props) {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = leagues.find((l) => l.slug === slug)
  if (!league) notFound()

  const products = await getProducts({ league: slug })

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)] py-12 text-center">
        <p className="text-4xl mb-3">{league.flag_emoji}</p>
        <h1 className="font-bebas text-6xl md:text-7xl text-white">{league.name}</h1>
        <p className="text-[var(--grey-lt)] mt-2">{products.length} maillots disponibles</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {products.length > 0
          ? <ProductsGrid products={products} />
          : <p className="text-center text-[var(--grey)] py-20">Aucun maillot disponible pour ce championnat.</p>
        }
      </div>
    </div>
  )
}
