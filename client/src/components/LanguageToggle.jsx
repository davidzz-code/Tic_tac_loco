import { useI18n } from '../i18n/i18n'

const LANGS = ['es', 'en']

export default function LanguageToggle() {
  const { lang, setLang } = useI18n()

  return (
    <div className="inline-flex items-center rounded-md border border-gray-500 overflow-hidden text-xs">
      {LANGS.map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2 py-1 uppercase border-0 rounded-none transition-colors duration-150 ${
            lang === code
              ? 'bg-white text-[#242424] font-semibold'
              : 'bg-transparent text-gray-300 hover:bg-white/10'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
