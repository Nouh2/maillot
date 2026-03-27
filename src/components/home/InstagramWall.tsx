// src/components/home/InstagramWall.tsx
// Galerie défilante infinie — animation CSS pure, pas de JS
import Link from 'next/link'

// Couleurs de fond pour simuler des photos clients
const PHOTO_COLORS = [
  '#C1440E', '#1C1712', '#A83A0C', '#3f3830', '#D4581F',
  '#7a6f62', '#C1440E', '#1C1712', '#A83A0C', '#D4581F',
  '#3f3830', '#7a6f62',
]

const INITIALS = ['TM', 'SK', 'PD', 'LB', 'MR', 'JL', 'CR', 'AB', 'KD', 'MF', 'RL', 'YB']

// On duplique pour une boucle continue
const ITEMS = [...INITIALS, ...INITIALS]

export function InstagramWall() {
  return (
    <section className="bg-[var(--cream-2)] py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 text-center">
        <p className="font-condensed text-xs uppercase tracking-[0.25em] text-[var(--terra)] mb-2">
          Communauté MAILLOT ADDICT
        </p>
        <h2 className="font-bebas text-4xl text-[var(--black)]">
          1 200+ CLIENTS SATISFAITS
        </h2>
        <p className="font-condensed text-sm text-[var(--grey)] mt-1">Merci pour vos photos ! 📸</p>
      </div>

      {/* Track défilant */}
      <div className="relative">
        <div
          className="flex gap-2"
          style={{ animation: 'kitlab-scroll 30s linear infinite', width: 'max-content' }}
        >
          {ITEMS.map((initials, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center rounded-lg"
              style={{
                width: 120,
                height: 120,
                background: PHOTO_COLORS[i % PHOTO_COLORS.length],
                borderRadius: 8,
              }}
            >
              <span className="font-bebas text-3xl text-white/30">{initials}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-4">
        <Link
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-condensed text-xs text-[var(--grey)] hover:text-[var(--terra)] transition-colors tracking-widest uppercase"
        >
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
