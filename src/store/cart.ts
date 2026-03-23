// src/store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (product_id: string, size: string) => void
  updateQty: (product_id: string, size: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find(
          (i) => i.product_id === newItem.product_id && i.size === newItem.size
        )
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.product_id === newItem.product_id && i.size === newItem.size
                ? { ...i, qty: i.qty + newItem.qty }
                : i
            ),
            isOpen: true,
          }
        }
        return { items: [...state.items, newItem], isOpen: true }
      }),

      removeItem: (product_id, size) => set((state) => ({
        items: state.items.filter(
          (i) => !(i.product_id === product_id && i.size === size)
        ),
      })),

      updateQty: (product_id, size, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter((i) => !(i.product_id === product_id && i.size === size))
          : state.items.map((i) =>
              i.product_id === product_id && i.size === size ? { ...i, qty } : i
            ),
      })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'kitlab-cart', skipHydration: true }
  )
)
