import { create } from 'zustand'
import type { Product } from '@/entities/product/types'

interface QuickViewStore {
  product: Product | null
  open: (product: Product) => void
  close: () => void
}

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}))
