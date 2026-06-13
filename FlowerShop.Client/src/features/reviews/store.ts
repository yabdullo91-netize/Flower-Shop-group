import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserReview {
  id: string
  productId: string
  productName: string
  productImg: string
  orderId: string
  rating: number
  text: string
  date: string
  photos?: string[]
}

interface ReviewsStore {
  reviews: UserReview[]
  addReview: (review: Omit<UserReview, 'id' | 'date'>) => void
  hasReview: (orderId: string, productId: string) => boolean
}

export const useReviewsStore = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (review) => {
        const newReview: UserReview = {
          ...review,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
        }
        set(s => ({ reviews: [newReview, ...s.reviews] }))
      },

      hasReview: (orderId, productId) =>
        get().reviews.some(r => r.orderId === orderId && r.productId === productId),
    }),
    { name: 'flower-reviews' }
  )
)
