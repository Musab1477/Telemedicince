import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import * as api from '../../../utils/api'

export function HospitalDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [recentPatients, setRecentPatients] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [hospitalName, setHospitalName] = useState('Hospital')

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const fetchHospitalProfile = async () => {
    try {
      setIsLoading(true)
      setError('')
      console.log('📤 Fetching Hospital Profile')
      const response = await api.getHospitalProfile()
      console.log('✅ Hospital Profile Fetched:', response)
      setProfileData(response)
      
      // Extract hospital name from response
      if (response.hospital_name) {
        setHospitalName(response.hospital_name)
      }
    } catch (err) {
      console.error('❌ Hospital Profile Fetch Error:', err)
      
      // Handle unauthorized errors
      if (err.status === 401 || err.status === 403) {
        console.log('🔄 Unauthorized - Redirecting to Login')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        route('/hospital/login')
      } else {
        setError(err.body?.message || err.message || 'Failed to load profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitalProfile()
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hospital_patients')
      const arr = raw ? JSON.parse(raw) : []
      const inpatients = arr.filter(p => !p.dischargeDate)
      inpatients.sort((a, b) => (b.admissionDate || '') > (a.admissionDate || '') ? 1 : -1)
      setRecentPatients(inpatients.slice(0, 3))
    } catch (e) {
      console.error('Failed to load recent patients', e)
      setRecentPatients([])
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

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (!confirmed) return
    
    setIsLoading(true)
    try {
      console.log('📤 Hospital Logout Request')
      const response = await api.logoutHospital()
      console.log('✅ Hospital Logout Success:', response)
      
      // Clear all localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('darkMode')
      
      // Redirect to login
      console.log('🔄 Redirecting to Hospital Login')
      route('/hospital/login')
    } catch (err) {
      console.error('❌ Hospital Logout Error:', err)
      setError(err.body?.message || err.message || 'Logout failed')
      setIsLoading(false)
    }
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: true, onClick: () => {} },
    { icon: '📋', label: 'Patients', active: false, onClick: () => route('/hospital/patients-record') },
    { icon: '👨‍⚕️', label: 'Manage Doctors', active: false, onClick: () => route('/hospital/manage-doctors') },
    // { icon: '✅', label: 'Doctor Requests', active: false, onClick: () => route('/hospital/doctor-requests') },
    { icon: '➕', label: 'Add Doctor', active: false, onClick: () => route('/hospital/add-doctor') },
    { icon: '📝', label: 'Form Builder', active: false, onClick: () => route('/hospital/form-builder') },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🏥</div>
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">SwasthLink</h2>
            </div>

            {/* Hospital Profile */}
            <button
              onClick={() => route('/hospital/profile')}
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-purple-100 hover:to-pink-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {hospitalName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {hospitalName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Hospital Admin</p>
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
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Emergency Button */}
            {/* <div className="mt-auto pt-6">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                <span className="text-xl">🚨</span>
                <span className="text-sm">Emergency: 108</span>
              </button>
            </div> */}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {hospitalName}!</p>
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
            {/* Loading Spinner */}
            {isLoading && !profileData && (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="fixed top-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg z-50 max-w-sm">
                {error}
              </div>
            )}

            {/* Main Content - Show only when profile is loaded */}
            {!isLoading && profileData && (
              <div>
                {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Doctors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">45</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">7</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-2xl">
                    📋
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Doctors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">38</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-2xl">
                    ✅
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consultations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">156</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-2xl">
                    💬
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <button
                  onClick={() => route('/hospital/patients-record')}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Patients</p>
                </button>

                <button
                  onClick={() => route('/hospital/manage-doctors')}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-center group"
                > 
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👨‍⚕️</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Doctors</p>
                </button>

                <button
                  onClick={() => route('/hospital/profile')}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏥</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Profile</p>
                </button>

                <button
                  onClick={() => route('/hospital/add-doctor')}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add Doctor</p>
                </button>

                <button
                  onClick={() => route('/hospital/form-builder')}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-center group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Forms</p>
                </button>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Admissions */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Admissions</h2>
                    <button
                      onClick={() => route('/hospital/patients-record')}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentPatients.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No recent admissions.</div>
                    ) : (
                      recentPatients.map(p => (
                        <div key={p.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                              👤
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{p.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{p.diagnosis} • Room: {p.room}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-blue-600 dark:text-blue-400">Admitted: {p.admissionDate}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Dr. {p.attendingDoctor}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => route('/hospital/patients-record')} 
                              className="self-start bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Hospital Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Hospital Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">🏥</span>
                      <span className="text-gray-900 dark:text-white font-medium">Government Hospital</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">📅</span>
                      <span className="text-gray-700 dark:text-gray-300">Est. 1985</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">🛏️</span>
                      <span className="text-gray-700 dark:text-gray-300">200 Beds</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">🏢</span>
                      <span className="text-gray-700 dark:text-gray-300">15 Departments</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => route('/hospital/profile')}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">Dr. Smith approved and joined</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">New doctor request received</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">Hospital profile updated</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tip */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💡</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Quick Tip</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Keep doctor profiles updated for better patient matching and improved healthcare delivery.
                  </p>
                </div>
              </div>
            </div>
              </div>
            )}
          </main>
        </div>
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