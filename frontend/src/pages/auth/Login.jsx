import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getValidationErrors } from '../../utils/helpers'

const DEMO_ACCOUNTS = [
  { role: 'Super Admin', email: 'superadmin@scms.com', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60' },
  { role: 'Admin',       email: 'admin@scms.com',      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60' },
  { role: 'Teacher',     email: 'teacher1@scms.com',   color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60' },
  { role: 'Student',     email: 'student1@scms.com',   color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:hover:bg-orange-900/60' },
]

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const { t }       = useTranslation()

  const [form, setForm]       = useState({ email: '', password: '', remember_me: false })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const fillDemo = (email) => {
    setForm({ email, password: 'password', remember_me: false })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const user = await login(form.email, form.password, form.remember_me)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const fieldErrors = getValidationErrors(err)
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.welcome')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('auth.signInSubtitle')}</p>
      </div>

      {/* Quick demo buttons */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{t('auth.quickLogin')}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{t('auth.clickToFill')}</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(({ role, email, color }) => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(email)}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors text-left ${color}`}
            >
              <span className="block font-semibold">{role}</span>
              <span className="text-xs opacity-70 font-mono">{email}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <input
            type="email"
            className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            required
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">{t('auth.password')}</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">{t('auth.forgotLink')}</Link>
          </div>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password[0]}</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            checked={form.remember_me}
            onChange={e => set('remember_me', e.target.checked)}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('auth.rememberMe')}</span>
        </label>

        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.signingIn')}</>
            : <><LogIn className="w-4 h-4" /> {t('auth.signIn')}</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">{t('auth.registerHere')}</Link>
      </p>
    </div>
  )
}
