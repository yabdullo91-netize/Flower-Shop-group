import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, Phone, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

type Step = 'phone' | 'code'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [step, setStep]       = useState<Step>('phone')
  const [phone, setPhone]     = useState('+992')
  const [code, setCode]       = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const codeRefs              = useRef<(HTMLInputElement | null)[]>([])

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 9) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/send-otp', { phone })
      setStep('code')
      setTimeout(() => codeRefs.current[0]?.focus(), 50)
    } catch {
      setError('Не удалось отправить код. Проверьте номер.')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (fullCode: string) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, code: fullCode })
      if (data.role !== 'Admin' && data.role !== 'SuperAdmin') {
        setError('Доступ запрещён. Только для администраторов.')
        setCode(['', '', '', '', '', ''])
        setLoading(false)
        return
      }
      login({ id: data.userId, name: data.name, phone: data.phone, role: data.role }, data.accessToken, data.refreshToken)
      navigate('/')
    } catch {
      setError('Неверный код. Попробуйте ещё раз.')
      setCode(['', '', '', '', '', ''])
      setTimeout(() => codeRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < 5) setTimeout(() => codeRefs.current[i + 1]?.focus(), 0)
    if (next.every(d => d)) verifyCode(next.join(''))
  }

  const handleCodeKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) codeRefs.current[i - 1]?.focus()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0c0a1e 0%, #1a0d3a 40%, #0f1830 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[380px] px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-900/60"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
              <Flower2 size={38} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-violet-400/30 backdrop-blur-sm flex items-center justify-center">
              <Shield size={14} className="text-violet-200" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FlowerHouse</h1>
          <p className="text-violet-300/70 text-sm mt-1.5 font-medium">Панель администратора</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-7 py-7">
            {step === 'phone' ? (
              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Вход</h2>
                  <p className="text-sm text-slate-400 mt-1">Введите номер для получения кода</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Номер телефона</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+992 XX XXX XXXX"
                      className="w-full h-12 pl-11 pr-4 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.8)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Отправка...
                    </span>
                  ) : 'Получить код →'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Введите код</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Отправлен на <span className="text-violet-300 font-semibold">{phone}</span>
                  </p>
                  <p className="text-xs text-violet-400/70 mt-1 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-1.5 inline-block">
                    Тест: <strong className="text-violet-300">111111</strong>
                  </p>
                </div>

                <div className="flex gap-2">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { codeRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleCodeInput(i, e.target.value)}
                      onKeyDown={e => handleCodeKeyDown(i, e)}
                      className="flex-1 h-13 text-center text-2xl font-bold rounded-xl outline-none transition-all text-white"
                      style={{
                        height: '52px',
                        background: 'rgba(255,255,255,0.07)',
                        border: digit ? '2px solid rgba(139,92,246,0.8)' : '1.5px solid rgba(255,255,255,0.12)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.9)'; e.currentTarget.style.borderWidth = '2px' }}
                      onBlur={e => { e.currentTarget.style.borderColor = digit ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderWidth = digit ? '2px' : '1.5px' }}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>
                )}
                {loading && (
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
                  </div>
                )}

                <button
                  onClick={() => { setStep('phone'); setCode(['','','','','','']); setError('') }}
                  className="text-sm text-slate-500 hover:text-violet-400 transition-colors"
                >
                  ← Изменить номер
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">FlowerHouse Admin © 2026</p>
      </div>
    </div>
  )
}
