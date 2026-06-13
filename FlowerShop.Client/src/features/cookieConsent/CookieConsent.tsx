import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useCookieConsentStore } from './store'
import { Button } from '@/shared/ui/Button'
import { ROUTES } from '@/shared/config/routes'

function CategoryModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const { prefs, setPrefs } = useCookieConsentStore()
  const [analytics, setAnalytics] = useState(prefs.analytics)
  const [marketing, setMarketing] = useState(prefs.marketing)

  const save = () => {
    setPrefs({ analytics, marketing })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-serif text-xl font-semibold text-ink">{t('cookies.settings_title')}</h3>

        <div className="space-y-3">
          {/* Necessary */}
          <div className="flex items-center justify-between p-3 bg-cream rounded-xl">
            <div>
              <p className="text-sm font-medium text-ink">{t('cookies.necessary')}</p>
              <p className="text-xs text-muted mt-0.5">{t('cookies.necessary_desc')}</p>
            </div>
            <span className="text-xs font-medium text-green-deep">{t('cookies.always_on')}</span>
          </div>

          {/* Analytics */}
          <label className="flex items-center justify-between p-3 bg-cream rounded-xl cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink">{t('cookies.analytics')}</p>
              <p className="text-xs text-muted mt-0.5">{t('cookies.analytics_desc')}</p>
            </div>
            <button
              type="button"
              onClick={() => setAnalytics(v => !v)}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${analytics ? 'bg-green-deep' : 'bg-border'}`}
              role="switch" aria-checked={analytics}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${analytics ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>

          {/* Marketing */}
          <label className="flex items-center justify-between p-3 bg-cream rounded-xl cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink">{t('cookies.marketing')}</p>
              <p className="text-xs text-muted mt-0.5">{t('cookies.marketing_desc')}</p>
            </div>
            <button
              type="button"
              onClick={() => setMarketing(v => !v)}
              className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${marketing ? 'bg-green-deep' : 'bg-border'}`}
              role="switch" aria-checked={marketing}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${marketing ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>{t('common.cancel')}</Button>
          <Button fullWidth onClick={save}>{t('common.save')}</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function CookieConsent() {
  const { t } = useTranslation()
  const { decided, acceptAll, acceptNecessary } = useCookieConsentStore()
  const [showModal, setShowModal] = useState(false)

  if (decided) return null

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <CategoryModal key="modal" onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 1 }}
        className="fixed bottom-16 md:bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none"
      >
        <div className="bg-surface rounded-2xl shadow-2xl border border-border p-5 w-full max-w-lg pointer-events-auto">
          <p className="text-sm font-semibold text-ink mb-1">🍪 {t('cookies.banner_title')}</p>
          <p className="text-xs text-muted mb-4">
            {t('cookies.banner_text')}{' '}
            <Link to={ROUTES.COOKIES} className="text-green-deep underline">{t('cookies.learn_more')}</Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={acceptAll}>{t('cookies.accept_all')}</Button>
            <Button size="sm" variant="outline" onClick={acceptNecessary}>{t('cookies.necessary_only')}</Button>
            <button
              onClick={() => setShowModal(true)}
              className="h-9 px-3 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              {t('cookies.configure')}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
