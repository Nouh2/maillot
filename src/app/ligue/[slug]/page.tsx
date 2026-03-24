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
      {/* Header ligue animé */}
      <div className="league-hero relative overflow-hidden py-14 text-center">
        {/* Grille diagonale */}
        <div className="league-grid absolute inset-0" />
        {/* Lueur centrale */}
        <div className="league-glow absolute inset-0" />
        {/* Lignes de lumière animées */}
        <div className="league-beam league-beam-1 absolute" />
        <div className="league-beam league-beam-2 absolute" />
        <div className="league-beam league-beam-3 absolute" />

        {/* Contenu */}
        <div className="relative z-10">
          <p className="mb-3 text-5xl" style={{ filter: 'drop-shadow(0 0 12px rgba(193,68,14,0.6))' }}>
            {league.flag_emoji}
          </p>
          <h1
            className="font-bebas text-6xl text-white md:text-8xl tracking-wide"
            style={{ textShadow: '0 0 40px rgba(193,68,14,0.4), 0 2px 0 rgba(0,0,0,0.8)' }}
          >
            {league.name}
          </h1>
          <p className="mt-3 font-condensed text-xs uppercase tracking-[0.25em] text-white/40">
            {products.length} maillots disponibles
          </p>
        </div>
      </div>

      <style>{`
        .league-hero {
          background: #0e0c0a;
          min-height: 200px;
        }

        /* Grille diagonale fine */
        .league-grid {
          background-image:
            repeating-linear-gradient(
              -55deg,
              transparent,
              transparent 28px,
              rgba(255,255,255,0.025) 28px,
              rgba(255,255,255,0.025) 29px
            );
        }

        /* Lueur orange pulsante au centre */
        .league-glow {
          background: radial-gradient(ellipse 70% 60% at 50% 100%, rgba(193,68,14,0.22) 0%, transparent 70%);
          animation: glow-pulse 3s ease-in-out infinite alternate;
        }
        @keyframes glow-pulse {
          from { opacity: 0.7; transform: scaleX(0.95); }
          to   { opacity: 1;   transform: scaleX(1.05); }
        }

        /* Rayons de lumière traversants */
        .league-beam {
          width: 1px;
          top: -20%;
          bottom: -20%;
          background: linear-gradient(to bottom, transparent 0%, rgba(193,68,14,0.35) 40%, rgba(255,180,80,0.15) 55%, transparent 100%);
          animation: beam-drift linear infinite;
          transform-origin: top center;
        }
        .league-beam-1 { left: 20%; animation-duration: 8s;  animation-delay: 0s;   width: 1.5px; opacity: 0.7; }
        .league-beam-2 { left: 55%; animation-duration: 11s; animation-delay: -3s;  width: 1px;   opacity: 0.5; }
        .league-beam-3 { left: 78%; animation-duration: 9s;  animation-delay: -6s;  width: 2px;   opacity: 0.4; }

        @keyframes beam-drift {
          0%   { transform: translateX(-40px) skewX(-8deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(40px)  skewX(-8deg); opacity: 0; }
        }
      `}</style>

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
