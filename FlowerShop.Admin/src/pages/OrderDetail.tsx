import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Badge, Select, Spinner, Card, toast } from '@/components/ui'
import type { Order } from '@/types'

const STATUS_SEQ = ['Pending', 'Processing', 'PhotoReady', 'OutForDelivery', 'Delivered']
const STATUS_LABEL: Record<string, string> = {
  Pending: 'Принят', Processing: 'Собирается', PhotoReady: 'Фото готово',
  OutForDelivery: 'Курьер в пути', Delivered: 'Доставлен', Cancelled: 'Отменён',
}
const STATUS_COLOR: Record<string, 'violet' | 'amber' | 'blue' | 'orange' | 'green' | 'red'> = {
  Pending: 'violet', Processing: 'amber', PhotoReady: 'blue',
  OutForDelivery: 'orange', Delivered: 'green', Cancelled: 'red',
}
const PAY_LABEL: Record<string, string> = { dc: 'Карта', alif: 'Alif Pay', cash: 'Наличные' }

function fmtDate(s: string) {
  return new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function OrderDetail() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const fileRef  = useRef<HTMLInputElement>(null)
  const [nextStatus, setNextStatus] = useState('')
  const [comment, setComment]       = useState('')
  const [uploading, setUploading]   = useState(false)

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
    enabled: !!id,
  })

  const statusMut = useMutation({
    mutationFn: ({ status, comment }: { status: string; comment: string }) =>
      api.patch(`/orders/${id}/status`, null, { params: { status, comment: comment || undefined } }),
    onSuccess: () => {
      toast.success('Статус обновлён')
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      setNextStatus('')
      setComment('')
    },
    onError: () => toast.error('Ошибка обновления статуса'),
  })

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await api.post(`/orders/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Фото добавлено')
      qc.invalidateQueries({ queryKey: ['order', id] })
    } catch {
      toast.error('Ошибка загрузки фото')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!order)   return <div className="p-8 text-slate-500">Заказ не найден</div>

  const curIdx = STATUS_SEQ.indexOf(order.status)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/orders')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Заказ {order.orderNumber}</h1>
            <Badge color={STATUS_COLOR[order.status] ?? 'slate'}>{STATUS_LABEL[order.status] ?? order.status}</Badge>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{fmtDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Состав заказа</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.productImg ? (
                    <img src={item.productImg} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.productName}</p>
                    <p className="text-xs text-slate-400">
                      {item.sizeLabel ?? item.stemCount + ' шт.'} × {item.quantity}
                      {item.packaging && ` · ${item.packaging}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 shrink-0">
                    {item.totalPrice.toLocaleString()} сом
                  </span>
                </div>
              ))}

              {order.addons.length > 0 && (
                <>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-semibold">Доп. товары</p>
                    {order.addons.map(a => (
                      <div key={a.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{a.addonName} × {a.quantity}</span>
                        <span className="font-medium">{(a.price * a.quantity).toLocaleString()} сом</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Товары</span>
                <span>{order.subtotal.toLocaleString()} сом</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Скидка</span>
                  <span>−{order.discountAmount.toLocaleString()} сом</span>
                </div>
              )}
              {order.pointsRedeemed > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Бонусы</span>
                  <span>−{order.pointsRedeemed} сом</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>Доставка</span>
                <span>{order.deliveryFee === 0 ? 'Бесплатно' : `${order.deliveryFee} сом`}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Итого</span>
                <span>{order.total.toLocaleString()} сом</span>
              </div>
            </div>
          </Card>

          {/* Photo */}
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Фото готового букета</h2>
            {order.orderPhotoUrl ? (
              <img src={order.orderPhotoUrl} alt="Фото заказа" className="w-full max-w-sm rounded-xl object-cover" />
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <p className="text-slate-400 text-sm mb-3">Фото ещё не добавлено</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) uploadPhoto(f)
                    e.target.value = ''
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Upload size={14} />}
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  Загрузить фото
                </Button>
              </div>
            )}
            {order.orderPhotoUrl && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) uploadPhoto(f)
                    e.target.value = ''
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  icon={<Upload size={14} />}
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  Заменить фото
                </Button>
              </>
            )}
          </Card>

          {/* Status history */}
          {order.statusHistory.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3">История статусов</h2>
              <div className="space-y-2">
                {order.statusHistory.map((h, i) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <CheckCircle size={15} className={`mt-0.5 shrink-0 ${i === 0 ? 'text-violet-600' : 'text-slate-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{STATUS_LABEL[h.status] ?? h.status}</p>
                      {h.note && <p className="text-xs text-slate-400">{h.note}</p>}
                      <p className="text-xs text-slate-400">{fmtDate(h.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Customer */}
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Получатель</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Имя</p>
                <p className="text-slate-900 font-medium">{order.recipientName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Телефон</p>
                <p className="text-slate-900">{order.recipientPhone}</p>
              </div>
              {order.isGift && (
                <Badge color="violet">Подарок {order.isAnonymous ? '(анонимно)' : ''}</Badge>
              )}
            </div>
          </Card>

          {/* Delivery */}
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Доставка</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Адрес</p>
                <p className="text-slate-900">{order.deliveryAddress}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Дата и время</p>
                <p className="text-slate-900">{order.deliveryDate} · {order.deliveryTimeSlot}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Оплата</p>
                <p className="text-slate-900">{PAY_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
              </div>
            </div>
          </Card>

          {/* Postcard */}
          {order.cardText && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-2">Открытка</h2>
              <p className="text-sm italic text-slate-600">"{order.cardText}"</p>
            </Card>
          )}

          {/* Progress */}
          <Card className="p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Прогресс</h2>
            <div className="space-y-2">
              {STATUS_SEQ.map((s, i) => (
                <div key={s} className={`flex items-center gap-2 text-sm ${
                  i <= curIdx ? 'text-violet-700' : 'text-slate-400'
                }`}>
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    i < curIdx  ? 'bg-violet-600' :
                    i === curIdx ? 'bg-violet-600 ring-2 ring-violet-200' :
                    'bg-slate-200'
                  }`} />
                  {STATUS_LABEL[s]}
                </div>
              ))}
            </div>
          </Card>

          {/* Update Status */}
          {(order.status as string) !== 'Cancelled' && (order.status as string) !== 'Delivered' && (
            <Card className="p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Изменить статус</h2>
              <div className="space-y-3">
                <Select
                  value={nextStatus}
                  onChange={e => setNextStatus(e.target.value)}
                >
                  <option value="">— Выберите статус —</option>
                  {STATUS_SEQ.slice(curIdx + 1).map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                  {order.status !== 'Cancelled' && (
                    <option value="Cancelled">Отменить заказ</option>
                  )}
                </Select>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Комментарий (необязательно)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-violet-500 resize-none"
                />
                <Button
                  className="w-full"
                  disabled={!nextStatus}
                  loading={statusMut.isPending}
                  onClick={() => statusMut.mutate({ status: nextStatus, comment })}
                >
                  Обновить статус
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
