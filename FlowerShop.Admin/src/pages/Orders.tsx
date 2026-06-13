import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, ShoppingBag, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Spinner, Empty, Table, Th, Td } from '@/components/ui'
import type { Order } from '@/types'

const STATUSES = [
  { value: '',               label: 'Все',         color: 'text-slate-600 bg-slate-100' },
  { value: 'Pending',        label: 'Принят',      color: 'text-violet-600 bg-violet-50' },
  { value: 'Processing',     label: 'Собирается',  color: 'text-amber-600 bg-amber-50'  },
  { value: 'PhotoReady',     label: 'Фото готово', color: 'text-blue-600 bg-blue-50'    },
  { value: 'OutForDelivery', label: 'В пути',      color: 'text-orange-600 bg-orange-50' },
  { value: 'Delivered',      label: 'Доставлен',   color: 'text-emerald-600 bg-emerald-50' },
  { value: 'Cancelled',      label: 'Отменён',     color: 'text-rose-600 bg-rose-50'    },
]

const STATUS_COLOR: Record<string, 'violet'|'amber'|'blue'|'orange'|'green'|'red'|'slate'> = {
  Pending: 'violet', Processing: 'amber', PhotoReady: 'blue',
  OutForDelivery: 'orange', Delivered: 'green', Cancelled: 'red',
}
const STATUS_LABEL: Record<string, string> = {
  Pending: 'Принят', Processing: 'Собирается', PhotoReady: 'Фото готово',
  OutForDelivery: 'В пути', Delivered: 'Доставлен', Cancelled: 'Отменён',
}
const PAY_LABEL: Record<string, string> = { dc: 'Карта', alif: 'Alif Pay', cash: 'Наличные' }

function fmtDate(s: string) {
  return new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function Orders() {
  const navigate        = useNavigate()
  const [status, setStatus] = useState('')
  const [q, setQ]       = useState('')

  const { data, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', status],
    queryFn: () => api.get('/orders', { params: status ? { status } : {} }).then(r => r.data),
  })

  const orders = (data ?? []).filter(o =>
    !q || o.orderNumber?.toLowerCase().includes(q.toLowerCase()) ||
    o.recipientName?.toLowerCase().includes(q.toLowerCase()) ||
    o.recipientPhone?.includes(q)
  )

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <ShoppingBag size={18} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Заказы</h1>
            <p className="text-slate-500 text-xs mt-0.5">{orders.length} заказов</p>
          </div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск по номеру, имени..."
            className="h-10 pl-10 pr-4 w-64 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 shadow-sm"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-5 bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              status === s.value
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : orders.length === 0 ? (
        <Empty message="Заказов не найдено" icon={<ShoppingBag size={28} className="text-slate-400" />} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Номер</Th>
              <Th>Получатель</Th>
              <Th>Дата</Th>
              <Th>Адрес</Th>
              <Th>Сумма</Th>
              <Th>Оплата</Th>
              <Th>Статус</Th>
              <Th className="w-12"></Th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr
                key={o.id}
                className="group hover:bg-violet-50/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/orders/${o.id}`)}
              >
                <Td>
                  <code className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg">
                    {o.orderNumber}
                  </code>
                </Td>
                <Td>
                  <p className="font-semibold text-slate-900 text-sm leading-tight">{o.recipientName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{o.recipientPhone}</p>
                </Td>
                <Td className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(o.createdAt)}</Td>
                <Td>
                  <p className="text-xs text-slate-600 max-w-[160px] truncate">{o.deliveryAddress}</p>
                  <p className="text-xs text-slate-400">{o.deliveryDate} · {o.deliveryTimeSlot}</p>
                </Td>
                <Td>
                  <span className="font-bold text-slate-900">{o.total.toLocaleString()} сом</span>
                </Td>
                <Td>
                  <Badge color="slate">{PAY_LABEL[o.paymentMethod] ?? o.paymentMethod}</Badge>
                </Td>
                <Td>
                  <Badge color={STATUS_COLOR[o.status] ?? 'slate'}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </Badge>
                </Td>
                <Td>
                  <ArrowRight size={15} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
