'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { League } from '@/types/product'

export function FilterSidebar({ leagues }: { leagues: League[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const active = (key: string, value: string) => searchParams.get(key) === value

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white border border-[var(--cream-3)] p-6 sticky top-20">
        <h3 className="font-bebas text-2xl tracking-widest mb-6">Filtres</h3>

        {/* League filter */}
        <div className="mb-6">
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">Championnat</p>
          <div className="space-y-2">
            {leagues.map((l) => (
              <label key={l.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active('league', l.slug)}
                  onChange={() => updateFilter('league', l.slug)}
                  className="accent-[var(--terra)]"
                />
                <span className="text-sm group-hover:text-[var(--terra)] transition-colors">
                  {l.flag_emoji} {l.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="mb-6">
          <p className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey)] mb-3">Type</p>
          <div className="space-y-2">
            {[['domicile', 'Domicile'], ['exterieur', 'Extérieur'], ['third', 'Third']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={active('type', v)}
                  onChange={() => updateFilter('type', v)}
                  className="accent-[var(--terra)]"
                />
                <span className="text-sm group-hover:text-[var(--terra)] transition-colors">{l}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
