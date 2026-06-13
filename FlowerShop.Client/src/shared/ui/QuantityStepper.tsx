import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'

interface Props {
  options: number[]
  value: number
  onChange: (v: number) => void
  label?: string
  className?: string
}

export function QuantityStepper({ options, value, onChange, label, className }: Props) {
  const { t } = useTranslation()
  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-sm font-semibold text-ink">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <motion.button
            key={opt}
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(opt)}
            className={cn(
              'w-14 h-10 rounded-[10px] text-sm font-medium border-2 transition-all duration-150',
              value === opt
                ? 'border-green-deep bg-green-deep text-white'
                : 'border-border text-ink hover:border-green-deep/50 bg-surface'
            )}
            aria-pressed={value === opt}
            aria-label={`${opt} ${t('product.stems_unit')}`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
