import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/cart/store'
import { useCartFlyStore } from '@/features/cart/flyStore'
import { useAuthStore } from '@/features/auth/store'

export function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const cartCount = useCartStore(s => s.count())
  const pulseKey = useCartFlyStore(s => s.pulseKey)
  const [prevCount, setPrevCount] = useState(cartCount)
  const [cartBump, setCartBump] = useState(0)
  const { user, openModal } = useAuthStore()

  useEffect(() => {
    if (cartCount > prevCount) setCartBump(k => k + 1)
    setPrevCount(cartCount)
  }, [cartCount, prevCount])

  // Also bump when the fly animation lands
  useEffect(() => {
    if (pulseKey > 0) setCartBump(k => k + 1)
  }, [pulseKey])

  if (location.pathname === '/checkout') return null

  const active = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-[16px] border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('nav.main_nav')}
    >
      <div className="flex h-14">
        <NavItem to="/" label={t('nav.home')} isActive={active('/')}>
          <HomeIcon active={active('/')} />
        </NavItem>

        <NavItem to="/catalog" label={t('nav.catalog')} isActive={active('/catalog')}>
          <GridIcon active={active('/catalog')} />
        </NavItem>

        <NavItem to="/cart" label={t('nav.cart')} isActive={active('/cart')}>
          <div data-cart-target="bottom" className="relative">
            <motion.div
              key={cartBump}
              animate={cartBump > 0 ? { scale: [1, 1.25, 1] } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <CartNavIcon active={active('/cart')} />
            </motion.div>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-2 bg-rose-dust text-ink text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 tabular-nums"
                  aria-live="polite"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </NavItem>

        <button
          onClick={() => (user ? navigate('/account') : openModal())}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
          aria-label={user ? t('nav.profile') : t('nav.login')}
        >
          {active('/account') && (
            <motion.div
              layoutId="nav-active-line"
              className="absolute -top-px inset-x-3 h-[2px] bg-green-deep rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <UserNavIcon active={active('/account')} />
          <span className={`text-[10px] ${active('/account') ? 'text-green-deep font-semibold' : 'text-muted'}`}>
            {user ? t('nav.profile') : t('nav.login')}
          </span>
        </button>
      </div>
    </nav>
  )
}

function NavItem({ to, label, isActive, children }: {
  to: string; label: string; isActive: boolean; children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
      aria-label={label}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active-line"
          className="absolute -top-px inset-x-3 h-[2px] bg-green-deep rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      {children}
      <span className={`text-[10px] ${isActive ? 'text-green-deep font-semibold' : 'text-muted'}`}>
        {label}
      </span>
    </Link>
  )
}

// All SVG icons use currentColor — inherits from parent text-green-deep / text-muted class
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={active ? 'text-green-deep' : 'text-muted'}
      aria-hidden="true"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9,21 9,12 15,12 15,21"/>
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={active ? 'text-green-deep' : 'text-muted'}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'}/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'}/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'}/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill={active ? 'currentColor' : 'none'}/>
    </svg>
  )
}

function CartNavIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={active ? 'text-green-deep' : 'text-muted'}
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" fill={active ? 'currentColor' : 'none'}/>
      <circle cx="20" cy="21" r="1" fill={active ? 'currentColor' : 'none'}/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function UserNavIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={active ? 'text-green-deep' : 'text-muted'}
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
