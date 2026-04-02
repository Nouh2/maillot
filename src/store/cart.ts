// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'
import { calculateCartGrandTotal, calculateItemsSubtotal, calculateShippingAmount } from '@/lib/cartPricing'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (item: CartItem) => void
  updateQty: (item: CartItem, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  subtotal: () => number
  shippingTotal: () => number
  total: () => number
  itemCount: () => number
}

// Helper to check if two cart items are identical in configuration
const isSameItem = (a: CartItem, b: CartItem) => {
  return (
    a.product_id === b.product_id &&
    a.size === b.size &&
    JSON.stringify([...a.patches].sort()) === JSON.stringify([...b.patches].sort()) &&
    a.flocage_name === b.flocage_name &&
    a.flocage_number === b.flocage_number
  )
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find((i) => isSameItem(i, newItem))
        if (existing) {
          return {
            items: state.items.map((i) =>
              isSameItem(i, newItem)
                ? { ...i, qty: i.qty + newItem.qty }
                : i
            ),
            isOpen: true,
          }
        }
        return { items: [...state.items, newItem], isOpen: true }
      }),

      removeItem: (itemToRemove) => set((state) => ({
        items: state.items.filter((i) => !isSameItem(i, itemToRemove)),
      })),

      updateQty: (itemToUpdate, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter((i) => !isSameItem(i, itemToUpdate))
          : state.items.map((i) =>
              isSameItem(i, itemToUpdate) ? { ...i, qty } : i
            ),
      })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () => calculateItemsSubtotal(get().items),
      shippingTotal: () => calculateShippingAmount(get().itemCount()),
      total: () => calculateCartGrandTotal(get().items),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'kitlab-cart', skipHydration: true }
  )
)
