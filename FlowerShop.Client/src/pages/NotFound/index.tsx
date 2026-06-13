import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/Button'
import { usePageTitle } from '@/shared/hooks/usePageTitle'

export function NotFoundPage() {
  const { t } = useTranslation()
  usePageTitle(t('notfound.title'))
  return (
    <div className="min-h-[70svh] flex flex-col items-center justify-center text-center px-4 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-8xl mb-4">🌸</p>
        <h1 className="font-serif text-5xl font-bold text-green-deep mb-2">404</h1>
        <p className="font-serif text-xl text-ink mb-1">{t('notfound.title')}</p>
        <p className="text-muted text-sm max-w-xs">
          {t('notfound.hint')}
        </p>
      </motion.div>
      <div className="flex gap-3">
        <Link to="/"><Button>{t('common.to_home')}</Button></Link>
        <Link to="/catalog"><Button variant="outline">{t('notfound.catalog')}</Button></Link>
      </div>
    </div>
  )
}
