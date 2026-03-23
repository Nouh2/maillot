'use client'

import { useState } from 'react'
import { SizeGuideModal } from './SizeGuideModal'

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
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <>
      <div>
        <div className="flex items-end justify-between mb-4">
          <p className="text-[16px] font-bold text-[var(--black)] uppercase">
            Choisir une Taille
          </p>
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="text-[14px] text-[#707072] underline hover:text-[var(--black)] transition-colors"
          >
            Guide des tailles
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SIZES.map((size) => {
            const avail = available.includes(size)
            return (
              <button
                key={size}
                onClick={() => avail && onSelect(size)}
                disabled={!avail}
                aria-label={`Taille ${size}${!avail ? ' — indisponible' : ''}`}
                aria-pressed={selected === size}
                className={`relative h-12 border transition-all flex items-center justify-center text-[15px] font-bold
                  ${
                    selected === size
                      ? 'border-[var(--black)] ring-1 ring-[var(--black)] bg-white text-[var(--black)]'
                      : avail
                        ? 'border-[#E5E5E5] bg-white hover:border-[var(--black)] text-[var(--black)]'
                        : 'border-[#F5F5F5] bg-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed'
                  }`}
              >
                {size}
                {!avail && (
                  <div className="absolute inset-0 w-full h-[1px] bg-[#CCCCCC] top-1/2 -rotate-45 transform origin-center" />
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      <SizeGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  )
}
