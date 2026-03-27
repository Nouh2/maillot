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
      {/* Main Container - Scroll Snap on Mobile */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex aspect-square w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-white scrollbar-hide sm:aspect-[4/5] sm:cursor-zoom-in"
      >
        {photos.map((p, i) => (
          <div 
            key={i} 
            className="relative h-full w-full flex-shrink-0 snap-center bg-white"
          >
            <Image
              src={proxyImage(p)}
              alt={`${name} - Photo ${i + 1}`}
              fill
              unoptimized
              className="object-contain p-3 sm:p-4"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* Thumbnails - Hidden on very small screens or keep them as indicators? */}
      {/* Nike uses them as indicators. Let's keep them refined. */}
      <div className="flex gap-3 px-1">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Photo ${i + 1} de ${name}`}
            className={`group relative h-20 w-16 overflow-hidden border-2 transition-all md:h-24 md:w-20
              ${
                active === i 
                  ? 'border-[var(--black)] scale-105 shadow-sm' 
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
      <div className="flex justify-center gap-2 md:hidden">
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
