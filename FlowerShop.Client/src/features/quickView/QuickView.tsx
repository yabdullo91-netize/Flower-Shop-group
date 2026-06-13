import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { useQuickViewStore } from './store'
import { useCartStore } from '@/features/cart/store'
import { formatPrice } from '@/shared/lib/format'
import { useHolidayPricing } from '@/shared/hooks/useHolidayPricing'
import { Button } from '@/shared/ui/Button'
import { toast } from '@/shared/ui/toast.store'
import { ROUTES } from '@/shared/config/routes'

export function QuickView() {
  const { t } = useTranslation()
  const { product, close } = useQuickViewStore()
  const addItem = useCartStore(s => s.addItem)
  const holiday = useHolidayPricing()
  const [imgIdx, setImgIdx] = useState(0)
  const [sizeIdx, setSizeIdx] = useState(0)
  const overlayRef = useRef<HTMLDivElement>(null)

  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])

  useEffect(() => {
    if (!product) return
    setImgIdx(0)
    setSizeIdx(0)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [product, close])

  if (!product) return null

  const sizes = product.sizes ?? []
  const activeSize = sizes[sizeIdx]
  const basePrice = activeSize?.price ?? product.price
  const displayPrice = holiday.active && product.freshness === 'live' ? holiday.apply(basePrice) : basePrice
  const displayOld = activeSize?.oldPrice ?? (holiday.active && product.freshness === 'live' ? basePrice : product.oldPrice)

  const handleAdd = () => {
    const size = activeSize ?? product.sizes[0]
    addItem(product, size)
    toast.success(t('common.added_to_cart'))
    close()
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/40 backdrop-blur-sm"
        onClick={e => { if (e.target === overlayRef.current) close() }}
      >
        <motion.div
          style={{ y, opacity }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 300 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => { if (info.offset.y > 120) close() }}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90svh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="grid sm:grid-cols-2 gap-0">
            {/* Gallery */}
            <div className="relative aspect-square bg-cream overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
              <motion.img
                key={imgIdx}
                src={product.images[imgIdx]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-ink"
                    aria-label={t('product.prev_photo')}
                  >‹</button>
                  <button
                    onClick={() => setImgIdx(i => Math.min(product.images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-ink"
                    aria-label={t('product.next_photo')}
                  >›</button>
                </>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-ink leading-snug">{product.name}</h2>
                <p className="text-sm text-muted mt-1 line-clamp-2">{product.composition}</p>
              </div>

              <div className="flex items-baseline gap-2 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={displayPrice}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="text-2xl font-bold text-green-deep tabular-nums"
                  >
                    {formatPrice(displayPrice)}
                  </motion.span>
                </AnimatePresence>
                {displayOld && (
                  <span className="text-sm text-muted line-through tabular-nums">{formatPrice(displayOld)}</span>
                )}
                {holiday.active && product.freshness === 'live' && (
                  <span className="text-xs font-bold text-rose-dust">+30%</span>
                )}
              </div>

              {sizes.length > 1 && (
                <div>
                  <p className="text-xs text-muted font-medium mb-1.5">{t('product.size')}</p>
                  <div className="flex gap-2">
                    {sizes.map((sz, i) => (
                      <button
                        key={sz.id}
                        onClick={() => setSizeIdx(i)}
                        className={`h-9 px-4 rounded-lg text-sm font-medium border transition-all ${
                          i === sizeIdx
                            ? 'border-green-deep bg-green-deep text-white'
                            : 'border-border text-muted hover:border-green-deep'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-2">
                <Button
                  fullWidth
                  onClick={handleAdd}
                  disabled={!product.inStock}
                >
                  {product.inStock ? t('common.add_to_cart') : t('common.out_of_stock')}
                </Button>
                <Link
                  to={ROUTES.PRODUCT(product.slug)}
                  onClick={close}
                  className="shrink-0 h-11 px-4 rounded-xl border border-border flex items-center justify-center text-sm font-medium text-muted hover:text-ink hover:border-ink transition-colors"
                >
                  {t('common.details')}
                </Link>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-muted hover:text-ink transition-colors shadow"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
