// src/components/home/ReviewsSection.tsx
const REVIEWS = [
  { name: 'Thomas M.', rating: 5, text: 'Qualité exceptionnelle, les coutures sont parfaites. Mon maillot du Real Madrid avec le patch LDC est magnifique !', date: 'Il y a 2 semaines' },
  { name: 'Sarah K.', rating: 5, text: 'Livraison ultra rapide, maillot conforme à la description. Je recommande vivement KITLAB !', date: 'Il y a 1 mois' },
  { name: 'Pierre D.', rating: 5, text: 'Acheté 3 maillots pour mes enfants, ils sont ravis. Bonne taille, belle finition. Site à recommander.', date: 'Il y a 3 semaines' },
] as const

export function ReviewsSection() {
  return (
    <section className="py-20 bg-[var(--terra)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-bebas text-5xl md:text-6xl text-white">CE QUE DISENT NOS CLIENTS</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white/10 backdrop-blur p-6 border border-white/20">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-300 text-sm">★</span>
                ))}
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-4">"{r.text}"</p>
              <div className="flex items-center justify-between">
                <p className="font-condensed text-sm tracking-wide font-semibold text-white uppercase">{r.name}</p>
                <p className="text-white/50 text-xs">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
