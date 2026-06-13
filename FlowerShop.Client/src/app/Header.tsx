import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/cart/store'
import { useCartFlyStore } from '@/features/cart/flyStore'
import { useFavoritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useLoyaltyStore } from '@/features/loyalty/store'
import { useScrollHeader } from '@/shared/hooks/useScrollHeader'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { LangSwitcher } from '@/shared/ui/LangSwitcher'

function CartBadge({ count }: { count: number }) {
  const pulseKey = useCartFlyStore(s => s.pulseKey)
  const [prev, setPrev] = useState(count)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (count !== prev) {
      setAnimKey(k => k + 1)
      setPrev(count)
    }
  }, [count, prev])

  // Extra pulse when fly animation lands
  useEffect(() => {
    if (pulseKey > 0) setAnimKey(k => k + 1)
  }, [pulseKey])

  if (count === 0) return null
  return (
    <motion.span
      key={animKey}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.35, 1] }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 400, damping: 10 }}
      className="absolute -top-1 -right-1 bg-rose-dust text-ink text-[10px] font-bold min-w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 tabular-nums"
      aria-live="polite"
    >
      {count}
    </motion.span>
  )
}

export function Header() {
  const { t } = useTranslation()
  const scrolled = useScrollHeader()
  const count = useCartStore(s => s.count())
  const favCount = useFavoritesStore(s => s.ids.size)
  const { user, openModal } = useAuthStore()
  const toggleCart = useCartStore(s => s.toggleCart)
  const loyaltyPoints = useLoyaltyStore(s => s.points)

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 h-14 md:h-16 transition-all duration-200 ${
        scrolled
          ? 'bg-cream/80 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.08)]'
          : 'bg-cream'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0 font-serif text-xl font-semibold text-green-deep tracking-tight">
          {t('header.logo')}
        </Link>

        {/* Desktop search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('common.search')}
            className="w-full h-10 pl-4 pr-10 rounded-xl bg-surface border border-border text-sm outline-none focus:border-green-deep focus:ring-2 focus:ring-green-deep/15 transition-all text-ink placeholder:text-muted"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-green-deep">
            <SearchIcon />
          </button>
        </form>

        <div className="flex-1" />

        {/* Icons */}
        <div className="flex items-center gap-1">
          {/* Language switcher */}
          <LangSwitcher />

          {/* Theme toggle */}
          <ThemeToggle compact />

          {/* Mobile search */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors relative text-ink"
            onClick={() => setSearchOpen(true)}
            aria-label={t('header.search_aria')}
          >
            <SearchIcon />
          </button>

          {/* Favorites */}
          <Link
            to="/account/favorites"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors relative text-ink"
            aria-label={`${t('header.favorites_aria')} (${favCount})`}
          >
            <HeartIcon />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-dust text-ink text-[10px] font-bold min-w-4.5 h-4.5 rounded-full flex items-center justify-center px-1">
                {favCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button
            data-cart-target="header"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors relative text-ink"
            onClick={toggleCart}
            aria-label={`${t('header.cart_aria')} (${count})`}
          >
            <CartIcon />
            <CartBadge count={count} />
          </button>

          {/* Profile */}
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors text-ink"
            onClick={() => user ? navigate('/account') : openModal()}
            aria-label={user ? t('header.profile_aria') : t('nav.login')}
          >
            <UserIcon />
            {user && loyaltyPoints > 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 bg-gold text-ink text-[9px] font-bold leading-none px-1 py-0.5 rounded-full">
                ⭐
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-0 h-14 bg-cream shadow-md flex items-center px-4 gap-3 z-10"
          >
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full h-10 pl-4 pr-10 rounded-xl bg-surface border border-border text-sm outline-none focus:border-green-deep text-ink placeholder:text-muted"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                <SearchIcon />
              </button>
            </form>
            <button onClick={() => { setSearchOpen(false); setQuery('') }} className="text-sm font-medium text-muted">
              {t('common.cancel')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
