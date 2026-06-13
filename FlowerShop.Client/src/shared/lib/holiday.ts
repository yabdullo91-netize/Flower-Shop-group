import { i18n } from './i18n'

export interface HolidayInfo {
  active: boolean
  name: string
  multiplier: number
}

const HOLIDAYS = [
  { month: 2,  day: 14, key: 'holiday.valentine' },
  { month: 3,  day: 8,  key: 'holiday.women_day' },
  { month: 3,  day: 20, key: 'holiday.navruz' },
  { month: 3,  day: 21, key: 'holiday.navruz' },
  { month: 12, day: 31, key: 'holiday.new_year' },
] as const

export function getHolidayInfo(date = new Date()): HolidayInfo {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const hit = HOLIDAYS.find(h => h.month === m && h.day === d)
  return hit
    ? { active: true, name: i18n.t(hit.key), multiplier: 1.3 }
    : { active: false, name: '', multiplier: 1 }
}

export function applyHolidayPrice(price: number, info: HolidayInfo): number {
  if (!info.active) return price
  return Math.round(price * info.multiplier)
}
