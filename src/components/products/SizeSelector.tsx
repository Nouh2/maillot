import { useState, useRef, useEffect } from 'react'
import { SizeGuideModal } from './SizeGuideModal'
import { ChevronDown, Check } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function SizeSelector({
  available,
  selected,
  onSelect,
  openSignal = 0,
  hasError = false,
}: {
  available: string[]
  selected: string | null
  onSelect: (size: string) => void
  openSignal?: number
  hasError?: boolean
}) {
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (openSignal > 0 && !selected) {
      const timeoutId = window.setTimeout(() => setIsOpen(true), 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [openSignal, selected])

  return (
    <>
      <div className="space-y-2.5" ref={containerRef}>
        <div className="flex items-center justify-between px-1">
          <p className="text-[17px] font-bold text-[var(--black)]">
            Taille: <span className="text-[var(--grey)] font-normal">{selected || 'Sélectionner'}</span>
          </p>
          <button 
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="text-[13px] text-[#707072] underline hover:text-[var(--black)] transition-colors uppercase font-bold tracking-tight"
          >
            Guide des tailles
          </button>
        </div>
        {hasError && !selected ? (
          <p className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-red-600" aria-live="polite">
            Choisis une taille pour continuer
          </p>
        ) : null}
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full flex items-center justify-between bg-white border-2 border-[var(--cream-3)] rounded-2xl px-5 py-3.5 text-[16px] font-bold text-[var(--black)] cursor-pointer transition-all hover:border-[var(--black)] shadow-sm text-left",
              isOpen && "border-[var(--black)] ring-4 ring-[var(--black)]/5",
              hasError && !selected && "border-red-500 ring-4 ring-red-500/10"
            )}
          >
            <span className={cn(!selected && "text-[var(--grey)]")}>
              {selected ? `Taille ${selected}` : 'Choisir une taille'}
            </span>
            <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-180")} />
          </button>

          {/* Custom Dropdown Menu */}
          <div 
            className={cn(
              "absolute left-0 right-0 mt-2 bg-white border-2 border-[var(--black)] rounded-2xl overflow-hidden z-50 shadow-2xl transition-all duration-200 origin-top",
              isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
            )}
          >
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
              <div className="px-6 py-2 border-b border-[var(--cream-3)] mb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--grey)]">Tailles disponibles</span>
              </div>
              {SIZES.map((size) => {
                const isAvailable = available.includes(size)
                const isSelected = selected === size

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      onSelect(size)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 transition-colors text-left",
                      isAvailable ? "hover:bg-[var(--cream)]" : "opacity-40 cursor-not-allowed",
                      isSelected && "bg-[var(--cream)]"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className={cn("text-[17px] font-bold", isAvailable ? "text-[var(--black)]" : "text-[var(--grey)]")}>
                        {size}
                      </span>
                      {!isAvailable && (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">Épuisé</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[var(--black)]" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      <SizeGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  )
}
