import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

const savedLang = localStorage.getItem('scms_lang') || 'en'

// Set document direction and lang immediately (before React renders)
document.documentElement.lang = savedLang
document.documentElement.dir  = savedLang === 'ar' ? 'rtl' : 'ltr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('scms_lang', lng)
  document.documentElement.lang = lng
  document.documentElement.dir  = lng === 'ar' ? 'rtl' : 'ltr'
})

export default i18n
