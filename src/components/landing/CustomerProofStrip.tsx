import Image from 'next/image'
import { TrustBadge } from '@/components/ui/TrustBadge'

const CUSTOMER_IMAGES = [
  '/images/avis/03be5b47-1c8e-4c2a-aa56-6438dd238b17.jpg',
  '/images/avis/24d5b5d7-8afe-43ca-a786-fd9c7ca02b8f.jpg',
  '/images/avis/IMG_8142_2.webp',
  '/images/avis/IMG_8147_2.webp',
  '/images/avis/a56e43d7-a7b1-46a3-a99c-b597f705f065.jpg',
] as const

const STRIP_IMAGES = [...CUSTOMER_IMAGES, ...CUSTOMER_IMAGES]

export function CustomerProofStrip() {
  return (
    <section className="overflow-hidden border-y border-[var(--cream-3)] bg-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-3 flex flex-col items-start gap-3">
          <div>
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-[var(--terra)]">Clients réels</p>
            <h2 className="mt-1 font-bebas text-3xl leading-none text-[var(--black)]">Ils l&apos;ont reçu</h2>
          </div>
          <TrustBadge className="w-full justify-between sm:w-auto sm:justify-start" />
        </div>
      </div>

      <div className="flex w-max gap-2 px-3 sm:gap-3 sm:px-4" style={{ animation: 'customer-proof-scroll 32s linear infinite' }}>
        {STRIP_IMAGES.map((src, index) => (
          <div key={`${src}-${index}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--cream)] sm:h-44 sm:w-36">
            <Image
              src={src}
              alt={`Photo client ${index + 1}`}
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes customer-proof-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
