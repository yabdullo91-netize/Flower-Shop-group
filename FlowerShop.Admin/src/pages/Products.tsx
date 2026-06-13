import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, ImageIcon, Package } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Badge, Spinner, Confirm, Empty, Table, Th, Td, toast } from '@/components/ui'
import type { Product } from '@/types'

const KIND_LABEL: Record<string, string> = { bouquet: 'Букет', single: 'Штучно', plant: 'Растение', other: 'Другое' }
const FRESH_LABEL: Record<string, string> = { live: 'Живые', dried: 'Сушёные' }

export function Products() {
  const navigate          = useNavigate()
  const qc                = useQueryClient()
  const [q, setQ]         = useState('')
  const [delId, setDelId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ items: Product[]; totalCount: number }>({
    queryKey: ['products', q],
    queryFn: () => api.get('/products', { params: { q, pageSize: 50 } }).then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Товар удалён')
      qc.invalidateQueries({ queryKey: ['products'] })
      setDelId(null)
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  const products = data?.items ?? []

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Package size={18} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Товары</h1>
            <p className="text-slate-500 text-xs mt-0.5">{data?.totalCount ?? 0} позиций в каталоге</p>
          </div>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => navigate('/products/new')}>
          Добавить товар
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Поиск по названию..."
          className="h-10 pl-10 pr-4 w-80 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : products.length === 0 ? (
        <Empty message="Товары не найдены" icon={<Package size={28} className="text-slate-400" />} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th className="w-16">Фото</Th>
              <Th>Название / Slug</Th>
              <Th>Тип</Th>
              <Th>Цена</Th>
              <Th>Статусы</Th>
              <Th>Рейтинг</Th>
              <Th className="w-24">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const price = p.sizes?.[0]?.price ?? p.basePrice ?? 0
              const primaryImg = p.images?.find(i => i.isPrimary) ?? p.images?.[0]
              return (
                <tr key={p.id} className="group hover:bg-violet-50/40 transition-colors">
                  <Td>
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center ring-1 ring-slate-200">
                      {primaryImg ? (
                        <img src={primaryImg.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-slate-300" />
                      )}
                    </div>
                  </Td>
                  <Td>
                    <p className="font-semibold text-slate-900 text-sm leading-tight">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{p.slug}</p>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-1">
                      <Badge color="violet">{KIND_LABEL[p.kind] ?? p.kind}</Badge>
                      <Badge color="slate">{FRESH_LABEL[p.freshness] ?? p.freshness}</Badge>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-bold text-slate-900">{price.toLocaleString()} сом</span>
                    {p.sizes?.length > 1 && (
                      <p className="text-xs text-slate-400 mt-0.5">{p.sizes.length} размеров</p>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {p.isNew        && <Badge color="blue">Новинка</Badge>}
                      {p.isHit        && <Badge color="amber">Хит</Badge>}
                      {p.inStock      && <Badge color="green">В наличии</Badge>}
                      {!p.inStock     && <Badge color="red">Нет</Badge>}
                      {p.deliverToday && <Badge color="orange">Сегодня</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-base">★</span>
                      <span className="text-sm font-semibold text-slate-700">{p.rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({p.reviewCount})</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                        className="p-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDelId(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}

      <Confirm
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => delId && deleteMut.mutate(delId)}
        loading={deleteMut.isPending}
        message="Вы уверены что хотите удалить этот товар? Действие нельзя отменить."
      />
    </div>
  )
}
