import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function NotFound() {
  const { t }          = useTranslation()
  const navigate       = useNavigate()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-200">
      <header className="p-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 font-bold text-xl">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          SCMS
        </Link>
        <button onClick={toggle}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700 transition-colors">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-8">
            <span className="text-[9rem] font-black text-primary-100 dark:text-primary-900/40 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('notFound.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t('notFound.message')}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> {t('notFound.goBack')}
            </button>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <Home className="w-4 h-4" /> {t('notFound.goHome')}
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} Student Course Management System
      </footer>
    </div>
  )
}
