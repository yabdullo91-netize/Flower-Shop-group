import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber'
import { useCartStore, type CartItem } from './store'
import { formatShort, formatPrice } from '@/shared/lib/format'
import { toast } from '@/shared/ui/toast.store'
import { cn } from '@/shared/lib/cn'

const FREE_DELIVERY = 1500

// One-shot petal burst — 8 petals flying outward
function PetalBurst() {
  const petals = [
    { tx: '0px,-36px',   color: '#E8B4B8' },
    { tx: '28px,-26px',  color: '#2AABEE' },
    { tx: '36px,0px',    color: '#E8B4B8' },
    { tx: '28px,26px',   color: '#2AABEE' },
    { tx: '0px,36px',    color: '#E8B4B8' },
    { tx: '-28px,26px',  color: '#2AABEE' },
    { tx: '-36px,0px',   color: '#E8B4B8' },
    { tx: '-28px,-26px', color: '#2AABEE' },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal-burst absolute text-[10px]"
          style={{
            '--tx': `translate(${p.tx}) scale(0.3)`,
            animationDelay: `${i * 30}ms`,
            color: p.color,
          } as React.CSSProperties}
        >
          ✿
        </span>
      ))}
    </div>
  )
}

function itemPrice(item: CartItem): number {
  if (item.stemCount != null && item.product.stemPrice) {
    return item.product.stemPrice * item.stemCount + (item.packaging === 'basket' ? 200 : 0)
  }
  return item.size.price + (item.packaging === 'basket' ? 200 : 0)
}

export function CartDrawer() {
  const { t } = useTranslation()
  const { isOpen, closeCart, items, updateQuantity, removeItem, total, promoCode, promoDiscount, applyPromo, clearPromo } = useCartStore()

  const PACKAGING_LABEL = {
    basket: t('catalog.packaging_basket'),
    no_basket: t('catalog.packaging_no'),
  } as const
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState(false)
  const promoRef = useRef<HTMLDivElement>(null)

  const subtotal = items.reduce((s, i) => s + itemPrice(i) * i.quantity, 0)
  const progress = Math.min(subtotal / FREE_DELIVERY, 1)

  // Detect when threshold is crossed to fire petal burst
  const [showBurst, setShowBurst] = useState(false)
  const prevProgressRef = useRef(progress)
  useEffect(() => {
    if (prevProgressRef.current < 1 && progress >= 1) {
      setShowBurst(true)
      const t = setTimeout(() => setShowBurst(false), 1200)
      return () => clearTimeout(t)
    }
    prevProgressRef.current = progress
  }, [progress])

  const handleRemove = (id: string, name: string) => {
    removeItem(id)
    toast.info(t('cart.removed_from_cart', { name }))
  }

  const handlePromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError(false)
    const ok = await applyPromo(promoInput)
    setPromoLoading(false)
    if (ok) {
      toast.success(t('cart.promo_success', { discount: promoDiscount || '' }))
      setPromoInput('')
    } else {
      setPromoError(true)
      if (promoRef.current) {
        promoRef.current.classList.remove('shake')
        void promoRef.current.offsetWidth
        promoRef.current.classList.add('shake')
      }
    }
  }

  return (
    <Sheet open={isOpen} onClose={closeCart} side="right" title={t('cart.title')}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
          <motion.span
            className="text-6xl select-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌸
          </motion.span>
          <p className="font-serif text-xl text-ink">{t('cart.empty')}</p>
          <p className="text-sm text-muted">{t('cart.empty_drawer_hint')}</p>
          <Button onClick={closeCart} variant="outline" size="md">
            <Link to="/">{t('cart.go_catalog')}</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            <AnimatePresence initial={false}>
              {items.map(item => {
                const price = itemPrice(item)
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-3 bg-surface rounded-[14px] p-3 overflow-hidden shadow-sm"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-18 h-18 rounded-[10px] object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 leading-snug text-ink">{item.product.name}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {item.stemCount != null
                          ? t('cart.stems_label', { count: item.stemCount })
                          : t('cart.size_label', { size: item.size.label })
                        }
                        {' · '}
                        {PACKAGING_LABEL[item.packaging]}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm hover:bg-cream transition-colors text-ink"
                          >−</button>
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.7, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              className="tabular-nums text-sm font-medium w-4 text-center text-ink"
                            >
                              {item.quantity}
                            </motion.span>
                          </AnimatePresence>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm hover:bg-cream transition-colors text-ink"
                          >+</button>
                        </div>
                        <span className="text-sm font-semibold text-green-deep tabular-nums">
                          {formatShort(price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, item.product.name)}
                      className="self-start text-muted hover:text-error transition-colors text-lg leading-none mt-0.5"
                      aria-label={t('cart.remove')}
                    >×</button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Free shipping progress bar */}
          <div className="px-4 pt-3 pb-2 border-t border-border relative">
            <div className="flex justify-between items-center mb-1.5">
              <AnimatePresence mode="wait">
                {progress >= 1 ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-green-deep"
                  >
                    {t('cart.free_delivery_done')}
                  </motion.span>
                ) : (
                  <motion.span
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted"
                  >
                    {t('cart.free_delivery_hint', { rest: formatShort(FREE_DELIVERY - subtotal) })}
                  </motion.span>
                )}
              </AnimatePresence>
              {progress < 1 && (
                <span className="text-xs text-muted tabular-nums">{Math.round(progress * 100)}%</span>
              )}
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-deep rounded-full"
                style={{ transformOrigin: 'left' }}
                initial={false}
                animate={{ scaleX: progress }}
                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              />
            </div>
            {showBurst && <PetalBurst />}
          </div>

          {/* Promo */}
          <div className="px-4 py-3 border-t border-border">
            {promoCode ? (
              <div className="flex items-center justify-between bg-green-deep/8 rounded-[10px] px-3 py-2">
                <span className="text-sm font-medium text-green-deep">🎉 {promoCode} — −{promoDiscount}%</span>
                <button onClick={clearPromo} className="text-muted hover:text-error text-sm">{t('common.remove')}</button>
              </div>
            ) : (
              <div ref={promoRef} className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value); setPromoError(false) }}
                  onKeyDown={e => e.key === 'Enter' && handlePromo()}
                  placeholder={t('cart.promo')}
                  className={cn(
                    'flex-1 h-10 px-3 rounded-[10px] border text-sm outline-none transition-all bg-surface text-ink placeholder:text-muted',
                    promoError
                      ? 'border-error focus:border-error focus:ring-2 focus:ring-error/15'
                      : 'border-border focus:border-green-deep focus:ring-2 focus:ring-green-deep/15'
                  )}
                />
                <Button onClick={handlePromo} loading={promoLoading} variant="outline" size="sm">
                  {t('common.apply')}
                </Button>
              </div>
            )}
            {promoError && <p className="text-xs text-error mt-1">{t('cart.promo_error')}</p>}
          </div>

          {/* Total */}
          <div className="px-4 py-4 border-t border-border space-y-2">
            {promoDiscount > 0 && (
              <>
                <div className="flex justify-between text-sm text-muted">
                  <span>{t('cart.subtotal')}</span><span className="tabular-nums">{formatShort(subtotal)} {t('common.som')}</span>
                </div>
                <div className="flex justify-between text-sm text-green-deep font-medium">
                  <span>{t('cart.discount_label', { discount: promoDiscount })}</span>
                  <span className="tabular-nums">−{formatShort(Math.round(subtotal * promoDiscount / 100))} {t('common.som')}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-semibold text-base text-ink">
              <span>{t('common.total')}</span>
              <AnimatedNumber
                value={total()}
                formatter={formatPrice}
                className="tabular-nums text-green-deep"
              />
            </div>
            <Link to="/checkout" onClick={closeCart}>
              <Button fullWidth size="lg" className="mt-2">{t('cart.checkout')}</Button>
            </Link>
            <Link to="/cart" onClick={closeCart} className="block text-center text-sm text-muted hover:text-green-deep transition-colors mt-1">
              {t('cart.open_cart')}
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  )
}
