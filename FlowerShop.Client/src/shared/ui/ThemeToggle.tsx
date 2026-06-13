import { useTranslation } from 'react-i18next'
import { useThemeStore, type ThemeMode } from '@/features/theme/store'
import { cn } from '@/shared/lib/cn'

const OPTIONS: { value: ThemeMode; tKey: string; icon: string }[] = [
  { value: 'light',  tKey: 'theme.light',  icon: '☀' },
  { value: 'dark',   tKey: 'theme.dark',   icon: '☾' },
  { value: 'system', tKey: 'theme.system', icon: '⊙' },
]

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()

  if (compact) {
    const next: ThemeMode = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    const current = OPTIONS.find(o => o.value === theme)!
    return (
      <button
        onClick={() => setTheme(next)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ink/5 transition-colors text-ink"
        aria-label={t('theme.switch_hint', { theme: t(current.tKey) })}
        title={t(current.tKey)}
      >
        <span className="text-base leading-none">{current.icon}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-[12px] bg-cream" role="group" aria-label={t('theme.aria')}>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-150',
            theme === opt.value
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          )}
          aria-pressed={theme === opt.value}
        >
          <span>{opt.icon}</span>
          {t(opt.tKey)}
        </button>
      ))}
    </div>
  )
}
