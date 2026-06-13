import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/shared/hooks/usePageTitle'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/store'
import { pluralPoints } from '@/shared/lib/pluralize'
import { useFavoritesStore } from '@/features/favorites/store'
import { useOrdersStore, type Order, type OrderStatus } from '@/features/orders/store'
import { useReviewsStore } from '@/features/reviews/store'
import { useLoyaltyStore, getTier, TIERS, MIN_REDEEM } from '@/features/loyalty/store'
import { usePushNotifications } from '@/features/push/usePushNotifications'
import { useAddressesStore, type SavedAddress } from '@/features/addresses/store'
import { MOCK_PRODUCTS } from '@/entities/product/mock'
import { ProductCard } from '@/entities/product/ProductCard'
import { Button } from '@/shared/ui/Button'
import { Badge, type BadgeVariant } from '@/shared/ui/Badge'
import { StarRating } from '@/shared/ui/StarRating'
import { toast } from '@/shared/ui/toast.store'
import { formatPrice } from '@/shared/lib/format'

const TABS = [
  { id: 'orders',    tKey: 'account.orders' },
  { id: 'favorites', tKey: 'account.favorites' },
  { id: 'addresses', tKey: 'account.addresses' },
  { id: 'bonuses',   tKey: 'account.bonuses' },
  { id: 'reviews',   tKey: 'account.reviews' },
  { id: 'profile',   tKey: 'account.profile' },
] as const
type Tab = typeof TABS[number]['id']

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PAYMENT_KEYS: Record<Order['payment'], string> = {
  dc:   'checkout.pay_dc',
  alif: 'checkout.pay_alif',
  cash: 'checkout.pay_cash',
}

// Статусы хранятся в persist-сторе по-русски — маппим на ключи перевода
const STATUS_KEYS: Record<OrderStatus, string> = {
  'Принят':        'account.order_status.accepted',
  'Собирается':    'account.order_status.assembling',
  'Фото готово':   'account.order_status.photo_ready',
  'Курьер в пути': 'account.order_status.on_the_way',
  'Доставлен':     'account.order_status.delivered',
  'Отменён':       'account.order_status.cancelled',
}

const ORDER_STATUS_BADGE: Record<OrderStatus, BadgeVariant> = {
  'Принят':        'order-accepted',
  'Собирается':    'order-assembling',
  'Фото готово':   'order-photo',
  'Курьер в пути': 'order-courier',
  'Доставлен':     'order-delivered',
  'Отменён':       'order-cancelled',
}

// ─── Photo upload hook ────────────────────────────────────────────────────────

function usePhotoUpload(max = 5) {
  const [photos, setPhotos] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = () => inputRef.current?.click()

  const MAX_FILE_BYTES = 500 * 1024 // 500 KB — prevents localStorage quota overflow

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = max - photos.length
    const valid = files.filter(f => {
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`Файл «${f.name}» слишком большой (макс. 500 КБ)`)
        return false
      }
      return true
    })
    valid.slice(0, remaining).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const src = ev.target?.result as string
        try {
          setPhotos(p => [...p, src])
        } catch {
          toast.error('Не удалось сохранить фото — очистите хранилище браузера')
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const remove = (idx: number) => setPhotos(p => p.filter((_, i) => i !== idx))

  return { photos, pick, onFiles, remove, inputRef, canAdd: photos.length < max }
}

// ─── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({
  orderId, productId, productName, productImg, onDone,
}: {
  orderId: string; productId: string; productName: string; productImg: string; onDone: () => void
}) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(5)
  const [hover, setHover]   = useState(0)
  const [text, setText]     = useState('')
  const { photos, pick, onFiles, remove, inputRef, canAdd } = usePhotoUpload(5)
  const addReview = useReviewsStore(s => s.addReview)

  const submit = () => {
    if (text.trim().length < 5) { toast.error(t('account.review_too_short')); return }
    addReview({ orderId, productId, productName, productImg, rating, text: text.trim(), photos: photos.length ? photos : undefined })
    toast.success(t('account.review_thanks'))
    onDone()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="p-4 border-t border-border space-y-3 bg-cream rounded-b-[14px]">
        <p className="text-sm font-semibold text-ink">{t('account.rate_purchase')}</p>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star} type="button"
              onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="text-2xl transition-transform hover:scale-110 active:scale-95"
            >
              <span className={(hover || rating) >= star ? 'text-gold' : 'text-border'}>★</span>
            </button>
          ))}
        </div>

        <textarea
          value={text} onChange={e => setText(e.target.value.slice(0, 500))}
          placeholder={t('account.review_ph')}
          rows={3}
          className="w-full px-3 py-2.5 rounded-[10px] border border-border text-sm outline-none resize-none focus:border-green-deep focus:ring-2 focus:ring-green-deep/15 bg-surface text-ink placeholder:text-muted"
        />

        <div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
          <div className="flex flex-wrap gap-2">
            {photos.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button" onClick={() => remove(i)}
                  className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-lg"
                >×</button>
              </div>
            ))}
            {canAdd && (
              <button
                type="button" onClick={pick}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-green-deep/60 flex flex-col items-center justify-center gap-0.5 text-muted hover:text-green-deep transition-all"
              >
                <span className="text-xl leading-none">📷</span>
                <span className="text-[9px] font-medium">{t('account.photo')}</span>
              </button>
            )}
          </div>
          {photos.length > 0 && (
            <p className="text-[10px] text-muted mt-1">{t('account.photos_count', { count: photos.length })}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{text.length}/500</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={submit}>{t('common.send')}</Button>
            <Button size="sm" variant="ghost" onClick={onDone}>{t('common.cancel')}</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Cancel dialog ────────────────────────────────────────────────────────────

function CancelDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const cancelOrder = useOrdersStore(s => s.cancelOrder)

  const confirm = async () => {
    await cancelOrder(orderId)
    toast.success(t('account.cancelled_toast'))
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <h3 className="font-serif text-xl font-semibold text-ink">{t('account.cancel_confirm')}</h3>
          <p className="text-sm text-muted mt-1">{t('account.cancel_warning')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>{t('account.keep_order')}</Button>
          <Button
            fullWidth
            className="bg-error hover:bg-error/90 text-white border-transparent"
            onClick={confirm}
          >
            {t('account.confirm_cancel')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const { t } = useTranslation()
  const [open, setOpen]               = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [showCancel, setShowCancel]   = useState(false)
  const hasReview = useReviewsStore(s => s.hasReview)

  return (
    <>
      <AnimatePresence>
        {showCancel && (
          <CancelDialog key="dlg" orderId={order.id} onClose={() => setShowCancel(false)} />
        )}
      </AnimatePresence>

      <div className="bg-surface rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <button
          className="w-full flex items-center gap-4 p-4 text-left hover:bg-cream transition-colors"
          onClick={() => setOpen(o => !o)}
        >
          <img src={order.items[0]?.productImg} alt="" className="w-14 h-14 rounded-[10px] object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{order.id}</p>
            <p className="text-xs text-muted mt-0.5">{order.date} · {order.deliveryDate}</p>
          </div>
          <Badge variant={ORDER_STATUS_BADGE[order.status]}>{t(STATUS_KEYS[order.status])}</Badge>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-muted ml-1 shrink-0">▾</motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.productId} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <img src={item.productImg} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-muted">
                            {item.size} × {item.quantity} — {item.price * item.quantity} {t('common.som')}
                          </p>
                        </div>
                      </div>

                      {order.status === 'Доставлен' && (
                        <AnimatePresence mode="wait">
                          {reviewingId === item.productId ? (
                            <ReviewForm
                              key="form"
                              orderId={order.id}
                              productId={item.productId}
                              productName={item.productName}
                              productImg={item.productImg}
                              onDone={() => setReviewingId(null)}
                            />
                          ) : hasReview(order.id, item.productId) ? (
                            <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-xs text-green-deep font-medium flex items-center gap-1 pl-1"
                            >{t('account.review_done')}</motion.p>
                          ) : (
                            <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                              <Button size="sm" variant="outline" onClick={() => setReviewingId(item.productId)}>
                                {t('account.leave_review')}
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  ))}
                </div>

                {order.addons?.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t('account.addons_label')}</p>
                    {order.addons.map(a => (
                      <div key={a.id} className="flex justify-between text-xs text-muted py-0.5">
                        <span>{a.name} {a.inscription ? `«${a.inscription}»` : ''} × {a.quantity}</span>
                        <span className="tabular-nums">{a.price * a.quantity} {t('common.som')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.cardText && (
                  <div className="bg-cream rounded-xl px-4 py-3 border border-border">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mb-1">{t('account.postcard_label')}</p>
                    <p className="text-sm italic font-serif text-ink leading-relaxed">"{order.cardText}"</p>
                  </div>
                )}

                <div className="pt-3 border-t border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>🕐 {order.deliveryTime}</span>
                    <span>📍 {order.address}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>{t('account.payment_label', { method: t(PAYMENT_KEYS[order.payment]) })}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-green-deep">
                      {t('account.total_label', { total: formatPrice(order.total) })}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {order.isCancellable && order.status === 'Принят' && (
                        <Button
                          variant="outline" size="sm"
                          className="text-error border-error/30 hover:bg-error/5"
                          onClick={() => setShowCancel(true)}
                        >
                          {t('account.cancel_order')}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => toast.info(t('account.repeat_toast'))}>
                        {t('account.repeat_order')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

// ─── My reviews ───────────────────────────────────────────────────────────────

function MyReviews() {
  const { t } = useTranslation()
  const reviews = useReviewsStore(s => s.reviews)
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">✍️</p>
        <p className="font-serif text-xl mb-2">{t('account.no_reviews')}</p>
        <p className="text-sm text-muted">{t('account.no_reviews_hint')}</p>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-surface rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 flex gap-4">
            <img src={r.productImg} alt="" className="w-16 h-16 rounded-[10px] object-cover shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <p className="text-sm font-semibold text-ink">{r.productName}</p>
              <StarRating value={r.rating} />
              <p className="text-sm text-ink leading-relaxed">{r.text}</p>
              {r.photos && r.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {r.photos.map((src, i) => (
                    <button
                      key={i} type="button" onClick={() => setLightbox(src)}
                      className="w-14 h-14 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted">{r.date}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Loyalty tab ──────────────────────────────────────────────────────────────

function LoyaltyTab() {
  const { t, i18n } = useTranslation()
  const { points, totalEarned, history } = useLoyaltyStore()
  const tierInfo = getTier(totalEarned)
  const tierLabel = (tier: string) => t(`loyalty.tier_${tier}`)
  const locale = i18n.language === 'en' ? 'en-US' : 'ru-RU'

  const nextTier = TIERS.find(t => t.minPoints > totalEarned) ?? null
  const progressPct = nextTier
    ? Math.min(100, ((totalEarned - tierInfo.minPoints) / (nextTier.minPoints - tierInfo.minPoints)) * 100)
    : 100

  return (
    <div className="space-y-5 max-w-lg">
      {/* Balance card */}
      <div className="bg-linear-to-br from-green-deep to-green-light rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{t('loyalty.title')}</p>
            <p className="text-5xl font-bold tabular-nums">{points.toLocaleString(locale)}</p>
            <p className="text-xs opacity-70 mt-1">{t('loyalty.point_rate')}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl">{tierInfo.emoji}</span>
            <p className="text-xs font-semibold opacity-90 mt-1">{tierLabel(tierInfo.tier)}</p>
          </div>
        </div>

        {/* Tier progress */}
        {nextTier && (
          <div className="mt-5">
            <div className="flex justify-between text-xs opacity-80 mb-1.5">
              <span>{tierLabel(tierInfo.tier)}</span>
              <span>{t('loyalty.to_next_tier', {
                tier: tierLabel(nextTier.tier),
                count: nextTier.minPoints - totalEarned,
                points: pluralPoints(nextTier.minPoints - totalEarned, i18n.language),
              })}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        )}
        {!nextTier && (
          <p className="mt-4 text-xs font-semibold opacity-80">{t('loyalty.max_tier')}</p>
        )}
      </div>

      {/* How it works */}
      <div className="bg-surface rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-3">
        <h3 className="text-sm font-semibold text-ink">{t('loyalty.how_it_works')}</h3>
        <div className="space-y-3">
          {[
            { icon: '🛍', title: t('loyalty.earn'), desc: t('loyalty.earn_desc') },
            { icon: '💸', title: t('loyalty.spend'), desc: t('loyalty.spend_desc', { min: MIN_REDEEM }) },
            { icon: '🥇', title: t('loyalty.level_up'), desc: t('loyalty.level_up_desc') },
          ].map(item => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      {history.length > 0 && (
        <div className="bg-surface rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-ink mb-3">{t('loyalty.history')}</h3>
          <div className="space-y-2">
            {history.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-ink">{t(tx.type === 'earn' ? 'loyalty.tx_earn' : 'loyalty.tx_redeem')}</p>
                  <p className="text-xs text-muted">{tx.date}</p>
                </div>
                <span className={`text-sm font-bold tabular-nums ${tx.amount > 0 ? 'text-green-deep' : 'text-error'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} {t('common.points_short')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-sm text-muted">{t('loyalty.no_history')}</p>
          <Link to="/" className="mt-4 inline-block">
            <Button size="sm">{t('loyalty.choose_bouquet')}</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Profile edit ─────────────────────────────────────────────────────────────

function ProfileEdit({ user }: { user: import('@/features/auth/store').User }) {
  const { t } = useTranslation()
  const { updateUser, logout } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const avatarRef = useRef<HTMLInputElement>(null)
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  useEffect(() => { setName(user.name) }, [user.name])

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateUser({ avatarUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const save = () => {
    if (name.trim().length < 2) { toast.error(t('account.name_too_short')); return }
    updateUser({ name: name.trim() })
    setEditing(false)
    toast.success(t('account.profile_updated'))
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-5">
      <h2 className="font-serif text-xl font-semibold text-ink">{t('account.personal_data')}</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => avatarRef.current?.click()}
          className="relative w-16 h-16 rounded-full overflow-hidden bg-green-deep flex items-center justify-center group shrink-0"
        >
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <span className="text-white text-2xl font-bold">{user.name[0]}</span>
          }
          <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-xs font-medium">📷</span>
          </div>
        </button>
        <input ref={avatarRef} type="file" accept="image/*" className="sr-only" onChange={pickAvatar} />
        <div>
          <p className="text-sm font-semibold text-ink">{user.name}</p>
          <button
            type="button"
            onClick={() => avatarRef.current?.click()}
            className="text-xs text-green-deep hover:underline"
          >
            {t('account.edit_photo')}
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{t('account.edit_name')}</p>
        {editing ? (
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="flex-1 h-9 px-3 rounded-lg border border-green-deep text-sm outline-none bg-surface text-ink"
            />
            <Button size="sm" onClick={save}>{t('common.save')}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(user.name) }}>✕</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <button onClick={() => setEditing(true)} className="text-xs text-green-deep hover:underline">{t('common.edit')}</button>
          </div>
        )}
      </div>

      {/* Phone (read-only) */}
      <div className="space-y-0.5">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">{t('account.phone')}</p>
        <p className="text-sm font-medium text-ink">{user.phone}</p>
      </div>

      {/* Push notifications */}
      {isSupported && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink flex items-center gap-2">{t('account.notifications')}</p>
              <p className="text-xs text-muted mt-0.5">
                {isSubscribed ? t('account.notifications_on') : t('account.notifications_off')}
              </p>
            </div>
            <button
              onClick={isSubscribed ? unsubscribe : subscribe}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                isSubscribed ? 'bg-green-deep' : 'bg-border'
              }`}
              role="switch" aria-checked={isSubscribed}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <Button variant="outline" onClick={logout} className="text-error border-error/30 hover:bg-error/5">
          {t('account.logout')}
        </Button>
      </div>
    </div>
  )
}

// ─── Addresses tab ───────────────────────────────────────────────────────────

function AddressForm({
  initial, onSave, onCancel,
}: {
  initial?: SavedAddress
  onSave: (data: Omit<SavedAddress, 'id' | 'isDefault'>) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [label, setLabel]       = useState(initial?.label ?? '')
  const [street, setStreet]     = useState(initial?.street ?? '')
  const [apartment, setApt]     = useState(initial?.apartment ?? '')
  const [district, setDistrict] = useState(initial?.district ?? '')

  const submit = () => {
    if (!street.trim()) return
    onSave({ label: label.trim() || street.trim(), street: street.trim(), apartment: apartment.trim() || undefined, district: district.trim() })
  }

  return (
    <div className="space-y-3 p-4 bg-cream rounded-2xl border border-border">
      <input
        value={label} onChange={e => setLabel(e.target.value)}
        placeholder={t('addresses.label_ph')}
        className="w-full h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink placeholder:text-muted"
      />
      <input
        value={street} onChange={e => setStreet(e.target.value)}
        placeholder={t('addresses.street_ph')}
        required
        className="w-full h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink placeholder:text-muted"
      />
      <input
        value={apartment} onChange={e => setApt(e.target.value)}
        placeholder="Квартира / офис"
        className="w-full h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink placeholder:text-muted"
      />
      <input
        value={district} onChange={e => setDistrict(e.target.value)}
        placeholder={t('addresses.district_ph')}
        className="w-full h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink placeholder:text-muted"
      />
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={submit} disabled={!street.trim()}>{t('common.save')}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
    </div>
  )
}

function AddressesTab() {
  const { t } = useTranslation()
  const { addresses, add, update, remove, setDefault } = useAddressesStore()
  const [adding, setAdding]   = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const handleAdd = (data: Omit<SavedAddress, 'id' | 'isDefault'>) => {
    const dup = addresses.find(a => a.street.toLowerCase() === data.street.toLowerCase())
    if (dup) { toast.error(t('addresses.duplicate')); return }
    add(data)
    setAdding(false)
    toast.success(t('addresses.saved'))
  }

  const handleEdit = (id: string, data: Omit<SavedAddress, 'id' | 'isDefault'>) => {
    update(id, data)
    setEditing(null)
    toast.success(t('addresses.saved'))
  }

  const handleRemove = (id: string) => {
    remove(id)
    toast.success(t('addresses.deleted'))
  }

  return (
    <div className="space-y-4 max-w-lg">
      {addresses.length === 0 && !adding && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📍</p>
          <p className="font-serif text-xl text-ink mb-1">{t('addresses.empty')}</p>
          <p className="text-sm text-muted mb-5">{t('addresses.empty_hint')}</p>
        </div>
      )}

      <AnimatePresence>
        {addresses.map(addr => (
          <motion.div
            key={addr.id}
            layout
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-surface rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-2"
          >
            {editing === addr.id ? (
              <AddressForm
                initial={addr}
                onSave={(d) => handleEdit(addr.id, d)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-deep/10 text-green-deep">
                          {t('addresses.default_badge')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                    {addr.district && <p className="text-xs text-muted">{addr.district}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditing(addr.id)} className="text-xs text-muted hover:text-green-deep transition-colors p-1">✏️</button>
                    <button onClick={() => handleRemove(addr.id)} className="text-xs text-muted hover:text-error transition-colors p-1">🗑️</button>
                  </div>
                </div>
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="text-xs text-green-deep hover:underline"
                  >
                    {t('addresses.set_default')}
                  </button>
                )}
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {adding && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <AddressForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!adding && (
        <Button variant="outline" onClick={() => setAdding(true)} className="w-full">
          + {t('addresses.add')}
        </Button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AccountPage() {
  const { t } = useTranslation()
  usePageTitle(t('account.title'))
  const { user } = useAuthStore()
  const { ids } = useFavoritesStore()
  const orders = useOrdersStore(s => s.orders)
  const fetchMyOrders = useOrdersStore(s => s.fetchMyOrders)
  const reviewCount = useReviewsStore(s => s.reviews.length)
  const loyaltyPoints = useLoyaltyStore(s => s.points)
  const [tab, setTab] = useState<Tab>('orders')

  useEffect(() => {
    if (user) fetchMyOrders()
  }, [user, fetchMyOrders])

  const favProducts = MOCK_PRODUCTS.filter(p => ids.has(p.id))

  if (!user) {
    return (
      <div className="min-h-[60svh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl">🌸</p>
        <p className="font-serif text-2xl text-ink">{t('account.login_prompt')}</p>
        <p className="text-sm text-muted">{t('account.login_hint')}</p>
        <Link to="/">
          <Button>{t('auth.login')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-green-deep flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            : user.name[0]
          }
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold text-ink">{user.name}</h1>
          <p className="text-sm text-muted">{user.phone}</p>
          {loyaltyPoints > 0 && (
            <p className="text-xs text-green-deep font-medium mt-0.5">{t('account.points', { count: loyaltyPoints })}</p>
          )}
        </div>
        <button
          onClick={() => setTab('profile')}
          className="ml-auto text-xs text-muted hover:text-ink shrink-0"
        >
          ✏️ {t('account.profile')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-border/40 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(tabDef => (
          <button
            key={tabDef.id} onClick={() => setTab(tabDef.id)}
            className={`relative shrink-0 px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 whitespace-nowrap ${
              tab === tabDef.id ? 'bg-surface shadow-sm text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t(tabDef.tKey)}
            {tabDef.id === 'orders' && orders.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-deep text-white text-[10px] font-bold">
                {orders.length}
              </span>
            )}
            {tabDef.id === 'bonuses' && loyaltyPoints > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 h-4 rounded-full bg-green-deep text-white text-[10px] font-bold">
                {loyaltyPoints}
              </span>
            )}
            {tabDef.id === 'reviews' && reviewCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-deep text-white text-[10px] font-bold">
                {reviewCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {tab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🌿</p>
                <p className="font-serif text-xl mb-2 text-ink">{t('account.no_orders')}</p>
                <p className="text-sm text-muted mb-6">{t('account.no_orders_hint')}</p>
                <Link to="/"><Button>{t('cart.go_catalog')}</Button></Link>
              </div>
            ) : (
              orders.map(o => <OrderCard key={o.id} order={o} />)
            )}
          </motion.div>
        )}

        {tab === 'favorites' && (
          <motion.div key="favs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {favProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🤍</p>
                <p className="font-serif text-xl mb-2 text-ink">{t('account.no_favorites')}</p>
                <Link to="/" className="text-green-deep text-sm hover:underline">
                  {t('account.go_catalog')}
                </Link>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                  {favProducts.map((p, i) => (
                    <motion.div key={p.id} layout exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                      <ProductCard product={p} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'addresses' && (
          <motion.div key="addresses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AddressesTab />
          </motion.div>
        )}

        {tab === 'bonuses' && (
          <motion.div key="loyalty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <LoyaltyTab />
          </motion.div>
        )}

        {tab === 'reviews' && (
          <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <MyReviews />
          </motion.div>
        )}

        {tab === 'profile' && (
          <motion.div
            key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="max-w-md"
          >
            <ProfileEdit user={user} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
