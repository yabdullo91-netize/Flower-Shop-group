import type { Product, ProductFilters, Review } from './types'
import { apiClient } from '@/shared/lib/apiClient'

interface BackendProduct {
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
  sizes: Array<{ id: string; label: string; price: number; oldPrice?: number; imageUrl?: string }>
  images: Array<{ id: string; url: string; isPrimary: boolean }>
  packagingOptions: Array<{ type: string; priceDelta: number }>
  stemOptions: Array<{ count: number; price: number }>
}

function mapProduct(p: BackendProduct): Product {
  const images = p.images
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    .map(i => i.url)

  const sizes = p.sizes.map(s => ({
    id: s.id,
    label: s.label as 'S' | 'M' | 'L',
    price: s.price,
    oldPrice: s.oldPrice,
    image: s.imageUrl,
  }))

  const stemPrice = p.stemOptions.length > 0
    ? Math.min(...p.stemOptions.map(s => s.price))
    : undefined
  const stemOptions = p.stemOptions.map(s => s.count)

  const price = sizes[0]?.price ?? p.basePrice ?? 0
  const oldPrice = sizes[0]?.oldPrice

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    composition: p.composition ?? '',
    images: images.length > 0 ? images : [],
    price,
    oldPrice,
    discount: oldPrice ? Math.round((1 - price / oldPrice) * 100) : undefined,
    rating: p.rating,
    reviewCount: p.reviewCount,
    occasions: (p.occasions ?? []) as Product['occasions'],
    flowerTypes: (p.flowerTypes ?? []) as Product['flowerTypes'],
    colors: p.colors ?? [],
    isNew: p.isNew,
    isHit: p.isHit,
    inStock: p.inStock,
    deliverToday: p.deliverToday,
    sizes,
    kind: p.kind as Product['kind'],
    freshness: p.freshness as Product['freshness'],
    packagingOptions: (p.packagingOptions ?? []).map(o => o.type) as Product['packagingOptions'],
    stemPrice,
    stemOptions: stemOptions.length > 0 ? stemOptions : undefined,
  }
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<{ items: Product[]; total: number }> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.q) params.q = filters.q
  if (filters.occasion) params.occasion = filters.occasion
  if (filters.deliverToday) params.deliverToday = true
  if (filters.priceMin != null) params.priceMin = filters.priceMin
  if (filters.priceMax != null) params.priceMax = filters.priceMax
  if (filters.freshness) params.freshness = filters.freshness
  if (filters.kind) params.kind = filters.kind
  if (filters.packaging) params.packaging = filters.packaging
  if (filters.sort) params.sort = filters.sort
  if (filters.page) params.page = filters.page

  const { data } = await apiClient.get('/products', { params })
  return {
    items: (data.items as BackendProduct[]).map(mapProduct),
    total: data.totalCount,
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const { data } = await apiClient.get(`/products/${slug}`)
    return mapProduct(data as BackendProduct)
  } catch {
    return null
  }
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await apiClient.get(`/products/${productId}/reviews`)
  return (data as Array<{
    id: string
    userName: string
    rating: number
    text?: string
    createdAt: string
    helpfulCount: number
    photos: Array<{ url: string }>
  }>).map(r => ({
    id: r.id,
    authorName: r.userName,
    rating: r.rating,
    text: r.text ?? '',
    date: new Date(r.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    helpful: r.helpfulCount,
    photos: r.photos.map(p => p.url),
  }))
}
