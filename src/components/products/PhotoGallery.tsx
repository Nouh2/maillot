'use client'
import { useState } from 'react'
import Image from 'next/image'
import { proxyImage } from '@/lib/images'

export function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (photos.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] bg-[var(--cream)]">
        <Image
          src={proxyImage(photos[active])}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex gap-3">
        {photos.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Photo ${i + 1} de ${name}`}
            className={`relative w-20 h-24 border-2 transition-colors ${
              active === i ? 'border-[var(--terra)]' : 'border-[var(--cream-3)]'
            }`}
          >
            <Image
              src={proxyImage(p)}
              alt={`${name} vue ${i + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
