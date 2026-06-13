import React, { type ReactNode, useEffect, useRef, useState } from 'react'
import { X, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type BtnSize    = 'sm' | 'md' | 'lg'

const VARIANT: Record<BtnVariant, string> = {
  primary:   'bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200 active:scale-[.98]',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[.98]',
  danger:    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200 active:scale-[.98]',
  ghost:     'text-slate-600 hover:bg-slate-100 active:scale-[.98]',
  outline:   'border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[.98]',
}
const SIZE: Record<BtnSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-10 px-5 text-sm gap-2 rounded-xl',
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    >
      {loading ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <input
        ref={ref}
        {...rest}
        className={`h-9 px-3 rounded-xl border bg-white text-sm outline-none transition-all ${
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
            : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
        } ${className}`}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <textarea
        ref={ref}
        {...rest}
        className={`px-3 py-2 rounded-xl border bg-white text-sm outline-none transition-all resize-none ${
          error ? 'border-rose-400 focus:ring-2 focus:ring-rose-100' : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
        } ${className}`}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <select
        ref={ref}
        {...rest}
        className={`h-9 px-3 rounded-xl border bg-white text-sm outline-none transition-all ${
          error ? 'border-rose-400' : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
        } ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor = 'violet' | 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'orange'

const BADGE_COLOR: Record<BadgeColor, string> = {
  violet: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  green:  'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  amber:  'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  red:    'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  blue:   'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  slate:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  orange: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
}

export function Badge({ color = 'slate', children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_COLOR[color]}`}>
      {children}
    </span>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className={`border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin ${className}`} />
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg', footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  danger?: boolean
  loading?: boolean
}

export function Confirm({ open, onClose, onConfirm, title = 'Подтвердите', message, confirmText = 'Удалить', danger = true, loading }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3 items-start">
        {danger && (
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-rose-600" />
          </div>
        )}
        <p className="text-sm text-slate-600 leading-relaxed pt-1.5">{message}</p>
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Отмена</Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>{confirmText}</Button>
      </div>
    </Modal>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: number; type: ToastType; message: string }

let toastListeners: ((t: ToastItem) => void)[] = []
let toastId = 0

export const toast = {
  success: (message: string) => toastListeners.forEach(fn => fn({ id: ++toastId, type: 'success', message })),
  error:   (message: string) => toastListeners.forEach(fn => fn({ id: ++toastId, type: 'error',   message })),
  info:    (message: string) => toastListeners.forEach(fn => fn({ id: ++toastId, type: 'info',    message })),
}

const TOAST_CFG: Record<ToastType, { bg: string; icon: React.ElementType }> = {
  success: { bg: 'bg-emerald-600', icon: CheckCircle2 },
  error:   { bg: 'bg-rose-600',    icon: XCircle },
  info:    { bg: 'bg-blue-600',    icon: Info },
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const fn = (t: ToastItem) => {
      setItems(prev => [...prev, t])
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    toastListeners.push(fn)
    return () => { toastListeners = toastListeners.filter(l => l !== fn) }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {items.map(t => {
        const { bg, icon: Icon } = TOAST_CFG[t.type]
        return (
          <div key={t.id} className={`${bg} text-white text-sm px-4 py-3 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2.5 min-w-[220px]`}>
            <Icon size={16} className="shrink-0" />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      <table className="min-w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/80 whitespace-nowrap border-b border-slate-100 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3.5 text-slate-700 border-t border-slate-50 ${className}`}>
      {children}
    </td>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ message = 'Нет данных', icon }: { message?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
          {icon}
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">{message}</p>
        <p className="text-xs text-slate-400 mt-0.5">Данные появятся здесь</p>
      </div>
    </div>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, ...rest }, ref) => (
    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
      <input ref={ref} type="checkbox" {...rest} className="w-4 h-4 accent-violet-600 cursor-pointer rounded" />
      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
    </label>
  )
)
Checkbox.displayName = 'Checkbox'
