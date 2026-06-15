'use client'

import { Check, Gift, Trophy } from 'lucide-react'
import type { CartPricingBreakdown } from '@/lib/cartPricing'
import { formatEuro } from '@/lib/cartPricing'

type SummerPackCardProps = {
  pricing: CartPricingBreakdown
  maxRewardAmount?: number
  className?: string
}

const milestones = [
  { threshold: 1, label: '1 maillot', marker: '1' },
  { threshold: 2, label: '-5€ / 2 maillots', marker: '-5€' },
  { threshold: 3, label: '-50% / 3e maillot', marker: '-50%' },
] as const

function getStage(itemCount: number) {
  if (itemCount >= 3) return 2
  if (itemCount >= 2) return 1
  return 0
}

function getHeadline(itemCount: number) {
  if (itemCount >= 3) return 'Pack gagnant débloqué'
  if (itemCount >= 2) return "-5 € débloqués ! Plus qu'1 maillot pour le 3e à -50 %"
  return 'Ajoute 1 maillot, débloque -5 €'
}

function getRewardCopy(pricing: CartPricingBreakdown, maxRewardAmount: number) {
  const promoWins = pricing.discountSource === 'promo_code' && pricing.packDiscount > 0

  if (promoWins) {
    return {
      tone: 'orange' as const,
      Icon: Gift,
      title: `Pack détecté : ${formatEuro(pricing.packDiscount)} d'économie`,
      detail: `Code ${pricing.promoCode} appliqué car plus avantageux`,
    }
  }

  if (pricing.itemCount >= 3) {
    const discountedLabel =
      pricing.packDiscountedItemCount > 1
        ? `${pricing.packDiscountedItemCount} maillots à moitié prix`
        : 'le 3e maillot à moitié prix'

    return {
      tone: 'green' as const,
      Icon: Trophy,
      title: `-${formatEuro(pricing.packDiscount)} — ${discountedLabel}`,
      detail: 'La meilleure offre du site',
    }
  }

  if (pricing.itemCount >= 2) {
    return {
      tone: 'orange' as const,
      Icon: Gift,
      title: `-${formatEuro(pricing.packDiscount)} appliqués`,
      detail: 'Ajoute 1 maillot : le moins cher passe à -50 %',
    }
  }

  return {
    tone: 'orange' as const,
    Icon: Gift,
    title: `Économise jusqu'à ${formatEuro(maxRewardAmount)}`,
    detail: 'Le 3e maillot (le moins cher) à moitié prix',
  }
}

export function SummerPackCard({ pricing, maxRewardAmount = 12.95, className = '' }: SummerPackCardProps) {
  const stage = getStage(pricing.itemCount)
  const progress = stage === 0 ? 0 : stage === 1 ? 50 : 100
  const badge = `Palier ${stage}/2${stage === 2 ? ' ✓' : ''}`
  const reward = getRewardCopy(pricing, maxRewardAmount)
  const RewardIcon = reward.Icon
  const rewardToneClass =
    reward.tone === 'green'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-950'
      : 'border-[#F7DED4] bg-[#FDF0EA] text-[#7B2508]'

  return (
    <section
      className={`rounded-[16px] border border-[#E8DFD0] bg-[#FDFAF5] p-4 text-[var(--black)] shadow-[0_16px_34px_rgba(28,23,18,0.1)] ${className}`}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-condensed text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--terra)]">PACK ÉTÉ</p>
        <span className="shrink-0 rounded-full bg-[#FDF0EA] px-2.5 py-1 text-[11px] font-bold leading-none text-[var(--terra)]">
          {badge}
        </span>
      </div>

      <h3 key={stage} className="pack-headline-bounce mt-2 text-[17px] font-semibold leading-snug text-[var(--black)]">
        {getHeadline(pricing.itemCount)}
      </h3>

      <div className="relative mt-6 px-1" role="progressbar" aria-valuemin={0} aria-valuemax={2} aria-valuenow={stage}>
        <div className="absolute left-[15px] right-[15px] top-[11px] h-1.5 rounded-full bg-[#EDE3D4]" />
        <div
          className="pack-progress-fill absolute left-[15px] top-[11px] h-1.5 rounded-full bg-[var(--terra)]"
          style={{ width: `calc((100% - 30px) * ${progress / 100})` }}
        />

        <div className="relative grid grid-cols-3 items-start">
          {milestones.map((milestone, index) => {
            const reached = pricing.itemCount >= milestone.threshold
            const next = !reached && index === Math.min(stage + 1, 2)
            const future = !reached && !next
            const nodeClass = reached
              ? 'pack-node-bounce border-[var(--terra)] bg-[var(--terra)] text-white'
              : next
                ? 'pack-next-node scale-110 border-[var(--terra)] bg-[#FDFAF5] text-[var(--terra)]'
                : 'border-[#E1D6C8] bg-[#E8DFD0] text-[#A89F92]'

            return (
              <div key={milestone.threshold} className="flex min-w-0 flex-col items-center gap-1 text-center">
                <span
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold leading-none transition-all duration-300 ${nodeClass}`}
                  aria-label={`${milestone.label} ${reached ? 'atteint' : next ? 'prochain palier' : 'à venir'}`}
                >
                  {reached ? <Check className="h-4 w-4" strokeWidth={3} /> : milestone.marker}
                </span>
                <span className={`text-[10px] leading-tight ${future ? 'text-[#A89F92]' : 'text-[var(--grey)]'}`}>{milestone.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={`mt-5 grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-xl border px-3 py-3 ${rewardToneClass}`}>
        <RewardIcon className="h-5 w-5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-tight">{reward.title}</p>
          <p className="mt-0.5 text-[12px] leading-tight">{reward.detail}</p>
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
    </section>
  )
}
