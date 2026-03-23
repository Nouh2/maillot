'use client'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function SizeSelector({
  available,
  selected,
  onSelect,
}: {
  available: string[]
  selected: string | null
  onSelect: (size: string) => void
}) {
  return (
    <div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">
        Taille {selected && <span className="text-[var(--terra)] ml-2">{selected}</span>}
      </p>
      <div className="flex gap-2 flex-wrap">
        {SIZES.map((size) => {
          const avail = available.includes(size)
          return (
            <button
              key={size}
              onClick={() => avail && onSelect(size)}
              disabled={!avail}
              aria-label={`Taille ${size}${!avail ? ' — indisponible' : ''}`}
              aria-pressed={selected === size}
              className={`w-12 h-12 border font-condensed text-sm font-semibold transition-all
                ${
                  selected === size
                    ? 'bg-[var(--terra)] text-white border-[var(--terra)]'
                    : avail
                      ? 'border-[var(--cream-3)] hover:border-[var(--terra)] hover:text-[var(--terra)]'
                      : 'border-[var(--cream-3)] text-[var(--cream-3)] cursor-not-allowed line-through'
                }`}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
