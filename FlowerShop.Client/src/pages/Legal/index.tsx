import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/shared/hooks/usePageTitle'

interface LegalPageProps {
  titleKey: string
  contentKey: string
  icon: string
}

function LegalPage({ titleKey, contentKey, icon }: LegalPageProps) {
  const { t } = useTranslation()
  const title = t(titleKey)
  usePageTitle(title)

  const updatedDate = new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-10">
        <p className="text-5xl mb-4">{icon}</p>
        <h1 className="font-serif text-3xl font-bold text-ink">{title}</h1>
        <p className="text-xs text-muted mt-2">{t('legal.last_updated', { date: updatedDate })}</p>
      </div>
      <div className="prose prose-sm max-w-none text-ink space-y-4">
        {t(contentKey).split('\n\n').map((para, i) => (
          <p key={i} className="text-sm text-muted leading-relaxed">{para}</p>
        ))}
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return <LegalPage titleKey="legal.privacy_title" contentKey="legal.privacy_text" icon="🔒" />
}

export function TermsPage() {
  return <LegalPage titleKey="legal.terms_title" contentKey="legal.terms_text" icon="📋" />
}

export function CookiesPage() {
  return <LegalPage titleKey="legal.cookies_title" contentKey="legal.cookies_text" icon="🍪" />
}

export function ReturnsPage() {
  return <LegalPage titleKey="legal.returns_title" contentKey="legal.returns_text" icon="↩️" />
}
