'use client'
// src/components/products/StickyAddToCart.tsx
import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'

interface Props {
  productName: string
  price: number
}

export function StickyAddToCart({ productName, price }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('product-cta-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function scrollToForm() {
    document.getElementById('product-cta-sentinel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[var(--cream-3)]"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.3s ease' }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-condensed text-sm font-bold uppercase tracking-wide text-[var(--black)] truncate pr-4">
            {productName}
          </p>
          <p className="font-condensed text-base font-bold text-[var(--terra)] shrink-0">
            {price.toFixed(2)} €
          </p>
        </div>
        <button
          onClick={scrollToForm}
          className="w-full flex items-center justify-center gap-2 bg-[var(--terra)] text-white font-condensed text-sm font-bold uppercase tracking-[0.15em] py-3.5 hover:bg-[var(--terra-2)] transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Ajouter au panier
        </button>
      </div>
    </div>
  )
}
