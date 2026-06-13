import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function usePageTitle(title?: string) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const siteName = t('header.site_name')
    document.title = title ? `${title} | ${siteName}` : siteName
    return () => { document.title = siteName }
  }, [title, t, i18n.language])
}
