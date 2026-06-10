'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { getLeagueFilterOptions } from '@/lib/catalog'
import type { League } from '@/types/product'

type FilterKey = 'league' | 'club' | 'type' | 'date' | 'alpha'

const FILTER_KEYS: FilterKey[] = ['league', 'club', 'type', 'date', 'alpha']

const TYPE_OPTIONS = [
  { value: 'domicile', label: 'Domicile' },
  { value: 'exterieur', label: 'Extérieur' },
  { value: 'third', label: 'Third' },
]

const DATE_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
]

const ALPHA_OPTIONS = [
  { value: 'az', label: 'A à Z' },
  { value: 'za', label: 'Z à A' },
]

interface FilterSidebarProps {
  leagues?: League[]
  clubs?: string[]
  showLeague?: boolean
  showClub?: boolean
  showType?: boolean
  showDate?: boolean
  showAlpha?: boolean
}

export function FilterSidebar({
  leagues = [],
  clubs = [],
  showLeague = leagues.length > 0,
  showClub = clubs.length > 0,
  showType = true,
  showDate = true,
  showAlpha = true,
}: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [openDropdown, setOpenDropdown] = useState<FilterKey | null>(null)
  const leagueOptions = showLeague ? getLeagueFilterOptions(leagues) : []

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
    if (key === 'club' && !showClub) return false
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
    <div className="relative shrink-0 sm:flex-initial">
      <button
        onClick={() => setOpenDropdown(openDropdown === filterKey ? null : filterKey)}
        className={`flex w-full items-center justify-between gap-4 rounded-full border-2 px-6 py-2.5 text-sm font-black font-condensed uppercase tracking-widest transition-all sm:w-auto sm:justify-start ${
          activeValue(filterKey)
            ? 'border-[var(--black)] bg-[var(--black)] text-white'
            : 'border-[var(--cream-3)] bg-white text-[var(--black)] hover:border-[var(--black)]'
        }`}
      >
        <span>
          {buttonLabel} {activeValue(filterKey) ? '(1)' : ''}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openDropdown === filterKey ? 'rotate-180' : ''}`} />
      </button>

      {openDropdown === filterKey ? (
        <div
          className={`absolute top-full ${align === 'right' ? 'right-0 sm:left-auto' : 'left-0'} z-50 mt-2 w-[280px] border-2 border-[var(--black)] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] duration-200 animate-in fade-in slide-in-from-top-2 sm:w-72 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.15)]`}
        >
          <div className="bg-[#2563EB] px-4 py-3 text-sm font-black font-condensed uppercase tracking-[2px] text-white">
            {panelTitle}
          </div>
          <div className="custom-scrollbar max-h-[60vh] overflow-y-auto sm:max-h-80">
            <button
              onClick={() => updateFilter(filterKey, '')}
              className="group flex w-full items-center justify-between border-b border-[var(--cream-3)] px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider transition-colors hover:bg-[var(--cream)]"
            >
              <span>{defaultLabel}</span>
              {!activeValue(filterKey) ? <Check className="h-4 w-4 text-[#2563EB]" /> : null}
            </button>

            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilter(filterKey, option.value)}
                className="group flex w-full items-center justify-between border-b border-[var(--cream-3)] px-5 py-3.5 text-left text-sm font-black font-condensed uppercase tracking-wider transition-colors hover:bg-[var(--cream)]"
              >
                <span>{option.label}</span>
                {activeValue(filterKey) === option.value ? <Check className="h-4 w-4 text-[#2563EB]" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="relative z-40 mb-6 w-full md:mb-8" ref={dropdownRef}>
      <div className="-mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
        <div className="group flex shrink-0 items-center gap-2 rounded-full border-2 border-[var(--black)] bg-white px-4 py-2 text-sm font-black font-condensed uppercase tracking-widest transition-all sm:px-5 sm:py-2.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
          {totalActive > 0 ? (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--terra)] text-[10px] text-white duration-300 animate-in zoom-in">
              {totalActive}
            </span>
          ) : null}
        </div>

        {showLeague
          ? renderDropdown({
              filterKey: 'league',
              buttonLabel: 'Championnat',
              panelTitle: 'Championnat',
              defaultLabel: 'Tous les championnats',
              options: leagueOptions.map((league) => ({ value: league.slug, label: league.name })),
            })
          : null}

        {showClub
          ? renderDropdown({
              filterKey: 'club',
              buttonLabel: 'Équipe',
              panelTitle: 'Équipe',
              defaultLabel: 'Toutes les équipes',
              options: clubs.map((club) => ({ value: club, label: club })),
            })
          : null}

        {showType
          ? renderDropdown({
              filterKey: 'type',
              buttonLabel: 'Type',
              panelTitle: 'Type de maillot',
              defaultLabel: 'Tous les types',
              options: TYPE_OPTIONS,
            })
          : null}

        {showDate
          ? renderDropdown({
              filterKey: 'date',
              buttonLabel: 'Date',
              panelTitle: "Date d'ajout",
              defaultLabel: 'Ordre par défaut',
              options: DATE_OPTIONS,
            })
          : null}

        {showAlpha
          ? renderDropdown({
              filterKey: 'alpha',
              buttonLabel: 'Alphabétique',
              panelTitle: 'Ordre alphabétique',
              defaultLabel: 'Ordre par défaut',
              options: ALPHA_OPTIONS,
              align: 'right',
            })
          : null}

        {totalActive > 0 ? (
          <button
            onClick={clearFilters}
            className="group flex items-center gap-2 rounded-full border-2 border-[var(--terra)] px-6 py-2.5 text-sm font-black font-condensed uppercase tracking-widest text-[var(--terra)] transition-all hover:bg-[var(--terra)] hover:text-white"
          >
            <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span className="hidden sm:inline">Effacer tout</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
