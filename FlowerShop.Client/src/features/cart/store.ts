import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, ProductSize, Packaging } from '@/entities/product/types'
import { apiClient } from '@/shared/lib/apiClient'

export interface CartItem {
  id: string
  product: Product
  size: ProductSize
  /** Price at the time the item was added — prevents holiday-surcharge drift */
  snapshotPrice: number
  quantity: number
  packaging: Packaging
  stemCount?: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, size: ProductSize, opts?: { packaging?: Packaging; stemCount?: number; snapshotPrice?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  total: () => number
  count: () => number
  promoCode: string
  promoDiscount: number
  applyPromo: (code: string) => Promise<boolean>
  clearPromo: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: '',
      promoDiscount: 0,

      addItem: (product, size, opts = {}) => {
        const packaging = opts.packaging ?? 'no_basket'
        const stemCount = opts.stemCount
        const snapshotPrice = opts.snapshotPrice ??
          (stemCount != null && product.stemPrice ? product.stemPrice * stemCount : size.price)
        const key = stemCount != null
          ? `${product.id}-stem${stemCount}-${packaging}`
          : `${product.id}-${size.id}-${packaging}`

        set(state => {
          const existing = state.items.find(i => i.id === key)
          if (existing) {
            return { items: state.items.map(i => i.id === key ? { ...i, quantity: i.quantity + 1 } : i) }
          }
          return {
            items: [...state.items, { id: key, product, size, snapshotPrice, quantity: 1, packaging, stemCount }],
          }
        })
      },

      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return }
        set(state => ({ items: state.items.map(i => i.id === id ? { ...i, quantity } : i) }))
      },

      clearCart: () => set({ items: [], promoCode: '', promoDiscount: 0 }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      total: () => {
        const { items, promoDiscount } = get()
        const subtotal = items.reduce((s, i) => s + i.snapshotPrice * i.quantity, 0)
        return promoDiscount ? Math.round(subtotal * (1 - promoDiscount / 100)) : subtotal
      },

      count: () => get().items.reduce((s, i) => s + i.quantity, 0),

      applyPromo: async (code) => {
        try {
          const subtotal = get().items.reduce((s, i) => s + i.snapshotPrice * i.quantity, 0)
          const { data } = await apiClient.post('/promo/validate', { code, orderTotal: subtotal })
          if (data.valid) {
            const discountPct = subtotal > 0 ? Math.round((data.discount / subtotal) * 100) : 0
            set({ promoCode: code, promoDiscount: discountPct })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      clearPromo: () => set({ promoCode: '', promoDiscount: 0 }),
    }),
    {
      name: 'flower-cart',
      version: 1,
      migrate: (state) => {
        // v0→v1: CartItem gained snapshotPrice; backfill from size.price
        const s = state as CartStore
        return {
          ...s,
          items: (s.items ?? []).map(item => ({
            ...item,
            snapshotPrice: (item as CartItem).snapshotPrice ??
              ((item as CartItem).stemCount != null && (item as CartItem).product?.stemPrice
                ? (item as CartItem).product.stemPrice! * (item as CartItem).stemCount!
                : (item as CartItem).size?.price ?? 0),
          })),
        }
      },
    }
  )
)
