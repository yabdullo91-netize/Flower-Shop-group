import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchProducts, fetchProduct, fetchReviews } from './api'
import type { ProductFilters } from './types'

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (slug: string) => ['products', 'detail', slug] as const,
  reviews: (id: string) => ['products', 'reviews', id] as const,
}

export function useProducts(filters: Omit<ProductFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ pageParam }) => fetchProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => {
      const loaded = all.flatMap(p => p.items).length
      return loaded < last.total ? all.length + 1 : undefined
    },
    staleTime: 60_000,
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProduct(slug),
    staleTime: 60_000,
  })
}

export function useReviews(productId: string) {
  return useQuery({
    queryKey: productKeys.reviews(productId),
    queryFn: () => fetchReviews(productId),
    staleTime: 60_000,
  })
}
