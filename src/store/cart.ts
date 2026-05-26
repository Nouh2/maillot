import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateCartPricing } from '@/lib/cartPricing'
import type { CartItem } from '@/types/cart'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  customerEmail: string
  marketingOptIn: boolean
  promoCode: string | null
  addItem: (item: CartItem) => void
  removeItem: (item: CartItem) => void
  updateQty: (item: CartItem, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  setCustomerEmail: (email: string) => void
  setMarketingOptIn: (marketingOptIn: boolean) => void
  setPromoCode: (promoCode: string | null) => void
  subtotal: () => number
  discountTotal: () => number
  shippingTotal: () => number
  total: () => number
  itemCount: () => number
  freeShippingUnlocked: () => boolean
}

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
    (set, get) => {
      const getPricing = () => calculateCartPricing(get().items, { promoCode: get().promoCode })

      return ({
      items: [],
      isOpen: false,
      customerEmail: '',
      marketingOptIn: false,
      promoCode: null,

      addItem: (newItem) => set((state) => {
        const existing = state.items.find((item) => isSameItem(item, newItem))
        if (existing) {
          return {
            items: state.items.map((item) =>
              isSameItem(item, newItem)
                ? { ...item, qty: item.qty + newItem.qty }
                : item,
            ),
            isOpen: true,
          }
        }

        return { items: [...state.items, newItem], isOpen: true }
      }),

      removeItem: (itemToRemove) => set((state) => ({
        items: state.items.filter((item) => !isSameItem(item, itemToRemove)),
      })),

      updateQty: (itemToUpdate, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter((item) => !isSameItem(item, itemToUpdate))
          : state.items.map((item) =>
              isSameItem(item, itemToUpdate) ? { ...item, qty } : item,
            ),
      })),

      clearCart: () => set({ items: [], promoCode: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCustomerEmail: (email) => set({ customerEmail: email.trim().toLowerCase() }),
      setMarketingOptIn: (marketingOptIn) => set({ marketingOptIn }),
      setPromoCode: (promoCode) => set({ promoCode: promoCode?.trim().toUpperCase() || null }),

      subtotal: () => getPricing().subtotal,
      discountTotal: () => getPricing().discount,
      shippingTotal: () => getPricing().shipping,
      total: () => getPricing().total,
      itemCount: () => getPricing().itemCount,
      freeShippingUnlocked: () => getPricing().freeShippingUnlocked,
    })
    },
    { name: 'kitlab-cart', skipHydration: true },
  ),
)
