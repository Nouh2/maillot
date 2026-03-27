'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { proxyImage } from '@/lib/images'

export function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync scroll position when active index changes (from thumbnail click)
  useEffect(() => {
    if (photos.length === 0) return

    const el = scrollRef.current
    if (el) {
      el.scrollTo({
        left: el.clientWidth * active,
        behavior: 'smooth'
      })
    }
  }, [active, photos.length])

  if (photos.length === 0) return null

  const handleScroll = () => {
    const el = scrollRef.current
    if (el) {
      const index = Math.round(el.scrollLeft / el.clientWidth)
      if (index !== active) {
        setActive(index)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Outer sizing container — définit l'aspect ratio */}
      <div className="relative w-full aspect-square sm:aspect-[4/5] bg-[var(--cream-2)] rounded-3xl shadow-xs border border-[var(--cream-3)] overflow-hidden">
        {/* Inner scroll container — absolute inset-0 : taille définie par le parent, pas par le contenu */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide sm:cursor-zoom-in"
        >
          {photos.map((p, i) => (
            <div
              key={i}
              className="relative flex-none w-full h-full snap-center bg-transparent"
            >
              <Image
                src={proxyImage(p)}
                alt={`${name} - Photo ${i + 1}`}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnails - Hidden on very small screens or keep them as indicators? */}
      {/* Nike uses them as indicators. Let's keep them refined. */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-1 pb-1 max-w-full">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Photo ${i + 1} de ${name}`}
            className={`group relative flex-shrink-0 h-20 w-20 overflow-hidden rounded-xl border-2 transition-all md:h-24 md:w-24
              ${
                active === i
                  ? 'border-[var(--black)] scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
          >
            <Image
              src={proxyImage(p)}
              alt={`${name} miniature ${i + 1}`}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
            {/* Active mask overlay */}
            {active !== i && <div className="absolute inset-0 bg-white/10 transition-opacity group-hover:opacity-0" />}
          </button>
        ))}
      </div>

      {/* Mobile Dot Indicators */}
      <div className="flex flex-wrap justify-center gap-1.5 md:hidden px-4 w-full max-w-full overflow-hidden">
        {photos.map((_, i) => (
          <div 
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 
              ${active === i ? 'w-6 bg-[var(--black)]' : 'w-1.5 bg-[var(--cream-3)]'}`}
          />
        ))}
      </div>
    </div>
  )
}
