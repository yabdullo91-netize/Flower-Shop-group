import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { usePageTitle } from '@/shared/hooks/usePageTitle'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { MOCK_PRODUCTS } from '@/entities/product/mock'
import { ProductCard } from '@/entities/product/ProductCard'
import { MAX_RECENT_SEARCHES } from '@/shared/config/appConfig'
import type { Product } from '@/entities/product/types'

const POPULAR_QUERIES = ['розы', 'пионы', 'тюльпаны', 'букет', 'орхидеи', 'сухоцветы']

function highlight(text: string, query: string): React.ReactElement {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-green-deep/20 text-green-deep rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function filterProducts(query: string): Product[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return MOCK_PRODUCTS.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.composition.toLowerCase().includes(q) ||
      p.occasions.some(o => o.toLowerCase().includes(q)) ||
      p.flowerTypes.some(f => f.toLowerCase().includes(q))
  )
}

export function SearchPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const debouncedQ = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  usePageTitle(`${t('search.title')}${debouncedQ ? ` — ${debouncedQ}` : ''}`)

  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('flower-recent-searches', [])

  const results = filterProducts(debouncedQ)

  useEffect(() => {
    if (debouncedQ.trim().length >= 2) {
      setParams({ q: debouncedQ }, { replace: true })
    }
  }, [debouncedQ, setParams])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addRecent = useCallback((q: string) => {
    if (q.trim().length < 2) return
    setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, MAX_RECENT_SEARCHES))
  }, [setRecentSearches])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      addRecent(query.trim())
    }
  }

  const pickQuery = (q: string) => {
    setQuery(q)
    addRecent(q)
    inputRef.current?.focus()
  }

  const showSuggestions = debouncedQ.length < 2

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      {/* Search bar */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="w-full h-12 pl-11 pr-12 rounded-2xl bg-surface border border-border text-sm outline-none focus:border-green-deep focus:ring-2 focus:ring-green-deep/15 transition-all text-ink placeholder:text-muted shadow-sm"
          autoFocus
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setQuery(''); setParams({}); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-border/60 text-muted hover:bg-border hover:text-ink transition-colors text-xs"
              aria-label={t('common.clear')}
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {showSuggestions ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-ink">{t('search.recent')}</p>
                  <button
                    onClick={() => setRecentSearches([])}
                    className="text-xs text-muted hover:text-ink transition-colors"
                  >
                    {t('search.clear_recent')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(s => (
                    <button
                      key={s}
                      onClick={() => pickQuery(s)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-surface border border-border text-sm text-ink hover:border-green-deep hover:text-green-deep transition-colors"
                    >
                      <ClockIcon />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular */}
            <div>
              <p className="text-sm font-semibold text-ink mb-3">{t('search.popular')}</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_QUERIES.map(s => (
                  <button
                    key={s}
                    onClick={() => pickQuery(s)}
                    className="h-8 px-3 rounded-full bg-green-deep/10 text-green-deep text-sm font-medium hover:bg-green-deep hover:text-white transition-colors"
                  >
                    🔥 {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {t('search.results_for', { q: debouncedQ })}
                </p>
                {results.length > 0 && (
                  <p className="text-xs text-muted mt-0.5">
                    {t('search.n_found', { count: results.length })}
                  </p>
                )}
              </div>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {results.map(p => (
                  <div key={p.id} onClick={() => addRecent(query.trim())}>
                    <ProductCard
                      product={p}
                      highlightText={debouncedQ}
                      showHighlight={false}
                    />
                    {/* Highlighted name overlay hint */}
                    <p className="text-xs text-muted mt-1 px-1 line-clamp-1">
                      {highlight(p.name, debouncedQ)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-serif text-xl text-ink mb-2">{t('search.no_results')}</p>
                <p className="text-sm text-muted mb-6">{t('search.no_results_hint')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_QUERIES.slice(0, 4).map(s => (
                    <button
                      key={s}
                      onClick={() => pickQuery(s)}
                      className="h-9 px-4 rounded-xl bg-surface border border-border text-sm text-muted hover:border-green-deep hover:text-green-deep transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Link
                  to="/"
                  className="inline-block mt-6 text-sm text-green-deep font-medium hover:underline"
                >
                  {t('common.to_home')} →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )
}
