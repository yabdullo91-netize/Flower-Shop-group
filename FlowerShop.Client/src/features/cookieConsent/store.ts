import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CookiePrefs {
  necessary: true
  analytics: boolean
  marketing: boolean
}

interface CookieConsentStore {
  decided: boolean
  prefs: CookiePrefs
  acceptAll: () => void
  acceptNecessary: () => void
  setPrefs: (prefs: Omit<CookiePrefs, 'necessary'>) => void
}

export const useCookieConsentStore = create<CookieConsentStore>()(
  persist(
    (set) => ({
      decided: false,
      prefs: { necessary: true, analytics: false, marketing: false },

      acceptAll: () =>
        set({ decided: true, prefs: { necessary: true, analytics: true, marketing: true } }),

      acceptNecessary: () =>
        set({ decided: true, prefs: { necessary: true, analytics: false, marketing: false } }),

      setPrefs: (prefs) =>
        set({ decided: true, prefs: { necessary: true, ...prefs } }),
    }),
    { name: 'flower-cookie-consent' }
  )
)
