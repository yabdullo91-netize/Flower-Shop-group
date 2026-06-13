import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from '@/shared/ui/toast.store'

interface Props {
  title: string
  text?: string
  url?: string
  className?: string
}

interface Platform {
  id: string
  label: string
  bg: string
  icon: React.ReactNode
  href: (url: string, title: string) => string
}

const PLATFORMS: Platform[] = [
  {
    id: 'telegram',
    label: 'Telegram',
    bg: 'bg-[#2AABEE]',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    bg: 'bg-[#25D366]',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9.776 9.776 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    ),
    href: (u, t) => `https://wa.me/?text=${encodeURIComponent(t + ' ' + u)}`,
  },
  {
    id: 'viber',
    label: 'Viber',
    bg: 'bg-[#7360F2]',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M11.4 0C9.5.03 5.3.34 3 2.47 1.3 4.18.7 6.7.62 9.82c-.07 3.12-.15 8.97 5.5 10.56h.01l-.003 2.42s-.038.95.592 1.14c.76.235 1.2-.484 1.925-1.26.397-.43.944-1.06 1.358-1.54 3.737.31 6.613-.4 6.938-.506.756-.243 5.033-.79 5.726-6.44.716-5.824-.346-9.504-2.826-11.157l-.003-.002C18.108.995 15.541-.08 11.398.002zm.1 1.92h.001c3.664-.489 5.827.415 6.41.83 2.017 1.38 2.916 4.516 2.305 9.63-.572 4.72-3.947 5.033-4.583 5.237-.271.086-2.862.716-6.044.498 0 0-2.396 2.893-3.143 3.64-.117.117-.252.166-.344.143-.13-.033-.165-.186-.163-.41l.02-3.543C2.12 16.13 2.195 11.302 2.255 8.897c.058-2.634.547-4.74 1.935-6.116 1.94-1.777 5.56-1.9 7.307-1.861zm.38 3.28c-.395-.012-.396.608 0 .612 3.048.096 4.512 1.676 4.596 4.87.01.396.614.388.604-.008-.095-3.504-1.776-5.36-5.2-5.474zm-1.386 7.525c-.483.284-.972.517-1.376.474-.257-.028-.452-.163-.61-.506-.437-.952-.846-1.914-1.268-2.868-.135-.305-.247-.653-.15-.98.095-.326.432-.573.66-.787.388-.366.408-.55.151-1.007-.446-.788-1.32-1.853-1.943-2.393-.358-.317-.705-.215-1.018.026-.28.216-.56.436-.798.695-.494.541-.51 1.16-.346 1.831.455 1.838 1.476 3.596 2.8 5.043 1.327 1.45 3.04 2.587 4.863 3.07.663.178 1.258.183 1.784-.339.249-.248.447-.533.647-.812.303-.42.228-.784-.166-1.068-.704-.508-1.48-1.049-2.23-1.379z"/>
      </svg>
    ),
    href: (u, t) => `viber://forward?text=${encodeURIComponent(t + ' ' + u)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    bg: 'bg-[#1877F2]',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    bg: 'bg-[#000000]',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    href: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
  },
]

export function ShareButton({ title, text, url, className = '' }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const shareUrl = url ?? window.location.href

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleTrigger = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
      } catch { /* dismissed */ }
      return
    }
    setOpen(true)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t('share.link_copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('share.copy_failed'))
    }
    setOpen(false)
  }

  const handlePlatform = (p: Platform) => {
    window.open(p.href(shareUrl, title), '_blank', 'noopener,noreferrer,width=600,height=500')
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleTrigger}
        className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        aria-label={t('share.title')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        {t('share.title')}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="fixed bottom-0 left-0 right-0 z-50 sm:absolute sm:bottom-auto sm:top-8 sm:right-0 sm:left-auto sm:w-72"
            >
              <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl border border-border overflow-hidden">
                {/* Handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-8 h-1 rounded-full bg-border" />
                </div>

                {/* Header */}
                <div className="px-5 pt-3 pb-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{t('share.title')}</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-cream flex items-center justify-center text-muted hover:text-ink transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Platform grid */}
                <div className="p-4 grid grid-cols-5 gap-3">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handlePlatform(p)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className={`w-11 h-11 rounded-2xl ${p.bg} flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 group-active:scale-95`}>
                        {p.icon}
                      </div>
                      <span className="text-[10px] text-muted leading-tight text-center">{p.label}</span>
                    </button>
                  ))}
                </div>

                {/* Copy link */}
                <div className="px-4 pb-5">
                  <div className="flex items-center gap-2 bg-cream rounded-xl px-3 py-2 border border-border">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    <span className="text-xs text-muted truncate flex-1">{shareUrl}</span>
                    <button
                      onClick={handleCopy}
                      className={`shrink-0 text-xs font-semibold transition-colors ${copied ? 'text-green-deep' : 'text-green-deep hover:text-green-light'}`}
                    >
                      {copied ? t('share.copied') : t('share.copy')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
