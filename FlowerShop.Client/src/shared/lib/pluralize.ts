const pr: Partial<Record<string, Intl.PluralRules>> = {}

function getPr(lang: string): Intl.PluralRules {
  return (pr[lang] ??= new Intl.PluralRules(lang === 'ru' ? 'ru-RU' : lang === 'tg' ? 'tg-TJ' : 'en-US'))
}

type Forms = { one: string; few?: string; many?: string; other: string }

function pick(forms: Forms, form: Intl.LDMLPluralRule): string {
  return (forms as Record<string, string>)[form] ?? forms.other
}

const POINTS: Record<string, Forms> = {
  ru: { one: 'балл', few: 'балла', many: 'баллов', other: 'баллов' },
  en: { one: 'point', other: 'points' },
  tg: { one: 'хол', other: 'хол' },
}

const RESULTS: Record<string, Forms> = {
  ru: { one: 'результат', few: 'результата', many: 'результатов', other: 'результатов' },
  en: { one: 'result', other: 'results' },
  tg: { one: 'натиҷа', other: 'натиҷаҳо' },
}

/** "балл" / "балла" / "баллов" for a given count and language */
export function pluralPoints(count: number, lang: string): string {
  return pick(POINTS[lang] ?? POINTS.ru, getPr(lang).select(count))
}

/** "результат" / "результата" / "результатов" */
export function pluralResults(count: number, lang: string): string {
  return pick(RESULTS[lang] ?? RESULTS.ru, getPr(lang).select(count))
}
