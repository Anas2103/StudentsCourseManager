import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Users, BarChart3, Calendar, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'

export default function Landing() {
  const { t } = useTranslation()
  const { dark, toggle } = useTheme()

  const FEATURES = [
    { icon: Users,     titleKey: 'feature1Title', descKey: 'feature1Desc' },
    { icon: BookOpen,  titleKey: 'feature2Title', descKey: 'feature2Desc' },
    { icon: BarChart3, titleKey: 'feature3Title', descKey: 'feature3Desc' },
    { icon: Calendar,  titleKey: 'feature4Title', descKey: 'feature4Desc' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          SCMS
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login"    className="btn-secondary text-sm">{t('landing.signIn')}</Link>
          <Link to="/register" className="btn-primary text-sm">{t('landing.getStarted')}</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="inline-block px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full mb-6">
          {t('landing.badge')}
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
          {t('landing.title1')}<br />
          <span className="text-primary-600">{t('landing.title2')}</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          {t('landing.subtitle')}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            {t('landing.ctaPrimary')} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">
            {t('landing.ctaSecondary')}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('landing.featuresTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
              <div key={titleKey} className="card p-6 flex gap-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`landing.${titleKey}`)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`landing.${descKey}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('landing.ctaTitle')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('landing.ctaSubtitle')}</p>
        <Link to="/register" className="btn-primary px-8 py-3 text-base justify-center">
          {t('landing.ctaBtn')} <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-sm text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} SCMS — {t('landing.footer')}
      </footer>
    </div>
  )
}
