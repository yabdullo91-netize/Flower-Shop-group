import { describe, it, expect } from 'vitest'
import { calcEarn, getTier, TIERS, MIN_REDEEM, MAX_REDEEM_PCT } from '@/features/loyalty/store'
import { applyHolidayPrice } from '@/shared/lib/holiday'
import { findPromo } from '@/shared/config/promotionConfig'
import { pluralPoints } from '@/shared/lib/pluralize'

// ─── Loyalty: calcEarn ────────────────────────────────────────────────────────

describe('calcEarn', () => {
  it('earns 1 point per 20 TJS', () => expect(calcEarn(20)).toBe(1))
  it('earns 5 points for 100 TJS', () => expect(calcEarn(100)).toBe(5))
  it('floors — 39 TJS earns 1, not 2', () => expect(calcEarn(39)).toBe(1))
  it('earns 0 for 0', () => expect(calcEarn(0)).toBe(0))
  it('earns 0 for less than 20', () => expect(calcEarn(19)).toBe(0))
  it('handles large amounts', () => expect(calcEarn(15000)).toBe(750))
})

// ─── Loyalty: getTier ─────────────────────────────────────────────────────────

describe('getTier', () => {
  it('bronze at 0 points', () => expect(getTier(0).tier).toBe('bronze'))
  it('bronze at 299 points', () => expect(getTier(299).tier).toBe('bronze'))
  it('silver at 300 points', () => expect(getTier(300).tier).toBe('silver'))
  it('silver at 999 points', () => expect(getTier(999).tier).toBe('silver'))
  it('gold at 1000 points', () => expect(getTier(1000).tier).toBe('gold'))
  it('gold at 9999 points', () => expect(getTier(9999).tier).toBe('gold'))
})

// ─── Loyalty: maxRedeemable formula ──────────────────────────────────────────

describe('maxRedeemable (pure formula check)', () => {
  const maxRedeemable = (balance: number, orderTotal: number) =>
    Math.min(balance, Math.floor(orderTotal * MAX_REDEEM_PCT))

  it('caps at 30% of order', () => expect(maxRedeemable(500, 1000)).toBe(300))
  it('caps at balance when balance < 30%', () => expect(maxRedeemable(100, 1000)).toBe(100))
  it('cannot exceed balance', () => expect(maxRedeemable(50, 10000)).toBe(50))
  it('zero order = zero redeemable', () => expect(maxRedeemable(500, 0)).toBe(0))

  it('minimum redeem threshold is 50', () => {
    const max = maxRedeemable(30, 1000)
    expect(max < MIN_REDEEM).toBe(true) // 30 < 50 → cannot redeem
  })
})

// ─── Holiday pricing ──────────────────────────────────────────────────────────

describe('applyHolidayPrice', () => {
  const active = { active: true, name: 'Test', multiplier: 1.3 }
  const inactive = { active: false, name: '', multiplier: 1 }

  it('applies +30% when holiday is active', () => expect(applyHolidayPrice(1000, active)).toBe(1300))
  it('rounds the result', () => expect(applyHolidayPrice(333, active)).toBe(433)) // 333 * 1.3 = 432.9 → 433
  it('returns unchanged price when not holiday', () => expect(applyHolidayPrice(1000, inactive)).toBe(1000))
  it('handles 0 price', () => expect(applyHolidayPrice(0, active)).toBe(0))
})

// ─── Promo codes ─────────────────────────────────────────────────────────────

describe('findPromo', () => {
  it('finds WELCOME20', () => expect(findPromo('WELCOME20')?.discountPct).toBe(20))
  it('finds FLOWER10', () => expect(findPromo('FLOWER10')?.discountPct).toBe(10))
  it('finds SPRING20', () => expect(findPromo('SPRING20')?.discountPct).toBe(20))
  it('finds WELCOME15', () => expect(findPromo('WELCOME15')?.discountPct).toBe(15))
  it('is case-insensitive', () => expect(findPromo('welcome20')?.code).toBe('WELCOME20'))
  it('returns undefined for unknown code', () => expect(findPromo('BADCODE')).toBeUndefined())
  it('all 4 codes exist', () => {
    const codes = ['WELCOME20', 'WELCOME15', 'FLOWER10', 'SPRING20']
    codes.forEach(c => expect(findPromo(c)).toBeDefined())
  })
})

// ─── Promo: cart discount formula ─────────────────────────────────────────────

describe('cart discount formula', () => {
  const applyDiscount = (subtotal: number, pct: number) =>
    Math.round(subtotal * (1 - pct / 100))

  it('20% off 1000 = 800', () => expect(applyDiscount(1000, 20)).toBe(800))
  it('10% off 500 = 450', () => expect(applyDiscount(500, 10)).toBe(450))
  it('0% changes nothing', () => expect(applyDiscount(1000, 0)).toBe(1000))
})

// ─── Pluralization ────────────────────────────────────────────────────────────

describe('pluralPoints (Russian)', () => {
  it('1 → балл', () => expect(pluralPoints(1, 'ru')).toBe('балл'))
  it('2 → балла', () => expect(pluralPoints(2, 'ru')).toBe('балла'))
  it('5 → баллов', () => expect(pluralPoints(5, 'ru')).toBe('баллов'))
  it('11 → баллов (not балл)', () => expect(pluralPoints(11, 'ru')).toBe('баллов'))
  it('21 → балл', () => expect(pluralPoints(21, 'ru')).toBe('балл'))
  it('0 → баллов', () => expect(pluralPoints(0, 'ru')).toBe('баллов'))
  it('100 → баллов', () => expect(pluralPoints(100, 'ru')).toBe('баллов'))
})

describe('pluralPoints (English)', () => {
  it('1 → point', () => expect(pluralPoints(1, 'en')).toBe('point'))
  it('2 → points', () => expect(pluralPoints(2, 'en')).toBe('points'))
  it('0 → points', () => expect(pluralPoints(0, 'en')).toBe('points'))
})

// ─── TIERS sanity ─────────────────────────────────────────────────────────────

describe('TIERS', () => {
  it('has exactly 3 tiers', () => expect(TIERS).toHaveLength(3))
  it('tiers are in ascending order', () => {
    const mins = TIERS.map(t => t.minPoints)
    expect(mins).toEqual([...mins].sort((a, b) => a - b))
  })
  it('last tier has null nextTierPoints', () => {
    expect(TIERS[TIERS.length - 1].nextTierPoints).toBeNull()
  })
})
