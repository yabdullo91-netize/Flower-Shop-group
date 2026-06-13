import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from './types'
import { Badge } from '@/shared/ui/Badge'
import { useCartStore } from '@/features/cart/store'
import { useFavoritesStore } from '@/features/favorites/store'
import { useQuickViewStore } from '@/features/quickView/store'
import { useCartFlyStore } from '@/features/cart/flyStore'
import { formatShort } from '@/shared/lib/format'
import { toast } from '@/shared/ui/toast.store'
import { getHolidayInfo, applyHolidayPrice } from '@/shared/lib/holiday'

interface Props {
  product: Product
  index?: number
  highlightText?: string
  showHighlight?: boolean
}

export function ProductCard({ product, index = 0 }: Props) {
  const { t } = useTranslation()
  const [imgIdx, setImgIdx] = useState(0)
  const [imgHovered, setImgHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const { toggle, has } = useFavoritesStore()
  const openQuickView = useQuickViewStore(s => s.open)
  const triggerFly = useCartFlyStore(s => s.triggerFly)
  const isFav = has(product.id)
  const imgContainerRef = useRef<HTMLDivElement>(null)

  const holiday = getHolidayInfo()
  const isLive = product.freshness === 'live'
  const displayPrice = isLive ? applyHolidayPrice(product.price, holiday) : product.price
  const displayOld = isLive && holiday.active ? product.price : product.oldPrice

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const size = product.sizes.find(s => s.label === 'M') || product.sizes[0]
    addItem(product, size)

    // FLIP fly-to-cart: measure image container, fire animation
    if (imgContainerRef.current) {
      triggerFly(product.images[0], imgContainerRef.current.getBoundingClientRect())
    }

    setAdded(true)
    toast.success(t('common.added_to_cart'))
    setTimeout(() => setAdded(false), 1500)
  }

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
    if (!isFav) toast.success(t('product.add_to_favorites'))
  }

  const badges = [
    product.discount && <Badge key="d" variant="discount">−{product.discount}%</Badge>,
    product.isHit && <Badge key="h" variant="hit">{t('catalog.hit')}</Badge>,
    product.isNew && <Badge key="n" variant="new">{t('catalog.new')}</Badge>,
    product.freshness === 'dried' && <Badge key="dr" variant="dried">{t('catalog.dried')}</Badge>,
    product.freshness === 'live' && <Badge key="lv" variant="live">{t('catalog.live')}</Badge>,
  ].filter(Boolean).slice(0, 2)

  // Stagger first page (0–11) fully; later batches stagger within their own group of 12
  const batchIndex = index < 12 ? index : index % 12
  const staggerDelay = batchIndex * 0.04

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-surface rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <Link to={`/product/${product.slug}`} className="contents">
        {/* Image */}
        <div
          ref={imgContainerRef}
          className="relative aspect-[3/4] overflow-hidden bg-cream"
          onMouseEnter={() => { product.images[1] && setImgIdx(1); setImgHovered(true) }}
          onMouseLeave={() => { setImgIdx(0); setImgHovered(false) }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: imgHovered ? 1.07 : 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIdx}
                src={product.images[imgIdx]}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </motion.div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">{badges}</div>
          )}

          {/* Heart */}
          <button
            onClick={handleFav}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-150 hover:scale-110"
            aria-label={isFav ? t('product.remove_from_favorites') : t('product.add_to_favorites')}
          >
            <motion.span
              animate={
                isFav
                  ? { scale: [1, 1.35, 1], rotate: [0, -14, 10, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ type: 'spring', stiffness: 380, damping: 12 }}
              className={`text-base leading-none select-none ${isFav ? 'text-rose-dust' : 'text-muted'}`}
            >
              {isFav ? '♥' : '♡'}
            </motion.span>
          </button>

          {/* Quick View */}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); openQuickView(product) }}
            className="absolute bottom-2 inset-x-2 h-8 rounded-xl bg-white/85 backdrop-blur-sm text-xs font-medium text-ink opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-1"
            aria-label={t('common.quick_view')}
          >
            👁 {t('common.quick_view')}
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="text-sm font-medium text-ink line-clamp-2 leading-snug">{product.name}</p>
          <p className="text-xs text-muted line-clamp-1">{product.composition}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-gold text-xs">★</span>
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto pt-1">
            <span className="text-base font-semibold text-green-deep tabular-nums">{formatShort(displayPrice)}</span>
            {displayOld && (
              <span className="text-xs text-muted line-through tabular-nums">{formatShort(displayOld)}</span>
            )}
            {holiday.active && isLive && (
              <span className="text-[9px] font-bold text-rose-dust">+30%</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-3 pb-3 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-200">
        <button
          onClick={handleAddToCart}
          className={`w-full h-10 rounded-[10px] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97] ${
            added
              ? 'bg-green-deep text-white'
              : 'bg-green-deep text-white hover:bg-green-light'
          }`}
        >
          {added ? (
            <>
              <svg className="draw-check" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="0">
                <polyline points="2,8 6,12 14,4"/>
              </svg>
              {t('common.added')}
            </>
          ) : t('common.add_to_cart')}
        </button>
      </div>
    </motion.div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="skeleton aspect-[3/4]" />
      <div className="p-3 flex flex-col gap-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-4 w-1/3 rounded mt-2" />
        <div className="skeleton h-10 rounded-xl mt-1" />
      </div>
    </div>
  )
}
