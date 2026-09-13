import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

function detectLang() {
  try {
    const saved = window.localStorage.getItem('lang')
    if (saved === 'es' || saved === 'en') return saved
  } catch (error) {
    console.error('Error reading lang from storage:', error)
  }
  const nav = (navigator.language || 'es').toLowerCase()
  return nav.startsWith('es') ? 'es' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      window.localStorage.setItem('lang', next)
    } catch (error) {
      console.error('Error saving lang to storage:', error)
    }
  }, [])

  const t = useCallback(
    (key) => (translations[lang] && translations[lang][key]) ?? translations.es[key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider')
  return ctx
}
