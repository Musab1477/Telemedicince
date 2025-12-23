import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { OTPVerification } from '../../ui/OTPInput'
import GoogleTranslate from '../../GoogleTranslate'
import api from '../../../utils/api'
import { useAuth } from '../../../contexts/AuthContext'

export function PatientLogin() {
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState(1) // 1 = enter phone, 2 = verify otp
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)
  const [userId, setUserId] = useState(null)

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

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (phone.length < 10) {
        throw new Error('Please enter a valid phone number')
      }

      console.log('🔐 Starting Patient Login...')
      const response = await api.loginPatient(phone)
      
      console.log('✅ Login Response:', response)
      console.log('User ID:', response.user_id)
      console.log('Role:', response.role)

      // Store user_id for OTP verification
      setUserId(response.user_id)
      localStorage.setItem('pendingUserId', response.user_id.toString())
      localStorage.setItem('pendingPhone', phone)

      // Move to OTP step
      setStep(2)
    } catch (err) {
      console.error('❌ Login Error:', err)
      console.error('Error Status:', err.status)
      console.error('Error Body:', err.body)
      
      const errorMsg = err.body?.message || err.message || 'Login failed. Please try again.'
      setError(errorMsg)
      alert('Error: ' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification
  const handleVerify = async (otpValue) => {
    setError('')
    setIsLoading(true)

    try {
      if (!userId) {
        throw new Error('User ID not found. Please login again.')
      }

      console.log('🔐 Verifying OTP...')
      const response = await api.verifyOTP(userId, otpValue)

      console.log('✅ OTP Verification Success:', response)
      console.log('Access Token:', response.tokens.access)
      console.log('Refresh Token:', response.tokens.refresh)
      console.log('User:', response.user)

      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.tokens.access)
      localStorage.setItem('refreshToken', response.tokens.refresh)
      localStorage.setItem('isAuthenticated', 'true')

      // ✅ Use AuthContext login to properly set user state
      const userData = {
        ...response.user,
        role: 'patient'  // Ensure role is set
      }
      login(userData)
      console.log('✅ User saved to AuthContext:', userData)

      // Clear pending login data
      localStorage.removeItem('pendingUserId')
      localStorage.removeItem('pendingPhone')

      alert('✅ Login Successful!')
      route('/patient/dashboard')
      return
    } catch (err) {
      console.error('❌ OTP Verification Error:', err)
      console.error('Error Status:', err.status)
      console.error('Error Body:', err.body)
      
      const errorMsg = err.body?.message || err.message || 'Invalid OTP. Please try again.'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setIsLoading(true)

    try {
      console.log('📱 Resending OTP...')
      const response = await api.loginPatient(phone)
      
      console.log('✅ OTP Resent Successfully:', response)
      setUserId(response.user_id)
      localStorage.setItem('pendingUserId', response.user_id.toString())
      
      alert('OTP resent to your phone number')
    } catch (err) {
      console.error('❌ Resend OTP Error:', err)
      const errorMsg = err.body?.message || err.message || 'Failed to resend OTP'
      setError(errorMsg)
      alert('Error: ' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            {/* Dark Mode Toggle & Language Selector */}
            <div className="flex justify-end gap-2 mb-4">
              <GoogleTranslate />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                🩺
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Patient Login
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Access your health records and consultations
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

          {step === 1 && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  disabled={isLoading}
                />
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
                {isLoading ? 'Sending OTP...' : 'Login with OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
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
                    setStep(1)
                    setError('')
                    setPhone('')
                    setUserId(null)
                  }}
                  disabled={isLoading}
                  className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Phone Number
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              New to SwasthLink?
            </p>
            <button 
              onClick={() => route('/patient/register')}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
            >
              Register as Patient
            </button>
          </div>

          <div className="text-center mt-4">
            <button 
              onClick={() => route('/')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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