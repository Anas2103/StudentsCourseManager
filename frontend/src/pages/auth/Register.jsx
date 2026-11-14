import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getValidationErrors } from '../../utils/helpers'

export default function Register() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const { t }         = useTranslation()

  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password_confirmation) {
      setErrors({ password: [t('auth.register.passwordMismatch')] })
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to SCMS.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors(getValidationErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.register.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('auth.register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.register.fullName')}</label>
          <input type="text" className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)}
            required autoComplete="name" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
        </div>
        <div>
          <label className="label">{t('auth.register.email')}</label>
          <input type="email" className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)}
            required autoComplete="email" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
        </div>
        <div>
          <label className="label">{t('auth.register.phone')}</label>
          <input type="text" className={`input ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="+1 234 567 890" value={form.phone} onChange={e => set('phone', e.target.value)}
            required autoComplete="tel" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>}
        </div>

        <div>
          <label className="label">{t('auth.register.password')}</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder={t('auth.register.minChars')}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
        </div>

        <div>
          <label className="label">{t('auth.register.confirmPassword')}</label>
          <input
            type={showPwd ? 'text' : 'password'}
            className="input"
            placeholder={t('auth.register.repeatPassword')}
            value={form.password_confirmation}
            onChange={e => set('password_confirmation', e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.register.creating')}</>
            : <><UserPlus className="w-4 h-4" /> {t('auth.register.createAccount')}</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">{t('auth.register.signIn')}</Link>
      </p>
    </div>
  )
}
