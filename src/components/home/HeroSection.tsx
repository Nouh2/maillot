// src/components/home/HeroSection.tsx
import Link from 'next/link'
import Image from 'next/image'
import { getProductMetaLine } from '@/lib/productLabels'
import { proxyImage } from '@/lib/images'
import type { Product } from '@/types/product'

export function HeroSection({ featured }: { featured: Product[] }) {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[var(--cream)]">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,var(--black)_0%,transparent_100%)] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[60fr_40fr] lg:gap-8">
        <div className="flex flex-col justify-center">
          <p className="mb-4 flex items-center gap-3 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--black)] md:text-sm">
            <span className="h-[2px] w-8 bg-[var(--terra)]"></span>
            Saison 2024/25
          </p>
          <h1 className="relative mb-6 font-bebas text-7xl uppercase leading-[0.85] tracking-tighter text-[var(--black)] sm:text-8xl md:text-[9rem] lg:text-[11rem]">
            L&apos;ELITE
            <br />
            DU <span className="relative inline-block text-[var(--terra)]">FOOTBALL</span>
          </h1>
          <p className="mb-8 max-w-lg text-lg font-normal leading-relaxed text-[var(--black-3)] md:text-xl">
            Plus de 390 maillots officiels des plus grands clubs et championnats. Qualite premium, flocages et patchs officiels.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/shop" className="group relative inline-flex items-center justify-center overflow-hidden bg-[var(--black)] px-8 py-5 font-condensed text-sm uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-[var(--terra)]">
              <span className="relative z-10">Decouvrir la collection</span>
            </Link>
            <Link href="/ligue/premier-league" className="group relative inline-flex items-center justify-center border border-[var(--black)] bg-transparent px-8 py-5 font-condensed text-sm uppercase tracking-[0.2em] text-[var(--black)] transition-colors duration-300 hover:bg-[var(--black-2)] hover:text-white">
              <span className="relative z-10">Premier League</span>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-[var(--black)]/10 pt-8">
            {[
              ['390+', 'Maillots Premium'],
              ['48h', 'Livraison Rapide'],
              ['SSL', 'Paiement Securise'],
            ].map(([value, label]) => (
              <div key={label} className="group cursor-default">
                <p className="mb-1 font-bebas text-4xl text-[var(--black)] transition-colors group-hover:text-[var(--terra)] lg:text-5xl">{value}</p>
                <p className="font-condensed text-[10px] uppercase tracking-widest text-[var(--grey)] md:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 items-start gap-4 lg:mt-0 lg:gap-6">
          <div className="absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--terra)]/5 blur-3xl"></div>
          {featured.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.slug}`}
              className="group relative flex h-full flex-col border border-[var(--black)]/5 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-[var(--cream-2)]">
                {product.photos[0] && (
                  <Image
                    src={proxyImage(product.photos[0])}
                    alt={product.name}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover mix-blend-multiply transition-transform duration-700 ease-in-out group-hover:scale-110"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="border border-white/30 bg-black/20 px-2 py-1 font-condensed text-xs uppercase tracking-wider text-white backdrop-blur-sm">Apercu rapide</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4 transition-colors group-hover:bg-[var(--cream)] sm:p-5">
                <div>
                  <p className="mb-1 font-condensed text-[10px] uppercase tracking-[0.2em] text-[var(--grey)] sm:mb-2 sm:text-xs">{product.club}</p>
                  <p className="line-clamp-2 font-condensed text-sm font-bold leading-tight text-[var(--black)] transition-colors group-hover:text-[var(--terra)] sm:text-base">{getProductMetaLine(product)}</p>
                </div>
                <p className="mt-3 font-bebas text-xl text-[var(--black)] sm:mt-4 sm:text-2xl">{product.price.toFixed(2)} EUR</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
