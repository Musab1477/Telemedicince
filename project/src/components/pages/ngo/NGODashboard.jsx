import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import * as api from '../../../utils/api'

export function NGODashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [ngoName, setNGOName] = useState('NGO')
  const [stats, setStats] = useState({
    totalBeneficiaries: 1250,
    activePrograms: 8,
    volunteers: 45,
    donations: 2500000
  })

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const fetchNGOProfile = async () => {
    try {
      setIsLoading(true)
      setError('')
      console.log('📤 Fetching NGO Profile')
      
      // Get NGO data from localStorage
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        throw new Error('No user session found')
      }
      
      const userData = JSON.parse(storedUser)
      console.log('✅ NGO Profile Loaded from localStorage:', userData)
      
      setNGOName(userData.ngo_name || userData.name || 'NGO')
      setProfileData(userData)
      
    } catch (err) {
      console.error('❌ NGO Profile Fetch Error:', err)
      
      // Redirect to login if no valid session
      console.log('🔄 No valid session - Redirecting to Login')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      route('/ngo/login')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNGOProfile()
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
    
    console.log('📤 NGO Logout')
    
    // Clear all localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    
    console.log('🔄 Redirecting to NGO Login')
    route('/ngo/login')
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: true, onClick: () => {} },
    { icon: '📊', label: 'Programs', active: false, onClick: () => alert('Programs page coming soon!') },
    { icon: '👥', label: 'Volunteers', active: false, onClick: () => alert('Volunteers page coming soon!') },
    { icon: '💰', label: 'Donations', active: false, onClick: () => alert('Donations page coming soon!') },
    { icon: '📋', label: 'Reports', active: false, onClick: () => alert('Reports page coming soon!') },
    { icon: '⚙️', label: 'Settings', active: false, onClick: () => alert('Settings page coming soon!') },
  ]

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading NGO Dashboard...</p>
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
          <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🤝</div>
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">SwasthLink NGO</h2>
            </div>

            {/* NGO Profile */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {(ngoName || 'N').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {ngoName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">NGO Admin</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1 flex-1">
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

            {/* Help Button */}
            <div className="mt-auto pt-6">
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                <span className="text-xl">📞</span>
                <span className="text-sm">Contact Support</span>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {ngoName}!</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
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

          {/* Error Alert */}
          {error && (
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Beneficiaries</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBeneficiaries.toLocaleString()}</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 12% this month</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Programs</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activePrograms}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">2 new programs</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Volunteers</h3>
                  <span className="text-2xl">🤝</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.volunteers}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">5 joined recently</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Donations Received</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{(stats.donations / 100000).toFixed(1)}L</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 8% this month</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <div className="text-3xl mb-2">➕</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add Program</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <div className="text-3xl mb-2">👤</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add Volunteer</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Create Report</p>
                </button>
                <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <div className="text-3xl mb-2">📢</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Announcement</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 text-xl">✓</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Health Camp Completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">150 patients examined at Village Health Camp</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">💰</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">New Donation Received</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">₹50,000 donated for education program</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl">👥</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">New Volunteers Joined</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5 volunteers registered for upcoming programs</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
