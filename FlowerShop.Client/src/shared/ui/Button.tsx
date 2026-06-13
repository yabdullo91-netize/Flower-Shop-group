import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-green-deep text-white hover:bg-green-light active:scale-[0.98]',
  outline: 'border border-green-deep text-green-deep hover:bg-green-deep/5 active:scale-[0.98]',
  ghost: 'text-muted hover:bg-black/5 active:scale-[0.98]',
  danger: 'bg-error text-white hover:bg-[#a93226] active:scale-[0.98]',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-[10px]',
  md: 'h-11 px-6 text-sm rounded-[12px]',
  lg: 'h-14 px-8 text-base rounded-[12px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 select-none focus-visible:outline-2 focus-visible:outline-[#1F4D3A] focus-visible:outline-offset-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
          </svg>
        </span>
      ) : children}
    </button>
  )
)
Button.displayName = 'Button'
