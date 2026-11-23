import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru.json'

// Russian is the source language. To add another one, drop a JSON file with
// the same keys next to ru.json and register it in `resources`.
export const defaultNS = 'translation'
export const resources = {
  ru: { translation: ru },
} as const

void i18n.use(initReactI18next).init({
  lng: 'ru',
  fallbackLng: 'ru',
  defaultNS,
  resources,
  interpolation: { escapeValue: false }, // React already escapes
})

export default i18n
