import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Users,
  Gift, Image, Star, Truck, LogOut, Flower2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

const NAV_MAIN = [
  { to: '/',         label: 'Дашборд',     icon: LayoutDashboard },
  { to: '/products', label: 'Товары',       icon: Package },
  { to: '/orders',   label: 'Заказы',       icon: ShoppingBag },
]
const NAV_MANAGE = [
  { to: '/promos',   label: 'Скидки',       icon: Tag },
  { to: '/users',    label: 'Пользователи', icon: Users },
  { to: '/addons',   label: 'Доп. товары',  icon: Gift },
  { to: '/banners',  label: 'Баннеры',      icon: Image },
  { to: '/reviews',  label: 'Отзывы',       icon: Star },
  { to: '/delivery', label: 'Доставка',     icon: Truck },
]

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? 'text-violet-200' : 'group-hover:text-slate-200'} />
          <span>{label}</span>
          {isActive && (
            <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-violet-300" />
          )}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('admin-refresh-token')
      if (token) await api.post('/auth/logout', { refreshToken: token }).catch(() => {})
    } finally {
      logout()
      navigate('/login')
    }
  }

  const initials = (user?.name?.[0] ?? user?.phone?.[3] ?? 'A').toUpperCase()

  return (
    <aside className="w-[220px] shrink-0 h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #141026 0%, #0e0c1e 100%)' }}>
      {/* Top accent */}
      <div className="h-[2px] shrink-0" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #6366f1)' }} />

      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/50"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
          <Flower2 size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-tight">FlowerHouse</p>
          <p className="text-violet-400/80 text-[11px] leading-tight mt-0.5">Панель управления</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto scrollbar-thin space-y-0.5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2 mt-1">Главное</p>
        {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2 mt-4">Управление</p>
        {NAV_MANAGE.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* User + Logout */}
      <div className="px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-semibold truncate leading-tight">
              {user?.name ?? user?.phone ?? 'Администратор'}
            </p>
            <p className="text-slate-500 text-[11px] truncate leading-tight mt-0.5">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-150"
        >
          <LogOut size={15} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  )
}
