import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesStore {
  ids: Set<string>
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: new Set<string>(),
      toggle: (id) => set(state => {
        const next = new Set(state.ids)
        next.has(id) ? next.delete(id) : next.add(id)
        return { ids: next }
      }),
      has: (id) => get().ids.has(id),
    }),
    {
      name: 'flower-favorites',
      version: 1,
      migrate: (s) => s,
      storage: {
        getItem: (key) => {
          const v = localStorage.getItem(key)
          if (!v) return null
          const p = JSON.parse(v)
          return { ...p, state: { ...p.state, ids: new Set(p.state.ids) } }
        },
        setItem: (key, val) => {
          const s = val as { state: { ids: Set<string> } }
          const v = { ...val, state: { ...s.state, ids: Array.from(s.state.ids) } }
          localStorage.setItem(key, JSON.stringify(v))
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    }
  )
)
