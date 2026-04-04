import Link from 'next/link'
import { Star } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Lucas M.',
    initials: 'LM',
    color: '#1C1712',
    stars: 5,
    text: 'Franchement incroyable, les maillots sont propres et la livraison super rapide. Merci MAILLOT ADDICT',
    product: 'Maillot France 2024',
  },
  {
    name: 'Enzo M.',
    initials: 'EM',
    color: '#C1440E',
    stars: 5,
    text: 'Déjà 3 commandes, jamais déçu. Toujours au rendez-vous sur la qualité et les délais.',
    product: 'Maillot Mexique 2026',
  },
  {
    name: 'Karim B.',
    initials: 'KB',
    color: '#3f3830',
    stars: 5,
    text: 'Qualité incroyable, exactement comme sur les photos. Le flocage est impeccable. Boutique de confiance.',
    product: 'Maillot Brésil Retro',
  },
  {
    name: 'Théo D.',
    initials: 'TD',
    color: '#A83A0C',
    stars: 5,
    text: "J'ai commandé le maillot Algérie avec le patch. Rendu parfait. Livraison en 9 jours chrono.",
    product: 'Maillot Algérie 2026',
  },
  {
    name: 'Adam S.',
    initials: 'AS',
    color: '#7a6f62',
    stars: 5,
    text: 'Maillot reçu bien emballé, qualité au top. Pas déçu du tout, je reviendrai sûrement pour la CAN.',
    product: 'Maillot PSG 2024',
  },
  {
    name: 'Nabil H.',
    initials: 'NH',
    color: '#D4581F',
    stars: 5,
    text: 'Le SAV a répondu en quelques heures à ma question. Sérieux, fiable, je recommande à tous mes potes.',
    product: 'Maillot Real Madrid',
  },
  {
    name: 'Rayan C.',
    initials: 'RC',
    color: '#1C1712',
    stars: 5,
    text: "Commandé vendredi, reçu le mercredi suivant. La qualité est là, c'est du solide. Top boutique.",
    product: 'Maillot Barcelone 2024',
  },
  {
    name: 'Yanis T.',
    initials: 'YT',
    color: '#C1440E',
    stars: 5,
    text: 'Suivi de commande nickel, maillot conforme à la description. Je recommande les yeux fermés.',
    product: 'Maillot Maroc 2026',
  },
]

function StarRating({ count = 5, size = 'sm' }: { count?: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={`${cls} fill-[#00b67a] text-[#00b67a]`} />
      ))}
    </div>
  )
}

const ALL_REVIEWS = [...REVIEWS, ...REVIEWS]

export function ReviewsSection() {
  return (
    <section className="overflow-hidden bg-[var(--cream)] py-12 md:py-16">
      {/* Header stats */}
      <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--cream-3)] bg-white px-4 py-2 shadow-sm">
            <StarRating size="md" />
            <span className="font-condensed text-sm font-bold text-[var(--black)]">Excellent</span>
            <span className="font-condensed text-sm font-bold text-[var(--terra)]">4.5 / 5</span>
            <span className="h-4 w-px bg-[var(--cream-3)]" />
            <span className="font-condensed text-xs text-[var(--grey)]">+30 000 clients satisfaits</span>
          </div>

          <h2 className="mt-2 font-bebas text-5xl leading-none text-[var(--black)] sm:text-6xl md:text-[5.5rem]">
            +250 000 MAILLOTS{' '}
            <span
              style={{
                WebkitTextStroke: '2px var(--black)',
                color: 'transparent',
              }}
            >
              LIVRÉS
            </span>
          </h2>
          <p className="mt-2 font-condensed text-sm text-[var(--grey)]">
            Merci pour vos retours — ils nous poussent à faire encore mieux.
          </p>
        </div>
      </div>

      {/* Scrolling reviews */}
      <div className="relative">
        <div
          className="flex gap-4 px-4"
          style={{ animation: 'reviews-scroll 45s linear infinite', width: 'max-content' }}
        >
          {ALL_REVIEWS.map((review, index) => (
            <article
              key={index}
              className="flex w-[280px] flex-shrink-0 flex-col rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bebas text-sm text-white"
                  style={{ background: review.color }}
                >
                  {review.initials}
                </div>
                <div>
                  <p className="font-condensed text-[13px] font-bold leading-tight text-[var(--black)]">
                    {review.name}
                  </p>
                  <p className="font-condensed text-[10px] font-semibold uppercase tracking-wide text-[#00b67a]">
                    ✓ Vérifié
                  </p>
                </div>
              </div>
              <StarRating />
              <p className="mt-3 flex-1 text-[12px] leading-relaxed text-[var(--grey)]">"{review.text}"</p>
              <p className="mt-4 font-condensed text-[9px] uppercase tracking-widest text-[var(--terra)]">
                {review.product}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="w-full rounded-none bg-[var(--black)] px-8 py-4 text-center font-condensed text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[var(--terra)] sm:w-auto"
          >
            Rejoindre +30 000 clients →
          </Link>
          <p className="font-condensed text-xs text-[var(--grey)]">Livraison suivie · Retour 14 jours</p>
        </div>
      </div>

      <style>{`
        @keyframes reviews-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
