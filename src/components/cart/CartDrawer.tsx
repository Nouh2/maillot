'use client'
import { useCartStore } from '@/store/cart'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { items, isOpen, closeCart, total } = useCartStore()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--cream-3)]">
          <h2 className="font-bebas text-2xl tracking-widest">Mon Panier</h2>
          <button onClick={closeCart} className="text-[var(--grey)] hover:text-[var(--black)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="font-bebas text-3xl text-[var(--cream-3)]">Panier vide</p>
              <p className="text-[var(--grey)] text-sm mt-2">Ajoutez des maillots pour commencer</p>
            </div>
          ) : (
            items.map((item) => <CartItem key={`${item.product_id}-${item.size}`} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[var(--cream-3)] space-y-4">
            <div className="flex justify-between font-condensed text-lg tracking-wide">
              <span>Total</span>
              <span className="font-bold">{total().toFixed(2)} €</span>
            </div>
            <p className="text-xs text-[var(--grey)] text-center">Livraison offerte dès 60€</p>
            <CheckoutButton />
          </div>
        )}
      </div>
    </>
  )
}

function CheckoutButton() {
  const { items, total } = useCartStore()

  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items, total: total() }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <Button onClick={handleCheckout} size="lg" className="w-full">
      Commander — {total().toFixed(2)} €
    </Button>
  )
}
