export interface DeliveryZone {
  id: string
  nameRu: string
  price: number
  minHours: number
  maxHours: number
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'center',  nameRu: 'Центр Душанбе',     price: 30, minHours: 1, maxHours: 2 },
  { id: 'north',   nameRu: 'Север (Сино, Бохтар)', price: 40, minHours: 2, maxHours: 3 },
  { id: 'south',   nameRu: 'Юг (Исмоили Сомони)', price: 40, minHours: 2, maxHours: 3 },
  { id: 'suburbs', nameRu: 'Пригород',            price: 60, minHours: 3, maxHours: 5 },
]

export const DEFAULT_ZONE = DELIVERY_ZONES[0]

export const TIME_SLOTS = [
  '09:00–12:00',
  '12:00–15:00',
  '15:00–18:00',
  '18:00–21:00',
] as const

export type TimeSlot = typeof TIME_SLOTS[number]
