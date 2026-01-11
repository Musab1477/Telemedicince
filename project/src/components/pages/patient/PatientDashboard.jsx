import { route } from 'preact-router'
import { useAuth, USER_ROLES } from '../../../contexts/AuthContext'
import { useTranslation } from '../../../contexts/I18nContext'
import { useState, useEffect } from 'preact/hooks'
import GoogleTranslate from '../../../components/GoogleTranslate'
import api from '../../../utils/api'

export function PatientDashboard() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }

    // Fetch user profile on component mount (page refresh)
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        console.log('⚠️ No access token found, redirecting to login')
        route('/patient/login')
        return
      }

      console.log('📤 Fetching User Profile with token...')
      const response = await api.getPatientProfile()

      console.log('✅ Profile Fetch Success:', response)
      console.log('User ID:', response.id)
      console.log('Role:', response.role)
      console.log('Mobile Number:', response.mobile_number)

      setProfileData(response)
      
      // Get existing user data from localStorage (may have additional fields)
      const existingUser = JSON.parse(localStorage.getItem('swasthlink_user') || '{}')
      
      // Get registration data if available
      const registrationData = JSON.parse(localStorage.getItem('patientRegistered') || '{}')
      
      // ✅ Merge all data sources, preserving local updates
      const userData = {
        ...response,
        ...registrationData,
        ...existingUser,  // Local updates take priority
        // Normalize field names
        name: existingUser.name || response.name || `${response.first_name || ''} ${response.last_name || ''}`.trim(),
        phone: existingUser.phone || response.mobile_number || registrationData.phone,
        mobile_number: response.mobile_number || existingUser.phone || registrationData.phone,
        role: response.role || USER_ROLES.PATIENT
      }
      login(userData)
      console.log('✅ User updated in AuthContext with merged data:', userData)
    } catch (err) {
      console.error('❌ Profile Fetch Error:', err)
      console.error('Error Status:', err.status)
      console.error('Error Body:', err.body)
      
      // If unauthorized, redirect to login
      if (err.status === 401 || err.status === 403) {
        console.log('🔐 Unauthorized - Redirecting to login')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        route('/patient/login')
        return
      }

      const errorMsg = err.body?.message || err.message || 'Failed to fetch profile'
      setError(errorMsg)
      console.error('Error:', errorMsg)
    } finally {
      setIsLoading(false)
    }
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

  const handleLogout = async () => {
    const confirmLogout = confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    setIsLoading(true)
    try {
      console.log('🚪 Logging out user...')
      const response = await api.logoutPatient()

      console.log('✅ Logout Success:', response)
      console.log('Message:', response.message)

      // Clear all stored data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('pendingUserId')
      localStorage.removeItem('pendingPhone')

      alert('✅ Logged out successfully!')
      route('/')
    } catch (err) {
      console.error('❌ Logout Error:', err)
      console.error('Error Status:', err.status)
      console.error('Error Body:', err.body)
      
      const errorMsg = err.body?.message || err.message || 'Logout failed'
      
      // Still clear data even if API fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      
      alert('Logged out (Error: ' + errorMsg + ')')
      route('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHospitals = () => {
    route('/patient/hospitals')
  }

  const handleMyAppointments = () => {
    route('/patient/appointments')
  }

  const handleHealthRecords = () => {
    route('/patient/reports')
  }

  const handleCommunity = () => {
    route('/patient/community')
  }

  const handleHealthAgent = () => {
    route('/patient/health-agent')
  }

  const handleNGOs = () => {
    route('/patient/ngos')
  }

  // Get display data from profileData or user context
  const displayUser = profileData || user || {}
  const displayName = profileData 
    ? `${profileData.first_name} ${profileData.last_name}`.trim() 
    : (user?.name || 'Patient')
  const displayMobileNumber = profileData?.mobile_number || user?.mobile_number || 'N/A'
  const displayRole = profileData?.role || user?.role || 'patient'

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: true, onClick: () => {} },
    { icon: '📅', label: 'Appointments', active: false, onClick: handleMyAppointments },
    { icon: '🏥', label: 'Hospitals', active: false, onClick: handleHospitals },
    { icon: '🤝', label: 'NGOs', active: false, onClick: handleNGOs },
    { icon: '📋', label: 'Health Records', active: false, onClick: handleHealthRecords },
    { icon: '👥', label: 'Community', active: false, onClick: handleCommunity },
    { icon: '🤖', label: 'Health Agent', active: false, onClick: handleHealthAgent },
  ]

  if (isLoading && !profileData) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🏥</div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">SwasthLink</h2>
            </div>

            {/* User Profile */}
            <button 
              onClick={() => route('/patient/profile')}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                  {profileData 
                    ? (profileData.first_name?.charAt(0) + profileData.last_name?.charAt(0)).toUpperCase()
                    : (displayName || 'A').charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{displayRole}</p>
                </div>
              </div>
            </button>

            {/* Menu Items */}
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

            {/* Emergency Button */}
            <div className="mt-auto pt-6">
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
                {/* Left: Menu Button & Title */}
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {displayName}!</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                   <GoogleTranslate />
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>

                  {/* Notifications */}
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="hidden sm:flex items-center gap-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Error Alert */}
          {error && (
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Content Area */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-2xl">
                    📅
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reports</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-2xl">
                    📋
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hospitals</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">8</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-2xl">
                    🏥
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Doctors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">35</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleMyAppointments}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Appointments</p>
                </button>

                <button
                  onClick={handleHealthRecords}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all text-center group"
                > 
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Records</p>
                </button>

                <button
                  onClick={handleHospitals}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏥</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Hospitals</p>
                </button>

                <button
                  onClick={handleCommunity}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Community</p>
                </button>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Nearby Hospitals */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nearby Hospitals</h2>
                    <button
                      onClick={handleHospitals}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                          🏥
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">City General Hospital</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Government Hospital • 2.5 km</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">15 doctors</span>
                            <span className="text-sm text-yellow-600 dark:text-yellow-400">⭐ 4.2</span>
                          </div>
                        </div>
                        <button
                          onClick={() => route('/patient/hospital/1')}
                          className="self-start bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                          🏥
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Civil Health Center</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Primary Health Center • 5.2 km</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">8 doctors</span>
                            <span className="text-sm text-yellow-600 dark:text-yellow-400">⭐ 4.0</span>
                          </div>
                        </div>
                        <button
                          onClick={() => route('/patient/hospital/2')}
                          className="self-start bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                          🏥
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Apollo Clinic</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Private Clinic • 3.8 km</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">12 doctors</span>
                            <span className="text-sm text-yellow-600 dark:text-yellow-400">⭐ 4.5</span>
                          </div>
                        </div>
                        <button
                          onClick={() => route('/patient/hospital/3')}
                          className="self-start bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Next Appointment */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Next Appointment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">👨‍⚕️</span>
                      <span className="text-gray-900 dark:text-white font-medium">Dr. Rajesh Kumar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">📅</span>
                      <span className="text-gray-700 dark:text-gray-300">Dec 20, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">⏰</span>
                      <span className="text-gray-700 dark:text-gray-300">10:30 AM</span>
                    </div>
                  </div>
                  <button
                    onClick={handleMyAppointments}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>

                {/* Health Community */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Health Community</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">💙 Diabetes Support</span>
                      <span className="text-gray-500 dark:text-gray-400">1.2k</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">❤️ Heart Health</span>
                      <span className="text-gray-500 dark:text-gray-400">856</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">🧠 Mental Wellness</span>
                      <span className="text-gray-500 dark:text-gray-400">2.1k</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCommunity}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Join Groups
                  </button>
                </div>

                {/* Health Tip */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💡</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Health Tip</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Drink at least 8 glasses of water daily to maintain good health and boost your immune system.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          ></div>
        )}
      </div>
    </div>
  )
}

function ProfileAvatar() {
  const { user } = useAuth()
  const initial = user ? ( (user.name || user.phone || 'U').charAt(0).toUpperCase() ) : 'U'
  return (
    <button onClick={() => route('/profile')} className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
      {initial}
    </button>
  )
}

export default PatientDashboard;