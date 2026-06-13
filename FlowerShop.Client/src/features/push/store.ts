import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PushStore {
  isSubscribed: boolean
  permissionAsked: boolean
  setSubscribed: (v: boolean) => void
  markAsked: () => void
}

export const usePushStore = create<PushStore>()(
  persist(
    set => ({
      isSubscribed: false,
      permissionAsked: false,
      setSubscribed: v => set({ isSubscribed: v }),
      markAsked: () => set({ permissionAsked: true }),
    }),
    { name: 'flower-push' }
  )
)
