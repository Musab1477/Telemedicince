import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import api from '../../../utils/api'

export function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState('')
  const [doctorName, setDoctorName] = useState('Dr. Doctor')
  const [todayAppointments, setTodayAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }

    // Fetch doctor profile on component mount
    fetchDoctorProfile()
    // Fetch today's appointments
    fetchTodayAppointments()
  }, [])

  const fetchDoctorProfile = async () => {
    setIsLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        console.log('⚠️ No access token found, redirecting to login')
        route('/doctor/login')
        return
      }

      console.log('📤 Fetching Doctor Profile with token...')
      const response = await api.getDoctorProfile()

      console.log('✅ Profile Fetch Success:', response)
      console.log('User ID:', response.id)
      console.log('Role:', response.role)
      console.log('First Name:', response.firsyt_name)
      console.log('Last Name:', response.last_name)
      console.log('Mobile Number:', response.mobile_number)

      setProfileData(response)
      // Try to get doctor name from localStorage or use default
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.first_name) {
        setDoctorName(`Dr. ${user.first_name}`)
      }
      localStorage.setItem('user', JSON.stringify(response))
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
        route('/doctor/login')
        return
      }

      const errorMsg = err.body?.message || err.message || 'Failed to fetch profile'
      setError(errorMsg)
      console.error('Error:', errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTodayAppointments = async () => {
    setAppointmentsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      console.log('📡 Fetching appointments from:', `${apiUrl}patient/appointments/list/`)
      
      const response = await fetch(`${apiUrl}patient/appointments/list/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        console.error('❌ Failed to fetch appointments:', response.status)
        setTodayAppointments([])
        return
      }
      
      const data = await response.json()
      console.log('✅ All appointments:', data)
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]
      console.log('📅 Today\'s date:', today)
      
      // Filter appointments for today
      const appointmentsArray = Array.isArray(data) ? data : (data.appointments || [])
      const todayAppts = appointmentsArray.filter(apt => {
        const aptDate = apt.appointment_date
        return aptDate === today
      })
      
      console.log('📋 Today\'s appointments:', todayAppts)
      setTodayAppointments(todayAppts)
    } catch (err) {
      console.error('❌ Error fetching appointments:', err)
      setTodayAppointments([])
    } finally {
      setAppointmentsLoading(false)
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
      localStorage.removeItem('pendingUserId')
      localStorage.removeItem('pendingPhone')

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
    } finally {
      setIsLoading(false)
    }
  }
  const handleSchedule = () => {
    route('/doctor/schedule')
  }

  const handleEMR = () => {
    route('/doctor/emr')
  }

  const handlePrescriptions = () => {
    route('/doctor/prescriptions')
  }
  
  const consultation = () => {
    route('/doctor/consultations')
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: true, onClick: () => {} },
    { icon: '📅', label: 'Schedule', onClick: handleSchedule },
    // { icon: '📋', label: 'EMR', onClick: handleEMR },
    { icon: '💊', label: 'Prescriptions', onClick: handlePrescriptions },
    { icon: '🎥', label: 'Consultations', onClick: consultation },
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
        {error && (
          <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 p-4 max-w-sm">
            {error}
          </div>
        )}
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🩺</div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">SwasthLink</h2>
            </div>

            {/* User Profile */}
            <button 
              onClick={() => {
                console.log('🔍 Profile button clicked!')
                console.log('📦 profileData:', profileData)
                console.log('🆔 profileData.id:', profileData?.id)
                
                if (profileData?.id) {
                  console.log('✅ Navigating to /doctor/profile/' + profileData.id)
                  route(`/doctor/profile/${profileData.id}`)
                } else {
                  console.warn('⚠️ No profile ID found, navigating without ID')
                  // Navigate anyway to see the page
                  route('/doctor/profile')
                }
              }}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                  {profileData?.first_name ? profileData.first_name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    Dr. {profileData?.first_name} {profileData?.last_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'Doctor'}
                  </p>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,  Dr. {profileData?.first_name} {profileData?.last_name}!</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
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
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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

          {/* Content Area */}
          <main className="p-4 sm:p-6 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Patients */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
                  </div>
                </div>
              </div>

              {/* Pending Reports */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Reports</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl">
                    <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleSchedule}
                  className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-6 hover:shadow-lg transform hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Schedule</h3>
                  </div>
                </button>

                {/* <button
                  onClick={handleEMR}
                  className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 rounded-2xl p-6 hover:shadow-lg transform hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">EMR Records</h3>
                  </div>
                </button> */}

                <button
                  onClick={handlePrescriptions}
                  className="bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-2xl p-6 hover:shadow-lg transform hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prescriptions</h3>
                  </div>
                </button>

                <button
                  onClick={consultation}
                  className="bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 rounded-2xl p-6 hover:shadow-lg transform hover:scale-105 transition-all group"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Consultation Room</h3>
                  </div>
                </button>
              </div>
            </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Appointments</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">{todayAppointments.length} scheduled</span>
              </div>
              <div className="space-y-4">
                {appointmentsLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="text-gray-600 dark:text-gray-400">Loading appointments...</div>
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="text-gray-600 dark:text-gray-400">No appointments scheduled for today</div>
                  </div>
                ) : (
                  todayAppointments.map((appointment, index) => {
                    const colors = [
                      { bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10', border: 'border-blue-100 dark:border-blue-800', avatar: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400' },
                      { bg: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10', border: 'border-green-100 dark:border-green-800', avatar: 'bg-green-600', text: 'text-green-600 dark:text-green-400' },
                      { bg: 'from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10', border: 'border-orange-100 dark:border-orange-800', avatar: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400' },
                      { bg: 'from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10', border: 'border-purple-100 dark:border-purple-800', avatar: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400' },
                      { bg: 'from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10', border: 'border-yellow-100 dark:border-yellow-800', avatar: 'bg-yellow-600', text: 'text-yellow-600 dark:text-yellow-400' },
                    ];
                    const colorScheme = colors[index % colors.length];
                    const initials = appointment.patient_name.split(' ').map(n => n[0]).join('').toUpperCase();

                    return (
                      <div key={appointment.id || index} className={`bg-gradient-to-r ${colorScheme.bg} border-2 ${colorScheme.border} rounded-xl p-4 hover:border-opacity-75 dark:hover:border-opacity-75 transition-all`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full ${colorScheme.avatar} flex items-center justify-center text-white font-semibold text-sm`}>
                                {initials}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{appointment.patient_name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Amount: ₹{appointment.amount || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="ml-13">
                              <p className={`text-sm ${colorScheme.text} font-medium`}>
                                {appointment.start_time} - {appointment.end_time}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">
                              {appointment.start_time}
                            </div>
                            <button onClick={consultation} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                              Start
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Completed consultation with John Doe</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Updated EMR for patient #1234</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Prescribed medication for Jane Smith</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Notes */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Notes</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Remember to update patient records after each consultation
              </p>
              <button 
                onClick={handleEMR}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Access EMR
              </button>
            </div>
          </div>
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}