'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { getLeagueFilterOptions } from '@/lib/catalog'
import type { League } from '@/types/product'
import { ChevronDown, SlidersHorizontal, X, Check } from 'lucide-react'

export function FilterSidebar({ leagues }: { leagues: League[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const leagueOptions = getLeagueFilterOptions(leagues)
  
  const [openDropdown, setOpenDropdown] = useState<'league' | 'type' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setOpenDropdown(null)
  }

  const activeValue = (key: string) => searchParams.get(key) || ''
  const totalActive = (searchParams.has('league') ? 1 : 0) + (searchParams.has('type') ? 1 : 0)

  const TYPES = [
    { value: 'domicile', label: 'Domicile', icon: '🏠' },
    { value: 'exterieur', label: 'Extérieur', icon: '✈️' },
    { value: 'third', label: 'Third', icon: '✨' },
  ]

  return (
    <div className="w-full mb-8 relative z-40" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Total Filters Button */}
        <div className="group flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[var(--black)] bg-white text-sm font-black font-condensed uppercase tracking-widest transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {totalActive > 0 && (
            <span className="bg-[var(--terra)] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1 animate-in zoom-in duration-300">
              {totalActive}
            </span>
          )}
        </div>

        {/* League Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'league' ? null : 'league')}
            className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-2.5 rounded-full border-2 transition-all text-sm font-black font-condensed uppercase tracking-widest ${
              activeValue('league') 
                ? 'border-[var(--black)] bg-[var(--black)] text-white' 
                : 'border-[var(--cream-3)] bg-white text-[var(--black)] hover:border-[var(--black)]'
            }`}
          >
            <span>CHAMPIONNAT {activeValue('league') ? '(1)' : ''}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'league' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'league' && (
            <div className="absolute top-full left-0 mt-2 w-[280px] sm:w-72 bg-white border-2 border-[var(--black)] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="bg-[#2563EB] text-white px-4 py-3 text-sm font-black font-condensed tracking-[2px] uppercase">
                CHAMPIONNAT
              </div>
              <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => updateFilter('league', '')}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider hover:bg-[var(--cream)] border-b border-[var(--cream-3)] transition-colors group"
                >
                  <span>Tous les championnats</span>
                  {!activeValue('league') && <Check className="w-4 h-4 text-[#2563EB]" />}
                </button>
                {leagueOptions.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => updateFilter('league', l.slug)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider hover:bg-[var(--cream)] border-b border-[var(--cream-3)] transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{l.flag_emoji}</span>
                      {l.name}
                    </span>
                    {activeValue('league') === l.slug && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Type Dropdown */}
        <div className="relative flex-1 sm:flex-initial">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
            className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-2.5 rounded-full border-2 transition-all text-sm font-black font-condensed uppercase tracking-widest ${
              activeValue('type') 
                ? 'border-[var(--black)] bg-[var(--black)] text-white' 
                : 'border-[var(--cream-3)] bg-white text-[var(--black)] hover:border-[var(--black)]'
            }`}
          >
            <span>TYPE {activeValue('type') ? '(1)' : ''}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'type' && (
            <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-[280px] sm:w-64 bg-white border-2 border-[var(--black)] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="bg-[#2563EB] text-white px-4 py-3 text-sm font-black font-condensed tracking-[2px] uppercase">
                TYPE DE MAILLOT
              </div>
              <div className="overflow-hidden">
                <button
                  onClick={() => updateFilter('type', '')}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider hover:bg-[var(--cream)] border-b border-[var(--cream-3)] transition-colors group"
                >
                  <span>Tous les types</span>
                  {!activeValue('type') && <Check className="w-4 h-4 text-[#2563EB]" />}
                </button>
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => updateFilter('type', t.value)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider hover:bg-[var(--cream)] border-b border-[var(--cream-3)] transition-colors group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      {t.label}
                    </span>
                    {activeValue('type') === t.value && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear All */}
        {totalActive > 0 && (
          <button 
            onClick={() => router.push(pathname, { scroll: false })}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[var(--terra)] text-[var(--terra)] hover:bg-[var(--terra)] hover:text-white text-sm font-black font-condensed uppercase tracking-widest transition-all group"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="hidden sm:inline">Effacer tout</span>
          </button>
        )}
      </div>
    </div>
  )
}
