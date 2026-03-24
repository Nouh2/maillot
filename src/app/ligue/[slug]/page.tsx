import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ProductsGrid } from '@/components/products/ProductsGrid'
import { getLeagueBySlug } from '@/lib/catalog'
import { getProducts, getLeagues } from '@/lib/supabase/queries'

// Mapping slug → image de bannière
const LEAGUE_BANNERS: Record<string, string> = {
  'bundesliga':         '/images/bundes.jpg',
  'serie-a':            '/images/seria.jpg',
  'ligue-1':            '/images/ligue1.jpg',
  'premier-league':     '/images/premiere.jpg',
  'la-liga':            '/images/liga.jpg',
  'reste-du-monde':     '/images/reste_du_monde.jpg',
}

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
  const banner = LEAGUE_BANNERS[slug]

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Bannière image si disponible */}
      {banner ? (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/7', maxHeight: 260 }}>
          <Image
            src={banner}
            alt={league.name}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient overlay pour lisibilité du texte */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.75) 0%, rgba(28,23,18,0.1) 60%, transparent 100%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 text-center">
            <h1 className="font-bebas text-5xl text-white md:text-7xl drop-shadow-lg">{league.name}</h1>
            <p className="mt-1 font-condensed text-sm text-white/70 uppercase tracking-widest">
              {products.length} maillots disponibles
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--black-2)] py-12 text-center">
          <p className="mb-3 text-4xl">{league.flag_emoji}</p>
          <h1 className="font-bebas text-6xl text-white md:text-7xl">{league.name}</h1>
          <p className="mt-2 text-[var(--grey-lt)]">{products.length} maillots disponibles</p>
        </div>
      )}

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
