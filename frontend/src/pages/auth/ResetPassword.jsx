import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { t }          = useTranslation()
  const navigate       = useNavigate()
  const [params]       = useSearchParams()

  const token = params.get('token') || ''
  const email = params.get('email') || ''

  const [form, setForm]       = useState({ password: '', password_confirmation: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (!token || !email) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('auth.reset.invalidLink')}</h2>
        <Link to="/forgot-password" className="btn-primary mt-6 justify-center inline-flex">
          {t('auth.reset.requestNew')}
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('auth.reset.successTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('auth.reset.successMsg')}</p>
        <button onClick={() => navigate('/login', { replace: true })} className="btn-primary mt-6 justify-center w-full py-2.5">
          {t('auth.forgot.backToLogin')}
        </button>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error(t('auth.register.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, email, ...form })
      setDone(true)
      toast.success(t('auth.reset.successTitle'))
    } catch (err) {
      toast.error(err?.response?.data?.message || t('auth.reset.invalidLink'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.reset.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('auth.reset.subtitle')}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.reset.newPassword')}</label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">{t('auth.reset.confirmPassword')}</label>
          <div className="relative">
            <input
              type={showConf ? 'text' : 'password'}
              className="input pr-10"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={e => set('password_confirmation', e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowConf(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.reset.resetting')}</>
            : <><KeyRound className="w-4 h-4" /> {t('auth.reset.resetBtn')}</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        <Link to="/login" className="inline-flex items-center gap-1 text-primary-600 font-medium hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('auth.forgot.backToLogin')}
        </Link>
      </p>
    </div>
  )
}
