import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'

interface AuthStore {
  user: AuthUser | null
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (user, accessToken, refreshToken) => {
        localStorage.setItem('admin-access-token', accessToken)
        localStorage.setItem('admin-refresh-token', refreshToken)
        set({ user })
      },
      logout: () => {
        localStorage.removeItem('admin-access-token')
        localStorage.removeItem('admin-refresh-token')
        set({ user: null })
      },
    }),
    { name: 'flower-admin-auth', partialize: (s) => ({ user: s.user }) }
  )
)
