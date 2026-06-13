import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/cart/store'
import { Button } from '@/shared/ui/Button'
import { AnimatedNumber } from '@/shared/ui/AnimatedNumber'
import { formatPrice, formatShort } from '@/shared/lib/format'
import { toast } from '@/shared/ui/toast.store'
import { cn } from '@/shared/lib/cn'

export function CartPage() {
  const { t } = useTranslation()
  const {
    items, updateQuantity, removeItem, total,
    promoCode, promoDiscount, applyPromo, clearPromo,
  } = useCartStore()
  const navigate = useNavigate()

  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState(false)
  const promoRef = useRef<HTMLDivElement>(null)

  const subtotal = items.reduce((s, i) => s + i.size.price * i.quantity, 0)
  const discount = promoDiscount > 0 ? subtotal * promoDiscount / 100 : 0
  const deliveryFee = subtotal >= 1500 ? 0 : 40

  const handleRemove = (id: string, name: string) => {
    removeItem(id)
    toast.info(t('cart.removed', { name }))
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
      promoRef.current?.classList.remove('shake')
      void promoRef.current?.offsetWidth
      promoRef.current?.classList.add('shake')
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="text-7xl mb-5 select-none"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌸
          </motion.p>
          <h1 className="font-serif text-2xl font-bold text-ink mb-2">{t('cart.empty')}</h1>
          <p className="text-sm text-muted max-w-xs">
            {t('cart.empty_hint')}
          </p>
        </motion.div>
        <Link to="/catalog">
          <Button size="lg">{t('cart.go_catalog')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/" className="hover:text-green-deep transition-colors">{t('common.home')}</Link>
        <span>/</span>
        <span className="text-ink font-medium">{t('cart.title')}</span>
      </nav>

      <h1 className="font-serif text-3xl font-bold mb-6">
        {t('cart.title')}
        <span className="text-muted font-normal text-xl ml-2">
          ({items.reduce((s, i) => s + i.quantity, 0)})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Items list */}
        <div className="flex-1 min-w-0 space-y-3">
          <AnimatePresence initial={false}>
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 bg-white rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                  <Link to={`/product/${item.product.slug}`} className="shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-22 h-22 md:w-24 md:h-24 rounded-xl object-cover hover:opacity-90 transition-opacity"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="text-sm font-semibold text-ink hover:text-green-deep transition-colors line-clamp-2 leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">{t('cart.size_label', { size: item.size.label })}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, item.product.name)}
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-error hover:bg-error/5 transition-colors text-lg leading-none"
                        aria-label={t('cart.remove')}
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Stepper */}
                      <div className="flex items-center gap-2 bg-cream rounded-full px-1 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium hover:bg-white transition-colors text-ink"
                          aria-label={t('cart.decrease')}
                        >−</button>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className="tabular-nums text-sm font-semibold w-5 text-center"
                          >
                            {item.quantity}
                          </motion.span>
                        </AnimatePresence>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium hover:bg-white transition-colors text-ink"
                          aria-label={t('cart.increase')}
                        >+</button>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-bold text-green-deep tabular-nums">
                          {formatShort(item.size.price * item.quantity)} {t('common.som')}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted tabular-nums">
                            {formatShort(item.size.price)} × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link to="/catalog" className="flex items-center gap-2 text-sm text-green-deep font-medium hover:underline mt-2 w-fit">
            {t('cart.add_more')}
          </Link>
        </div>

        {/* Summary sidebar */}
        <div className="w-full lg:w-85 shrink-0 sticky top-20 space-y-4">
          {/* Promo */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-sm font-semibold text-ink mb-3">{t('cart.promo')}</h3>
            {promoCode ? (
              <div className="flex items-center justify-between bg-green-deep/8 rounded-[10px] px-3 py-2.5">
                <span className="text-sm font-medium text-green-deep">🎉 {promoCode} — −{promoDiscount}%</span>
                <button onClick={clearPromo} className="text-xs text-muted hover:text-error transition-colors">{t('common.remove')}</button>
              </div>
            ) : (
              <>
                <div ref={promoRef} className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(false) }}
                    onKeyDown={e => e.key === 'Enter' && handlePromo()}
                    placeholder={t('cart.promo_placeholder')}
                    className={cn(
                      'flex-1 h-10 px-3 rounded-[10px] border text-sm outline-none transition-all bg-white placeholder:text-muted',
                      promoError
                        ? 'border-error focus:border-error focus:ring-2 focus:ring-error/15'
                        : 'border-border focus:border-green-deep focus:ring-2 focus:ring-green-deep/15'
                    )}
                  />
                  <Button onClick={handlePromo} loading={promoLoading} variant="outline" size="sm">
                    OK
                  </Button>
                </div>
                {promoError && <p className="text-xs text-error mt-1.5">{t('cart.promo_error')}</p>}
              </>
            )}
          </div>

          {/* Order total */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-3">
            <h3 className="text-sm font-semibold text-ink">{t('common.total')}</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>{t('cart.items_label', { count: items.reduce((s, i) => s + i.quantity, 0) })}</span>
                <span className="tabular-nums">{formatShort(subtotal)} {t('common.som')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-deep font-medium">
                  <span>{t('cart.discount_label', { discount: promoDiscount })}</span>
                  <span className="tabular-nums">−{formatShort(discount)} {t('common.som')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted">
                <span>{t('common.delivery')}</span>
                {deliveryFee === 0 ? (
                  <span className="text-green-deep font-medium">{t('common.free')}</span>
                ) : (
                  <span className="tabular-nums">{deliveryFee} {t('common.som')}</span>
                )}
              </div>

              {subtotal < 1500 && deliveryFee > 0 && (
                <p className="text-xs text-muted bg-cream rounded-lg px-3 py-2">
                  {t('cart.free_delivery_hint', { rest: formatShort(1500 - subtotal) })}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-baseline">
              <span className="font-semibold text-base">{t('cart.to_pay')}</span>
              <AnimatedNumber
                value={total() + deliveryFee}
                formatter={formatPrice}
                className="font-bold text-xl text-green-deep tabular-nums"
              />
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
              className="mt-1"
            >
              {t('cart.checkout')} →
            </Button>

            <div className="flex items-center justify-center gap-4 pt-1">
              <PaymentIcon label="DC" />
              <PaymentIcon label="Alif" />
              <PaymentIcon label={t('cart.cash')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentIcon({ label }: { label: string }) {
  return (
    <span className="text-xs text-muted border border-border rounded-md px-2 py-1">{label}</span>
  )
}
