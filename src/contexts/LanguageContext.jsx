import { createContext, useContext, useMemo, useState } from 'react'
import esMessages from '../lang/es.json'
import enMessages from '../lang/en.json'

const MESSAGES = {
  es: esMessages,
  en: enMessages,
}

const LanguageContext = createContext({
  locale: 'es',
  t: esMessages,
  changeLanguage: () => {},
})

export function LanguageProvider({ children }) {
  const initialLocale = navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'
  const [locale, setLocale] = useState(initialLocale)

  const value = useMemo(
    () => ({
      locale,
      t: MESSAGES[locale],
      changeLanguage: setLocale,
    }),
    [locale],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
