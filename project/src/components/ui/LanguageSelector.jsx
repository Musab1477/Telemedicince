import { useState } from 'preact/hooks'
import { useLanguage, useTranslation } from '../../contexts/I18nContext'

export function LanguageSelector({ className = '', showLabel = true, compact = false }) {
  const { currentLanguage, changeLanguage, getAvailableLanguages, isLoading } = useLanguage()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = getAvailableLanguages()

  const handleLanguageChange = async (languageCode) => {
    setIsOpen(false)
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode)
    }
  }

  const currentLanguageInfo = languages.find(lang => lang.code === currentLanguage)

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isLoading}
          className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
        
        {isLoading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('patient.preferredLanguage')}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 flex items-center justify-between"
        >
          <span className="flex items-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
            ) : (
              <span className="w-4 h-4 mr-2 flex items-center justify-center text-xs font-bold bg-primary-100 text-primary-700 rounded">
                {currentLanguage.toUpperCase()}
              </span>
            )}
            <span>{currentLanguageInfo?.name || currentLanguage}</span>
          </span>
          
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center ${
                  language.isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                } ${language.code === languages[0].code ? 'rounded-t-lg' : ''} ${
                  language.code === languages[languages.length - 1].code ? 'rounded-b-lg' : ''
                }`}
              >
                <span className="w-4 h-4 mr-2 flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-600 rounded">
                  {language.code.toUpperCase()}
                </span>
                <span>{language.name}</span>
                {language.isActive && (
                  <svg className="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}