import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { useAuth } from '../../contexts/AuthContext'

export function PatientLayout({ children, title, subtitle, showSidebar = true }) {
  const { user, login } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
    setCurrentPath(window.location.pathname)

    // Fetch user profile on component mount
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        console.log('⚠️ No access token found')
        return
      }

      console.log('📤 Fetching User Profile from PatientLayout...')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'

      const response = await fetch(`${apiUrl}auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        console.error('❌ Failed to fetch profile:', response.status)
        return
      }

      const data = await response.json()
      console.log('✅ Profile Fetch Success:', data)
      console.log('User ID:', data.id)
      console.log('First Name:', data.first_name)
      console.log('Last Name:', data.last_name)
      console.log('Role:', data.role)
      console.log('Mobile Number:', data.mobile_number)

      setProfileData(data)
      
      // Update AuthContext with fetched profile data
      const userData = {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`.trim(),
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        mobile_number: data.mobile_number,
        email: data.email,
        ...data
      }
      login(userData)
      console.log('✅ User updated in AuthContext:', userData)
    } catch (err) {
      console.error('❌ Profile Fetch Error:', err)
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

    try {
      console.log('🚪 Logging out user...')
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        console.log('⚠️ No access token found')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        route('/')
        return
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'

      const response = await fetch(`${apiUrl}auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })

      console.log('📥 Logout Response Status:', response.status)

      // Clear localStorage regardless of response
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('pendingUserId')
      localStorage.removeItem('pendingPhone')

      console.log('✅ Logged out successfully!')
      alert('✅ Logged out successfully!')
      route('/')
    } catch (err) {
      console.error('❌ Logout Error:', err)
      // Still clear localStorage even if API fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      alert('Logged out (with error)')
      route('/')
    }
  }

  const handleHospitals = () => {
    route('/patient/hospitals')
    setCurrentPath('/patient/hospitals')
  }

  const handleMyAppointments = () => {
    route('/patient/appointments')
    setCurrentPath('/patient/appointments')
  }

  const handleHealthRecords = () => {
    route('/patient/reports')
    setCurrentPath('/patient/reports')
  }

  const handleCommunity = () => {
    route('/patient/community')
    setCurrentPath('/patient/community')
  }

  const handleDashboard = () => {
    route('/patient/dashboard')
    setCurrentPath('/patient/dashboard')
  }

  const isActive = (path) => {
    if (path === '/patient/dashboard') {
      return currentPath === '/patient/dashboard'
    }
    if (path === '/patient/appointments') {
      return currentPath.startsWith('/patient/appointments') || currentPath.startsWith('/patient/booking')
    }
    if (path === '/patient/hospitals') {
      return currentPath.startsWith('/patient/hospitals') || currentPath.startsWith('/patient/hospital') || currentPath.startsWith('/patient/doctor')
    }
    if (path === '/patient/reports') {
      return currentPath.startsWith('/patient/reports')
    }
    if (path === '/patient/community') {
      return currentPath.startsWith('/patient/community') || currentPath.startsWith('/patient/group')
    }
    return false
  }

  const menuItems = [
    { 
      icon: '🏠', 
      label: 'Dashboard', 
      onClick: handleDashboard, 
      path: '/patient/dashboard' 
    },
    { 
      icon: '📅', 
      label: 'Appointments', 
      onClick: handleMyAppointments, 
      path: '/patient/appointments' 
    },
    { 
      icon: '🏥', 
      label: 'Hospitals', 
      onClick: handleHospitals, 
      path: '/patient/hospitals' 
    },
    { 
      icon: '📋', 
      label: 'Health Records', 
      onClick: handleHealthRecords, 
      path: '/patient/reports' 
    },
    { 
      icon: '👥', 
      label: 'Community', 
      onClick: handleCommunity, 
      path: '/patient/community' 
    },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        {showSidebar && (
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
                    {((profileData?.first_name || user?.name || 'A').charAt(0) + (profileData?.last_name || user?.name || 'A').charAt(0)).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {profileData ? `${profileData.first_name} ${profileData.last_name}`.trim() : (user?.name || 'Patient')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {profileData?.role || user?.role || 'Patient'}
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
                    isActive(item.path)
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
        )}

        {/* Main Content */}
        <div className={showSidebar ? 'lg:ml-64' : ''}>
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Left: Menu Button & Title */}
                <div className="flex items-center gap-4">
                  {showSidebar && (
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  )}
                  {!showSidebar && (
                    <button 
                      onClick={() => route('/patient/dashboard')}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
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
            {children}
          </main>
        </div>

        {/* Overlay for mobile sidebar */}
        {showSidebar && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          ></div>
        )}
      </div>
    </div>
  )
}
