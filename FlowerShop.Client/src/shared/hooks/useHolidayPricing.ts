import { useMemo } from 'react'
import { HOLIDAY_DATES, HOLIDAY_SURCHARGE } from '@/shared/config/appConfig'

export interface HolidayPricingResult {
  active: boolean
  multiplier: number
  apply: (price: number) => number
  holidayName: string | null
}

function getHolidayName(date: Date): string | null {
  const mm = date.getMonth() + 1
  const dd = date.getDate()
  for (const h of HOLIDAY_DATES) {
    if (h.month === mm && h.day === dd) return h.name
  }
  return null
}

export function useHolidayPricing(): HolidayPricingResult {
  return useMemo(() => {
    const now = new Date()
    const name = getHolidayName(now)
    const active = name !== null
    const multiplier = active ? 1 + HOLIDAY_SURCHARGE : 1
    return {
      active,
      multiplier,
      apply: (price: number) => active ? Math.ceil(price * multiplier) : price,
      holidayName: name,
    }
  }, [])
}
