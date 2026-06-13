import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Badge, Input, Spinner, Confirm, Empty, Table, Th, Td, Modal, toast, Checkbox } from '@/components/ui'
import type { Addon } from '@/types'

const empty = (): Partial<Addon> & { priceStr: string } => ({
  type: 'gift', name: '', emoji: '', priceStr: '', hasInscription: false, isActive: true, sortOrder: 0,
})

export function AddonsPage() {
  const qc = useQueryClient()
  const [open, setOpen]   = useState(false)
  const [delId, setDelId] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm]   = useState(empty())

  const { data, isLoading } = useQuery<Addon[]>({
    queryKey: ['addons'],
    queryFn: () => api.get('/addons').then(r => r.data),
  })

  const close = () => { setOpen(false); setEditing(null); setForm(empty()) }

  const upsertMut = useMutation({
    mutationFn: (payload: object) =>
      editing
        ? api.put(`/addons/${editing}`, payload)
        : api.post('/addons', payload),
    onSuccess: () => {
      toast.success(editing ? 'Обновлено' : 'Создано')
      qc.invalidateQueries({ queryKey: ['addons'] })
      close()
    },
    onError: () => toast.error('Ошибка сохранения'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/addons/${id}`),
    onSuccess: () => {
      toast.success('Удалено')
      qc.invalidateQueries({ queryKey: ['addons'] })
      setDelId(null)
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  const openEdit = (a: Addon) => {
    setEditing(a.id)
    setForm({ ...a, priceStr: String(a.price) })
    setOpen(true)
  }

  const save = () => {
    if (!form.name?.trim()) { toast.error('Введите название'); return }
    upsertMut.mutate({
      type:           form.type,
      name:           form.name,
      emoji:          form.emoji || null,
      imageUrl:       form.imageUrl || null,
      price:          parseFloat(form.priceStr ?? '0') || 0,
      hasInscription: form.hasInscription ?? false,
      isActive:       form.isActive ?? true,
      sortOrder:      form.sortOrder ?? 0,
    })
  }

  const addons = data ?? []

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Доп. товары</h1>
          <p className="text-slate-500 text-sm mt-0.5">{addons.length} позиций</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setForm(empty()); setOpen(true) }}>
          Добавить
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : addons.length === 0 ? (
        <Empty message="Доп. товары не добавлены" icon="🎁" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Товар</Th>
              <Th>Тип</Th>
              <Th>Цена</Th>
              <Th>Надпись</Th>
              <Th>Статус</Th>
              <Th className="w-24">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {addons.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2.5">
                    {a.emoji && <span className="text-2xl">{a.emoji}</span>}
                    {a.imageUrl && !a.emoji && <img src={a.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                    <span className="font-medium text-sm text-slate-900">{a.name}</span>
                  </div>
                </Td>
                <Td><Badge color="slate">{a.type}</Badge></Td>
                <Td className="font-semibold">{a.price.toLocaleString()} сом</Td>
                <Td>{a.hasInscription ? <Badge color="blue">Есть</Badge> : <span className="text-slate-400">—</span>}</Td>
                <Td>
                  <Badge color={a.isActive ? 'green' : 'red'}>{a.isActive ? 'Активен' : 'Скрыт'}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDelId(a.id)} className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors">
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
        title={editing ? 'Редактировать доп. товар' : 'Новый доп. товар'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>Отмена</Button>
            <Button size="sm" loading={upsertMut.isPending} onClick={save}>Сохранить</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Название *" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Коробка конфет" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Тип (type)" value={form.type ?? ''} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="gift" />
            <Input label="Emoji" value={form.emoji ?? ''} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🍫" />
          </div>
          <Input label="Цена (сом) *" type="number" value={form.priceStr ?? ''} onChange={e => setForm(f => ({ ...f, priceStr: e.target.value }))} placeholder="350" />
          <Input label="URL изображения" value={form.imageUrl ?? ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
          <Input label="Порядок сортировки" type="number" value={String(form.sortOrder ?? 0)} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
          <div className="flex gap-4">
            <Checkbox label="Надпись на товаре" checked={form.hasInscription ?? false} onChange={e => setForm(f => ({ ...f, hasInscription: e.target.checked }))} />
            <Checkbox label="Активен" checked={form.isActive ?? true} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          </div>
        </div>
      </Modal>

      <Confirm
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => delId && deleteMut.mutate(delId)}
        loading={deleteMut.isPending}
        message="Удалить этот доп. товар?"
      />
    </div>
  )
}
