import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { useNetworkStatus } from '../../contexts/NetworkContext'

export function SideBar({ isOpen, onClose }) {
  const { user, USER_ROLES } = useAuth()
  const { t } = useI18n()
  const { isOnline } = useNetworkStatus()

  if (!user) return null

  const getMenuItems = () => {
    const baseItems = [
      {
        href: '/dashboard',
        icon: 'home',
        label: t('nav.dashboard'),
        active: true
      }
    ]

    switch (user.role) {
      case USER_ROLES.PATIENT:
        return [
          ...baseItems,
          {
            href: '/search-doctors',
            icon: 'search',
            label: t('patient.findDoctors')
          },
          {
            href: '/appointments',
            icon: 'calendar',
            label: t('patient.myAppointments')
          },
          {
            href: '/health-records',
            icon: 'document',
            label: t('patient.healthRecords')
          }
        ]

      case USER_ROLES.DOCTOR:
        return [
          ...baseItems,
          {
            href: '/appointments',
            icon: 'calendar',
            label: t('doctor.todaysAppointments')
          },
          {
            href: '/patient-records',
            icon: 'users',
            label: t('doctor.patientRecords')
          },
          {
            href: '/prescriptions',
            icon: 'document',
            label: t('doctor.prescriptions')
          },
          {
            href: '/schedule',
            icon: 'clock',
            label: 'Schedule'
          }
        ]

      case USER_ROLES.HOSPITAL:
        return [
          ...baseItems,
          {
            href: '/doctor-requests',
            icon: 'users',
            label: t('hospital.doctorRequests')
          },
          {
            href: '/hospital-doctors',
            icon: 'user-group',
            label: t('hospital.hospitalDoctors')
          },
          {
            href: '/hospital-profile',
            icon: 'building',
            label: t('hospital.hospitalProfile')
          }
        ]

      case USER_ROLES.ADMIN:
        return [
          ...baseItems,
          {
            href: '/verify-hospitals',
            icon: 'shield-check',
            label: t('admin.verifyHospitals')
          },
          {
            href: '/platform-logs',
            icon: 'document-text',
            label: t('admin.platformLogs')
          },
          {
            href: '/system-stats',
            icon: 'chart-bar',
            label: t('admin.systemStats')
          }
        ]

      default:
        return baseItems
    }
  }

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      search: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      ),
      calendar: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
      document: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      users: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      ),
      'user-group': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      building: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
      'shield-check': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      ),
      'document-text': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      ),
      'chart-bar': (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      clock: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )
    }
    return icons[iconName] || icons.home
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {t('app.name')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('roles.' + user.role)}
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  item.active
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={onClose}
              >
                <svg
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    item.active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {getIcon(item.icon)}
                </svg>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="ml-2 text-xs text-gray-500">
                {isOnline ? t('network.online') : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}