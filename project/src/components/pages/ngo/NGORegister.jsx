import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import api from '../../../utils/api'

export function NGORegister() {
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    ngoName: '',
    registrationNumber: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    ngoType: '',
    focusArea: '',
    founderName: '',
    founderPhone: '',
    establishedYear: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.ngoName || !formData.registrationNumber || !formData.phone || !formData.email || 
          !formData.ngoType || !formData.founderName || !formData.founderPhone || !formData.city || !formData.state) {
        throw new Error('Please fill all required fields')
      }

      // Check if NGO already exists
      const existingNGOs = JSON.parse(localStorage.getItem('registeredNGOs') || '[]')
      const ngoExists = existingNGOs.some(
        ngo => ngo.phone === formData.phone || ngo.email === formData.email || ngo.registrationNumber === formData.registrationNumber
      )
      
      if (ngoExists) {
        throw new Error('NGO with this phone number, email or registration number already exists')
      }

      // Generate password
      const generatedPassword = 'NGO' + Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // Create NGO object
      const ngoData = {
        id: 'ngo_' + Date.now(),
        ngoName: formData.ngoName,
        registrationNumber: formData.registrationNumber,
        ngoType: formData.ngoType,
        focusArea: formData.focusArea,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        founderName: formData.founderName,
        founderPhone: formData.founderPhone,
        establishedYear: formData.establishedYear,
        password: generatedPassword,
        role: 'ngo',
        registeredAt: new Date().toISOString()
      }

      // Store in localStorage
      existingNGOs.push(ngoData)
      localStorage.setItem('registeredNGOs', JSON.stringify(existingNGOs))
      
      console.log('✅ NGO Registered Successfully:', ngoData)
      console.log('📧 Generated Password:', generatedPassword)

      // Show success alert
      alert('Registration Successful!\n\nYou will receive your credentials via email.')
      route('/ngo/login')
    } catch (err) {
      console.error('❌ NGO Registration Error:', err)
      const errorMsg = err.message || 'Registration failed. Please try again.'
      setError(errorMsg)
      alert('Error: ' + errorMsg)
    } finally {
      setIsLoading(false)
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
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🤝</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Register Your NGO</h2>
              <p className="text-gray-600 dark:text-gray-400">Join our platform to reach more people and make a bigger impact</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* NGO Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">NGO Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NGO Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.ngoName}
                      onInput={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                      placeholder="Enter NGO name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onInput={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g., NGO12345678"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NGO Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.ngoType}
                      onChange={(e) => setFormData({ ...formData, ngoType: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Type</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="children">Children Welfare</option>
                      <option value="elderly">Elderly Care</option>
                      <option value="rural">Rural Development</option>
                      <option value="women">Women Empowerment</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Focus Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.focusArea}
                      onInput={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                      placeholder="e.g., Free Health Camps"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      value={formData.establishedYear}
                      onInput={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                      placeholder="e.g., 2020"
                      min="1900"
                      max="2026"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onInput={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91-XXXXXXXXXX"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onInput={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ngo@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Address
                    </label>
                    <textarea
                      value={formData.address}
                      onInput={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter complete address"
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onInput={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onInput={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onInput={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="Pincode"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Founder/Admin Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Founder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.founderName}
                      onInput={(e) => setFormData({ ...formData, founderName: e.target.value })}
                      placeholder="Founder's full name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Founder Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.founderPhone}
                      onInput={(e) => setFormData({ ...formData, founderPhone: e.target.value })}
                      placeholder="+91-XXXXXXXXXX"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Registering...' : 'Register NGO'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already registered?{' '}
                <button
                  onClick={() => route('/ngo/login')}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
