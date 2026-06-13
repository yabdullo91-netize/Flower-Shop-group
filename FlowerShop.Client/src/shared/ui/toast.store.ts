import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  action?: { label: string; onClick: () => void }
}

interface ToastStore {
  toasts: Toast[]
  add: (t: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(x => x.id !== id) })), 4000)
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export const toast = {
  success: (message: string, action?: Toast['action']) => useToastStore.getState().add({ message, type: 'success', action }),
  error: (message: string) => useToastStore.getState().add({ message, type: 'error' }),
  info: (message: string, action?: Toast['action']) => useToastStore.getState().add({ message, type: 'info', action }),
}
