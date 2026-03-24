'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, X, Check } from 'lucide-react'
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
  const [open, setOpen] = useState(false)
  const selectedPatch = patches.find((p) => p.code === selected)

  // Empêche le scroll du body quand le sheet est ouvert
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (patches.length === 0) return null

  const handleSelect = (code: string | null) => {
    onSelect(code)
    setTimeout(() => setOpen(false), 160)
  }

  return (
    <>
      {/* Trigger compact */}
      <div>
        <p className="text-[13px] font-bold text-[var(--black)] uppercase tracking-wide mb-2">
          Patch
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 border border-[#E5E5E5] bg-white hover:border-[var(--black)] transition-colors"
          style={{ borderRadius: 2 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">
              {selectedPatch ? selectedPatch.emoji : '🏷️'}
            </span>
            <div className="text-left">
              <span className="block text-[14px] font-bold text-[var(--black)]">
                {selectedPatch ? selectedPatch.name : 'Sans patch'}
              </span>
              <span className="block text-[11px] text-[var(--grey)]">
                {selectedPatch ? 'Version Pro' : 'Maillot classique'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--grey)] flex-shrink-0" />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          style={{ backdropFilter: 'blur(2px)', animation: 'fade-in 0.2s ease' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white"
        style={{
          borderRadius: '16px 16px 0 0',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle + Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0F0F0]">
          <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <p className="font-bebas text-2xl text-[var(--black)] tracking-wide">
              Choisir un patch
            </p>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#EBEBEB] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--black)]" />
            </button>
          </div>
        </div>

        {/* Options scrollables */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {/* Option sans patch */}
          <PatchOption
            emoji="🏷️"
            name="Sans patch"
            description="Maillot classique, sans badge"
            isSelected={selected === null}
            onSelect={() => handleSelect(null)}
          />

          {/* Séparateur */}
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--grey)] mt-4 mb-2 px-1">
            Badges disponibles
          </p>

          {patches.map((p) => (
            <PatchOption
              key={p.code}
              emoji={p.emoji}
              name={p.name}
              description="Version Pro"
              isSelected={selected === p.code}
              onSelect={() => handleSelect(p.code)}
            />
          ))}

          {/* Espace pour iOS safe area */}
          <div className="h-6" />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
      `}</style>
    </>
  )
}

function PatchOption({
  emoji,
  name,
  description,
  isSelected,
  onSelect,
}: {
  emoji: string
  name: string
  description: string
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 px-4 py-3.5 mb-2 transition-all text-left"
      style={{
        borderRadius: 8,
        background: isSelected ? '#1C1712' : '#FAFAFA',
        border: `1.5px solid ${isSelected ? '#1C1712' : '#EFEFEF'}`,
      }}
    >
      <span
        className="text-2xl flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg"
        style={{ background: isSelected ? 'rgba(255,255,255,0.1)' : '#F0F0F0' }}
      >
        {emoji}
      </span>
      <div className="flex-1">
        <p
          className="text-[15px] font-bold leading-tight"
          style={{ color: isSelected ? '#fff' : '#1C1712' }}
        >
          {name}
        </p>
        <p
          className="text-[12px] mt-0.5"
          style={{ color: isSelected ? 'rgba(255,255,255,0.55)' : '#999' }}
        >
          {description}
        </p>
      </div>
      {isSelected && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--terra)] flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}
