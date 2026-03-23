// src/components/home/ReviewsSection.tsx
import { Star } from 'lucide-react'

const REVIEWS = [
  { name: 'Thomas M.', rating: 5, text: 'Qualite exceptionnelle, les coutures sont parfaites. Mon maillot du Real Madrid avec le patch LDC est magnifique !', date: 'Il y a 2 semaines' },
  { name: 'Sarah K.', rating: 5, text: 'Livraison ultra rapide, maillot conforme a la description. Je recommande vivement KITLAB pour son serieux !', date: 'Il y a 1 mois' },
  { name: 'Pierre D.', rating: 5, text: 'Achete 3 maillots pour mes enfants, ils sont ravis. Bonne taille, belle finition. Site tres professionnel et a recommander.', date: 'Il y a 3 semaines' },
] as const

export function ReviewsSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--cream)] py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 flex items-center gap-3 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)] sm:text-sm">
              <span className="h-[2px] w-8 bg-[var(--terra)]"></span>
              La voix du terrain
            </p>
            <h2 className="font-bebas text-6xl leading-none text-[var(--black)] md:text-8xl">
              AVIS
              <br />
              CLIENTS
            </h2>
          </div>
          <p className="max-w-sm text-sm font-semibold leading-relaxed text-[var(--black-3)]">
            Rejoignez des passionnes qui s&apos;equipent chez KITLAB pour vivre leur passion du football sans compromis.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <div key={review.name} className={`relative border border-[var(--black)]/5 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[var(--black)]/20 ${index === 1 ? 'md:mt-12' : ''}`}>
              <div className="absolute right-0 top-0 h-16 w-16 border-b border-l border-[var(--black)]/5 bg-[var(--cream-2)]"></div>
              <div className="relative z-10 mb-8 flex gap-1">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-5 w-5 fill-[var(--black)] text-[var(--black)]" />
                ))}
              </div>
              <p className="relative z-10 mb-10 text-base italic leading-snug text-[var(--black-2)] md:text-lg">&ldquo;{review.text}&rdquo;</p>
              <div className="flex flex-col gap-1 border-t border-[var(--black)]/10 pt-6">
                <p className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-[var(--black)]">{review.name}</p>
                <p className="font-condensed text-[10px] uppercase tracking-[0.1em] text-[var(--grey)] sm:text-xs">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
