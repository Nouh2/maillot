import Link from 'next/link'

const PHOTO_COLORS = [
  '#C1440E', '#1C1712', '#A83A0C', '#3f3830', '#D4581F',
  '#7a6f62', '#C1440E', '#1C1712', '#A83A0C', '#D4581F',
  '#3f3830', '#7a6f62',
]

const INITIALS = ['FR', 'PL', 'LL', 'RM', 'PS', 'AC', 'MU', 'BM', 'AR', 'OM', 'INT', 'BRA']
const ITEMS = [...INITIALS, ...INITIALS]

export function InstagramWall() {
  return (
    <section className="overflow-hidden bg-[var(--black)] py-12">
      <div className="mx-auto mb-7 max-w-7xl px-4 text-center sm:px-6">
        <p className="mb-2 font-condensed text-xs font-semibold uppercase tracking-[0.3em] text-[var(--terra)]">
          Communauté MAILLOT ADDICT
        </p>
        <h2 className="font-bebas text-4xl text-white sm:text-5xl">
          ILS L'ONT REÇU.{' '}
          <span
            style={{
              WebkitTextStroke: '2px white',
              color: 'transparent',
            }}
          >
            ILS L'ONT PORTÉ.
          </span>
        </h2>
        <p className="mt-2 font-condensed text-sm text-white/50">
          Taguez-nous sur Instagram pour rejoindre le mur de la communauté.
        </p>
      </div>

      <div className="relative">
        <div
          className="flex gap-2"
          style={{ animation: 'kitlab-scroll 32s linear infinite', width: 'max-content' }}
        >
          {ITEMS.map((initials, index) => (
            <div
              key={index}
              className="flex flex-shrink-0 items-center justify-center"
              style={{
                width: 120,
                height: 120,
                background: PHOTO_COLORS[index % PHOTO_COLORS.length],
                borderRadius: 8,
              }}
            >
              <span className="font-bebas text-3xl text-white/20">{initials}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="https://instagram.com/maillotaddict_officiel"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:text-[var(--terra)]"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @MAILLOTADDICT_officiel
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
