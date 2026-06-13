export type Occasion = 'birthday' | 'wedding' | 'nikah' | 'mom' | 'romantic' | 'sorry' | 'funeral' | 'other'
export type FlowerType = 'rose' | 'peony' | 'tulip' | 'orchid' | 'mixed'
export type Freshness = 'live' | 'dried'
export type ProductKind = 'bouquet' | 'single'
export type Packaging = 'basket' | 'no_basket'
export type AddonType = 'chocolate' | 'teddy' | 'choco_strawberry' | 'bento_cake'

export type ProductSize = { id: string; label: 'S' | 'M' | 'L'; price: number; oldPrice?: number; image?: string }

export interface Product {
  id: string
  slug: string
  name: string
  composition: string
  images: string[]
  price: number
  oldPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  occasions: Occasion[]
  flowerTypes: FlowerType[]
  colors: string[]
  isNew?: boolean
  isHit?: boolean
  inStock: boolean
  deliverToday: boolean
  sizes: ProductSize[]
  kind: ProductKind
  freshness: Freshness
  packagingOptions: Packaging[]
  stemPrice?: number
  stemOptions?: number[]
}

export interface Addon {
  id: string
  type: AddonType
  name: string
  image: string
  price: number
  hasInscription?: boolean
}

export interface Postcard {
  id: string
  occasion: Occasion | 'universal'
  image: string
  isPopular?: boolean
}

export interface MessageTemplate {
  id: string
  category: 'birthday' | 'romantic' | 'universal' | 'funeral'
  text: string
  isPopular?: boolean
}

export interface CardData {
  postcardId?: string
  text: string
  isAnonymous?: boolean
  videoUrl?: string
}

export interface Review {
  id: string
  authorName: string
  authorAvatar?: string
  rating: number
  text: string
  photos?: string[]
  date: string
  helpful: number
}

export interface ProductFilters {
  occasion?: Occasion
  priceMin?: number
  priceMax?: number
  flowerTypes?: FlowerType[]
  colors?: string[]
  deliverToday?: boolean
  freshness?: Freshness
  kind?: ProductKind
  packaging?: Packaging
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating'
  q?: string
  page?: number
}
