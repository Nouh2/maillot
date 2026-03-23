'use client'
import type { Patch } from '@/types/product'

export function PatchSelector({
  patches,
  selected,
  onSelect,
}: {
  patches: Patch[]
  selected: string | null
  onSelect: (code: string | null) => void
}) {
  if (patches.length === 0) return null

  return (
    <div>
      <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">
        Patch optionnel
      </p>
      <div className="space-y-2">
        <button
          onClick={() => onSelect(null)}
          aria-pressed={selected === null}
          className={`w-full text-left px-4 py-3 border font-condensed text-sm tracking-wide transition-all
            ${
              selected === null
                ? 'border-[var(--terra)] bg-[var(--terra-lt)] text-[var(--terra)]'
                : 'border-[var(--cream-3)] hover:border-[var(--terra)]'
            }`}
        >
          Sans patch
        </button>
        {patches.map((p) => (
          <button
            key={p.code}
            onClick={() => onSelect(p.code)}
            aria-pressed={selected === p.code}
            className={`w-full text-left px-4 py-3 border font-condensed text-sm tracking-wide transition-all
              ${
                selected === p.code
                  ? 'border-[var(--terra)] bg-[var(--terra-lt)] text-[var(--terra)]'
                  : 'border-[var(--cream-3)] hover:border-[var(--terra)]'
              }`}
          >
            <span className="mr-2">{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
