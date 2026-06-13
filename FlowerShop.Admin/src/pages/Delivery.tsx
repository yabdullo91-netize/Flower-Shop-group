import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Badge, Input, Spinner, Confirm, Empty, Table, Th, Td, Modal, toast, Checkbox } from '@/components/ui'
import type { DeliverySlot } from '@/types'

const empty = (): Partial<DeliverySlot> => ({ slot: '', isActive: true, sortOrder: 0 })

export function DeliveryPage() {
  const qc = useQueryClient()
  const [open, setOpen]   = useState(false)
  const [delId, setDelId] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm]   = useState(empty())

  const { data, isLoading } = useQuery<DeliverySlot[]>({
    queryKey: ['delivery-slots'],
    queryFn: () => api.get('/delivery/slots').then(r => r.data),
  })

  const close = () => { setOpen(false); setEditing(null); setForm(empty()) }

  const upsertMut = useMutation({
    mutationFn: (payload: object) =>
      editing
        ? api.put(`/admin/delivery/slots/${editing}`, payload)
        : api.post('/admin/delivery/slots', payload),
    onSuccess: () => {
      toast.success(editing ? 'Слот обновлён' : 'Слот создан')
      qc.invalidateQueries({ queryKey: ['delivery-slots'] })
      close()
    },
    onError: () => toast.error('Ошибка сохранения'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/delivery/slots/${id}`),
    onSuccess: () => {
      toast.success('Слот удалён')
      qc.invalidateQueries({ queryKey: ['delivery-slots'] })
      setDelId(null)
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  const openEdit = (s: DeliverySlot) => {
    setEditing(s.id)
    setForm({ ...s })
    setOpen(true)
  }

  const save = () => {
    if (!form.slot?.trim()) { toast.error('Введите временной слот'); return }
    upsertMut.mutate({
      slot:      form.slot,
      isActive:  form.isActive  ?? true,
      sortOrder: form.sortOrder ?? 0,
    })
  }

  const slots = data ?? []

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Слоты доставки</h1>
          <p className="text-slate-500 text-sm mt-0.5">{slots.length} слотов</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setForm(empty()); setOpen(true) }}>
          Добавить слот
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : slots.length === 0 ? (
        <Empty message="Слоты не добавлены" icon="🚚" />
      ) : (
        <Table className="max-w-lg">
          <thead>
            <tr>
              <Th>Временной слот</Th>
              <Th>Порядок</Th>
              <Th>Статус</Th>
              <Th className="w-24">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {slots.sort((a, b) => a.sortOrder - b.sortOrder).map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <Td>
                  <span className="font-medium text-slate-900">{s.slot}</span>
                </Td>
                <Td className="text-slate-500">{s.sortOrder}</Td>
                <Td>
                  <Badge color={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Активен' : 'Скрыт'}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDelId(s.id)} className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Редактировать слот' : 'Новый слот доставки'}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>Отмена</Button>
            <Button size="sm" loading={upsertMut.isPending} onClick={save}>Сохранить</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Временной слот *"
            value={form.slot ?? ''}
            onChange={e => setForm(f => ({ ...f, slot: e.target.value }))}
            placeholder="09:00 – 12:00"
          />
          <Input
            label="Порядок сортировки"
            type="number"
            value={String(form.sortOrder ?? 0)}
            onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
          />
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
        message="Удалить этот временной слот?"
      />
    </div>
  )
}
