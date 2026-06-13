import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/entities/product/types'

const MAX_ITEMS = 8

interface RecentlyViewedStore {
  items: Product[]
  track: (product: Product) => void
  clear: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      track: (product) =>
        set(state => {
          const filtered = state.items.filter(p => p.id !== product.id)
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) }
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'flower-recently-viewed' }
  )
)
