import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Spinner, Empty, Card, toast } from '@/components/ui'
import type { Review } from '@/types'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
      ))}
    </div>
  )
}

export function ReviewsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<Review[]>({
    queryKey: ['reviews-pending'],
    queryFn: () => api.get('/reviews').then(r => r.data),
  })

  const approveMut = useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/${id}/approve`),
    onSuccess: () => { toast.success('Отзыв одобрен'); qc.invalidateQueries({ queryKey: ['reviews-pending'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const rejectMut = useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/${id}/reject`),
    onSuccess: () => { toast.success('Отзыв отклонён'); qc.invalidateQueries({ queryKey: ['reviews-pending'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const reviews = data ?? []

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Модерация отзывов</h1>
        <p className="text-slate-500 text-sm mt-0.5">{reviews.length} отзывов на модерации</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <Empty message="Нет отзывов на модерации" icon="⭐" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map(r => (
            <Card key={r.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{r.userName}</p>
                  <p className="text-xs text-slate-400">{r.productName}</p>
                </div>
                <Badge color={r.status === 'Pending' ? 'amber' : r.status === 'Approved' ? 'green' : 'red'}>
                  {r.status === 'Pending' ? 'На модерации' : r.status === 'Approved' ? 'Одобрен' : 'Отклонён'}
                </Badge>
              </div>

              <Stars rating={r.rating} />

              {r.text && <p className="text-sm text-slate-600 line-clamp-4">"{r.text}"</p>}

              {r.photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {r.photos.map(p => (
                    <img key={p.id} src={p.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {r.status === 'Pending' && (
                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                  <button
                    onClick={() => approveMut.mutate(r.id)}
                    disabled={approveMut.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <Check size={13} /> Одобрить
                  </button>
                  <button
                    onClick={() => rejectMut.mutate(r.id)}
                    disabled={rejectMut.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    <X size={13} /> Отклонить
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
