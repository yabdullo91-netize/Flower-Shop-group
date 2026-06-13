import { forwardRef, type InputHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && <label htmlFor={inputId} className="text-sm font-medium text-ink">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 px-4 rounded-xl border text-sm outline-none transition-all duration-150',
            'bg-white border-border text-ink placeholder:text-muted',
            'focus:border-green-deep focus:ring-2 focus:ring-green-deep/15',
            error && 'border-error focus:border-error focus:ring-error/15',
            className
          )}
          {...props}
        />
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              key={error}
              className="text-xs text-error"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
