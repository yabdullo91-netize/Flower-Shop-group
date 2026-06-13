import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useProduct, useReviews } from '@/entities/product/queries'
import type { Packaging, ProductSize } from '@/entities/product/types'
import { useCartStore } from '@/features/cart/store'
import { useFavoritesStore } from '@/features/favorites/store'
import { useAuthStore } from '@/features/auth/store'
import { useRecentlyViewedStore } from '@/features/recently-viewed/store'
import { RecentlyViewed } from '@/features/recently-viewed/RecentlyViewed'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { StarRating } from '@/shared/ui/StarRating'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { ShareButton } from '@/shared/ui/ShareButton'
import { QuantityStepper } from '@/shared/ui/QuantityStepper'
import { formatPrice, formatShort } from '@/shared/lib/format'
import { toast } from '@/shared/ui/toast.store'
import { usePageTitle } from '@/shared/hooks/usePageTitle'
import { ProductCard } from '@/entities/product/ProductCard'
import { MOCK_PRODUCTS } from '@/entities/product/mock'

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-medium hover:text-green-deep transition-colors text-ink"
      >
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted">
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-muted leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ProductPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug!)
  const { data: reviews } = useReviews(slug!)

  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null)
  const [selectedPackaging, setSelectedPackaging] = useState<Packaging>('no_basket')
  const [stemCount, setStemCount] = useState<number>(11)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(true)
  const [quickBuyOpen, setQuickBuyOpen] = useState(false)
  const [quickBuyPhone, setQuickBuyPhone] = useState('')
  const [quickBuyLoading, setQuickBuyLoading] = useState(false)
  const [quickBuyDone, setQuickBuyDone] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  const addItem = useCartStore(s => s.addItem)
  const { toggle, has } = useFavoritesStore()
  const authUser = useAuthStore(s => s.user)
  const trackViewed = useRecentlyViewedStore(s => s.track)

  usePageTitle(product?.name)

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  useEffect(() => {
    setActiveImg(0)
    setSelectedSize(null)
    setQuickBuyOpen(false)
    setQuickBuyDone(false)
  }, [slug])

  useEffect(() => {
    if (authUser?.phone) setQuickBuyPhone(authUser.phone)
    else setQuickBuyPhone('+992')
  }, [authUser])

  useEffect(() => {
    if (product) {
      trackViewed(product)
      // Init packaging to first available option
      if (product.packagingOptions.length > 0) {
        setSelectedPackaging(product.packagingOptions.includes('no_basket') ? 'no_basket' : product.packagingOptions[0])
      }
      // Init stem count
      if (product.kind === 'single' && product.stemOptions) {
        setStemCount(product.stemOptions[2] ?? product.stemOptions[0])
      }
    }
  }, [product, trackViewed])

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="skeleton aspect-[3/4] rounded-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-8 rounded" />)}
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-20">
      <p className="font-serif text-xl text-ink">{t('product.not_found')}</p>
      <Link to="/" className="text-green-deep text-sm mt-2 hover:underline">{t('product.back_to_catalog')}</Link>
    </div>
  )

  const PACKAGING_LABELS: Record<Packaging, string> = {
    basket:    t('product.packaging_basket'),
    no_basket: t('product.packaging_no'),
  }

  const size = selectedSize || product.sizes.find(s => s.label === 'M') || product.sizes[0]
  const isFav = has(product.id)
  const avgRating = reviews ? reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1) : product.rating
  const related = MOCK_PRODUCTS.filter(p => p.id !== product.id && p.occasions.some(o => product.occasions.includes(o))).slice(0, 4)

  const currentPrice = product.kind === 'single' && product.stemPrice
    ? product.stemPrice * stemCount + (selectedPackaging === 'basket' ? 200 : 0)
    : size.price + (selectedPackaging === 'basket' ? 200 : 0)

  const handleAddToCart = () => {
    addItem(product, size, {
      packaging: selectedPackaging,
      stemCount: product.kind === 'single' ? stemCount : undefined,
    })
    setAdded(true)
    toast.success(t('common.added_to_cart'))
    setTimeout(() => setAdded(false), 1500)
  }

  const handleQuickBuy = async () => {
    if (quickBuyPhone.replace(/\D/g, '').length < 9) {
      toast.error(t('product.invalid_phone'))
      return
    }
    setQuickBuyLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setQuickBuyLoading(false)
    setQuickBuyDone(true)
  }

  const navigateImg = (dir: 1 | -1) => {
    setActiveImg(i => Math.max(0, Math.min(product.images.length - 1, i + dir)))
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) navigateImg(dx > 0 ? 1 : -1)
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
      <Breadcrumbs items={[
        { label: t('nav.catalog'), href: '/' },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="flex gap-3">
          <div className="hidden md:flex flex-col gap-2 w-[72px]">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`rounded-[10px] overflow-hidden aspect-square border-2 transition-all ${activeImg === i ? 'border-green-deep' : 'border-transparent hover:border-border'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="flex-1 relative select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full aspect-[3/4] object-cover rounded-2xl bg-cream"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                draggable={false}
              />
            </AnimatePresence>

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.discount && <Badge variant="discount">−{product.discount}%</Badge>}
              {product.isHit && <Badge variant="hit">{t('catalog.hit')}</Badge>}
              {product.isNew && <Badge variant="new">{t('catalog.new')}</Badge>}
              <Badge variant={product.freshness === 'live' ? 'live' : 'dried'}>
                {product.freshness === 'live' ? t('catalog.category_live') : t('catalog.category_dried')}
              </Badge>
            </div>

            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => navigateImg(-1)} disabled={activeImg === 0}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm items-center justify-center shadow-sm hover:bg-surface transition-colors disabled:opacity-30 text-ink"
                  aria-label={t('product.prev_photo')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={() => navigateImg(1)} disabled={activeImg === product.images.length - 1}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm items-center justify-center shadow-sm hover:bg-surface transition-colors disabled:opacity-30 text-ink"
                  aria-label={t('product.next_photo')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}

            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden">
                {product.images.map((_, i) => (
                  <motion.button
                    key={i} onClick={() => setActiveImg(i)}
                    animate={{ width: i === activeImg ? 20 : 6, backgroundColor: i === activeImg ? '#fff' : 'rgba(255,255,255,0.55)' }}
                    transition={{ duration: 0.2 }}
                    className="h-1.5 rounded-full"
                    aria-label={`${t('account.photo')} ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info column */}
        <div className="space-y-5">
          <div>
            <h1 className="font-serif text-3xl font-bold leading-tight text-ink">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-sm font-medium text-ink">{avgRating.toFixed(1)}</span>
              <a href="#reviews" className="text-sm text-muted hover:text-green-deep hover:underline">
                {t('product.reviews_count', { count: product.reviewCount })}
              </a>
            </div>
            <p className="text-sm text-muted mt-1">{product.composition}</p>
          </div>

          {/* Single flowers — stem count picker */}
          {product.kind === 'single' && product.stemOptions && (
            <QuantityStepper
              label={t('product.stems')}
              options={product.stemOptions}
              value={stemCount}
              onChange={setStemCount}
            />
          )}

          {/* Bouquet — size selector */}
          {product.kind === 'bouquet' && product.sizes.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-ink mb-2">{t('product.size')}</p>
              <div className="flex gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s)}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all duration-150 ${
                      size.id === s.id
                        ? 'border-green-deep bg-green-deep/5'
                        : 'border-border hover:border-green-deep/40 bg-surface'
                    }`}
                  >
                    <span className="font-semibold text-sm text-ink">{s.label}</span>
                    <span className="text-xs text-green-deep font-medium tabular-nums mt-0.5">{formatShort(s.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Packaging selector */}
          {product.packagingOptions.length > 1 && (
            <div>
              <p className="text-sm font-semibold text-ink mb-2">{t('product.packaging')}</p>
              <div className="flex gap-2">
                {product.packagingOptions.map(pkg => (
                  <button
                    key={pkg}
                    onClick={() => setSelectedPackaging(pkg)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                      selectedPackaging === pkg
                        ? 'border-green-deep bg-green-deep/5 text-ink'
                        : 'border-border hover:border-green-deep/40 text-muted bg-surface'
                    }`}
                  >
                    {PACKAGING_LABELS[pkg]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-green-deep tabular-nums">{formatPrice(currentPrice)}</span>
            {product.kind === 'single' && product.stemPrice && (
              <span className="text-sm text-muted">{product.stemPrice} {t('product.per_stem')}</span>
            )}
            {product.kind === 'bouquet' && size.oldPrice && (
              <span className="text-base text-muted line-through tabular-nums">{formatShort(size.oldPrice)} {t('common.som')}</span>
            )}
          </div>

          {/* Delivery badge */}
          {product.deliverToday && (
            <div className="flex items-center gap-2 text-sm text-green-deep font-medium bg-green-deep/8 px-4 py-2.5 rounded-[10px]">
              <span>🚚</span>
              <span>{t('product.deliver_today')}</span>
            </div>
          )}

          {/* CTA block */}
          <div ref={ctaRef} className="flex flex-col gap-3">
            <Button size="lg" fullWidth onClick={handleAddToCart} className={added ? 'bg-green-light' : ''}>
              {added ? (
                <><svg className="draw-check" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100">
                  <polyline points="2,8 6,12 14,4"/>
                </svg> {t('common.added_to_cart')}</>
              ) : `🛒 ${t('common.add_to_cart')}`}
            </Button>
            <Button size="lg" fullWidth variant="outline" onClick={() => { setQuickBuyOpen(true); setQuickBuyDone(false) }}>
              {t('product.buy_one_click')}
            </Button>

            <AnimatePresence>
              {quickBuyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="bg-cream rounded-[14px] p-4 space-y-3">
                    {quickBuyDone ? (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2 py-2 text-center">
                        <span className="text-2xl">✓</span>
                        <p className="text-sm font-semibold text-green-deep">{t('product.request_accepted')}</p>
                        <p className="text-xs text-muted leading-relaxed">{t('product.manager_callback')}</p>
                        <button onClick={() => setQuickBuyOpen(false)} className="mt-1 text-xs text-muted underline underline-offset-2">{t('common.close')}</button>
                      </motion.div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-ink mb-1">{t('product.buy_one_click')}</p>
                          <p className="text-xs text-muted">{t('product.quick_buy_hint')}</p>
                        </div>
                        <input
                          type="tel" value={quickBuyPhone} onChange={e => setQuickBuyPhone(e.target.value)}
                          placeholder="+992 — — — — —"
                          className="w-full h-11 px-3 rounded-[10px] border border-border bg-surface text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-deep/25 focus:border-green-deep transition-all"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setQuickBuyOpen(false)} className="flex-1 h-10 rounded-[10px] border border-border text-sm text-muted hover:bg-surface transition-colors">
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={handleQuickBuy} disabled={quickBuyLoading}
                            className="flex-1 h-10 rounded-[10px] bg-green-deep text-white text-sm font-medium hover:bg-green-light transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                          >
                            {quickBuyLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('product.send_request')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <button
                onClick={() => toggle(product.id)}
                className="flex items-center gap-2 text-sm text-muted hover:text-rose-dust transition-colors"
              >
                <span className={isFav ? 'text-rose-dust' : ''}>{isFav ? '♥' : '♡'}</span>
                {isFav ? t('product.in_favorites') : t('product.add_to_favorites')}
              </button>
              <ShareButton title={product.name} text={product.composition} />
            </div>
          </div>

          {/* Accordions */}
          <div>
            <Accordion title={t('product.composition')}><p>{product.composition}</p></Accordion>
            <Accordion title={t('product.care_title')}>
              <p>{t('product.care_text')}</p>
            </Accordion>
            <Accordion title={t('product.delivery_title')}>
              <p>{t('product.delivery_text')}</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews">
        <h2 className="font-serif text-2xl font-semibold text-ink mb-6">{t('product.reviews')}</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-surface rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-green-deep/20 flex items-center justify-center font-semibold text-green-deep shrink-0">
                    {r.authorName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{r.authorName}</p>
                    <p className="text-xs text-muted">{r.date}</p>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                <p className="text-sm text-ink leading-relaxed">{r.text}</p>
                {r.photos && r.photos.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.photos.map((photo, pi) => (
                      <button key={pi} onClick={() => setLightboxPhoto(photo)} className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img src={photo} alt={t('product.review_photo')} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">{t('product.no_reviews')}</p>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-semibold text-ink mb-4">{t('product.related')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />

      {/* Sticky CTA */}
      <AnimatePresence>
        {!ctaVisible && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-14 md:hidden inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <img src={product.images[0]} alt="" className="w-12 h-12 rounded-[10px] object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink line-clamp-1">{product.name}</p>
              <p className="text-sm font-bold text-green-deep tabular-nums">{formatPrice(currentPrice)}</p>
            </div>
            <Button size="sm" onClick={handleAddToCart}>{added ? '✓' : t('common.add_to_cart')}</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <img src={lightboxPhoto} alt="" className="max-h-[80vh] max-w-full rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
