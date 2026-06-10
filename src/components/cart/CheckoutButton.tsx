'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatEuro } from '@/lib/cartPricing'
import { getStoredAttribution, trackBeginCheckout, trackEvent } from '@/lib/tracking'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

interface CheckoutButtonProps {
  className?: string
  fullWidth?: boolean
}

export function CheckoutButton({ className, fullWidth = true }: CheckoutButtonProps) {
  const { items, total, customerEmail, marketingOptIn, promoCode } = useCartStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0 || loading) return

    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError('Renseigne un email valide pour recevoir le suivi de commande.')
      return
    }

    const attribution = getStoredAttribution()
    trackBeginCheckout({
      items,
      value: total(),
      marketingOptIn,
      promoCode,
    })

    try {
      setLoading(true)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email: customerEmail,
          marketingOptIn,
          attribution,
          promoCode,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? `Erreur ${response.status}`)
      }

      trackEvent('checkout_redirected', {
        item_count: items.reduce((sum, item) => sum + item.qty, 0),
        marketing_opt_in: marketingOptIn,
      })

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout echoue', error)
      setError(error instanceof Error ? error.message : 'Impossible de lancer le paiement pour le moment.')
      setLoading(false)
    }
  }

  return (
    <div className={cn(fullWidth ? 'w-full' : '', className)}>
      {error ? (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        onClick={handleCheckout}
        size="lg"
        className="w-full"
        disabled={items.length === 0 || loading}
      >
        {loading ? 'Redirection paiement...' : `Commander - ${formatEuro(total())}`}
      </Button>
    </div>
  )
}
