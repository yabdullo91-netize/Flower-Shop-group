// Auth
export interface AuthUser {
  id: string
  name: string | null
  phone: string
  role: string
}

// Product
export interface ProductSize {
  id: string
  label: string
  price: number
  oldPrice?: number
  imageUrl?: string
}

export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
}

export interface ProductPackagingOption {
  type: string
  priceDelta: number
}

export interface ProductStemOption {
  count: number
  price: number
}

export interface Product {
  id: string
  slug: string
  name: string
  composition?: string
  description?: string
  kind: string
  freshness: string
  basePrice?: number
  isNew: boolean
  isHit: boolean
  inStock: boolean
  deliverToday: boolean
  rating: number
  reviewCount: number
  occasions: string[]
  flowerTypes: string[]
  colors: string[]
  sizes: ProductSize[]
  images: ProductImage[]
  packagingOptions: ProductPackagingOption[]
  stemOptions: ProductStemOption[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

// Orders
export type OrderStatus = 'Pending' | 'Processing' | 'PhotoReady' | 'OutForDelivery' | 'Delivered' | 'Cancelled'

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImg?: string
  sizeLabel?: string
  packaging?: string
  stemCount?: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderAddon {
  id: string
  addonId: string
  addonName: string
  price: number
  quantity: number
  inscription?: string
}

export interface OrderStatusHistory {
  id: string
  status: string
  note?: string
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  recipientName: string
  recipientPhone: string
  isGift: boolean
  isAnonymous: boolean
  cardText?: string
  deliveryAddress: string
  deliveryDate: string
  deliveryTimeSlot: string
  paymentMethod: string
  subtotal: number
  discountAmount: number
  deliveryFee: number
  pointsRedeemed: number
  total: number
  promoCode?: string
  orderPhotoUrl?: string
  isCancellable: boolean
  createdAt: string
  items: OrderItem[]
  addons: OrderAddon[]
  statusHistory: OrderStatusHistory[]
}

// Promo
export interface PromoCode {
  id: string
  code: string
  discountPct?: number
  discountFixed?: number
  minOrder?: number
  maxUses?: number
  usedCount: number
  validFrom?: string
  validUntil?: string
  isActive: boolean
  createdAt: string
}

// User
export interface User {
  id: string
  name?: string
  phone: string
  role: string
  isBlocked: boolean
  createdAt: string
}

// Banner
export interface Banner {
  id: string
  title?: string
  imageUrl: string
  link?: string
  isActive: boolean
  sortOrder: number
  startsAt?: string
  endsAt?: string
}

// Addon
export interface Addon {
  id: string
  type: string
  name: string
  emoji?: string
  imageUrl?: string
  price: number
  hasInscription: boolean
  isActive: boolean
  sortOrder: number
}

// Review
export interface Review {
  id: string
  userId: string
  userName: string
  productId: string
  productName: string
  orderId: string
  rating: number
  text?: string
  status: string
  helpfulCount: number
  createdAt: string
  photos: { id: string; url: string }[]
}

// Dashboard
export interface DashboardStats {
  totalRevenue: number
  ordersCount: number
  activeUsersCount: number
  pendingReviewsCount: number
}

export interface ChartPoint {
  date: string
  count: number
  revenue: number
}

// Delivery
export interface DeliverySlot {
  id: string
  slot: string
  isActive: boolean
  sortOrder: number
}
