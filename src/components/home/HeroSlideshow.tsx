'use client'
// src/components/home/HeroSlideshow.tsx
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
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
    staticImage: '/images/coupe_du_monde.jpg',
  },
  {
    smallText: 'Collection Rétro',
    bigText: 'Maillots\nRétro',
    cta: 'Voir la collection',
    href: '/retro',
    staticImage: '/images/retro.jpg',
  },
  {
    smallText: 'La Liga 25-26',
    bigText: 'Real Madrid\n& Barça',
    cta: 'Voir la collection',
    href: '/ligue/la-liga',
    staticImage: '/images/real_barça.jpg',
  },
  {
    smallText: 'Avant-Match Actuel',
    bigText: "Maillots\nd'Avant-Match",
    cta: 'Voir la collection',
    href: '/shop',
    staticImage: '/images/entrainement.jpg',
  },
]

export function HeroSlideshow({ heroProducts }: { heroProducts: (Product | null)[] }) {
  const paginationRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative w-full bg-[var(--black)]">
      <div className="relative aspect-[3/4] overflow-hidden md:aspect-auto md:h-[360px] lg:h-[390px] xl:h-[410px] 2xl:h-[430px]">
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
        className="!absolute !inset-0 !w-full !h-full"
      >
        {SLIDE_META.map((slide, i) => {
          const product = heroProducts[i]
          const imgSrc = slide.staticImage ?? (product?.photos[0] ?? null)

          return (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full">
                {/* Image du produit */}
                {imgSrc ? (
                  slide.staticImage ? (
                    <Image src={imgSrc} alt={slide.bigText} fill className="object-cover object-center" priority={i === 0} />
                  ) : (
                    <ExternalProductImage
                      src={imgSrc}
                      alt={slide.bigText}
                      fill
                      unoptimized
                      fallbackMode="proxy"
                      bunnyTransform="hero"
                      className="object-cover"
                      priority={i === 0}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-[var(--black-2)]" />
                )}

                {/* Gradient overlay bas */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(28,23,18,0.92) 0%, rgba(28,23,18,0.4) 45%, transparent 70%)' }}
                />

                {/* Texte overlay bas */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-16 md:bottom-auto md:top-1/2 md:max-w-[420px] md:-translate-y-1/2 md:px-12 md:pb-0 lg:left-20 lg:max-w-[460px] lg:px-0 xl:max-w-[500px]">
                  <p
                    className="font-condensed uppercase mb-2 md:mb-3 md:text-xs"
                    style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)' }}
                  >
                    {slide.smallText}
                  </p>
                  <h2
                    className="font-condensed font-bold uppercase text-white leading-tight mb-5 text-[30px] md:mb-6 md:text-[46px] lg:text-[52px] xl:text-[58px]"
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {slide.bigText}
                  </h2>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center justify-center font-condensed font-bold uppercase bg-white text-[var(--black)] hover:bg-[var(--cream)] transition-colors w-full md:w-auto md:px-9"
                    style={{ fontSize: 13, height: 42, borderRadius: 2, letterSpacing: '0.08em' }}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
      </div>

      {/* Pagination dots */}
      <div
        ref={paginationRef}
        className="hero-pagination absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-1.5 md:bottom-8 md:left-12 md:right-auto md:justify-start lg:left-20"
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
