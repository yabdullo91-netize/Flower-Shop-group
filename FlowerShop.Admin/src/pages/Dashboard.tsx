import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ShoppingBag, Users, Star, DollarSign, Package } from 'lucide-react'
import { api } from '@/lib/api'
import { Spinner } from '@/components/ui'
import type { DashboardStats, ChartPoint } from '@/types'

const fmtPrice = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M TJS` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}K TJS` :
  `${n} TJS`

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)

const KPI_CONFIG = [
  {
    key: 'revenue',
    label: 'Выручка',
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
    glow: 'rgba(124,58,237,0.35)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  {
    key: 'orders',
    label: 'Заказов',
    icon: ShoppingBag,
    gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    glow: 'rgba(37,99,235,0.35)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  {
    key: 'users',
    label: 'Пользователей',
    icon: Users,
    gradient: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
    glow: 'rgba(5,150,105,0.35)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  {
    key: 'reviews',
    label: 'Ожидают отзывов',
    icon: Star,
    gradient: 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
    glow: 'rgba(217,119,6,0.35)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
]

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="font-bold text-slate-900">{formatter(payload[0].value)}</p>
    </div>
  )
}

export function Dashboard() {
  const statsQ = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then(r => r.data),
  })

  const chartQ = useQuery<ChartPoint[]>({
    queryKey: ['dashboard-chart'],
    queryFn: () => api.get('/admin/dashboard/orders-chart').then(r => r.data),
  })

  if (statsQ.isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )

  const s = statsQ.data
  const kpiValues = [
    fmtPrice(s?.totalRevenue ?? 0),
    fmt(s?.ordersCount ?? 0),
    fmt(s?.activeUsersCount ?? 0),
    String(s?.pendingReviewsCount ?? 0),
  ]

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Дашборд</h1>
        <p className="text-slate-500 text-sm mt-0.5">Обзор основных показателей магазина</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CONFIG.map((cfg, i) => {
          const Icon = cfg.icon
          return (
            <div
              key={cfg.key}
              className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: cfg.gradient,
                boxShadow: `0 8px 24px ${cfg.glow}`,
              }}
            >
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 bg-white" />
              <div className="absolute -right-1 bottom-3 w-14 h-14 rounded-full opacity-10 bg-white" />

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: cfg.iconBg, backdropFilter: 'blur(8px)' }}
              >
                <Icon size={20} className="text-white" strokeWidth={2} />
              </div>

              {/* Value */}
              <div>
                <p className="text-2xl font-extrabold text-white leading-none tracking-tight">{kpiValues[i]}</p>
                <p className="text-white/70 text-xs font-medium mt-1.5">{cfg.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Выручка за 7 дней</h2>
              <p className="text-slate-400 text-xs mt-0.5">TJS</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold bg-violet-50 px-2.5 py-1 rounded-full">
              <TrendingUp size={12} />
              График
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartQ.data ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={v => `${Math.round(v / 1000)}K`}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip formatter={(v: number) => fmtPrice(v)} />} />
              <Area
                type="monotone" dataKey="revenue" stroke="#7c3aed"
                strokeWidth={2.5} fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Заказы за 7 дней</h2>
              <p className="text-slate-400 text-xs mt-0.5">Количество</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
              <ShoppingBag size={12} />
              График
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartQ.data ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                allowDecimals={false} axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip formatter={(v: number) => `${v} заказов`} />} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-slate-500" />
          <h2 className="font-bold text-slate-900 text-sm">Быстрые данные</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Всего выручки', value: fmtPrice(s?.totalRevenue ?? 0), color: 'text-violet-600' },
            { label: 'Всего заказов', value: fmt(s?.ordersCount ?? 0), color: 'text-blue-600' },
            { label: 'Пользователей', value: fmt(s?.activeUsersCount ?? 0), color: 'text-emerald-600' },
            { label: 'На модерации', value: String(s?.pendingReviewsCount ?? 0), color: 'text-amber-600' },
          ].map(item => (
            <div key={item.label} className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium">{item.label}</span>
              <span className={`text-xl font-extrabold mt-0.5 ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
