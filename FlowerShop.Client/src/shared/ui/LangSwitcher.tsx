import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LANGS, setLang, type Lang } from '@/shared/lib/i18n'

export function LangSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGS.find(l => l.code === i18n.language) ?? LANGS[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const choose = (code: Lang) => {
    setLang(code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 h-8 px-2 rounded-lg hover:bg-ink/5 transition-colors text-xs font-medium text-ink"
        aria-label="Language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted text-[10px] ml-0.5"
        >▾</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[7rem]"
          >
            {LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => choose(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                  lang.code === i18n.language
                    ? 'bg-green-deep/8 text-green-deep font-semibold'
                    : 'hover:bg-cream text-ink'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
