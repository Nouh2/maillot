import Image from 'next/image'
import Link from 'next/link'

const AVIS_IMAGES = [
  '/images/avis/03be5b47-1c8e-4c2a-aa56-6438dd238b17.jpg',
  '/images/avis/24d5b5d7-8afe-43ca-a786-fd9c7ca02b8f.jpg',
  '/images/avis/IMG_8142_2.webp',
  '/images/avis/IMG_8147_2.webp',
  '/images/avis/a56e43d7-a7b1-46a3-a99c-b597f705f065.jpg',
]

const ITEMS = [...AVIS_IMAGES, ...AVIS_IMAGES, ...AVIS_IMAGES]

export function TikTokWall() {
  return (
    <section className="overflow-hidden bg-[var(--black)] py-8 md:py-20">
      <div className="mx-auto mb-6 max-w-7xl px-4 text-center sm:px-6 md:mb-10">
        <p className="mb-2 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)]">
          Communaute MAILLOT ADDICT
        </p>
        <h2 className="font-bebas text-4xl text-white sm:text-5xl md:text-6xl">
          ILS L’ONT REÇU.{' '}
          <span
            style={{
              WebkitTextStroke: '1px rgba(255,255,255,0.3)',
              color: 'transparent',
            }}
            className="md:WebkitTextStroke-[2px]"
          >
            ILS L’ONT PORTÉ.
          </span>
        </h2>
        <p className="mt-4 font-condensed text-sm text-white/50 md:text-base">
          Taguez-nous sur TikTok pour rejoindre le mur de la communauté.
        </p>
      </div>

      <div className="relative">
        <div
          className="flex gap-2 md:gap-4"
          style={{ animation: 'kitlab-scroll 40s linear infinite', width: 'max-content' }}
        >
          {ITEMS.map((src, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 overflow-hidden rounded-xl border border-white/5 bg-[var(--black-2)]"
              style={{
                width: 'clamp(132px, 34vw, 180px)',
                aspectRatio: '4/5',
              }}
            >
              <Image
                src={src}
                alt={`Avis client ${index}`}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                sizes="(max-width: 768px) 160px, 200px"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="https://tiktok.com/@maillotaddict3"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.2em] text-white opacity-80 transition-all hover:opacity-100 active:scale-95"
        >
          <div className="h-6 w-6 shrink-0 text-white">
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7a5 5 0 0 1-5-5h-3v14a3 3 0 1 1-3-3c.3 0 .5.1.7.2V9A6 6 0 1 0 15 15V8a9 9 0 0 0 5 1V7z" />
            </svg>
          </div>
          <span className="relative">
            @maillotaddict3
          </span>
        </Link>
      </div>

      <style>{`
        @keyframes kitlab-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
