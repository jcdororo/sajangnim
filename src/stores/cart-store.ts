import { create } from 'zustand'
import { MenuItem } from '@/types/menu'

interface CartItem extends MenuItem {
  quantity: number
}

interface CartStore {
  tableId: string | null
  items: CartItem[]
  setTableId: (tableId: string) => void
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  tableId: null,
  items: [],
  setTableId: (tableId) => set({ tableId }),
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { items: [...state.items, { ...item, quantity: 1 }] }
    }),
  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.id !== itemId)
          : state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [] }),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
