'use client'
// src/components/home/HeroSlideshow.tsx
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { proxyImage } from '@/lib/images'
import type { Product } from '@/types/product'
import 'swiper/css'
import 'swiper/css/pagination'

// Ordre : Coupe du monde → Rétro → Real & Barça → Avant-match
const SLIDE_META = [
  {
    smallText: 'Équipes Nationales 2026',
    bigText: 'Coupe du\nMonde',
    cta: 'Voir la collection',
    href: '/coupe-du-monde',
  },
  {
    smallText: 'Collection Rétro',
    bigText: 'Maillots\nRétro',
    cta: 'Voir la collection',
    href: '/retro',
  },
  {
    smallText: 'La Liga 25-26',
    bigText: 'Real Madrid\n& Barça',
    cta: 'Voir la collection',
    href: '/ligue/la-liga',
  },
  {
    smallText: 'Avant-Match 2026-27',
    bigText: "Maillots\nd'Avant-Match",
    cta: 'Voir la collection',
    href: '/shop',
  },
]

export function HeroSlideshow({ heroProducts }: { heroProducts: (Product | null)[] }) {
  const paginationRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative w-full" style={{ background: 'var(--black)' }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        pagination={{
          clickable: true,
          el: '.hero-pagination',
          bulletClass: 'hero-bullet',
          bulletActiveClass: 'hero-bullet-active',
        }}
        className="w-full"
        style={{ aspectRatio: '3/4' } as React.CSSProperties}
      >
        {SLIDE_META.map((slide, i) => {
          const product = heroProducts[i]
          const imgSrc = product?.photos[0] ? proxyImage(product.photos[0]) : null

          return (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full" style={{ aspectRatio: '3/4' }}>
                {/* Image du produit */}
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={slide.bigText}
                    fill
                    unoptimized
                    className="object-cover"
                    priority={i === 0}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--black-2)]" />
                )}

                {/* Gradient overlay bas */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.90) 0%, rgba(28,23,18,0.3) 40%, transparent 65%)' }}
                />

                {/* Texte overlay bas */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-20">
                  <p
                    className="font-condensed uppercase mb-2"
                    style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)' }}
                  >
                    {slide.smallText}
                  </p>
                  <h2
                    className="font-condensed font-bold uppercase text-white leading-tight mb-5"
                    style={{ fontSize: 30, whiteSpace: 'pre-line' }}
                  >
                    {slide.bigText}
                  </h2>
                  <Link
                    href={slide.href}
                    className="flex items-center justify-center font-condensed font-bold uppercase bg-white text-[var(--black)] hover:bg-[var(--cream)] transition-colors"
                    style={{ fontSize: 13, height: 44, borderRadius: 2, letterSpacing: '0.08em', width: '100%' }}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {/* Pagination dots */}
      <div
        ref={paginationRef}
        className="hero-pagination absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10"
      />

      <style>{`
        .hero-bullet {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: background 0.2s, width 0.2s;
        }
        .hero-bullet-active {
          background: #C1440E;
          width: 18px;
          border-radius: 3px;
        }
      `}</style>
    </section>
  )
}
