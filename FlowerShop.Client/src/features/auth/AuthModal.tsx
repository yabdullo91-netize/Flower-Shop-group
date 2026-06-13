import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store'
import { Button } from '@/shared/ui/Button'
import { toast } from '@/shared/ui/toast.store'
import { apiClient } from '@/shared/lib/apiClient'

type Step = 'phone' | 'code'

export function AuthModal() {
  const { t } = useTranslation()
  const { isModalOpen, closeModal, login } = useAuthStore()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('+992')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [codeError, setCodeError] = useState(false)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!isModalOpen) { setStep('phone'); setPhone('+992'); setCode(['','','','','','']); setCodeError(false) }
  }, [isModalOpen])

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 9) return
    setLoading(true)
    try {
      await apiClient.post('/auth/send-otp', { phone })
      setStep('code')
      setTimeout(() => codeRefs.current[0]?.focus(), 50)
      toast.info(t('auth.test_code_toast'))
    } catch {
      toast.error(t('auth.send_failed') ?? 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    setCodeError(false)
    if (digit && i < 5) setTimeout(() => codeRefs.current[i + 1]?.focus(), 0)
    if (next.every(d => d)) submitCode(next.join(''))
  }

  const handleCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      codeRefs.current[i - 1]?.focus()
    }
  }

  const submitCode = async (fullCode: string) => {
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/verify-otp', { phone, code: fullCode })
      login(
        { id: data.userId, name: data.name ?? t('auth.default_name'), phone: data.phone },
        data.accessToken,
        data.refreshToken,
      )
      toast.success(t('auth.logged_in'))
    } catch {
      setCodeError(true)
      setCode(['', '', '', '', '', ''])
      setTimeout(() => codeRefs.current[0]?.focus(), 0)
    } finally {
      setLoading(false)
    }
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={closeModal}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-cream rounded-[24px] p-8 w-full max-w-sm shadow-2xl"
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-muted text-lg"
        >×</button>

        <h2 className="font-serif text-2xl font-semibold mb-1">
          {step === 'phone' ? t('auth.title') : t('auth.enter_code')}
        </h2>
        <p className="text-sm text-muted mb-6">
          {step === 'phone' ? t('auth.enter_phone') : t('auth.code_sent_to', { phone })}
        </p>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form key="phone" onSubmit={handlePhone} className="space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+992 XX XXX XXXX"
                type="tel"
                className="w-full h-12 px-4 rounded-[12px] border border-border bg-white text-sm outline-none focus:border-green-deep focus:ring-2 focus:ring-green-deep/15"
                autoFocus
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                {t('auth.get_code')}
              </Button>
            </motion.form>
          ) : (
            <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <motion.div
                className="flex gap-2 justify-center mb-4"
                animate={codeError ? { x: [-6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {code.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { codeRefs.current[i] = el }}
                    value={d}
                    onChange={e => handleCodeInput(i, e.target.value)}
                    onKeyDown={e => handleCodeKey(i, e)}
                    maxLength={1}
                    type="text"
                    inputMode="numeric"
                    className={`w-10 h-12 text-center text-lg font-semibold rounded-[10px] border outline-none transition-all ${
                      codeError
                        ? 'border-error bg-error/5'
                        : 'border-border bg-white focus:border-green-deep focus:ring-2 focus:ring-green-deep/15'
                    }`}
                  />
                ))}
              </motion.div>
              {codeError && <p className="text-xs text-error text-center mb-3">{t('auth.wrong_code')}</p>}
              {loading && <p className="text-xs text-muted text-center">{t('auth.checking')}</p>}
              <button onClick={() => setStep('phone')} className="text-xs text-muted hover:text-green-deep transition-colors mt-2 w-full text-center">
                {t('auth.change_number')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
