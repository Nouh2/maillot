'use client'
import { useState, useEffect } from 'react'
import { ChevronRight, X } from 'lucide-react'
import type { Patch } from '@/types/product'

// Groupes de patchs pour l'affichage organisé
const PATCH_GROUPS: { label: string; codes: string[] }[] = [
  { label: 'UEFA', codes: ['ucl', 'uel', 'uecl', 'uefa_super_cup', 'nations_league'] },
  { label: 'FIFA', codes: ['world_cup', 'club_world_cup'] },
  { label: 'Amériques & Afrique', codes: ['can', 'copa_america', 'gold_cup', 'afc_cup'] },
  { label: 'Premier League', codes: ['pl_winner', 'fa_cup', 'efl_cup'] },
  { label: 'La Liga', codes: ['laliga_winner', 'copa_del_rey', 'supercopa'] },
  { label: 'Bundesliga', codes: ['bundesliga_winner', 'dfb_pokal'] },
  { label: 'Serie A', codes: ['serie_a_winner', 'coppa_italia', 'supercoppa'] },
  { label: 'Ligue 1', codes: ['ligue1_winner', 'coupe_de_france', 'trophee_champions'] },
  { label: 'Distinctions', codes: ['captain', 'ballon_dor', 'best_fifa'] },
]

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

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (patches.length === 0) return null

  const handleSelect = (code: string | null) => {
    onSelect(code)
    setTimeout(() => setOpen(false), 200)
  }

  const patchMap = Object.fromEntries(patches.map((p) => [p.code, p]))

  return (
    <>
      {/* Trigger */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-[var(--black)] uppercase tracking-[0.12em]">
            Patch officiel
          </p>
          {selected && (
            <button
              onClick={() => onSelect(null)}
              className="text-[11px] text-[var(--grey)] underline underline-offset-2 hover:text-[var(--black)] transition-colors"
            >
              Retirer
            </button>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-[#E0E0E0] hover:border-[var(--black)] transition-all group"
          style={{ borderRadius: 2 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-[3px] self-stretch rounded-full flex-shrink-0"
              style={{ background: selected ? 'var(--terra)' : '#E0E0E0', minHeight: 28 }}
            />
            <div className="text-left">
              <p className="text-[14px] font-bold text-[var(--black)] leading-tight">
                {selectedPatch ? selectedPatch.name : 'Sans patch'}
              </p>
              <p className="text-[11px] text-[#999] mt-0.5">
                {selectedPatch ? 'Patch sélectionné' : 'Maillot classique'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--grey)] uppercase tracking-[0.08em] group-hover:text-[var(--black)] transition-colors">
            Modifier
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{
            background: 'rgba(10,8,6,0.6)',
            backdropFilter: 'blur(4px)',
            animation: 'patch-fade 0.2s ease',
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAF8]"
        style={{
          borderRadius: '12px 12px 0 0',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-3 pb-4 border-b border-[#ECECEC]">
          <div className="w-8 h-[3px] bg-[#DEDEDE] rounded-full mx-auto mb-4" />
          <div className="flex items-end justify-between">
            <div>
              <p className="font-bebas text-[28px] tracking-wide text-[var(--black)] leading-none">
                Patch officiel
              </p>
              <p className="text-[11px] text-[#999] mt-1 uppercase tracking-[0.1em]">
                {patches.length} patchs disponibles
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mb-0.5 w-8 h-8 flex items-center justify-center border border-[#E0E0E0] bg-white hover:border-[var(--black)] transition-colors"
              style={{ borderRadius: 2 }}
            >
              <X className="w-3.5 h-3.5 text-[var(--black)]" />
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 px-4 py-4">

          {/* Option sans patch */}
          <button
            onClick={() => handleSelect(null)}
            className="w-full flex items-center justify-between px-4 py-3 mb-5 border transition-all"
            style={{
              borderRadius: 2,
              borderColor: selected === null ? 'var(--black)' : '#E8E8E8',
              background: selected === null ? 'var(--black)' : 'white',
            }}
          >
            <div className="text-left">
              <p
                className="text-[13px] font-bold uppercase tracking-[0.06em]"
                style={{ color: selected === null ? 'white' : 'var(--black)' }}
              >
                Sans patch
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: selected === null ? 'rgba(255,255,255,0.5)' : '#999' }}
              >
                Maillot classique
              </p>
            </div>
            {selected === null && (
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--terra)' }}
              />
            )}
          </button>

          {/* Groupes */}
          {PATCH_GROUPS.map((group) => {
            const groupPatches = group.codes
              .map((c) => patchMap[c])
              .filter(Boolean)
            if (groupPatches.length === 0) return null

            return (
              <div key={group.label} className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#AAAAAA] mb-2 px-1">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {groupPatches.map((p) => {
                    const isSelected = selected === p.code
                    return (
                      <button
                        key={p.code}
                        onClick={() => handleSelect(p.code)}
                        className="flex items-center gap-2.5 px-3 py-2.5 border text-left transition-all"
                        style={{
                          borderRadius: 2,
                          borderColor: isSelected ? 'var(--black)' : '#EBEBEB',
                          background: isSelected ? 'var(--black)' : 'white',
                          borderLeft: isSelected ? `3px solid var(--terra)` : `1px solid #EBEBEB`,
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[12px] font-bold truncate leading-tight"
                            style={{ color: isSelected ? 'white' : 'var(--black)' }}
                          >
                            {p.name}
                          </p>
                        </div>
                        {isSelected && (
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: 'var(--terra)' }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div style={{ height: 'env(safe-area-inset-bottom, 16px)' }} />
        </div>
      </div>

      <style>{`
        @keyframes patch-fade {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
      `}</style>
    </>
  )
}
