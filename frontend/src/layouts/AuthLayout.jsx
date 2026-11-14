import { Outlet, Link } from 'react-router-dom'
import { GraduationCap, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'

export default function AuthLayout() {
  const { t } = useTranslation()
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
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="p-6 text-center text-sm text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} {t('landing.footer')}
      </footer>
    </div>
  )
}
