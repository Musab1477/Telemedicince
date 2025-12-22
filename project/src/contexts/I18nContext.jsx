import { createContext } from 'preact'
import { useContext, useState, useEffect } from 'preact/hooks'
import { 
  translate, 
  getInitialLanguage, 
  storeLanguage, 
  isValidLanguage,
  getLanguageName,
  getLanguageDirection,
  LANGUAGES,
  LANGUAGE_CODES,
  DEFAULT_LANGUAGE
} from '../i18n'

// Create the i18n context
const I18nContext = createContext()

// I18n provider component
export function I18nProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage())
  const [isLoading, setIsLoading] = useState(false)

  // Update document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage
    document.documentElement.dir = getLanguageDirection(currentLanguage)
  }, [currentLanguage])

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (!isValidLanguage(languageCode)) {
      console.error(`Invalid language code: ${languageCode}`)
      return false
    }

    if (languageCode === currentLanguage) {
      return true // Already using this language
    }

    setIsLoading(true)

    try {
      // Store the language preference
      const stored = storeLanguage(languageCode)
      if (!stored) {
        console.warn('Failed to store language preference')
      }

      // Update current language
      setCurrentLanguage(languageCode)
      
      console.log(`Language changed to: ${languageCode}`)
      return true
    } catch (error) {
      console.error('Error changing language:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Translation function with current language
  const t = (key, fallback = null) => {
    return translate(key, currentLanguage, fallback)
  }

  // Translation function with interpolation
  const tInterpolate = (key, variables = {}, fallback = null) => {
    let text = translate(key, currentLanguage, fallback)
    
    // Simple interpolation: replace {{variable}} with values
    Object.keys(variables).forEach(variable => {
      const placeholder = `{{${variable}}}`
      text = text.replace(new RegExp(placeholder, 'g'), variables[variable])
    })
    
    return text
  }

  // Get available languages
  const getAvailableLanguages = () => {
    return Object.entries(LANGUAGES).map(([code, name]) => ({
      code,
      name,
      isActive: code === currentLanguage
    }))
  }

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return {
      code: currentLanguage,
      name: getLanguageName(currentLanguage),
      direction: getLanguageDirection(currentLanguage),
      isRTL: getLanguageDirection(currentLanguage) === 'rtl'
    }
  }

  // Check if language is supported
  const isLanguageSupported = (languageCode) => {
    return isValidLanguage(languageCode)
  }

  // Reset to default language
  const resetToDefault = () => {
    return changeLanguage(DEFAULT_LANGUAGE)
  }

  const contextValue = {
    // Current state
    currentLanguage,
    isLoading,
    
    // Translation functions
    t,
    tInterpolate,
    translate: t, // Alias for t
    
    // Language management
    changeLanguage,
    resetToDefault,
    
    // Language info
    getCurrentLanguageInfo,
    getAvailableLanguages,
    isLanguageSupported,
    
    // Constants
    LANGUAGES,
    LANGUAGE_CODES,
    DEFAULT_LANGUAGE
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

// Custom hook to use i18n context
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Utility hook for just translation function
export function useTranslation() {
  const { t, tInterpolate, currentLanguage } = useI18n()
  return { t, tInterpolate, currentLanguage }
}

// Utility hook for language switching
export function useLanguage() {
  const { 
    currentLanguage, 
    changeLanguage, 
    getAvailableLanguages, 
    getCurrentLanguageInfo,
    isLoading 
  } = useI18n()
  
  return {
    currentLanguage,
    changeLanguage,
    getAvailableLanguages,
    getCurrentLanguageInfo,
    isLoading
  }
}