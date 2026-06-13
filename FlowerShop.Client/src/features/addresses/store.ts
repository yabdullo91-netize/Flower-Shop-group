import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedAddress {
  id: string
  label: string
  street: string
  apartment?: string
  district: string
  isDefault: boolean
}

interface AddressesStore {
  addresses: SavedAddress[]
  add: (data: Omit<SavedAddress, 'id' | 'isDefault'>) => string
  update: (id: string, data: Partial<Omit<SavedAddress, 'id'>>) => void
  remove: (id: string) => void
  setDefault: (id: string) => void
  getDefault: () => SavedAddress | undefined
}

export const useAddressesStore = create<AddressesStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      add: (data) => {
        const id = `addr-${Date.now()}`
        const isFirst = get().addresses.length === 0
        set(s => ({
          addresses: [
            ...s.addresses.map(a => isFirst ? a : a),
            { ...data, id, isDefault: isFirst },
          ],
        }))
        return id
      },

      update: (id, data) =>
        set(s => ({
          addresses: s.addresses.map(a => a.id === id ? { ...a, ...data } : a),
        })),

      remove: (id) =>
        set(s => {
          const filtered = s.addresses.filter(a => a.id !== id)
          const hasDefault = filtered.some(a => a.isDefault)
          return {
            addresses: filtered.map((a, i) =>
              !hasDefault && i === 0 ? { ...a, isDefault: true } : a
            ),
          }
        }),

      setDefault: (id) =>
        set(s => ({
          addresses: s.addresses.map(a => ({ ...a, isDefault: a.id === id })),
        })),

      getDefault: () => get().addresses.find(a => a.isDefault),
    }),
    { name: 'flower-addresses', version: 1, migrate: (s) => s }
  )
)
