import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { OTPVerification } from '../../ui/OTPInput'
import * as api from '../../../utils/api'

export function NGOLogin() {
  const [phone, setPhone] = useState('')
  const [ngoKey, setNGOKey] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

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

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic validation
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    if (!ngoKey || ngoKey.trim().length < 6) {
      setError('NGO key must be at least 6 characters')
      return
    }
    
    setIsLoading(true)
    try {
      console.log('🔐 Starting NGO Login')
      
      // Check if NGO exists in localStorage
      const registeredNGOs = JSON.parse(localStorage.getItem('registeredNGOs') || '[]')
      const ngo = registeredNGOs.find(n => n.phone === phone)
      
      if (!ngo) {
        throw new Error('NGO not found. Please register first.')
      }
      
      if (ngo.password !== ngoKey) {
        throw new Error('Invalid password. Please check your credentials.')
      }
      
      console.log('✅ NGO Credentials Verified:', ngo.ngoName)
      
      // Store NGO ID for OTP verification
      setUserId(ngo.id)
      
      // Generate and log demo OTP (in real app, this would be sent via SMS)
      const demoOTP = '123456'
      console.log('📱 Demo OTP for testing:', demoOTP)
      
      setStep('otp')
    } catch (err) {
      console.error('❌ NGO Login Error:', err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (otpValue) => {
    if (!userId) {
      throw new Error('User ID not found')
    }
    
    try {
      console.log('📤 NGO OTP Verification:', { user_id: userId, otp: otpValue })
      
      // For demo, accept any 6-digit OTP or the demo OTP 123456
      if (otpValue.length !== 6) {
        throw new Error('Invalid OTP. Please enter 6 digits.')
      }
      
      // Get NGO data from localStorage
      const registeredNGOs = JSON.parse(localStorage.getItem('registeredNGOs') || '[]')
      const ngo = registeredNGOs.find(n => n.id === userId)
      
      if (!ngo) {
        throw new Error('NGO not found')
      }
      
      console.log('✅ NGO OTP Verified')
      
      // Store NGO session data
      localStorage.setItem('userRole', 'ngo')
      localStorage.setItem('user', JSON.stringify({
        id: ngo.id,
        ngo_name: ngo.ngoName,
        name: ngo.ngoName,
        email: ngo.email,
        phone: ngo.phone,
        role: 'ngo',
        ngoType: ngo.ngoType,
        focusArea: ngo.focusArea,
        city: ngo.city,
        state: ngo.state
      }))
      localStorage.setItem('accessToken', 'ngo_token_' + Date.now())
      
      console.log('✅ NGO Session Created')
      console.log('🔄 Redirecting to NGO Dashboard')
      route('/ngo/dashboard')
    } catch (err) {
      console.error('❌ NGO OTP Verification Error:', err)
      throw err
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => route('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-3xl">🤝</div>
                <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">SwasthLink NGO</h1>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            {step === 'phone' ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🤝</div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">NGO Login</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your NGO operations and programs</p>
                </div>

                <form onSubmit={handleRequestOTP} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onInput={(e) => setPhone(e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NGO Key (Password)
                    </label>
                    <input
                      type="password"
                      value={ngoKey}
                      onInput={(e) => setNGOKey(e.target.value)}
                      placeholder="Enter your NGO key"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending OTP...' : 'Request OTP'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <button
                      onClick={() => route('/ngo/register')}
                      className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    >
                      Register NGO
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <OTPVerification
                phone={phone}
                onVerify={handleVerify}
                onBack={() => setStep('phone')}
                title="Verify NGO OTP"
                subtitle="Enter the OTP sent to your registered phone"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
