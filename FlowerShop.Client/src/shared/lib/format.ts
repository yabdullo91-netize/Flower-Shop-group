import { i18n } from './i18n'

const fmt = new Intl.NumberFormat('ru-TJ', { style: 'decimal', maximumFractionDigits: 0 })

export const formatPrice = (n: number) => `${fmt.format(n)} ${i18n.t('common.somoni')}`

export const formatShort = (n: number) => fmt.format(n)
