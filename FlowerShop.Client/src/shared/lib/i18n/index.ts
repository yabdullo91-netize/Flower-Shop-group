import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ru } from './ru'
import { en } from './en'
import { tg } from './tg'

export type Lang = 'ru' | 'en' | 'tg'

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'ru', label: 'Рус',  flag: '🇷🇺' },
  { code: 'en', label: 'Eng',  flag: '🇬🇧' },
  { code: 'tg', label: 'Тоҷ', flag: '🇹🇯' },
]

const saved = (localStorage.getItem('flower-lang') as Lang) || 'ru'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      tg: { translation: tg },
    },
    lng: saved,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  })

document.documentElement.lang = saved

export function setLang(lang: Lang) {
  i18n.changeLanguage(lang)
  localStorage.setItem('flower-lang', lang)
  document.documentElement.lang = lang
}

/** Locale для Intl/toLocaleString в зависимости от выбранного языка */
export function getLocale(): string {
  return ({ ru: 'ru-RU', en: 'en-US', tg: 'tg-TJ' } as Record<string, string>)[i18n.language] ?? 'ru-RU'
}

export { i18n }
