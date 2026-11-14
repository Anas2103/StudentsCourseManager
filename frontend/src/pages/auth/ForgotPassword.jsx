import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { token, email }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setResult({ token: data.demo_token, email: data.email })
      toast.success('Reset token generated.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const resetUrl = `/reset-password?token=${result.token}&email=${encodeURIComponent(result.email)}`
    return (
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('auth.forgot.successTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('auth.forgot.successMsg')} <strong>{result.email}</strong>
          </p>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg mb-4">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" /> Demo mode — no email server configured
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">Click the button below to proceed directly to the reset page.</p>
        </div>

        <Link to={resetUrl} className="btn-primary w-full justify-center py-2.5 mb-3">
          <KeyRound className="w-4 h-4" /> {t('auth.forgot.resetNow')}
        </Link>
        <Link to="/login" className="btn-secondary w-full justify-center py-2">
          <ArrowLeft className="w-4 h-4" /> {t('auth.forgot.backToLogin')}
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.forgot.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('auth.forgot.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.forgot.sending')}</>
            : <><Send className="w-4 h-4" /> {t('auth.forgot.sendReset')}</>
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
