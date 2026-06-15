'use client'

import { useMemo, useState } from 'react'
import { BadgePercent, CheckCircle2, PackagePlus, Sparkles } from 'lucide-react'
import { FAN_JERSEY_PRICE, calculateCartPricing, formatEuro } from '@/lib/cartPricing'

const BUNDLE_OPTIONS = [
  { qty: 1, label: '1 maillot', benefit: 'livraison incluse', icon: PackagePlus },
  { qty: 2, label: '2 maillots', benefit: 'economise 5 EUR', icon: Sparkles },
  { qty: 3, label: '3 maillots', benefit: '3e à -50 %', tag: 'Le plus choisi', icon: BadgePercent },
] as const

function getOptionPrice(qty: number) {
  const pricing = calculateCartPricing([{ price: FAN_JERSEY_PRICE, qty }])
  return {
    total: pricing.total,
    discount: pricing.packDiscount,
  }
}

export function BundleOffer() {
  const [selectedQty, setSelectedQty] = useState(3)
  const selectedPricing = useMemo(() => getOptionPrice(selectedQty), [selectedQty])
  const progress = useMemo(() => Math.min(100, (Math.min(selectedQty, 3) / 3) * 100), [selectedQty])

  const scrollToProducts = () => {
    document.getElementById('selection-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="bundle-offer" className="relative z-[90] mx-auto max-w-7xl scroll-mt-24 px-4 py-7 sm:px-6 md:py-10">
      <div className="overflow-hidden rounded-lg bg-[var(--black)] text-white">
        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <div className="p-5 md:p-8">
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.22em] text-[var(--terra)]">
              Pack malin
            </p>
            <h2 className="mt-2 font-bebas text-5xl leading-[0.9] md:text-7xl">
              Plus tu prends, plus tu gagnes
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              2 maillots : -5 EUR. Dès 3 maillots : le moins cher par tranche de 3 passe à -50 %. Livraison incluse.
            </p>

            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <div className="mb-2 flex items-center justify-between font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                <span>Progression pack</span>
                <span>{Math.min(selectedQty, 3)}/3</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-[var(--terra)] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-[var(--terra)]" />
                Total pack : {formatEuro(selectedPricing.total)}
                {selectedPricing.discount > 0 ? ` - economie ${formatEuro(selectedPricing.discount)}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 pb-5 text-[var(--black)] md:p-6">
            <div className="grid gap-2">
              {BUNDLE_OPTIONS.map((option) => {
                const Icon = option.icon
                const selected = selectedQty === option.qty
                const optionPricing = getOptionPrice(option.qty)

                return (
                  <button
                    key={option.qty}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedQty(option.qty)}
                    className={`grid min-h-[92px] grid-cols-[44px_1fr] gap-3 rounded-lg border p-3 text-left transition-all sm:grid-cols-[44px_1fr_auto] ${
                      selected
                        ? 'border-[var(--terra)] bg-[var(--terra-lt)] shadow-[0_0_0_2px_rgba(193,68,14,0.12)]'
                        : 'border-[var(--cream-3)] bg-[var(--cream)] hover:border-[var(--terra)]/40'
                    }`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[var(--terra)] text-white' : 'bg-white text-[var(--terra)]'}`}>
                      {selected ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-condensed text-xs font-bold uppercase tracking-[0.16em] text-[var(--terra)]">
                        <span>{option.benefit}</span>
                        {'tag' in option ? (
                          <span className="rounded-full bg-[var(--terra)] px-2 py-0.5 text-[10px] tracking-[0.12em] text-white">
                            {option.tag}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block font-bebas text-3xl leading-none text-[var(--black)]">{option.label}</span>
                    </span>
                    <span className="col-start-2 shrink-0 text-left font-condensed text-xs font-bold uppercase tracking-[0.12em] text-[var(--grey)] sm:col-start-auto sm:text-right">
                      {formatEuro(optionPricing.total)}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={scrollToProducts}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-md bg-[var(--terra)] px-5 py-4 font-condensed text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra-2)]"
            >
              Choisir mes maillots
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
