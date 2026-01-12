import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

export function Prescriptions() {
  const [activeTab, setActiveTab] = useState('recent')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [doctorSignature, setDoctorSignature] = useState(null)
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Fetch doctor profile
    fetchDoctorProfile()
  }, [])

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      const response = await fetch(`${apiUrl}auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        console.log('✅ Profile loaded:', data)
      }
    } catch (err) {
      console.error('❌ Profile fetch error:', err)
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = async () => {
    const confirmLogout = confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    try {
      console.log('🚪 Logging out doctor...')
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      const response = await fetch(`${apiUrl}auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      console.log('✅ Doctor Logout Success:', data)
      
      // Clear all stored data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      
      alert('✅ Logged out successfully!')
      route('/')
    } catch (err) {
      console.error('❌ Logout Error:', err)
      
      // Still clear data even if API fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      
      alert('Logged out (with error, but cleared local data)')
      route('/')
    }
  }

  // Load doctor's digital signature from registration
  useEffect(() => {
    try {
      const registration = localStorage.getItem('pendingDoctorRegistration')
      if (registration) {
        const data = JSON.parse(registration)
        setDoctorSignature(data.digitalSignatureUrl)
        setDoctorInfo({
          name: data.fullName || 'Dr. ' + data.firstName + ' ' + data.lastName,
          qualification: data.qualification || 'MBBS, MD',
          license: data.medicalLicense || 'MCI-' + Math.floor(Math.random() * 1000000)
        })
      }
    } catch (e) {
      console.error('Error loading doctor signature:', e)
    }
  }, [])

  const mockPrescriptions = [
    {
      id: 1,
      patient: 'John Doe',
      date: '2024-01-15',
      medicines: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days' },
        { name: 'Amoxicillin 250mg', dosage: '1 capsule', frequency: 'Three times daily', duration: '7 days' }
      ],
      diagnosis: 'Viral fever with bacterial infection',
      status: 'active'
    },
    {
      id: 2,
      patient: 'Jane Smith',
      date: '2024-01-12',
      medicines: [
        { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: 'Ongoing' },
        { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: 'Ongoing' }
      ],
      diagnosis: 'Hypertension and Diabetes',
      status: 'active'
    },
    {
      id: 3,
      patient: 'Robert Wilson',
      date: '2024-01-10',
      medicines: [
        { name: 'Aspirin 75mg', dosage: '1 tablet', frequency: 'Once daily', duration: 'Ongoing' }
      ],
      diagnosis: 'Cardiovascular protection',
      status: 'completed'
    }
  ]

  const filteredPrescriptions = mockPrescriptions.filter(prescription => {
    // Tab filter
    if (activeTab === 'active' && prescription.status !== 'active') return false
    if (activeTab === 'completed' && prescription.status !== 'completed') return false

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase()
      // match patient name
      if ((prescription.patient || '').toLowerCase().includes(q)) return true
      // match date (YYYY-MM-DD)
      if ((prescription.date || '').toLowerCase().includes(q)) return true
      // match diagnosis
      if ((prescription.diagnosis || '').toLowerCase().includes(q)) return true
      // match medicines
      const medMatch = (prescription.medicines || []).some(m => (m.name || '').toLowerCase().includes(q))
      if (medMatch) return true

      // no match
      return false
    }

    return true
  })

  const handleCreatePrescription = (e) => {
    e.preventDefault()
    alert('Prescription created successfully!')
    setShowCreateForm(false)
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', onClick: () => route('/doctor/dashboard') },
    { icon: '📅', label: 'Schedule', onClick: () => route('/doctor/schedule') },
    // { icon: '📋', label: 'EMR', onClick: () => route('/doctor/emr') },
    { icon: '💊', label: 'Prescriptions', active: true, onClick: () => {} },
    { icon: '🎥', label: 'Consultations', onClick: () => route('/doctor/consultations') },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🩺</div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">SwasthLink</h2>
            </div>
            <button 
              onClick={() => profileData?.id && route(`/doctor/profile/${profileData.id}`)}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                  {profileData?.first_name ? profileData.first_name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">Dr. {profileData?.first_name} {profileData?.last_name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'Doctor'}
                  </p>
                </div>
              </div>
            </button>
            <nav className="space-y-1">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                <span className="text-xl">🚨</span>
                <span className="text-sm">Emergency: 108</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage patient prescriptions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium hidden sm:block"
                  >
                    Create Prescription
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'recent' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Recent Prescriptions
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'active' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Active Prescriptions
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'completed' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Completed
                </button>
              </div>
              <div className="mt-4">
                <label className="relative block">
                  <input
                    value={searchTerm}
                    onInput={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by patient, date, diagnosis or medicine..."
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </label>
              </div>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {filteredPrescriptions.length} prescriptions found
              </h2>

              {filteredPrescriptions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
                  <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">💊</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No prescriptions found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Create your first prescription to get started</p>
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Prescription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrescriptions.map(prescription => (
                    <div key={prescription.id} className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-blue-600 dark:text-blue-400">👤</span>
                            {prescription.patient}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{prescription.date}</p>
                          <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">{prescription.diagnosis}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            prescription.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                          }`}>
                            {prescription.status === 'active' ? 'Active' : 'Completed'}
                          </span>
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium">
                            Print
                          </button>
                        </div>
                      </div>

                      {/* Medicines */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-purple-600 dark:text-purple-400">💊</span>
                          Prescribed Medicines
                        </h4>
                        <div className="space-y-3">
                          {prescription.medicines.map((medicine, index) => (
                            <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800 rounded-xl p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">{medicine.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Dosage: {medicine.dosage}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Frequency: {medicine.frequency}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 dark:text-gray-400">Duration: {medicine.duration}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Digital Signature Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <p>Registration No: {doctorInfo?.license || 'MCI-' + Math.floor(Math.random() * 1000000)}</p>
                            <p className="mt-1">License Valid Until: Dec 2026</p>
                          </div>
                          <div className="text-right">
                            <div className="mb-2">
                              {doctorSignature ? (
                                <div className="inline-block border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-white dark:bg-gray-800">
                                  <img 
                                    src={doctorSignature} 
                                    alt="Doctor's signature" 
                                    className="h-16 object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="inline-block border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                                  <div className="text-blue-900 dark:text-blue-400 font-bold text-lg italic" style="font-family: 'Brush Script MT', cursive;">
                                    Dr. R. Kumar
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{doctorInfo?.name || 'Dr. Rajesh Kumar'}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{doctorInfo?.qualification || 'MBBS, MD (Internal Medicine)'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {doctorSignature ? 'Digital Signature Applied' : 'Signature Required'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

        {/* Create Prescription Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Prescription
              </h3>
            
              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter patient name..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter diagnosis..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medicine 1
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Medicine name..."
                      required
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dosage..."
                      required
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Frequency..."
                      required
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Duration..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Medicine 2 (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Medicine name..."
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dosage..."
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Frequency..."
                    />
                    <input
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Duration..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Any additional instructions..."
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    Create Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  )
}