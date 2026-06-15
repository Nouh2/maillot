import Image from 'next/image'
import { ChevronDown, SlidersHorizontal, Star } from 'lucide-react'
import type { Product } from '@/types/product'

const PAYMENT_METHODS = [
  { name: 'American Express', src: '/payment/amex.svg' },
  { name: 'Apple Pay', src: '/payment/apple-pay.svg' },
  { name: 'Google Pay', src: '/payment/google-pay.svg' },
  { name: 'Mastercard', src: '/payment/mastercard.svg' },
  { name: 'Shop Pay', src: '/payment/shop-pay.svg' },
  { name: 'Visa', src: '/payment/visa.svg' },
] as const

const DEMO_REVIEWS = [
  {
    name: 'Yohan R.',
    image: '/images/avis/IMG_8142_2.webp',
    text: 'Tres bonne qualite de maillot, bien floque. Le rendu est propre.',
  },
  {
    name: 'Prenfat S.',
    image: '/images/avis/IMG_8147_2.webp',
    text: 'Tres beau maillot, tissu confortable et coupe nickel.',
  },
  {
    name: 'Sarah M.',
    image: '/images/avis/a56e43d7-a7b1-46a3-a99c-b597f705f065.jpg',
    text: 'Livraison suivie et maillot conforme aux photos.',
  },
  {
    name: 'Nabil H.',
    image: '/images/avis/24d5b5d7-8afe-43ca-a786-fd9c7ca02b8f.jpg',
    text: 'Bien emballe, rendu propre et suivi de commande clair.',
  },
] as const

function Stars() {
  return (
    <div className="flex text-[#ff6b21]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
  )
}

export function ProductDetailsPanels({ product }: { product: Product }) {
  return (
    <section className="mt-6 space-y-5">
      <div className="space-y-0 border-y border-[var(--cream-3)]">
        <details className="group border-b border-[var(--cream-3)] py-4" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-[var(--black)]">
            Specifications
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-[var(--grey)]">
            Coupe : {product.jersey_version === 'player' ? 'player ajustee' : 'standard / unisexe'}.
            Prends ta taille habituelle. Type : {product.type}. Saison : {product.season}.
          </p>
        </details>

        <details className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-[var(--black)]">
            Materiaux & Entretien
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-[var(--grey)]">
            Tissu leger et respirant. Lavage doux a froid recommande. Evite le seche-linge pour preserver le flocage.
          </p>
        </details>
      </div>

      <div className="rounded-lg bg-white p-5">
        <h2 className="text-lg font-bold text-[var(--black)]">Paiement & Securite</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <span key={method.name} className="flex h-7 w-11 items-center justify-center rounded border border-[var(--cream-3)] bg-white px-1.5">
              <Image
                src={method.src}
                alt={method.name}
                width={38}
                height={18}
                className="object-contain"
              />
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-medium leading-relaxed text-[var(--grey)]">
          Vos informations de paiement sont traitees de maniere securisee. Nous ne stockons pas les informations de carte bancaire.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stars />
            <span className="font-semibold text-[var(--black)]">Avis clients</span>
          </div>
          <button type="button" aria-label="Filtrer les avis" className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--cream-3)] bg-white text-[var(--black)]">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
        <button type="button" className="mb-5 min-h-[44px] w-full rounded-lg border border-[var(--cream-3)] bg-white px-4 py-3 text-sm font-semibold text-[var(--black)]">
          Ecrire un avis
        </button>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_REVIEWS.map((review) => (
            <article key={review.name} className="overflow-hidden rounded-lg border border-[var(--cream-3)] bg-white">
              <div className="relative aspect-[4/5] bg-[var(--cream)]">
                <Image src={review.image} alt={review.name} fill sizes="50vw" className="object-cover" />
              </div>
              <div className="p-3">
                <p className="font-bold text-[var(--black)]">{review.name}</p>
                <div className="mt-2">
                  <Stars />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--black)]">{review.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
