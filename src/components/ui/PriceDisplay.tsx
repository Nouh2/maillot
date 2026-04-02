import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  currentPrice: string
  originalPrice?: string
  promoLabel?: string
  className?: string
  tone?: 'default' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: {
    wrapper: 'gap-1.5',
    current: 'text-sm',
    original: 'text-xs',
    badge: 'text-[9px] px-2 py-0.5',
  },
  md: {
    wrapper: 'gap-2',
    current: 'text-lg',
    original: 'text-sm',
    badge: 'text-[10px] px-2.5 py-0.5',
  },
  lg: {
    wrapper: 'gap-3',
    current: 'text-3xl md:text-5xl',
    original: 'text-base md:text-xl',
    badge: 'text-[11px] px-3 py-1',
  },
} as const

export function PriceDisplay({
  currentPrice,
  originalPrice,
  promoLabel,
  className,
  tone = 'default',
  size = 'md',
}: PriceDisplayProps) {
  const styles = SIZE_CLASSES[size]
  const isLight = tone === 'light'

  return (
    <div className={cn('flex flex-wrap items-center', styles.wrapper, className)}>
      <span
        className={cn(
          'font-condensed font-bold',
          styles.current,
          isLight ? 'text-white' : 'text-[var(--terra)]',
        )}
      >
        {currentPrice}
      </span>

      {originalPrice ? (
        <span
          className={cn(
            'font-condensed line-through',
            styles.original,
            isLight ? 'text-white/60' : 'text-[var(--grey)]',
          )}
        >
          {originalPrice}
        </span>
      ) : null}

      {promoLabel ? (
        <span
          className={cn(
            'rounded-full font-condensed uppercase tracking-[0.18em]',
            styles.badge,
            isLight
              ? 'bg-white/12 text-white'
              : 'bg-[var(--terra-lt)] text-[var(--terra)]',
          )}
        >
          {promoLabel}
        </span>
      ) : null}
    </div>
  )
}
