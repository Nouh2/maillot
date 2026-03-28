'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { getLeagueFilterOptions } from '@/lib/catalog'
import type { League } from '@/types/product'

type FilterKey = 'league' | 'type' | 'date' | 'alpha'

const FILTER_KEYS: FilterKey[] = ['league', 'type', 'date', 'alpha']

const TYPE_OPTIONS = [
  { value: 'domicile', label: 'Domicile' },
  { value: 'exterieur', label: 'Exterieur' },
  { value: 'third', label: 'Third' },
]

const DATE_OPTIONS = [
  { value: 'recent', label: 'Plus recents' },
  { value: 'oldest', label: 'Plus anciens' },
]

const ALPHA_OPTIONS = [
  { value: 'az', label: 'A a Z' },
  { value: 'za', label: 'Z a A' },
]

interface FilterSidebarProps {
  leagues?: League[]
  showLeague?: boolean
  showType?: boolean
  showDate?: boolean
  showAlpha?: boolean
}

export function FilterSidebar({
  leagues = [],
  showLeague = leagues.length > 0,
  showType = true,
  showDate = true,
  showAlpha = true,
}: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const leagueOptions = showLeague ? getLeagueFilterOptions(leagues) : []

  const [openDropdown, setOpenDropdown] = useState<FilterKey | null>(null)
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

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const updateFilter = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    pushParams(params)
    setOpenDropdown(null)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of FILTER_KEYS) {
      params.delete(key)
    }

    pushParams(params)
    setOpenDropdown(null)
  }

  const activeValue = (key: FilterKey) => searchParams.get(key) || ''
  const totalActive = FILTER_KEYS.filter((key) => {
    if (key === 'league' && !showLeague) return false
    if (key === 'type' && !showType) return false
    if (key === 'date' && !showDate) return false
    if (key === 'alpha' && !showAlpha) return false
    return searchParams.has(key)
  }).length

  const renderDropdown = ({
    filterKey,
    buttonLabel,
    panelTitle,
    defaultLabel,
    options,
    align = 'left',
  }: {
    filterKey: FilterKey
    buttonLabel: string
    panelTitle: string
    defaultLabel: string
    options: { value: string; label: string }[]
    align?: 'left' | 'right'
  }) => (
    <div className="relative flex-1 sm:flex-initial">
      <button
        onClick={() => setOpenDropdown(openDropdown === filterKey ? null : filterKey)}
        className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-2.5 rounded-full border-2 transition-all text-sm font-black font-condensed uppercase tracking-widest ${
          activeValue(filterKey)
            ? 'border-[var(--black)] bg-[var(--black)] text-white'
            : 'border-[var(--cream-3)] bg-white text-[var(--black)] hover:border-[var(--black)]'
        }`}
      >
        <span>{buttonLabel} {activeValue(filterKey) ? '(1)' : ''}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === filterKey ? 'rotate-180' : ''}`} />
      </button>

      {openDropdown === filterKey && (
        <div className={`absolute top-full ${align === 'right' ? 'right-0 sm:left-auto' : 'left-0'} mt-2 w-[280px] sm:w-72 bg-white border-2 border-[var(--black)] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-2 duration-200 z-50`}>
          <div className="bg-[#2563EB] text-white px-4 py-3 text-sm font-black font-condensed tracking-[2px] uppercase">
            {panelTitle}
          </div>
          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => updateFilter(filterKey, '')}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider hover:bg-[var(--cream)] border-b border-[var(--cream-3)] transition-colors group"
            >
              <span>{defaultLabel}</span>
              {!activeValue(filterKey) && <Check className="w-4 h-4 text-[#2563EB]" />}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilter(filterKey, option.value)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider hover:bg-[var(--cream)] border-b border-[var(--cream-3)] transition-colors group"
              >
                <span>{option.label}</span>
                {activeValue(filterKey) === option.value && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full mb-8 relative z-40" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="group flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[var(--black)] bg-white text-sm font-black font-condensed uppercase tracking-widest transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {totalActive > 0 && (
            <span className="bg-[var(--terra)] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1 animate-in zoom-in duration-300">
              {totalActive}
            </span>
          )}
        </div>

        {showLeague && renderDropdown({
          filterKey: 'league',
          buttonLabel: 'Championnat',
          panelTitle: 'Championnat',
          defaultLabel: 'Tous les championnats',
          options: leagueOptions.map((league) => ({
            value: league.slug,
            label: league.name,
          })),
        })}

        {showType && renderDropdown({
          filterKey: 'type',
          buttonLabel: 'Type',
          panelTitle: 'Type de maillot',
          defaultLabel: 'Tous les types',
          options: TYPE_OPTIONS,
        })}

        {showDate && renderDropdown({
          filterKey: 'date',
          buttonLabel: 'Date',
          panelTitle: "Date d'ajout",
          defaultLabel: 'Ordre par defaut',
          options: DATE_OPTIONS,
        })}

        {showAlpha && renderDropdown({
          filterKey: 'alpha',
          buttonLabel: 'Alphabetique',
          panelTitle: 'Ordre alphabetique',
          defaultLabel: 'Ordre par defaut',
          options: ALPHA_OPTIONS,
          align: 'right',
        })}

        {totalActive > 0 && (
          <button
            onClick={clearFilters}
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
