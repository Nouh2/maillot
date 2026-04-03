'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'

export function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) return null

  const activePhoto = photos[active] ?? photos[0]
  const goToPrevious = () => setActive((current) => (current === 0 ? photos.length - 1 : current - 1))
  const goToNext = () => setActive((current) => (current === photos.length - 1 ? 0 : current + 1))

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[var(--cream-3)] bg-[var(--cream-2)] shadow-xs sm:aspect-[4/5]">
        <button
          type="button"
          onClick={goToNext}
          aria-label={`Voir la photo suivante de ${name}`}
          className="absolute inset-0 z-10 cursor-pointer"
        />

        <ExternalProductImage
          key={activePhoto}
          src={activePhoto}
          alt={`${name} - Photo ${active + 1}`}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 hover:scale-105"
          priority={active === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                goToPrevious()
              }}
              aria-label={`Voir la photo precedente de ${name}`}
              className="absolute top-1/2 left-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--black)] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                goToNext()
              }}
              aria-label={`Voir la photo suivante de ${name}`}
              className="absolute top-1/2 right-3 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--black)] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      <div className="scrollbar-hide flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
        {photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Photo ${index + 1} de ${name}`}
            className={`group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all md:h-24 md:w-24 ${
              active === index ? 'scale-105 border-[var(--black)] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <ExternalProductImage
              src={photo}
              alt={`${name} miniature ${index + 1}`}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
            {active !== index ? <div className="absolute inset-0 bg-white/10 transition-opacity group-hover:opacity-0" /> : null}
          </button>
        ))}
      </div>

      <div className="flex w-full max-w-full flex-wrap justify-center gap-1.5 overflow-hidden px-4 md:hidden">
        {photos.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Selectionner la photo ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              active === index ? 'w-6 bg-[var(--black)]' : 'w-1.5 bg-[var(--cream-3)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
