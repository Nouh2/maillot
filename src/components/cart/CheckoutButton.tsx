'use client'

import { Button } from '@/components/ui/Button'
import { formatEuro } from '@/lib/cartPricing'
import { getStoredAttribution, trackEvent } from '@/lib/tracking'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

interface CheckoutButtonProps {
  className?: string
  fullWidth?: boolean
}

export function CheckoutButton({ className, fullWidth = true }: CheckoutButtonProps) {
  const { items, total, customerEmail, marketingOptIn } = useCartStore()

  const handleCheckout = async () => {
    if (items.length === 0) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      window.alert('Renseigne un email valide pour recevoir le suivi de commande.')
      return
    }

    const attribution = getStoredAttribution()
    trackEvent('begin_checkout', {
      item_count: items.reduce((sum, item) => sum + item.qty, 0),
      value: total(),
    })

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email: customerEmail,
          marketingOptIn,
          attribution,
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
      window.alert('Impossible de lancer le paiement pour le moment.')
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      size="lg"
      className={cn(fullWidth ? 'w-full' : '', className)}
      disabled={items.length === 0}
    >
      Commander - {formatEuro(total())}
    </Button>
  )
}
