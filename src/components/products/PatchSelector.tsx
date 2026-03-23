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
      <div className="flex items-end justify-between mb-4">
        <p className="text-[16px] font-bold text-[var(--black)] uppercase">
          Sélectionner un Patch
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelect(null)}
          aria-pressed={selected === null}
          className={`relative px-5 py-4 border transition-all text-left flex flex-col justify-center gap-1
            ${
              selected === null
                ? 'border-[var(--black)] ring-1 ring-[var(--black)] bg-white'
                : 'border-[#E5E5E5] bg-white hover:border-[var(--black)]'
            }`}
        >
          <span className="block text-[15px] font-bold text-[var(--black)]">Classique</span>
          <span className="block text-[13px] text-[#707072]">Sans badge</span>
          {selected === null && (
             <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--black)]" />
          )}
        </button>

        {patches.map((p) => (
          <button
            key={p.code}
            onClick={() => onSelect(p.code)}
            aria-pressed={selected === p.code}
            className={`relative px-5 py-4 border transition-all text-left flex flex-col justify-center gap-1
              ${
                selected === p.code
                  ? 'border-[var(--black)] ring-1 ring-[var(--black)] bg-white'
                  : 'border-[#E5E5E5] bg-white hover:border-[var(--black)]'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[20px] leading-none">{p.emoji}</span>
              <span className="block text-[15px] font-bold text-[var(--black)] leading-tight">{p.name}</span>
            </div>
            <span className="block text-[13px] text-[#707072]">Version Pro</span>
            {selected === p.code && (
               <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--black)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
