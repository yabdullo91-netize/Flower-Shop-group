import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/shared/lib/apiClient'

export type OrderStatus = 'Принят' | 'Собирается' | 'Фото готово' | 'Курьер в пути' | 'Доставлен' | 'Отменён'

const STATUS_MAP: Record<string, OrderStatus> = {
  Pending: 'Принят',
  Processing: 'Собирается',
  PhotoReady: 'Фото готово',
  OutForDelivery: 'Курьер в пути',
  Delivered: 'Доставлен',
  Cancelled: 'Отменён',
}

export interface OrderItem {
  productId: string
  productName: string
  productImg: string
  size: string
  quantity: number
  price: number
}

export interface OrderAddon {
  id: string
  name: string
  price: number
  quantity: number
  inscription?: string
}

export interface Order {
  id: string
  date: string
  items: OrderItem[]
  addons: OrderAddon[]
  cardText?: string
  subtotal: number
  deliveryFee: number
  promoDiscount: number
  pointsDiscount: number
  total: number
  status: OrderStatus
  address: string
  deliveryDate: string
  deliveryTime: string
  payment: 'dc' | 'alif' | 'cash'
  isCancellable: boolean
}

interface OrdersStore {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  addOrder: (data: Omit<Order, 'id' | 'date' | 'status' | 'isCancellable'>) => string
  cancelOrder: (id: string) => Promise<void>
  fetchMyOrders: () => Promise<void>
}

function mapApiOrder(o: {
  id: string; orderNumber: string; createdAt: string; status: string
  items: Array<{ productId: string; productName: string; productImg?: string; sizeLabel?: string; quantity: number; unitPrice: number }>
  addons: Array<{ addonId: string; addonName: string; price: number; quantity: number; inscription?: string }>
  cardText?: string; subtotal: number; deliveryFee: number; discountAmount: number; pointsRedeemed: number; total: number
  deliveryAddress: string; deliveryDate: string; deliveryTimeSlot: string; paymentMethod: string; isCancellable: boolean
}): Order {
  return {
    id: o.orderNumber || o.id,
    date: new Date(o.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    items: o.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      productImg: i.productImg ?? '',
      size: i.sizeLabel ?? '',
      quantity: i.quantity,
      price: i.unitPrice,
    })),
    addons: o.addons.map(a => ({
      id: a.addonId,
      name: a.addonName,
      price: a.price,
      quantity: a.quantity,
      inscription: a.inscription,
    })),
    cardText: o.cardText,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    promoDiscount: o.discountAmount,
    pointsDiscount: o.pointsRedeemed,
    total: o.total,
    status: STATUS_MAP[o.status] ?? 'Принят',
    address: o.deliveryAddress,
    deliveryDate: o.deliveryDate,
    deliveryTime: o.deliveryTimeSlot,
    payment: (o.paymentMethod?.toLowerCase() ?? 'cash') as Order['payment'],
    isCancellable: o.isCancellable,
  }
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      setOrders: (orders) => set({ orders }),

      fetchMyOrders: async () => {
        try {
          const { data } = await apiClient.get('/orders/my')
          set({ orders: (data as Parameters<typeof mapApiOrder>[0][]).map(mapApiOrder) })
        } catch {
          // not logged in or network error — keep local state
        }
      },

      addOrder: (data) => {
        const id = `#${Math.floor(100000 + Math.random() * 900000)}`
        set(s => ({
          orders: [
            {
              ...data,
              id,
              date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
              status: 'Принят',
              isCancellable: true,
            },
            ...s.orders,
          ],
        }))
        return id
      },

      cancelOrder: async (id) => {
        const order = get().orders.find(o => o.id === id)
        if (!order || order.status !== 'Принят') return
        try {
          // Try to cancel on the backend (id might be a UUID or order number)
          await apiClient.patch(`/orders/my/${id}/cancel`)
        } catch {
          // If the backend call fails (e.g. id is order number), update locally anyway
        }
        set(s => ({
          orders: s.orders.map(o =>
            o.id === id ? { ...o, status: 'Отменён' as OrderStatus, isCancellable: false } : o
          ),
        }))
      },
    }),
    {
      name: 'flower-orders',
      version: 1,
      migrate: (state) => {
        const s = state as OrdersStore
        return {
          ...s,
          orders: (s.orders ?? []).map(order => {
            const o = order as Partial<Order>
            const full: Order = { ...(o as Order) }
            if (full.subtotal == null)       full.subtotal = 0
            if (full.deliveryFee == null)    full.deliveryFee = 0
            if (full.promoDiscount == null)  full.promoDiscount = 0
            if (full.pointsDiscount == null) full.pointsDiscount = 0
            return full
          }),
        }
      },
    }
  )
)
