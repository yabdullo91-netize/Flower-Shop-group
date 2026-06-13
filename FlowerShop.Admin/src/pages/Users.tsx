import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, ShieldCheck, Ban } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge, Spinner, Empty, Table, Th, Td, toast, Select, Modal, Button } from '@/components/ui'
import type { User } from '@/types'

const ROLE_COLOR: Record<string, 'violet' | 'amber' | 'slate'> = {
  SuperAdmin: 'violet', Admin: 'amber', Customer: 'slate',
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function UsersPage() {
  const qc     = useQueryClient()
  const [q, setQ] = useState('')
  const [roleEdit, setRoleEdit] = useState<User | null>(null)
  const [newRole, setNewRole]   = useState('')

  const { data, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  })

  const blockMut = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/block`),
    onSuccess: () => { toast.success('Статус изменён'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: () => toast.error('Ошибка'),
  })

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, JSON.stringify(role), { headers: { 'Content-Type': 'application/json' } }),
    onSuccess: () => {
      toast.success('Роль изменена')
      qc.invalidateQueries({ queryKey: ['users'] })
      setRoleEdit(null)
    },
    onError: () => toast.error('Ошибка изменения роли'),
  })

  const users = (data ?? []).filter(u =>
    !q || u.name?.toLowerCase().includes(q.toLowerCase()) || u.phone.includes(q)
  )

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Пользователи</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} пользователей</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Поиск по имени или телефону..."
          className="h-8 pl-8 pr-3 w-72 rounded-lg border border-slate-300 text-sm outline-none focus:border-violet-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : users.length === 0 ? (
        <Empty message="Пользователи не найдены" icon="👥" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Пользователь</Th>
              <Th>Телефон</Th>
              <Th>Роль</Th>
              <Th>Зарегистрирован</Th>
              <Th>Статус</Th>
              <Th>Действия</Th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                      {(u.name?.[0] ?? u.phone[3] ?? '?').toUpperCase()}
                    </div>
                    <span className="font-medium text-sm text-slate-900">{u.name ?? '—'}</span>
                  </div>
                </Td>
                <Td className="text-sm font-mono">{u.phone}</Td>
                <Td>
                  <Badge color={ROLE_COLOR[u.role] ?? 'slate'}>{u.role}</Badge>
                </Td>
                <Td className="text-xs text-slate-500">{fmtDate(u.createdAt)}</Td>
                <Td>
                  <Badge color={u.isBlocked ? 'red' : 'green'}>
                    {u.isBlocked ? 'Заблокирован' : 'Активен'}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <button
                      title="Изменить роль"
                      onClick={() => { setRoleEdit(u); setNewRole(u.role) }}
                      className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-500 hover:text-violet-600 transition-colors"
                    >
                      <ShieldCheck size={15} />
                    </button>
                    <button
                      title={u.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                      onClick={() => blockMut.mutate(u.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.isBlocked
                          ? 'hover:bg-emerald-100 text-slate-500 hover:text-emerald-600'
                          : 'hover:bg-rose-100 text-slate-500 hover:text-rose-600'
                      }`}
                    >
                      <Ban size={15} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={!!roleEdit}
        onClose={() => setRoleEdit(null)}
        title="Изменить роль"
        maxWidth="max-w-xs"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRoleEdit(null)}>Отмена</Button>
            <Button size="sm" loading={roleMut.isPending} onClick={() => roleEdit && roleMut.mutate({ id: roleEdit.id, role: newRole })}>
              Сохранить
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Пользователь: <strong>{roleEdit?.name ?? roleEdit?.phone}</strong>
          </p>
          <Select label="Роль" value={newRole} onChange={e => setNewRole(e.target.value)}>
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </Select>
        </div>
      </Modal>
    </div>
  )
}
