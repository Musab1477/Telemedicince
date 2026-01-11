import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import api from '../../../utils/api'

export function HospitalRegister() {
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [documents, setDocuments] = useState({
    hospitalDigitalStamp: null
  })
  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    hospitalType: '',
    adminName: '',
    adminPhone: ''
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
      if (!formData.hospitalName || !formData.registrationNumber || !formData.phone || !formData.email || 
          !formData.hospitalType || !formData.adminName || !formData.adminPhone || !formData.city || !formData.state) {
        throw new Error('Please fill all required fields')
      }

      // Validate hospital digital stamp
      if (!documents.hospitalDigitalStamp) {
        throw new Error('Please upload your hospital digital stamp')
      }

      // Prepare FormData to handle file upload
      const payload = new FormData()
      payload.append('hospital_name', formData.hospitalName)
      payload.append('registration_number', formData.registrationNumber)
      payload.append('hospital_type', formData.hospitalType)
      payload.append('mobile_number', formData.phone)
      payload.append('email', formData.email)
      payload.append('hospital_address', formData.address)
      payload.append('city', formData.city)
      payload.append('state', formData.state)
      payload.append('pincode', formData.pincode)
      payload.append('admin_name', formData.adminName)
      payload.append('admin_phone_number', formData.adminPhone)
      
      // Add hospital digital stamp file
      if (documents.hospitalDigitalStamp && documents.hospitalDigitalStamp.file) {
        payload.append('hospital_digital_stamp', documents.hospitalDigitalStamp.file, documents.hospitalDigitalStamp.name)
      }

      console.log('📤 Sending Hospital Registration with Digital Stamp')
      console.log('Hospital Info:', {
        hospital_name: formData.hospitalName,
        registration_number: formData.registrationNumber,
        hospital_type: formData.hospitalType,
        mobile_number: formData.phone,
        email: formData.email,
        city: formData.city,
        state: formData.state
      })
      console.log('Digital Stamp File:', documents.hospitalDigitalStamp?.name)

      // Call API with file support
      const response = await api.createHospitalWithFiles(payload)

      console.log('✅ Hospital Registration Success Response:', response)
      console.log('Response Type:', typeof response)
      console.log('Response Keys:', Object.keys(response))

      // Store hospital info and generated password in localStorage
      localStorage.setItem('hospitalRegistered', JSON.stringify({
        id: response.hospital?.id,
        hospitalName: response.hospital?.hospital_name,
        email: response.hospital?.email,
        phone: response.hospital?.mobile_number,
        role: response.hospital?.role,
        generatedPassword: response.generated_password
      }))

      // Show success alert with API message
      alert(response.message || 'Hospital Registration Successful!')
      route('/hospital/login')
    } catch (err) {
      console.error('❌ Hospital Registration Error:', err)
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

  function handleFileChange(field, files) {
    const file = files && files.length > 0 ? files[0] : null
    if (file) {
      setDocuments(prev => ({ ...prev, [field]: { name: file.name, size: file.size, file: file, url: URL.createObjectURL(file) } }))
    } else {
      setDocuments(prev => ({ ...prev, [field]: null }))
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <button 
                  onClick={() => route('/hospital/login')}
                  className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Hospital Registration</h1>
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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🏥</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hospital Registration</h2>
              <p className="text-gray-600 dark:text-gray-400">Register your hospital to join our healthcare network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hospital Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hospital Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hospital Name *
                    </label>
                    <input
                      type="text"
                      value={formData.hospitalName}
                      onChange={(e) => updateFormData('hospitalName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="City General Hospital"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="REG123456"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hospital Type *
                    </label>
                    <select
                      value={formData.hospitalType}
                      onChange={(e) => updateFormData('hospitalType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="private">Private</option>
                      <option value="government">Government</option>
                      <option value="semi_private">Semi Private</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="hospital@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hospital Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                    placeholder="Complete hospital address"
                    rows="3"
                  required
                />
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="Mumbai"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="Maharashtra"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => updateFormData('pincode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hospital Admin Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => updateFormData('adminName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.adminPhone}
                      onChange={(e) => updateFormData('adminPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🏛️ Hospital Digital Stamp *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('hospitalDigitalStamp', e.target.files)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 file:cursor-pointer hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 transition-colors"
                    required
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {documents.hospitalDigitalStamp ? (
                      <span className="flex items-center">
                        <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                        {documents.hospitalDigitalStamp.name}
                      </span>
                    ) : (
                      <span className="italic">No file selected</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Upload your hospital's official digital stamp/seal as an image or PDF
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg transition-colors font-medium ${
                  isLoading
                    ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    : 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600'
                }`}
              >
                {isLoading ? 'Processing...' : 'Submit Hospital Registration'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Already registered?</p>
              <button 
                onClick={() => route('/hospital/login')}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                Login Here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}