'use client'
// src/components/home/ReviewsSection.tsx
import { Star, CheckCircle2, Quote } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

const REVIEWS = [
  {
    id: 1,
    name: 'Thomas M.',
    location: 'Lyon',
    avatar: 'https://i.pravatar.cc/150?img=11',
    stars: 5,
    date: 'il y a 2 jours',
    product: 'Real Madrid Domicile 2024-25',
    title: 'Qualité impressionnante, livraison ultra rapide',
    text: 'Je cherchais ce maillot depuis des mois. La matière est douce, le flocage est parfaitement aligné et j\'ai reçu le colis en 2 jours chrono. Vraiment bluffé pour ce prix.',
    helpful: 23,
    verified: true,
  },
  {
    id: 2,
    name: 'Sarah K.',
    location: 'Paris',
    avatar: 'https://i.pravatar.cc/150?img=47',
    stars: 5,
    date: 'il y a 5 jours',
    product: 'Bayern Munich Domicile 2024-25',
    title: 'Cadeau parfait pour mon fils',
    text: 'Mon fils voulait ce maillot pour son anniversaire. La qualité est au rendez-vous, les finitions sont propres. Il l\'a mis le soir même tellement il était content. Je reviendrai commander !',
    helpful: 18,
    verified: true,
  },
  {
    id: 3,
    name: 'Pierre D.',
    location: 'Bordeaux',
    avatar: 'https://i.pravatar.cc/150?img=52',
    stars: 5,
    date: 'il y a 1 semaine',
    product: 'PSG Third 2024-25 + Flocage',
    title: 'Deuxième commande, toujours aussi satisfait',
    text: 'C\'est ma deuxième commande chez KITLAB. J\'avais pris le France domicile la dernière fois et j\'étais déjà conquis. Ce coup-ci j\'ai ajouté un flocage — rendu impeccable, lettres bien fixées.',
    helpful: 31,
    verified: true,
  },
  {
    id: 4,
    name: 'Lucas B.',
    location: 'Toulouse',
    avatar: 'https://i.pravatar.cc/150?img=15',
    stars: 5,
    date: 'il y a 1 semaine',
    product: 'France Extérieur 2026-27',
    title: 'Reçu en 48h, emballage soigné',
    text: 'Commande passée un lundi matin, livraison le mercredi. Le maillot était dans un sac plastique protecteur avec une étiquette propre. Exactement ce que je voulais. Rien à redire.',
    helpful: 9,
    verified: true,
  },
  {
    id: 5,
    name: 'Mehdi R.',
    location: 'Marseille',
    avatar: 'https://i.pravatar.cc/150?img=68',
    stars: 4,
    date: 'il y a 2 semaines',
    product: 'Manchester City Domicile 2024-25',
    title: 'Très bon maillot, site simple d\'utilisation',
    text: 'Le site est vraiment simple, j\'ai trouvé mon maillot en 2 clics. La livraison était express. Conseil : prendre une taille au-dessus, ça taille un peu petit. Sinon qualité top.',
    helpful: 14,
    verified: true,
  },
  {
    id: 6,
    name: 'Julien F.',
    location: 'Nantes',
    avatar: 'https://i.pravatar.cc/150?img=57',
    stars: 5,
    date: 'il y a 2 semaines',
    product: 'Arsenal Domicile 2024-25 + Patch UCL',
    title: 'Le patch donne un rendu pro',
    text: 'J\'ai commandé avec le patch Champions League — honnêtement c\'est la touche qui fait tout. On dirait exactement ce que portent les joueurs sur le terrain. Qualité de couture irréprochable.',
    helpful: 27,
    verified: true,
  },
  {
    id: 7,
    name: 'Camille L.',
    location: 'Strasbourg',
    avatar: 'https://i.pravatar.cc/150?img=44',
    stars: 5,
    date: 'il y a 3 semaines',
    product: 'Brésil Extérieur 2024-25',
    title: 'Superbe qualité pour un cadeau',
    text: 'Acheté pour l\'anniversaire de mon copain fan du Brésil. Le jaune est bien vif, les broderies sur le col sont propres. Il l\'a mis le soir même pour regarder le match.',
    helpful: 11,
    verified: true,
  },
  {
    id: 8,
    name: 'Rayan S.',
    location: 'Lille',
    avatar: 'https://i.pravatar.cc/150?img=62',
    stars: 5,
    date: 'il y a 3 semaines',
    product: 'Inter Milan Third 2024-25',
    title: 'J\'en ai commandé deux du coup',
    text: 'Tellement satisfait du premier que j\'ai passé une deuxième commande la semaine suivante. Le service client a répondu en 30 minutes quand je posais une question sur les tailles. Rare de voir ça.',
    helpful: 19,
    verified: true,
  },
]

const RATING_DISTRIBUTION = [
  { stars: 5, pct: 84 },
  { stars: 4, pct: 10 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
]

export function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll() {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const cardW = el.querySelector('[data-card]')?.clientWidth ?? el.offsetWidth
    const index = Math.round(el.scrollLeft / (cardW + 16))
    setActiveIndex(index)
  }

  return (
    <section className="bg-[var(--cream)] py-12 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-8 md:mb-12">
          {/* Eyebrow */}
          <p className="mb-3 flex items-center gap-3 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)]">
            <span className="h-[2px] w-8 bg-[var(--terra)]" />
            Avis vérifiés
          </p>

          {/* Titre + score : côte à côte dès mobile */}
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-bebas text-5xl leading-none text-[var(--black)] sm:text-7xl md:text-8xl">
              ILS PARLENT<br />DE KITLAB
            </h2>

            {/* Score compact (toujours visible) */}
            <div className="flex-shrink-0 text-center pb-1">
              <p className="font-bebas text-[3.5rem] sm:text-[4.5rem] leading-none text-[var(--terra)]">4.9</p>
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-condensed text-[9px] sm:text-[10px] uppercase tracking-widest text-[var(--grey)] whitespace-nowrap">
                1&nbsp;200+ avis
              </p>
            </div>
          </div>

          {/* Barres de répartition — sous le titre sur mobile */}
          <div className="mt-4 flex flex-col gap-1.5 max-w-xs">
            {RATING_DISTRIBUTION.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="font-condensed text-[10px] w-2.5 text-right text-[var(--grey)]">{stars}</span>
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-black/10 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-condensed text-[10px] w-5 text-[var(--grey)]">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Avis en vedette ── */}
        <div
          className="mb-5 bg-white rounded-2xl p-5 sm:p-8 flex flex-col gap-4 sm:flex-row sm:gap-6 sm:items-start"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
        >
          {/* Avatar + identité — ligne sur mobile */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-3 sm:w-20 flex-shrink-0">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[var(--terra)]/20">
              <Image
                src={REVIEWS[0].avatar}
                alt={REVIEWS[0].name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="sm:text-center">
              <p className="font-condensed text-xs font-bold uppercase tracking-wider text-[var(--black)]">{REVIEWS[0].name}</p>
              <p className="font-condensed text-[10px] text-[var(--grey)]">{REVIEWS[0].location}</p>
            </div>
          </div>

          {/* Corps */}
          <div className="flex-1 min-w-0">
            <Quote className="w-6 h-6 text-[var(--terra)] mb-2 opacity-60" />
            <p className="font-bebas text-xl sm:text-2xl text-[var(--black)] mb-2 leading-tight">
              {REVIEWS[0].title}
            </p>
            <p className="text-sm text-[var(--black)]/80 leading-relaxed mb-4">
              {REVIEWS[0].text}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: REVIEWS[0].stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="flex items-center gap-1 font-condensed text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Achat vérifié
              </span>
              <span className="font-condensed text-[10px] text-[var(--terra)] uppercase tracking-wider">
                {REVIEWS[0].product}
              </span>
              <span className="font-condensed text-[10px] text-[var(--grey)]">· {REVIEWS[0].date}</span>
            </div>
          </div>
        </div>

        {/* ── Carrousel ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REVIEWS.slice(1).map((review) => (
            <div
              key={review.id}
              data-card
              className="flex-shrink-0 w-[82vw] sm:w-72 bg-white rounded-xl p-4 sm:p-5 flex flex-col gap-3"
              style={{ scrollSnapAlign: 'start', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
            >
              {/* Avatar + nom */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-condensed text-xs font-bold uppercase tracking-wider text-[var(--black)] truncate">{review.name}</p>
                  <p className="font-condensed text-[10px] text-[var(--grey)]">{review.location} · {review.date}</p>
                </div>
                {review.verified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                )}
              </div>

              {/* Étoiles + produit */}
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: review.stars }).map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  {Array.from({ length: 5 - review.stars }).map((_, si) => (
                    <Star key={`e${si}`} className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
                  ))}
                </div>
                <p className="font-condensed text-[10px] uppercase tracking-wider text-[var(--terra)]">
                  {review.product}
                </p>
              </div>

              {/* Titre + texte */}
              <div>
                <p className="font-condensed text-sm font-bold text-[var(--black)] mb-1 leading-snug">
                  {review.title}
                </p>
                <p className="text-xs text-[var(--black)]/75 leading-relaxed line-clamp-3">
                  {review.text}
                </p>
              </div>

              {/* Utile */}
              <p className="mt-auto font-condensed text-[10px] text-[var(--grey)] pt-2 border-t border-black/5">
                👍 {review.helpful} personnes ont trouvé cet avis utile
              </p>
            </div>
          ))}
        </div>

        {/* ── Dots ── */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {REVIEWS.slice(1).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                const cardW = el.querySelector('[data-card]')?.clientWidth ?? 0
                el.scrollTo({ left: i * (cardW + 16), behavior: 'smooth' })
                setActiveIndex(i)
              }}
              aria-label={`Avis ${i + 2}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                background: i === activeIndex ? 'var(--terra)' : '#ddd',
                width: i === activeIndex ? 20 : 8,
              }}
            />
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Avatars empilés + texte */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {REVIEWS.slice(0, 5).map((r) => (
                <div key={r.id} className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[var(--cream)]">
                  <Image src={r.avatar} alt={r.name} fill className="object-cover" sizes="36px" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-condensed text-xs text-[var(--grey)] uppercase tracking-wider">
                Rejoignez <span className="font-bold text-[var(--black)]">1 200+</span> fans équipés
              </p>
            </div>
          </div>

          {/* Bouton pleine largeur sur mobile */}
          <Link
            href="/shop"
            className="flex items-center justify-center bg-[var(--black)] px-8 py-4 sm:px-10 sm:py-5 font-condensed text-sm uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-[var(--terra)] w-full sm:w-auto"
          >
            Découvrir la boutique
          </Link>
        </div>

      </div>
    </section>
  )
}
