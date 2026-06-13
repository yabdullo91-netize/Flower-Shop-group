export interface Promotion {
  id: string
  code: string
  discountPct: number
  minOrder: number
  validFrom: string
  validTo: string | null
  labelRu: string
}

// Single source of truth for all promo codes — cart/store uses findPromo() to validate
export const PROMOTIONS: Promotion[] = [
  {
    id: 'welcome20',
    code: 'WELCOME20',
    discountPct: 20,
    minOrder: 0,
    validFrom: '2024-01-01',
    validTo: null,
    labelRu: 'Скидка 20% на первый заказ',
  },
  {
    id: 'welcome15',
    code: 'WELCOME15',
    discountPct: 15,
    minOrder: 0,
    validFrom: '2024-01-01',
    validTo: null,
    labelRu: 'Приветственная скидка 15%',
  },
  {
    id: 'flower10',
    code: 'FLOWER10',
    discountPct: 10,
    minOrder: 0,
    validFrom: '2024-01-01',
    validTo: null,
    labelRu: 'Скидка 10%',
  },
  {
    id: 'spring20',
    code: 'SPRING20',
    discountPct: 20,
    minOrder: 500,
    validFrom: '2025-03-01',
    validTo: '2025-04-30',
    labelRu: 'Весенняя скидка 20%',
  },
]

export function findPromo(code: string): Promotion | undefined {
  return PROMOTIONS.find(p => p.code === code.toUpperCase())
}
