// src/components/home/HeroSection.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types/product'

export function HeroSection({ featured }: { featured: Product[] }) {
  return (
    <section className="min-h-[85vh] flex items-center bg-[var(--cream)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid md:grid-cols-[55fr_45fr] gap-8 md:gap-12 py-12">
        {/* Left: Text */}
        <div className="flex flex-col justify-center">
          <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-4">
            Maillots Premium · Saison 2024/25
          </p>
          <h1 className="font-bebas text-7xl md:text-9xl leading-none text-[var(--black)] mb-6">
            TOUS LES<br />
            <span className="text-[var(--terra)]">GRANDS</span><br />
            CLUBS
          </h1>
          <p className="text-[var(--grey)] text-lg leading-relaxed max-w-md mb-8 font-light">
            390+ maillots officiels pour tous les clubs et championnats. Tailles S à XXL, patchs disponibles, livraison rapide.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop">
              <Button size="lg">Explorer la boutique</Button>
            </Link>
            <Link href="/ligue/premier-league">
              <Button variant="secondary" size="lg">Premier League</Button>
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[var(--cream-3)]">
            {[['390+', 'Maillots'], ['48h', 'Livraison'], ['100%', 'Sécurisé']].map(([n, l]) => (
              <div key={l}>
                <p className="font-bebas text-3xl text-[var(--terra)]">{n}</p>
                <p className="font-condensed text-xs tracking-widest uppercase text-[var(--grey)]">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Featured product cards */}
        <div className="hidden md:grid grid-cols-2 gap-4 items-start">
          {featured.slice(0, 4).map((p, i) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className={`group block bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-[var(--terra)] border border-[var(--cream-3)] ${i === 1 ? 'mt-8' : ''}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {p.photos[0] && (
                  <Image
                    src={p.photos[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 22vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="font-condensed text-xs tracking-widest uppercase text-[var(--grey)]">{p.club}</p>
                <p className="font-condensed text-sm font-semibold truncate capitalize">{p.type} {p.season}</p>
                <p className="text-[var(--terra)] font-semibold text-sm mt-1">{p.price.toFixed(2)} €</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
