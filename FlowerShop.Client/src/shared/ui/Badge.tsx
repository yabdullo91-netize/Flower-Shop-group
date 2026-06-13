import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type BadgeVariant =
  | 'discount' | 'hit' | 'new' | 'status' | 'live' | 'dried'
  | 'order-accepted' | 'order-assembling' | 'order-photo'
  | 'order-courier' | 'order-delivered' | 'order-cancelled'

const styles: Record<BadgeVariant, string> = {
  // Product badges
  discount:         'bg-rose-dust text-ink',
  hit:              'bg-green-deep text-white',
  new:              'bg-ink text-surface',
  status:           'bg-cream border border-border text-muted',
  live:             'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  dried:            'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  // Order status badges — use CSS custom property tokens for dark-mode correctness
  'order-accepted':   'bg-green-deep/10 text-green-deep border border-green-deep/20',
  'order-assembling': 'bg-gold/20 text-gold border border-gold/30',
  'order-photo':      'bg-rose-dust/30 text-ink border border-rose-dust/40',
  'order-courier':    'bg-ink/8 text-ink border border-border',
  'order-delivered':  'bg-green-deep text-white',
  'order-cancelled':  'bg-error/10 text-error border border-error/20',
}

export function Badge({
  variant = 'status',
  className,
  children,
}: {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold', styles[variant], className)}>
      {children}
    </span>
  )
}

export type { BadgeVariant }
