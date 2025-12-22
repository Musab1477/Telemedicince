import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import api from '../../../utils/api'

export function PatientRegister() {
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    phone: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: ''
  })

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
    // Load saved language
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode)
    localStorage.setItem('selectedLanguage', langCode)
  }

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    localStorage.setItem('darkMode', newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: parseInt(formData.age, 10),
        mobile_number: formData.phone,
        gender: formData.gender
      }

      console.log('📤 Sending Patient Registration Payload:', payload)

      const response = await api.createPatient(payload)

      console.log('✅ Patient Registration Success Response:', response)
      console.log('Response Type:', typeof response)
      console.log('Response Keys:', Object.keys(response))
      
      // Store patient info in localStorage for reference
      localStorage.setItem('patientRegistered', JSON.stringify({
        id: response.patient?.id,
        firstName: response.patient?.first_name,
        lastName: response.patient?.last_name,
        phone: response.patient?.mobile_number,
        role: response.patient?.role
      }))

      // Show success message and redirect to login
      alert(language === 'hi' ? 'पंजीकरण सफल! कृपया लॉगिन करें' :
            language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது! தயவுசெய்து உள்நுழைக' :
            language === 'mr' ? 'नोंदणी यशस्वी झाली! कृपया लॉगिन करा' :
            'Registration Successful! Please login.')
      route('/patient/login')
    } catch (err) {
      console.error('❌ Patient Registration Error:', err)
      console.error('Error Status:', err.status)
      console.error('Error Body:', err.body)
      console.error('Error Message:', err.message)
      
      const errorMsg = err.body?.message || err.message || 'Registration failed. Please try again.'
      setError(errorMsg)
      alert('Error: ' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => route('/')}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ← {language === 'hi' ? 'वापस' :
                     language === 'ta' ? 'பின்செல்' :
                     language === 'mr' ? 'मागे' :
                     'Back'}
                </button>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {language === 'hi' ? 'मरीज़ पंजीकरण' :
                   language === 'ta' ? 'நோயாளி பதிவு' :
                   language === 'mr' ? 'रुग्ण नोंदणी' :
                   'Patient Registration'}
                </h1>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                {/* Language Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Language / भाषा चुनें
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          language === lang.code
                            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span>{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    👤
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'hi' ? 'खाता बनाएं' :
                     language === 'ta' ? 'கணக்கை உருவாக்கவும்' :
                     language === 'mr' ? 'खाते तयार करा' :
                     'Create Account'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'hi' ? 'पंजीकरण के लिए अपना विवरण दर्ज करें' :
                     language === 'ta' ? 'பதிவு செய்ய உங்கள் விவரங்களை உள்ளிடவும்' :
                     language === 'mr' ? 'नोंदणीसाठी तुमचे तपशील प्रविष्ट करा' :
                     'Enter your details to register'}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'hi' ? 'पहला नाम' :
                         language === 'ta' ? 'முதல் பெயர்' :
                         language === 'mr' ? 'पहिले नाव' :
                         'First Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                        placeholder={language === 'hi' ? 'पहला नाम' :
                                   language === 'ta' ? 'முதல் பெயர்' :
                                   language === 'mr' ? 'पहिले नाव' :
                                   'First name'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'hi' ? 'अंतिम नाम' :
                         language === 'ta' ? 'கடைசி பெயர்' :
                         language === 'mr' ? 'आडनाव' :
                         'Last Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                        placeholder={language === 'hi' ? 'अंतिम नाम' :
                                   language === 'ta' ? 'கடைசி பெயர்' :
                                   language === 'mr' ? 'आडनाव' :
                                   'Last name'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'hi' ? 'फ़ोन नंबर' :
                       language === 'ta' ? 'தொலைபேசி எண்' :
                       language === 'mr' ? 'फोन नंबर' :
                       'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'hi' ? 'आयु' :
                       language === 'ta' ? 'வயது' :
                       language === 'mr' ? 'वय' :
                       'Age'}
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateFormData('age', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                      placeholder={language === 'hi' ? 'अपनी आयु दर्ज करें' :
                                 language === 'ta' ? 'உங்கள் வயதை உள்ளிடவும்' :
                                 language === 'mr' ? 'तुमचे वय टाका' :
                                 'Enter your age'}
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'hi' ? 'लिंग' :
                       language === 'ta' ? 'பாலினம்' :
                       language === 'mr' ? 'लिंग' :
                       'Gender'}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateFormData('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">
                        {language === 'hi' ? 'लिंग चुनें' :
                         language === 'ta' ? 'பாலினத்தைத் தேர்ந்தெடுக்கவும்' :
                         language === 'mr' ? 'लिंग निवडा' :
                         'Select Gender'}
                      </option>
                      <option value="male">
                        {language === 'hi' ? 'पुरुष' :
                         language === 'ta' ? 'ஆண்' :
                         language === 'mr' ? 'पुरुष' :
                         'Male'}
                      </option>
                      <option value="female">
                        {language === 'hi' ? 'महिला' :
                         language === 'ta' ? 'பெண்' :
                         language === 'mr' ? 'महिला' :
                         'Female'}
                      </option>
                      <option value="other">
                        {language === 'hi' ? 'अन्य' :
                         language === 'ta' ? 'மற்றவை' :
                         language === 'mr' ? 'इतर' :
                         'Other'}
                      </option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg transition-colors font-medium shadow-lg ${
                    isLoading 
                      ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white hover:shadow-xl'
                  }`}
                >
                  {isLoading 
                    ? (language === 'hi' ? 'प्रक्रिया में...' :
                       language === 'ta' ? 'செயல்பாட்டில் உள்ளது...' :
                       language === 'mr' ? 'प्रक्रियामध्ये...' :
                       'Processing...') 
                    : (language === 'hi' ? 'पंजीकरण पूर्ण करें' :
                       language === 'ta' ? 'பதிவை முடிக்கவும்' :
                       language === 'mr' ? 'नोंदणी पूर्ण करा' :
                       'Complete Registration')}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'hi' ? 'पहले से खाता है?' :
                     language === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா?' :
                     language === 'mr' ? 'आधीच खाते आहे?' :
                     'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => route('/patient/login')}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                    >
                      {language === 'hi' ? 'यहां लॉगिन करें' :
                       language === 'ta' ? 'இங்கே உள்நுழைக' :
                       language === 'mr' ? 'येथे लॉगिन करा' :
                       'Login here'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}