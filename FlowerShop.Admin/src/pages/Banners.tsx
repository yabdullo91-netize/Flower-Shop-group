import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { Button, Badge, Input, Spinner, Confirm, Empty, Table, Th, Td, Modal, toast, Checkbox } from '@/components/ui'
import type { Banner } from '@/types'

const empty = (): Partial<Banner> => ({
  title: '', imageUrl: '', link: '', isActive: true, sortOrder: 0,
})

export function BannersPage() {
  const qc = useQueryClient()
  const [open, setOpen]   = useState(false)
  const [delId, setDelId] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm]   = useState(empty())

  const { data, isLoading } = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: () => api.get('/content/banners').then(r => r.data),
  })

  const close = () => { setOpen(false); setEditing(null); setForm(empty()) }

  const upsertMut = useMutation({
    mutationFn: (payload: object) =>
      editing
        ? api.put(`/admin/banners/${editing}`, payload)
        : api.post('/admin/banners', payload),
    onSuccess: () => {
      toast.success(editing ? 'Баннер обновлён' : 'Баннер создан')
      qc.invalidateQueries({ queryKey: ['banners'] })
      close()
    },
    onError: () => toast.error('Ошибка сохранения'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      toast.success('Баннер удалён')
      qc.invalidateQueries({ queryKey: ['banners'] })
      setDelId(null)
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  const openEdit = (b: Banner) => {
    setEditing(b.id)
    setForm({
      ...b,
      startsAt: b.startsAt ? b.startsAt.slice(0, 10) : '',
      endsAt:   b.endsAt   ? b.endsAt.slice(0, 10)   : '',
    })
    setOpen(true)
  }

  const save = () => {
    if (!form.imageUrl?.trim()) { toast.error('Введите URL изображения'); return }
    upsertMut.mutate({
      title:     form.title     || null,
      imageUrl:  form.imageUrl,
      link:      form.link      || null,
      isActive:  form.isActive  ?? true,
      sortOrder: form.sortOrder ?? 0,
      startsAt:  form.startsAt  || null,
      endsAt:    form.endsAt    || null,
    })
  }

  const banners = data ?? []

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Баннеры</h1>
          <p className="text-slate-500 text-sm mt-0.5">{banners.length} баннеров</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setForm(empty()); setOpen(true) }}>
          Добавить баннер
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : banners.length === 0 ? (
        <Empty message="Баннеры не добавлены" icon="🖼️" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="aspect-[16/5] bg-slate-100 overflow-hidden relative">
                <img src={b.imageUrl} alt={b.title ?? ''} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                {!b.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge color="red">Отключён</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-slate-900 text-sm truncate">{b.title ?? '(без названия)'}</p>
                {b.link && (
                  <a href={b.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-violet-600 flex items-center gap-1 mt-0.5 hover:underline truncate"
                  >
                    <ExternalLink size={10} />{b.link}
                  </a>
                )}
                <div className="flex items-center justify-between mt-3">
                  <Badge color={b.isActive ? 'green' : 'red'}>{b.isActive ? 'Активен' : 'Скрыт'}</Badge>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDelId(b.id)} className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Редактировать баннер' : 'Новый баннер'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={close}>Отмена</Button>
            <Button size="sm" loading={upsertMut.isPending} onClick={save}>Сохранить</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="URL изображения *" value={form.imageUrl ?? ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://example.com/banner.jpg" />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="w-full rounded-lg object-cover aspect-[16/5] bg-slate-100" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <Input label="Заголовок" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Летняя распродажа" />
          <Input label="Ссылка (URL)" value={form.link ?? ''} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/catalog?occasion=birthday" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Начало" type="date" value={form.startsAt ?? ''} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />
            <Input label="Конец" type="date" value={form.endsAt ?? ''} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} />
          </div>
          <Input label="Порядок сортировки" type="number" value={String(form.sortOrder ?? 0)} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
          <Checkbox label="Активен" checked={form.isActive ?? true} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
        </div>
      </Modal>

      <Confirm
        open={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={() => delId && deleteMut.mutate(delId)}
        loading={deleteMut.isPending}
        message="Удалить этот баннер?"
      />
    </div>
  )
}
