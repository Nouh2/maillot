'use client'
// src/components/home/ReviewsSection.tsx
import { Star } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

const REVIEWS = [
  { name: 'Thomas M.', stars: 5, text: 'Franchement top, qualité impeccable et livraison en 48h comme promis !', verified: true },
  { name: 'Sarah K.', stars: 5, text: 'Super expérience d\'achat. Le maillot de Bayern est parfait, flocage bien fait.', verified: true },
  { name: 'Pierre D.', stars: 5, text: 'Deuxième commande chez KITLAB. Toujours aussi satisfait. Le rapport qualité/prix est imbattable.', verified: true },
  { name: 'Lucas B.', stars: 5, text: 'Reçu en 2 jours, emballage soigné, maillot nickel. Que demander de plus ?', verified: true },
  { name: 'Mehdi R.', stars: 4, text: 'Le site est simple et la livraison express. Le maillot PSG est magnifique.', verified: true },
] as const

const AVATARS = ['TM', 'SK', 'PD', 'LB', 'MR']
const AVATAR_COLORS = ['#C1440E', '#1C1712', '#A83A0C', '#3f3830', '#D4581F']

export function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll() {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveIndex(index)
  }

  return (
    <section className="bg-[var(--cream)] py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="mb-4 flex items-center gap-3 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)] sm:text-sm">
              <span className="h-[2px] w-8 bg-[var(--terra)]"></span>
              La voix du terrain
            </p>
            <h2 className="font-bebas text-6xl leading-none text-[var(--black)] md:text-8xl">
              AVIS<br />CLIENTS
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* avatars empilés */}
              <div className="flex -space-x-2">
                {AVATARS.slice(0, 3).map((initials, i) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-condensed text-[10px] font-bold text-white border-2 border-[var(--cream)]"
                    style={{ background: AVATAR_COLORS[i] }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bebas text-2xl text-[var(--black)]">4.9</span>
            </div>
            <p className="font-condensed text-xs uppercase tracking-[0.15em] text-[var(--grey)]">
              Basé sur <span className="font-bold text-[var(--black)]">1 000+</span> clients satisfaits
            </p>
          </div>
        </div>

        {/* Carrousel scroll-snap */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REVIEWS.map((review, i) => (
            <div
              key={review.name}
              className="flex-shrink-0 w-[82vw] sm:w-72 bg-white rounded-xl overflow-hidden"
              style={{ scrollSnapAlign: 'start', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
              {/* Avatar coloré en remplacement de photo */}
              <div
                className="h-36 flex items-center justify-center"
                style={{ background: AVATAR_COLORS[i] }}
              >
                <span className="font-bebas text-6xl text-white/30">{AVATARS[i]}</span>
              </div>
              <div className="p-5">
                <p className="text-sm text-[var(--black)] leading-relaxed mb-4">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.stars }).map((_, si) => (
                      <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {review.verified && (
                    <span
                      className="font-condensed text-[10px] px-2 py-0.5 text-[#666]"
                      style={{ background: '#f0f0f0', borderRadius: 3 }}
                    >
                      ✓ Vérifié
                    </span>
                  )}
                </div>
                <p className="font-condensed text-xs font-bold uppercase tracking-[0.15em] text-[var(--black)]">
                  {review.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots pagination */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' })
                setActiveIndex(i)
              }}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ background: i === activeIndex ? 'var(--terra)' : '#ddd' }}
              aria-label={`Avis ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-[var(--black)] px-10 py-5 font-condensed text-sm uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-[var(--terra)]"
          >
            Rejoindre 1 000+ fans équipés
          </Link>
        </div>
      </div>
    </section>
  )
}
