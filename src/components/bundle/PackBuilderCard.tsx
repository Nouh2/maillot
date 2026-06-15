'use client'

import { useState } from 'react'
import { Gift, Plus, Shirt, Trophy, X } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { calculateCartPricing, formatEuro } from '@/lib/cartPricing'
import { normalizeProductTextSeasons } from '@/lib/season'

export type PackBuilderSuggestion = {
  id: string
  slug: string
  name: string
  club: string
  season?: string
  price: number
  photo: string
  sizes: string[]
}

export type PackBuilderSlot = {
  key: string
  productId: string
  slug: string
  name: string
  club: string
  season?: string
  price: number
  photo: string
  size: string | null
  removable?: boolean
}

type PackBuilderCardProps = {
  slots: PackBuilderSlot[]
  suggestions: PackBuilderSuggestion[]
  onAddSuggestion: (suggestion: PackBuilderSuggestion, size: string) => void
  onRemoveSlot?: (slot: PackBuilderSlot) => void
  onCurrentSlotClick?: () => void
  className?: string
}

const FALLBACK_SIZES = ['S', 'M', 'L', 'XL']
const MAX_SLOTS = 3
const JERSEY_COLORS = ['text-[var(--terra)]', 'text-[#1C73D8]', 'text-[#39206D]', 'text-[#05845E]']

function getHeadline(slotCount: number) {
  if (slotCount >= 3) return 'Pack gagnant débloqué'
  if (slotCount >= 2) return '−5 € débloqués ! Plus qu’1 maillot pour le 3e à −50 %'
  return 'Ajoute 2 maillots : le 3e à −50 %'
}

function compactSeason(season?: string) {
  if (!season) return ''
  const rangeMatch = season.match(/^20(\d{2})-20(\d{2})$/)
  if (rangeMatch) return `${rangeMatch[1]}/${rangeMatch[2]}`
  return season
}

function displaySuggestionName(product: PackBuilderSuggestion) {
  const club = product.club || normalizeProductTextSeasons(product.name)
  const season = compactSeason(product.season)
  return [club, season].filter(Boolean).join(' ')
}

function displaySlotName(slot: PackBuilderSlot) {
  const base = slot.club || normalizeProductTextSeasons(slot.name)
  return `${base} · ${slot.size ?? '?'}`
}

function getReward(slotCount: number, discount: number) {
  if (slotCount >= 3) {
    return {
      tone: 'green' as const,
      Icon: Trophy,
      title: `−${formatEuro(discount)} — le 3e maillot à moitié prix`,
      detail: 'La meilleure offre du site',
      label: 'Pack 3/3 ✓',
    }
  }

  if (slotCount >= 2) {
    return {
      tone: 'orange' as const,
      Icon: Gift,
      title: `−${formatEuro(discount)} appliqués`,
      detail: 'Ajoute 1 maillot : le moins cher passe à −50 %',
      label: 'Pack 2/3 — ajoute 1 maillot',
    }
  }

  return {
    tone: 'orange' as const,
    Icon: Gift,
    title: 'Pack 1/3 — ajoute 2 maillots',
    detail: '',
    label: 'Pack 1/3 — ajoute 2 maillots',
  }
}

export function PackBuilderCard({
  slots,
  suggestions,
  onAddSuggestion,
  onRemoveSlot,
  onCurrentSlotClick,
  className = '',
}: PackBuilderCardProps) {
  const [pendingSuggestion, setPendingSuggestion] = useState<PackBuilderSuggestion | null>(null)
  const visibleSlots = slots.slice(0, MAX_SLOTS)
  const slotCount = Math.min(visibleSlots.length, MAX_SLOTS)
  const pricing = calculateCartPricing(visibleSlots.map((slot) => ({ price: slot.price, qty: 1 })))
  const reward = getReward(slotCount, pricing.packDiscount)
  const RewardIcon = reward.Icon
  const visibleSuggestions = suggestions
    .filter((suggestion) => !visibleSlots.some((slot) => slot.slug === suggestion.slug))
    .slice(0, 3)
  const slotModels = [
    { index: 0, emptyLabel: 'Ton maillot' },
    { index: 1, emptyLabel: '−5 € débloqués' },
    { index: 2, emptyLabel: '−50 % sur le 3e' },
  ]
  const rewardToneClass =
    reward.tone === 'green'
      ? 'bg-[#EAF8F1] text-[#065F46]'
      : 'bg-[#FDF0EA] text-[#7B2508]'

  return (
    <section
      className={`mx-auto w-full max-w-[344px] rounded-[16px] border border-[#E8DFD0] bg-[#FDFAF5] p-4 text-[var(--black)] shadow-[0_14px_32px_rgba(28,23,18,0.1)] ${className}`}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-condensed text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--terra)]">COMPOSE TON PACK</p>
        <span className="shrink-0 rounded-full bg-[#FDF0EA] px-2.5 py-1 text-[11px] font-bold leading-none text-[var(--terra)]">
          {slotCount}/3{slotCount >= 3 ? ' ✓' : ''}
        </span>
      </div>

      <h3 key={slotCount} className="pack-headline-bounce mt-2 text-[17px] font-semibold leading-snug text-[var(--black)]">
        {getHeadline(slotCount)}
      </h3>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {slotModels.map(({ index, emptyLabel }) => {
          const slot = visibleSlots[index]
          const isFilled = Boolean(slot)
          const isNext = !isFilled && index === slotCount

          return (
            <button
              key={slot?.key ?? `empty-${index}`}
              type="button"
              onClick={() => {
                if (slot?.removable) onRemoveSlot?.(slot)
                if (index === 0 && !slot?.removable) onCurrentSlotClick?.()
              }}
              className={`group relative flex min-h-[86px] flex-col items-center justify-center rounded-xl border p-2 text-center transition-transform ${
                isFilled
                  ? 'pack-node-bounce border-2 border-[var(--terra)] bg-white'
                  : isNext
                    ? 'pack-next-node border-2 border-dashed border-[var(--terra)] bg-[#FFFCF7] text-[#A88F77]'
                    : 'border-2 border-dashed border-[#D9BFA8] bg-[#FFFCF7] text-[#B9A48E]'
              }`}
              aria-label={isFilled && slot ? displaySlotName(slot) : emptyLabel}
            >
              {isFilled && slot ? (
                <>
                  <span className="relative mb-1.5 h-9 w-9 overflow-hidden rounded-lg bg-[var(--cream)]">
                    {slot.photo ? (
                      <ExternalProductImage
                        src={slot.photo}
                        alt={slot.name}
                        fill
                        unoptimized
                        loading="lazy"
                        fetchPriority="low"
                        fallbackMode="proxy"
                        bunnyTransform="cart"
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <Shirt className={`m-2 h-5 w-5 ${JERSEY_COLORS[index % JERSEY_COLORS.length]}`} strokeWidth={2.2} />
                    )}
                  </span>
                  {slot.removable ? (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--black)] text-white opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                      <X className="h-3 w-3" />
                    </span>
                  ) : null}
                  <span className="line-clamp-1 max-w-full text-[10px] font-medium leading-tight">{displaySlotName(slot)}</span>
                </>
              ) : (
                <>
                  <Plus className="mb-2 h-5 w-5" />
                  <span className="text-[10px] leading-tight">{emptyLabel}</span>
                </>
              )}
            </button>
          )
        })}
      </div>

      {visibleSuggestions.length > 0 && slotCount < MAX_SLOTS ? (
        <div className="mt-4">
          <p className="text-[12px] font-semibold text-[var(--black)]">Les plus ajoutés avec ce maillot</p>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
            {visibleSuggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                toneClass={JERSEY_COLORS[(index + 1) % JERSEY_COLORS.length]}
                onRequestSize={setPendingSuggestion}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className={`mt-4 grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 ${rewardToneClass}`}>
        <div className="flex min-w-0 items-center gap-2">
          <RewardIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-tight">{reward.title}</p>
            {reward.detail ? <p className="mt-0.5 text-[11px] leading-tight">{reward.detail}</p> : null}
          </div>
        </div>
        <div className="text-right">
          <p className="font-condensed text-[18px] font-bold leading-none text-[var(--black)]">{formatEuro(pricing.total)}</p>
          {pricing.discount > 0 ? (
            <p className="mt-1 text-[11px] leading-none text-[var(--grey)]">
              au lieu de <span className="line-through">{formatEuro(pricing.subtotal)}</span>
            </p>
          ) : null}
          <p className="mt-1 text-[11px] leading-none text-[var(--grey)]">livraison incluse</p>
        </div>
      </div>

      {pendingSuggestion ? (
        <div className="fixed inset-0 z-[320] flex items-end bg-black/35 p-3 md:items-center md:justify-center" onClick={() => setPendingSuggestion(null)}>
          <div
            className="w-full rounded-[16px] border border-[#E8DFD0] bg-[#FDFAF5] p-4 shadow-[0_20px_50px_rgba(28,23,18,0.2)] md:max-w-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-condensed text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--terra)]">Choisir la taille</p>
                <p className="mt-1 text-sm font-bold">{displaySuggestionName(pendingSuggestion)}</p>
              </div>
              <button type="button" className="rounded-full p-2 text-[var(--grey)]" onClick={() => setPendingSuggestion(null)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {(pendingSuggestion.sizes.length > 0 ? pendingSuggestion.sizes : FALLBACK_SIZES).slice(0, 8).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    onAddSuggestion(pendingSuggestion, size)
                    setPendingSuggestion(null)
                  }}
                  className="min-h-11 rounded-xl border border-[var(--cream-3)] bg-white text-sm font-bold hover:border-[var(--terra)] hover:text-[var(--terra)]"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function SuggestionCard({
  suggestion,
  toneClass,
  onRequestSize,
}: {
  suggestion: PackBuilderSuggestion
  toneClass: string
  onRequestSize: (suggestion: PackBuilderSuggestion) => void
}) {
  return (
    <div className="w-[96px] shrink-0 rounded-xl border border-[#E8DFD0] bg-white p-2 text-center">
      <div className="relative mx-auto h-14 w-14 overflow-hidden rounded-lg bg-[var(--cream)]">
        {suggestion.photo ? (
          <ExternalProductImage
            src={suggestion.photo}
            alt={suggestion.name}
            fill
            unoptimized
            loading="lazy"
            fetchPriority="low"
            fallbackMode="proxy"
            bunnyTransform="cart"
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <Shirt className={`m-3.5 h-7 w-7 ${toneClass}`} strokeWidth={2.2} aria-hidden="true" />
        )}
      </div>
      <p className="mt-2 line-clamp-2 min-h-[28px] text-[11px] font-bold leading-tight">{displaySuggestionName(suggestion)}</p>
      <p className="mt-0.5 text-[11px] text-[var(--grey)]">{formatEuro(suggestion.price)}</p>
      <button
        type="button"
        onClick={() => onRequestSize(suggestion)}
        className="mt-2 flex min-h-7 w-full items-center justify-center rounded-full border border-[#F1E4D8] bg-[#FFFCF7] px-3 text-[11px] font-bold text-[#B88F78] transition-colors hover:border-[var(--terra)] hover:text-[var(--terra)]"
      >
        Ajouter
      </button>
    </div>
  )
}
