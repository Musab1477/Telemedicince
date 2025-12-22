import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { OTPVerification } from '../../ui/OTPInput'
import * as api from '../../../utils/api'

export function HospitalLogin() {
  const [phone, setPhone] = useState('')
  const [hospitalKey, setHospitalKey] = useState('')
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
    
    // Basic validation: need valid phone and hospital key
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    if (!hospitalKey || hospitalKey.trim().length < 6) {
      setError('Hospital key must be at least 6 characters')
      return
    }
    
    setIsLoading(true)
    try {
      console.log('🔐 Starting Hospital Login')
      const response = await api.loginHospital(phone, hospitalKey)
      console.log('✅ Hospital Login Success:', response)
      
      // Store user_id for OTP verification
      setUserId(response.user_id)
      setStep('otp')
    } catch (err) {
      console.error('❌ Hospital Login Error:', err)
      setError(err.body?.message || err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (otpValue) => {
    if (!userId) {
      throw new Error('User ID not found')
    }
    
    try {
      console.log('📤 Hospital OTP Verification:', { user_id: userId, otp: otpValue })
      const response = await api.verifyHospitalOTP(userId, otpValue)
      console.log('✅ Hospital OTP Verified:', response)
      
      // Store tokens
      if (response.tokens?.access) {
        localStorage.setItem('accessToken', response.tokens.access)
        console.log('✅ Access Token Stored')
      }
      if (response.tokens?.refresh) {
        localStorage.setItem('refreshToken', response.tokens.refresh)
        console.log('✅ Refresh Token Stored')
      }
      
      // Store hospital data
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('userRole', 'hospital')
        console.log('✅ Hospital Data Stored')
      }
      
      // Redirect to hospital dashboard
      console.log('🔄 Redirecting to Hospital Dashboard')
      route('/hospital/dashboard')
    } catch (err) {
      console.error('❌ Hospital OTP Verification Error:', err)
      throw err
    }
  }

  const handleResend = async () => {
    try {
      console.log('📤 Requesting OTP Resend')
      setError('')
      const response = await api.loginHospital(phone, hospitalKey)
      console.log('✅ OTP Resent:', response)
      return Promise.resolve()
    } catch (err) {
      console.error('❌ OTP Resend Error:', err)
      setError('Failed to resend OTP. Please try again.')
      throw err
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            {/* Dark Mode Toggle */}
            <div className="flex justify-end mb-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🏥</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hospital Login</h1>
              <p className="text-gray-600 dark:text-gray-400">Access your hospital management dashboard</p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
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
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hospital Key
                  </label>
                  <input
                    type="password"
                    value={hospitalKey}
                    onChange={(e) => setHospitalKey(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                    placeholder="Enter your hospital key"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    You received this key after hospital registration approval
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Requesting OTP...' : 'Login with OTP'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <OTPVerification
                  phoneNumber={phone}
                  onVerify={handleVerify}
                  onResend={handleResend}
                  isLoading={isLoading}
                  resendCooldown={30}
                />

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone')
                      setError('')
                      setUserId(null)
                    }}
                    className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Change Phone Number
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New hospital?</p>
              <button 
                onClick={() => route('/hospital/register')}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                Register Hospital
              </button>
            </div>

            <div className="text-center mt-4">
              <button 
                onClick={() => route('/')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}