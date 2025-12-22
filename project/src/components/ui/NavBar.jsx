import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { LanguageSelector } from './LanguageSelector'
import { useTheme } from '../../contexts/ThemeContext'

export function NavBar({ onMenuToggle, isSidebarOpen }) {
  const { user, logout, USER_ROLES } = useAuth()
  const { t } = useI18n()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { theme, toggleTheme, isDark } = useTheme()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const getRoleBasedTitle = () => {
    if (!user) return t('app.name')
    
    switch (user.role) {
      case USER_ROLES.PATIENT:
        return t('patient.dashboard')
      case USER_ROLES.DOCTOR:
        return t('doctor.dashboard')
      case USER_ROLES.HOSPITAL:
        return t('hospital.dashboard')
      case USER_ROLES.ADMIN:
        return t('admin.dashboard')
      default:
        return t('app.name')
    }
  }

  const getUserDisplayName = () => {
    if (!user) return ''
    return user.name || user.phone || t('roles.' + user.role)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Menu toggle and title */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            {user && (
              <button
                onClick={onMenuToggle}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={isSidebarOpen ? t('common.close') : t('common.open')}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}

            {/* App title (clickable home) */}
            <div className="flex items-center ml-2 md:ml-0">
              <div className="flex-shrink-0">
                {/* <button onClick={() => route('/')} className="text-xl font-semibold text-gray-900 hover:underline focus:outline-none">
                  {getRoleBasedTitle()}
                </button> */}
                <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex-shrink-0">Patient Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
            </div>
              </div>
            </div>
          </div>

          {/* Right section - Language selector and user menu */}
          <div className="flex items-center space-x-4">
            {/* Language selector */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '🌞' : '🌙'}
            </button>
            <LanguageSelector />

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="flex items-center space-x-2">
                    {/* User avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* User name - hidden on mobile */}
                    <span className="hidden sm:block text-gray-700 font-medium">
                      {getUserDisplayName()}
                    </span>
                    {/* Dropdown arrow */}
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      {t('roles.' + user.role)}
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // route to role-specific profile pages
                        const profileRoute = user?.role === USER_ROLES.DOCTOR ? '/doctor/profile'
                          : user?.role === USER_ROLES.HOSPITAL ? '/hospital/profile'
                          : user?.role === USER_ROLES.PATIENT ? '/patient/profile' : '/patient/profile'
                        route(profileRoute)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.profile')}
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); route('/settings') }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.settings')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
                <div className="flex items-center space-x-2">
                <button
                  onClick={() => route('/login')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </button>
                <button
                  onClick={() => route('/register')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  )
}