'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ShieldCheck, Star, Truck } from 'lucide-react'

const SOCIAL_PROOF_ITEMS = [
  {
    name: 'Yanis R',
    avatar: '/images/avis/03be5b47-1c8e-4c2a-aa56-6438dd238b17.jpg',
    text: 'Franchement lourd, le flocage est propre. Reçu vite, le rendu en vrai est encore mieux.',
  },
  {
    name: 'Sarah M',
    avatar: '/images/avis/a56e43d7-a7b1-46a3-a99c-b597f705f065.jpg',
    text: 'Taille nickel, super confortable. Je vais en reprendre un autre direct.',
  },
  {
    name: 'Nabil H',
    avatar: '/images/avis/24d5b5d7-8afe-43ca-a786-fd9c7ca02b8f.jpg',
    text: 'Maillot bien emballé, suivi clair et qualité au top.',
  },
  {
    name: 'Karim B',
    avatar: '/images/avis/IMG_8147_2.webp',
    text: 'Reçu nickel, les détails sont propres et la taille tombe bien.',
  },
] as const

function formatDeliveryDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(date)
}

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export function ProductConversionProof() {
  const [deliveryRange] = useState(() => `${formatDeliveryDate(addDays(10))} - ${formatDeliveryDate(addDays(14))}`)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = SOCIAL_PROOF_ITEMS[activeIndex]

  const showPrevious = () => {
    setActiveIndex((current) => (current === 0 ? SOCIAL_PROOF_ITEMS.length - 1 : current - 1))
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % SOCIAL_PROOF_ITEMS.length)
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[var(--black)]">Commande rapide et sécurisée</h2>
        <div className="relative mt-3 rounded-xl bg-white p-3">
          <button
            type="button"
            aria-label="Avis précédent"
            onClick={showPrevious}
            className="absolute -left-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--cream-3)] bg-white text-[var(--grey)]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Avis suivant"
            onClick={showNext}
            className="absolute -right-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--cream-3)] bg-white text-[var(--grey)]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <article className="flex min-h-[92px] items-center gap-3 rounded-lg bg-[var(--cream)] p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
              <Image src={activeItem.avatar} alt={activeItem.name} fill sizes="48px" className="object-cover" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                <ShieldCheck className="h-3 w-3" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--black)]">{activeItem.name}</p>
                <div className="flex text-[#ff6b21]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--black)]">{activeItem.text}</p>
            </div>
          </article>
          <div className="mt-2 flex justify-center gap-1">
            {SOCIAL_PROOF_ITEMS.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-label={`Afficher avis ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${activeIndex === index ? 'w-5 bg-[var(--terra)]' : 'w-1.5 bg-[var(--cream-3)]'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[var(--black)]">
        <Truck className="h-5 w-5" />
        <p className="text-base font-semibold">Livraison estimée : {deliveryRange}</p>
      </div>

    </section>
  )
}
