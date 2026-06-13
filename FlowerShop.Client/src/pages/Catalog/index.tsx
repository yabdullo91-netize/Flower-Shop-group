import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard, ProductCardSkeleton } from '@/entities/product/ProductCard'
import { useProducts } from '@/entities/product/queries'
import type { Freshness, Occasion, Packaging, ProductFilters, ProductKind } from '@/entities/product/types'
import { Button } from '@/shared/ui/Button'
import { Sheet } from '@/shared/ui/Sheet'
import { usePageTitle } from '@/shared/hooks/usePageTitle'
import { getHolidayInfo } from '@/shared/lib/holiday'

// ─── Constants ───────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'popular',    tKey: 'catalog.sort_popular' },
  { value: 'price_asc',  tKey: 'catalog.sort_price_asc' },
  { value: 'price_desc', tKey: 'catalog.sort_price_desc' },
  { value: 'newest',     tKey: 'catalog.sort_newest' },
  { value: 'rating',     tKey: 'catalog.sort_rating' },
] as const

const OCCASION_IDS = ['birthday', 'wedding', 'nikah', 'romantic', 'mom', 'sorry', 'funeral', 'other'] as const

const OCCASION_EMOJI: Record<typeof OCCASION_IDS[number], string> = {
  birthday: '🎂', wedding: '💍', nikah: '🕌', romantic: '❤️',
  mom: '🌷', sorry: '🙏', funeral: '🕊', other: '🌸',
}

const PROMO_CODE = 'WELCOME20'

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters, setFilters, onClose, t,
}: {
  filters: ProductFilters
  setFilters: (f: ProductFilters) => void
  onClose?: () => void
  t: TFunction
}) {
  const [priceMin, setPriceMin] = useState(filters.priceMin ?? '')
  const [priceMax, setPriceMax] = useState(filters.priceMax ?? '')

  const apply = () => {
    setFilters({
      ...filters,
      priceMin: priceMin !== '' ? Number(priceMin) : undefined,
      priceMax: priceMax !== '' ? Number(priceMax) : undefined,
    })
    onClose?.()
  }

  return (
    <div className="p-4 space-y-6">
      {/* Свежесть */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">{t('catalog.freshness_title')}</h3>
        <div className="flex flex-wrap gap-2">
          {([
            { value: undefined, label: t('catalog.category_all') },
            { value: 'live',    label: t('catalog.category_live') },
            { value: 'dried',   label: t('catalog.category_dried') },
          ] as { value: Freshness | undefined; label: string }[]).map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setFilters({ ...filters, freshness: opt.value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                filters.freshness === opt.value
                  ? 'bg-green-deep text-white border-green-deep'
                  : 'border-border text-muted hover:border-green-deep bg-surface'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Тип товара */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">{t('catalog.type_title')}</h3>
        <div className="flex gap-2">
          {([
            { value: undefined, label: t('catalog.type_all') },
            { value: 'bouquet', label: t('catalog.type_bouquet') },
            { value: 'single',  label: t('catalog.type_single') },
          ] as { value: ProductKind | undefined; label: string }[]).map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setFilters({ ...filters, kind: opt.value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                filters.kind === opt.value
                  ? 'bg-green-deep text-white border-green-deep'
                  : 'border-border text-muted hover:border-green-deep bg-surface'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Упаковка */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">{t('catalog.packaging_title')}</h3>
        <div className="flex gap-2">
          {([
            { value: undefined,   label: t('catalog.packaging_any') },
            { value: 'basket',    label: t('catalog.packaging_basket') },
            { value: 'no_basket', label: t('catalog.packaging_no') },
          ] as { value: Packaging | undefined; label: string }[]).map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setFilters({ ...filters, packaging: opt.value })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                filters.packaging === opt.value
                  ? 'bg-green-deep text-white border-green-deep'
                  : 'border-border text-muted hover:border-green-deep bg-surface'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Повод */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">{t('catalog.occasion')}</h3>
        <div className="flex flex-wrap gap-2">
          {OCCASION_IDS.map(id => (
            <button
              key={id}
              onClick={() => setFilters({ ...filters, occasion: filters.occasion === id ? undefined : id as Occasion })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                filters.occasion === id
                  ? 'bg-green-deep text-white border-green-deep'
                  : 'border-border text-muted hover:border-green-deep bg-surface'
              }`}
            >{OCCASION_EMOJI[id]} {t(`occasions.${id}`)}</button>
          ))}
        </div>
      </div>

      {/* Цена */}
      <div>
        <h3 className="text-sm font-semibold text-ink mb-3">{t('catalog.price_title')}</h3>
        <div className="flex gap-3 items-center">
          <input
            type="number" value={priceMin} min={0}
            onChange={e => setPriceMin(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink"
            placeholder={t('catalog.price_from')}
          />
          <span className="text-muted shrink-0">—</span>
          <input
            type="number" value={priceMax} min={0}
            onChange={e => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink"
            placeholder={t('catalog.price_to')}
          />
        </div>
      </div>

      {/* Доставка сегодня */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={!!filters.deliverToday}
          onChange={e => setFilters({ ...filters, deliverToday: e.target.checked || undefined })}
          className="w-4 h-4 accent-green-deep rounded"
        />
        <span className="text-sm text-ink">{t('catalog.deliver_today')}</span>
      </label>

      {onClose && (
        <Button onClick={apply} fullWidth>{t('common.apply')}</Button>
      )}
    </div>
  )
}

// ─── Catalog page ─────────────────────────────────────────────────────────────

export function CatalogPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [promoCopied, setPromoCopied] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const q = searchParams.get('q') || undefined
  usePageTitle(q ? `${t('catalog.search_title')}: ${q}` : t('catalog.page_title'))

  const filters: ProductFilters = {
    q:            searchParams.get('q') || undefined,
    occasion:     (searchParams.get('occasion') as Occasion) || undefined,
    priceMin:     searchParams.get('priceMin')  ? +searchParams.get('priceMin')!  : undefined,
    priceMax:     searchParams.get('priceMax')  ? +searchParams.get('priceMax')!  : undefined,
    deliverToday: searchParams.get('deliverToday') === 'true' || undefined,
    freshness:    (searchParams.get('freshness') as Freshness) || undefined,
    kind:         (searchParams.get('kind') as ProductKind) || undefined,
    packaging:    (searchParams.get('packaging') as Packaging) || undefined,
    sort:         (searchParams.get('sort') as ProductFilters['sort']) || 'popular',
  }

  const setFilters = (f: ProductFilters) => {
    const p = new URLSearchParams()
    if (f.q)           p.set('q', f.q)
    if (f.occasion)    p.set('occasion', f.occasion)
    if (f.priceMin)    p.set('priceMin',  String(f.priceMin))
    if (f.priceMax)    p.set('priceMax',  String(f.priceMax))
    if (f.deliverToday) p.set('deliverToday', 'true')
    if (f.freshness)   p.set('freshness', f.freshness)
    if (f.kind)        p.set('kind', f.kind)
    if (f.packaging)   p.set('packaging', f.packaging)
    if (f.sort && f.sort !== 'popular') p.set('sort', f.sort)
    setSearchParams(p)
  }

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useProducts(filters)
  const products = data?.pages.flatMap(p => p.items) || []
  const total = data?.pages[0]?.total || 0

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    }, { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const activeFilterCount = [
    filters.occasion, filters.priceMin, filters.priceMax,
    filters.deliverToday, filters.freshness, filters.kind, filters.packaging,
  ].filter(Boolean).length

  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE)
      setPromoCopied(true)
      setTimeout(() => setPromoCopied(false), 2000)
    } catch { /* noop */ }
  }

  const holiday = getHolidayInfo()

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">

      {/* ── Occasion chips ── */}
      <div className="mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {OCCASION_IDS.map(id => (
            <motion.button
              key={id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilters({ ...filters, occasion: filters.occasion === id ? undefined : id as Occasion })}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                filters.occasion === id
                  ? 'border-green-deep bg-green-deep text-white shadow-sm'
                  : 'border-border bg-surface text-ink hover:border-green-deep/50'
              }`}
            >
              <span>{OCCASION_EMOJI[id]}</span>
              {t(`occasions.${id}`)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Holiday banner ── */}
      <AnimatePresence>
        {holiday.active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-dust/20 border border-rose-dust"
          >
            <span className="text-xl">🌸</span>
            <div>
              <p className="text-sm font-semibold text-ink">{holiday.name}</p>
              <p className="text-xs text-muted">{t('catalog.holiday_hint')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Promo banner ── */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-deep/10 border border-green-deep/20"
        >
          <span className="text-xl">🎁</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">{t('catalog.promo_label')}</p>
            <p className="text-xs text-muted">{t('catalog.promo_hint')}</p>
          </div>
          <button
            onClick={copyPromo}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-deep text-white text-xs font-bold hover:bg-green-light transition-colors"
          >
            {promoCopied ? t('catalog.copied') : PROMO_CODE}
          </button>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-70 shrink-0">
          <h2 className="font-serif text-xl font-semibold text-ink mb-4">{t('catalog.filters')}</h2>
          <div className="bg-surface rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <FilterPanel filters={filters} setFilters={setFilters} t={t} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              {q ? (
                <>
                  <h1 className="font-serif text-2xl font-semibold text-ink">{t('catalog.results_for', { query: q })}</h1>
                  {!isLoading && (
                    <p className="text-sm text-muted mt-0.5">
                      {total > 0 ? t('catalog.n_found', { count: total }) : t('catalog.no_results')}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h1 className="font-serif text-2xl font-semibold text-ink">
                    {filters.occasion
                      ? `${OCCASION_EMOJI[filters.occasion as typeof OCCASION_IDS[number]]} ${t(`occasions.${filters.occasion}`)}`
                      : t('catalog.title')}
                  </h1>
                  {!isLoading && <p className="text-sm text-muted mt-0.5">{t('catalog.n_items', { count: total })}</p>}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 h-10 px-4 rounded-[10px] border border-border bg-surface text-sm font-medium hover:border-green-deep transition-colors text-ink"
              >
                ⚙ {t('catalog.filters')}
                {activeFilterCount > 0 && (
                  <span className="bg-green-deep text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <select
                value={filters.sort || 'popular'}
                onChange={e => setFilters({ ...filters, sort: e.target.value as ProductFilters['sort'] })}
                className="h-10 px-3 rounded-[10px] border border-border text-sm outline-none focus:border-green-deep bg-surface text-ink"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.tKey)}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-4 overflow-hidden"
              >
                {filters.occasion && (
                  <ActiveChip onRemove={() => setFilters({ ...filters, occasion: undefined })}>
                    {OCCASION_EMOJI[filters.occasion as typeof OCCASION_IDS[number]]} {t(`occasions.${filters.occasion}`)}
                  </ActiveChip>
                )}
                {(filters.priceMin || filters.priceMax) && (
                  <ActiveChip onRemove={() => setFilters({ ...filters, priceMin: undefined, priceMax: undefined })}>
                    {filters.priceMin && filters.priceMax
                      ? `${filters.priceMin}–${filters.priceMax} ${t('common.som')}`
                      : filters.priceMin
                        ? `${t('catalog.price_from')} ${filters.priceMin}`
                        : `${t('catalog.price_to')} ${filters.priceMax}`}
                  </ActiveChip>
                )}
                {filters.deliverToday && (
                  <ActiveChip onRemove={() => setFilters({ ...filters, deliverToday: undefined })}>
                    {t('catalog.today_chip')}
                  </ActiveChip>
                )}
                {filters.freshness && (
                  <ActiveChip onRemove={() => setFilters({ ...filters, freshness: undefined })}>
                    {filters.freshness === 'live' ? t('catalog.category_live') : t('catalog.category_dried')}
                  </ActiveChip>
                )}
                {filters.kind && (
                  <ActiveChip onRemove={() => setFilters({ ...filters, kind: undefined })}>
                    {filters.kind === 'bouquet' ? t('catalog.type_bouquet') : t('catalog.type_single')}
                  </ActiveChip>
                )}
                {filters.packaging && (
                  <ActiveChip onRemove={() => setFilters({ ...filters, packaging: undefined })}>
                    {filters.packaging === 'basket' ? t('catalog.packaging_basket') : t('catalog.packaging_no')}
                  </ActiveChip>
                )}
                <button
                  onClick={() => { setSearchParams({}); }}
                  className="px-3 py-1.5 text-xs text-muted hover:text-ink transition-colors underline"
                >
                  {t('catalog.reset_all')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {isLoading
              ? Array.from({ length: 12 }, (_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p, i) => <ProductCard key={p.id} product={p} index={i < 12 ? i : -1} />)
            }
            {isFetchingNextPage && Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={`next-${i}`} />)}
          </div>

          {/* Empty */}
          {!isLoading && products.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🥀</div>
              <p className="font-serif text-xl text-ink mb-2">{t('catalog.no_results')}</p>
              <p className="text-sm text-muted">{t('catalog.no_results_hint')}</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchParams({})}>
                {t('catalog.reset_filters')}
              </Button>
            </div>
          )}

          <div ref={sentinelRef} />

          {hasNextPage && !isFetchingNextPage && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={() => fetchNextPage()}>{t('common.show_more')}</Button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} side="bottom" title={t('catalog.filters')}>
        <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setFiltersOpen(false)} t={t} />
      </Sheet>
    </div>
  )
}

function ActiveChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <motion.button
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={onRemove}
      className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-green-deep/10 text-green-deep rounded-full text-xs font-medium hover:bg-green-deep/20 transition-colors"
    >
      {children}
      <span className="w-4 h-4 rounded-full bg-green-deep/20 flex items-center justify-center">×</span>
    </motion.button>
  )
}
