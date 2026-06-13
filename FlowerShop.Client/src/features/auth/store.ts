import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/shared/lib/apiClient'

export interface User {
  id: string
  name: string
  phone: string
  avatarUrl?: string
}

interface AuthStore {
  user: User | null
  isModalOpen: boolean
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (patch: Partial<Pick<User, 'name' | 'avatarUrl'>>) => void
  openModal: () => void
  closeModal: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isModalOpen: false,
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('flower-access-token', accessToken)
        localStorage.setItem('flower-refresh-token', refreshToken)
        set({ user, isModalOpen: false })
      },
      logout: () => {
        const refreshToken = localStorage.getItem('flower-refresh-token')
        if (refreshToken) {
          apiClient.post('/auth/logout', { refreshToken }).catch(() => {})
        }
        localStorage.removeItem('flower-access-token')
        localStorage.removeItem('flower-refresh-token')
        set({ user: null })
      },
      updateUser: (patch) => set(s => ({ user: s.user ? { ...s.user, ...patch } : null })),
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
    }),
    { name: 'flower-auth', partialize: (s) => ({ user: s.user }) }
  )
)
