'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronRight, X } from 'lucide-react'
import { PATCH_PRICE, formatEuro } from '@/lib/cartPricing'
import type { Patch } from '@/types/product'
import { cn } from '@/lib/utils'

const PATCH_GROUPS: { label: string; codes: string[] }[] = [
  { label: 'UEFA', codes: ['ucl', 'uel', 'uecl', 'uefa_super_cup', 'nations_league'] },
  { label: 'FIFA', codes: ['world_cup', 'club_world_cup'] },
  { label: 'Ameriques & Afrique', codes: ['can', 'copa_america', 'gold_cup', 'afc_cup'] },
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
  selected: string[]
  onSelect: (codes: string[]) => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (patches.length === 0) return null

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onSelect(selected.filter((item) => item !== code))
    } else {
      onSelect([...selected, code])
    }
  }

  const patchMap = Object.fromEntries(patches.map((patch) => [patch.code, patch]))

  return (
    <>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--black)]">Patch officiel</p>
          {selected.length > 0 ? (
            <button
              onClick={() => onSelect([])}
              className="text-[11px] text-[var(--grey)] underline underline-offset-2 transition-colors hover:text-[var(--black)]"
            >
              Tout retirer
            </button>
          ) : null}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="group flex w-full items-center justify-between border border-[#E0E0E0] bg-white px-4 py-3.5 transition-all hover:border-[var(--black)]"
          style={{ borderRadius: 2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-[3px] flex-shrink-0 self-stretch rounded-full" style={{ background: selected.length > 0 ? 'var(--terra)' : '#E0E0E0', minHeight: 28 }} />
            <div className="text-left">
              <p className="text-[14px] font-bold leading-tight text-[var(--black)]">
                {selected.length === 0
                  ? 'Sans patch'
                  : selected.length === 1
                    ? patches.find((patch) => patch.code === selected[0])?.name ?? '1 patch'
                    : `${selected.length} patchs selectionnes`}
              </p>
              <p className="mt-0.5 text-[11px] text-[#999]">
                {selected.length > 0 ? `+${formatEuro(selected.length * PATCH_PRICE)}` : 'Inclus'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--grey)] transition-colors group-hover:text-[var(--black)]">
            Modifier
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[60]"
          style={{
            background: 'rgba(10,8,6,0.6)',
            backdropFilter: 'blur(4px)',
            animation: 'patch-fade 0.2s ease',
          }}
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[70] flex flex-col bg-[#FAFAF8] transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
        )}
        style={{
          borderRadius: '24px 24px 0 0',
          maxHeight: '85vh',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex-shrink-0 border-b border-[#ECECEC] px-5 pt-3 pb-4">
          <div className="mx-auto mb-4 h-[3px] w-8 rounded-full bg-[#DEDEDE]" />
          <div className="flex items-end justify-between">
            <div>
              <p className="font-bebas text-[28px] leading-none tracking-wide text-[var(--black)]">Patchs officiels</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#999]">
                {patches.length} patchs · +{formatEuro(PATCH_PRICE)} / patch · cumul possible
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mb-0.5 flex h-8 w-8 items-center justify-center border border-[#E0E0E0] bg-white transition-colors hover:border-[var(--black)]"
              style={{ borderRadius: 2 }}
            >
              <X className="h-3.5 w-3.5 text-[var(--black)]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <button
            onClick={() => onSelect([])}
            className="mb-5 flex w-full items-center justify-between border px-4 py-3 transition-all"
            style={{
              borderRadius: 2,
              borderColor: selected.length === 0 ? 'var(--black)' : '#E8E8E8',
              background: selected.length === 0 ? 'var(--black)' : 'white',
            }}
          >
            <div className="text-left">
              <p className="text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: selected.length === 0 ? 'white' : 'var(--black)' }}>
                Sans patch
              </p>
              <p className="mt-0.5 text-[11px]" style={{ color: selected.length === 0 ? 'rgba(255,255,255,0.5)' : '#999' }}>
                Maillot classique
              </p>
            </div>
            {selected.length === 0 ? <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: 'var(--terra)' }} /> : null}
          </button>

          {PATCH_GROUPS.map((group) => {
            const groupPatches = group.codes.map((code) => patchMap[code]).filter(Boolean)
            if (groupPatches.length === 0) return null

            return (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#AAAAAA]">{group.label}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {groupPatches.map((patch) => {
                    const isSelected = selected.includes(patch.code)

                    return (
                      <button
                        key={patch.code}
                        onClick={() => toggle(patch.code)}
                        className={cn(
                          'group/item relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 px-5 py-4 transition-all duration-300',
                          isSelected ? 'scale-[1.02] border-[var(--black)] bg-white shadow-md' : 'border-[var(--cream-3)] bg-white hover:border-[var(--grey)]',
                        )}
                      >
                        {isSelected ? <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[var(--terra)]" /> : null}

                        <div className="min-w-0 flex-1">
                          <p className={cn('truncate text-[15px] font-bold leading-tight transition-colors', isSelected ? 'text-[var(--black)]' : 'text-[var(--black)]/80')}>
                            {patch.name}
                          </p>
                          <p className={cn('mt-1 text-[12px] font-medium transition-colors', isSelected ? 'text-[var(--terra)]' : 'text-[var(--grey)]')}>
                            +{formatEuro(PATCH_PRICE)}
                          </p>
                        </div>

                        <div
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300',
                            isSelected ? 'scale-110 border-[var(--black)] bg-[var(--black)]' : 'border-[var(--cream-3)] group-hover/item:border-[var(--grey)]',
                          )}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={4} /> : null}
                        </div>
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
