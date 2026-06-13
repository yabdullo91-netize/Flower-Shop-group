import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface SheetProps {
  open: boolean
  onClose: () => void
  side?: 'right' | 'bottom'
  children: ReactNode
  title?: string
}

const variants = {
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    className: 'right-0 top-0 h-full w-full max-w-[420px] rounded-l-[24px]',
  },
  bottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    className: 'bottom-0 left-0 right-0 w-full max-h-[90svh] rounded-t-[24px]',
  },
}

export function Sheet({ open, onClose, side = 'right', children, title }: SheetProps) {
  const { t } = useTranslation()
  const v = variants[side]

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={`absolute bg-cream shadow-2xl flex flex-col ${v.className}`}
            initial={v.initial} animate={v.animate} exit={v.exit}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {side === 'bottom' && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>
            )}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="font-serif text-xl font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors text-xl"
                  aria-label={t('common.close')}
                >×</button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
