'use client'

import { Button } from '@/components/ui/Button'
import { formatEuro } from '@/lib/cartPricing'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

interface CheckoutButtonProps {
  className?: string
  fullWidth?: boolean
}

export function CheckoutButton({ className, fullWidth = true }: CheckoutButtonProps) {
  const { items, total } = useCartStore()

  const handleCheckout = async () => {
    if (items.length === 0) return

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) throw new Error(`Erreur ${response.status}`)

      const { url } = await response.json()
      if (url) window.location.href = url
    } catch (error) {
      console.error('Checkout echoue', error)
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
