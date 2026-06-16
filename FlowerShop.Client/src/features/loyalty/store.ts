import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LoyaltyTx {
  id: string
  type: 'earn' | 'redeem'
  amount: number
  description: string
  date: string
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold'

export interface LoyaltyTierInfo {
  tier: LoyaltyTier
  label: string
  emoji: string
  minPoints: number
  nextTierPoints: number | null
  color: string
}

export const TIERS: LoyaltyTierInfo[] = [
  { tier: 'bronze', label: 'Бронза',  emoji: '🥉', minPoints: 0,    nextTierPoints: 500,  color: 'text-orange-600' },
  { tier: 'silver', label: 'Серебро', emoji: '🥈', minPoints: 500,  nextTierPoints: 1000, color: 'text-slate-400' },
  { tier: 'gold',   label: 'Золото',  emoji: '🥇', minPoints: 1000, nextTierPoints: null, color: 'text-gold' },
]

// 1 балл за каждые 10 сомони потрачено (10% от суммы заказа, 1 балл = 1 сомони)
export const EARN_DIVISOR   = 10
// 1 балл = 1 сомони при списании
export const REDEEM_RATE    = 1
// минимум для списания
export const MIN_REDEEM     = 50
// максимум 30% от суммы заказа
export const MAX_REDEEM_PCT = 0.30

export function calcEarn(amount: number): number {
  return Math.floor(amount / EARN_DIVISOR)
}

export function getTier(totalEarned: number): LoyaltyTierInfo {
  return [...TIERS].reverse().find(t => totalEarned >= t.minPoints) ?? TIERS[0]
}

interface LoyaltyStore {
  points: number
  totalEarned: number
  history: LoyaltyTx[]
  earnPoints: (amount: number, description?: string) => number
  redeemPoints: (pts: number) => boolean
  maxRedeemable: (orderTotal: number) => number
}

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      points: 0,
      totalEarned: 0,
      history: [],

      earnPoints: (amount, description = 'За покупку') => {
        const pts = calcEarn(amount)
        if (pts <= 0) return 0
        const tx: LoyaltyTx = {
          id: `earn-${Date.now()}`,
          type: 'earn',
          amount: pts,
          description,
          date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
        }
        set(s => ({
          points: s.points + pts,
          totalEarned: s.totalEarned + pts,
          history: [tx, ...s.history].slice(0, 50),
        }))
        return pts
      },

      redeemPoints: (pts) => {
        const { points } = get()
        if (pts < MIN_REDEEM || pts > points) return false
        const tx: LoyaltyTx = {
          id: `redeem-${Date.now()}`,
          type: 'redeem',
          amount: -pts,
          description: 'Списание за заказ',
          date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
        }
        set(s => ({
          points: s.points - pts,
          history: [tx, ...s.history].slice(0, 50),
        }))
        return true
      },

      maxRedeemable: (orderTotal) => {
        const { points } = get()
        const cap = Math.floor(orderTotal * MAX_REDEEM_PCT)
        return Math.min(points, cap)
      },
    }),
    { name: 'flower-loyalty', version: 1, migrate: (s) => s }
  )
)
