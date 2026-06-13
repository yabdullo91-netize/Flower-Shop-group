import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Badge, Input, Spinner, Confirm, Empty, Table, Th, Td, Modal, toast, Checkbox } from '@/components/ui'
import type { PromoCode } from '@/types'

const empty = (): Partial<PromoCode> & { discountPctStr: string; discountFixedStr: string; minOrderStr: string; maxUsesStr: string } => ({
  code: '', discountPctStr: '', discountFixedStr: '', minOrderStr: '', maxUsesStr: '',
  validFrom: '', validUntil: '', isActive: true,
})

function fmtDate(s?: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('ru-RU')
}

export function Promos() {
  const qc = useQueryClient()
  const [open, setOpen]   = useState(false)
  const [delId, setDelId] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm]   = useState(empty())

  const { data, isLoading } = useQuery<PromoCode[]>({
    queryKey: ['promos'],
    queryFn: () => api.get('/admin/promo-codes').then(r => r.data),
  })

  const upsertMut = useMutation({
    mutationFn: (payload: object) =>
      editing
        ? api.put(`/admin/promo-codes/${editing}`, payload)
        : api.post('/admin/promo-codes', payload),
    onSuccess: () => {
      toast.success(editing ? 'Промокод обновлён' : 'Промокод создан')
      qc.invalidateQueries({ queryKey: ['promos'] })
      close()
    },
    onError: () => toast.error('Ошибка сохранения'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/promo-codes/${id}`),
    onSuccess: () => {
      toast.success('Промокод удалён')
      qc.invalidateQueries({ queryKey: ['promos'] })
      setDelId(null)
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  const close = () => { setOpen(false); setEditing(null); setForm(empty()) }

  const openEdit = (p: PromoCode) => {
    setEditing(p.id)
    setForm({
      ...p,
      discountPctStr:   p.discountPct?.toString() ?? '',
      discountFixedStr: p.discountFixed?.toString() ?? '',
      minOrderStr:      p.minOrder?.toString() ?? '',
      maxUsesStr:       p.maxUses?.toString() ?? '',
      validFrom:  p.validFrom  ? p.validFrom.slice(0, 10)  : '',
      validUntil: p.validUntil ? p.validUntil.slice(0, 10) : '',
    })
    setOpen(true)
  }

  const save = () => {
    if (!form.code?.trim()) { toast.error('Введите код'); return }
    const payload = {
      code:          form.code,
      discountPct:   form.discountPctStr   ? parseInt(form.discountPctStr)   : null,
      discountFixed: form.discountFixedStr ? parseFloat(form.discountFixedStr) : null,
      minOrder:      form.minOrderStr      ? parseFloat(form.minOrderStr)    : null,
      maxUses:       form.maxUsesStr       ? parseInt(form.maxUsesStr)       : null,
      validFrom:     form.validFrom  || null,
      validUntil:    form.validUntil || null,
      isActive:      form.isActive ?? true,
    }
    upsertMut.mutate(payload)
  }

  const promos = data ?? []

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Tag size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Скидки и промокоды</h1>
            <p className="text-slate-500 text-xs mt-0.5">{promos.length} промокодов</p>
          </div>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => { setForm(empty()); setOpen(true) }}>
          Добавить скидку
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : promos.length === 0 ? (
        <Empty message="Промокодов нет" icon="🏷️" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Код</Th>
              <Th>Скидка</Th>
              <Th>Мин. заказ</Th>
              <Th>Использований</Th>
              <Th>Действует до</Th>
              <Th>Статус</Th>
              <Th className="w-24">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {promos.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <Td>
                  <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono text-violet-700">
                    {p.code}
                  </code>
                </Td>
                <Td>
                  {p.discountPct   && <span className="font-semibold text-emerald-700">−{p.discountPct}%</span>}
                  {p.discountFixed && <span className="font-semibold text-emerald-700">−{p.discountFixed} сом</span>}
                  {!p.discountPct && !p.discountFixed && <span className="text-slate-400">—</span>}
                </Td>
                <Td>{p.minOrder ? `${p.minOrder} сом` : '—'}</Td>
                <Td>
                  <span>{p.usedCount}</span>
                  {p.maxUses && <span className="text-slate-400"> / {p.maxUses}</span>}
                </Td>
                <Td>{fmtDate(p.validUntil)}</Td>
                <Td>
                  <Badge color={p.isActive ? 'green' : 'red'}>
                    {p.isActive ? 'Активен' : 'Отключён'}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-600 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDelId(p.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Form Modal */}
      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Редактировать промокод' : 'Новый промокод'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>Отмена</Button>
            <Button size="sm" loading={upsertMut.isPending} onClick={save}>Сохранить</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Код *"
            value={form.code ?? ''}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER20"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Скидка %"
              type="number"
              value={form.discountPctStr ?? ''}
              onChange={e => setForm(f => ({ ...f, discountPctStr: e.target.value }))}
              placeholder="20"
            />
            <Input
              label="Фиксированная скидка (сом)"
              type="number"
              value={form.discountFixedStr ?? ''}
              onChange={e => setForm(f => ({ ...f, discountFixedStr: e.target.value }))}
              placeholder="200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Мин. сумма заказа"
              type="number"
              value={form.minOrderStr ?? ''}
              onChange={e => setForm(f => ({ ...f, minOrderStr: e.target.value }))}
              placeholder="1000"
            />
            <Input
              label="Макс. использований"
              type="number"
              value={form.maxUsesStr ?? ''}
              onChange={e => setForm(f => ({ ...f, maxUsesStr: e.target.value }))}
              placeholder="100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Действует с"
              type="date"
              value={form.validFrom ?? ''}
              onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
            />
            <Input
              label="Действует до"
              type="date"
              value={form.validUntil ?? ''}
              onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
            />
          </div>
          <Checkbox
            label="Активен"
            checked={form.isActive ?? true}
            onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
          />
        </div>
      </Modal>

      <Confirm
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => delId && deleteMut.mutate(delId)}
        loading={deleteMut.isPending}
        message="Удалить этот промокод?"
      />
    </div>
  )
}
