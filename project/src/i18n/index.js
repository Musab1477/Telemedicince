import { en } from './translations/en'
import { hi } from './translations/hi'
import { ta } from './translations/ta'
import { mr } from './translations/mr'

// Available languages
export const LANGUAGES = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  mr: 'मराठी (Marathi)'
}

// Language codes
export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  HINDI: 'hi',
  TAMIL: 'ta',
  MARATHI: 'mr'
}

// Default language
export const DEFAULT_LANGUAGE = LANGUAGE_CODES.ENGLISH

// All translations
export const translations = {
  en,
  hi,
  ta,
  mr
}

// Get nested translation value
export function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

// Translation function
export function translate(key, language = DEFAULT_LANGUAGE, fallback = null) {
  const languageTranslations = translations[language]
  
  if (!languageTranslations) {
    console.warn(`Language '${language}' not found, falling back to '${DEFAULT_LANGUAGE}'`)
    return translate(key, DEFAULT_LANGUAGE, fallback)
  }

  const value = getNestedValue(languageTranslations, key)
  
  if (value !== null) {
    return value
  }

  // Try fallback to English if not default language
  if (language !== DEFAULT_LANGUAGE) {
    const englishValue = getNestedValue(translations[DEFAULT_LANGUAGE], key)
    if (englishValue !== null) {
      console.warn(`Translation key '${key}' not found in '${language}', using English fallback`)
      return englishValue
    }
  }

  // Return fallback or key itself
  if (fallback !== null) {
    return fallback
  }

  console.warn(`Translation key '${key}' not found in any language`)
  return key
}

// Get language direction (for future RTL support)
export function getLanguageDirection(language) {
  // All current languages are LTR
  return 'ltr'
}

// Get language name in its own script
export function getLanguageName(languageCode) {
  return LANGUAGES[languageCode] || languageCode
}

// Validate language code
export function isValidLanguage(languageCode) {
  return Object.values(LANGUAGE_CODES).includes(languageCode)
}

// Get browser language preference
export function getBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage
  const langCode = browserLang.split('-')[0].toLowerCase()
  
  // Check if we support this language
  if (isValidLanguage(langCode)) {
    return langCode
  }
  
  return DEFAULT_LANGUAGE
}

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = 'swasthlink_language'

// Get stored language preference
export function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored && isValidLanguage(stored)) {
      return stored
    }
  } catch (error) {
    console.warn('Error reading language from localStorage:', error)
  }
  
  return null
}

// Store language preference
export function storeLanguage(languageCode) {
  try {
    if (isValidLanguage(languageCode)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode)
      return true
    }
  } catch (error) {
    console.warn('Error storing language to localStorage:', error)
  }
  
  return false
}

// Get initial language (stored > browser > default)
export function getInitialLanguage() {
  return getStoredLanguage() || getBrowserLanguage() || DEFAULT_LANGUAGE
}