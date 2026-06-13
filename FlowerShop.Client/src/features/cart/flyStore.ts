import { create } from 'zustand'

interface CartFlyState {
  pulseKey: number
  flyState: {
    src: string
    startRect: DOMRect
    key: number
  } | null
  triggerFly: (src: string, startRect: DOMRect) => void
  clearFly: () => void
  triggerPulse: () => void
}

export const useCartFlyStore = create<CartFlyState>((set) => ({
  pulseKey: 0,
  flyState: null,
  triggerFly: (src, startRect) => set({ flyState: { src, startRect, key: Date.now() } }),
  clearFly: () => set({ flyState: null }),
  triggerPulse: () => set((state) => ({ pulseKey: state.pulseKey + 1 })),
}))
