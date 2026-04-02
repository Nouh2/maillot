'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { formatEuro } from '@/lib/cartPricing'

interface Props {
  productName: string
  currentPrice: number
  originalPrice?: number | null
  promoLabel?: string | null
}

export function StickyAddToCart({ productName, currentPrice, originalPrice, promoLabel }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('product-cta-sentinel')
    if (!sentinel) return

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const scrollToForm = () => {
    document.getElementById('product-cta-sentinel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-full overflow-hidden border-t border-[var(--cream-3)] bg-white md:hidden"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s ease' }}
    >
      <div className="w-full max-w-full overflow-hidden px-4 py-3" style={{ height: '108px' }}>
        <div className="mb-2 flex w-full items-center justify-between overflow-hidden">
          <p className="min-w-0 flex-1 truncate pr-4 font-condensed text-sm font-bold uppercase tracking-wide text-[var(--black)]">
            {productName}
          </p>

          <PriceDisplay
            currentPrice={formatEuro(currentPrice)}
            originalPrice={originalPrice ? formatEuro(originalPrice) : undefined}
            promoLabel={promoLabel ?? undefined}
            size="sm"
            className="justify-end"
          />
        </div>

        <button
          onClick={scrollToForm}
          className="flex w-full items-center justify-center gap-2 bg-[var(--terra)] py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[var(--terra-2)]"
        >
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier
        </button>
      </div>
    </div>
  )
}
