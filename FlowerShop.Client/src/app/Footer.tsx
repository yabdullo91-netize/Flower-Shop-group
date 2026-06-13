import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-green-deep text-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <p className="font-serif text-xl font-semibold">{t('header.logo')}</p>
          <p className="text-white/60 text-sm leading-relaxed">
            {t('footer.tagline')}
          </p>
          <div className="flex gap-3 pt-1">
            <a
              href="https://instagram.com/yakubov.abdullo_"
              target="_blank" rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://t.me/yakubov_111"
              target="_blank" rel="noopener noreferrer"
              aria-label="Telegram"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <TelegramIcon />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">{t('footer.catalog')}</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/catalog" className="hover:text-white transition-colors">{t('footer.all_bouquets')}</Link></li>
            <li><Link to="/catalog?occasion=birthday" className="hover:text-white transition-colors">{t('footer.for_birthday')}</Link></li>
            <li><Link to="/catalog?occasion=wedding" className="hover:text-white transition-colors">{t('footer.for_wedding')}</Link></li>
            <li><Link to="/catalog?occasion=mom" className="hover:text-white transition-colors">{t('footer.for_mom')}</Link></li>
          </ul>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">{t('footer.info')}</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/account" className="hover:text-white transition-colors">{t('footer.my_orders')}</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors">{t('footer.returns')}</Link></li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">{t('footer.contacts')}</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <span>📍</span>
              <span>{t('footer.address')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <a href="tel:+992004048769" className="hover:text-white transition-colors">+992 004 048 769</a>
            </li>
            <li className="flex items-center gap-2">
              <span>🕐</span>
              <span>{t('footer.hours')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {t('header.logo')}. {t('footer.rights')}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white/70 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors">{t('footer.terms')}</Link>
            <Link to="/cookies" className="hover:text-white/70 transition-colors">{t('footer.cookies_link')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.15 13.6l-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.537-.194 1.006.131.834.957z"/>
    </svg>
  )
}
