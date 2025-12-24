import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

export default function ConsultationList() {
  const [filter, setFilter] = useState('upcoming') // upcoming | completed | cancelled | all
  const [consultations, setConsultations] = useState([])
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('Please login to view appointments')
          setLoading(false)
          return
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
        const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
        
        // Determine status parameter based on filter
        const statusMap = {
          'upcoming': 'upcoming',
          'completed': 'completed',
          'cancelled': 'cancelled',
          'all': 'all'
        }
        
        const status = statusMap[filter] || 'all'
        const url = `${apiUrl}patient/appointments/list/?status=${status}`
        
        console.log('📡 Fetching appointments from:', url)
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📥 Response Status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Failed to fetch appointments:', errorData)
          throw new Error(errorData.detail || 'Failed to fetch appointments')
        }

        const data = await response.json()
        console.log('✅ Appointments received:', data)
        
        // Map API response to component format
        // API returns: { appointments: [...], count, message, status_filter }
        const appointmentsArray = Array.isArray(data) ? data : (data.appointments || [])
        console.log('📋 Appointments array:', appointmentsArray)
        
        const mappedAppointments = appointmentsArray.map(apt => {
          console.log('🔄 Mapping appointment:', apt)
          return {
            id: apt.id.toString(),
            patient: {
              id: apt.patient,
              name: apt.patient_name
            },
            appointmentTime: `${apt.appointment_date} ${apt.start_time}`,
            appointmentDate: apt.appointment_date,
            startTime: apt.start_time,
            endTime: apt.end_time,
            symptoms: 'General Checkup',
            urgency: apt.status === 'booked' ? 'high' : apt.status === 'completed' ? 'low' : 'medium',
            type: 'video',
            status: apt.status === 'booked' ? 'scheduled' : apt.status === 'completed' ? 'completed' : 'cancelled',
            paymentStatus: apt.payment_status,
            amount: apt.amount,
            doctorUrl: apt.doctor_link
          }
        })
        
        console.log('✅ Mapped appointments:', mappedAppointments)
        setConsultations(mappedAppointments)
      } catch (err) {
        console.error('❌ Error fetching appointments:', err)
        setError(err.message)
        setConsultations([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [filter])

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

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', onClick: () => route('/doctor/dashboard') },
    { icon: '📅', label: 'Schedule', onClick: () => route('/doctor/schedule') },
    { icon: '📋', label: 'EMR', onClick: () => route('/doctor/emr') },
    { icon: '💊', label: 'Prescriptions', onClick: () => route('/doctor/prescriptions') },
    { icon: '🎥', label: 'Consultations', active: true, onClick: () => {} },
  ]

  // Removed old useEffect that loads from localStorage - now using API


  // (No helper buttons in the UI - initial seeding happens in useEffect)

  const filtered = consultations.filter(c => {
    if (filter === 'all') return true
    if (filter === 'completed') return c.status === 'completed'
    // upcoming: scheduled or in_progress
    return c.status === 'scheduled' || c.status === 'in_progress'
  })

  const handleJoin = (id) => {
    try {
      localStorage.setItem('next_appointment', id)
    } catch (e) {}
    route('/doctor/consultationRoom')
  }

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
              onClick={() => route('/doctor/profile')}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">SJ</div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Cardiologist</p>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled meetings and history</p>
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
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={() => route('/')}
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
            {/* Filter Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={() => setFilter('upcoming')} 
                  className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter==='upcoming'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  📅 Upcoming
                </button>
                <button 
                  onClick={() => setFilter('completed')} 
                  className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter==='completed'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  ✅ Completed
                </button>
                <button 
                  onClick={() => setFilter('cancelled')} 
                  className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter==='cancelled'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  ❌ Cancelled
                </button>
                <button 
                  onClick={() => setFilter('all')} 
                  className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter==='all'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  📋 All
                </button>
              </div>
            </div>

            {/* Consultations List */}
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4 animate-spin">⏳</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading appointments...</h3>
                <p className="text-gray-600 dark:text-gray-400">Fetching from server</p>
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm p-8 text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading appointments</h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🎥</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No consultations</h3>
                <p className="text-gray-600 dark:text-gray-400">You have no consultations for the selected filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(item => {
                  const statusColors = {
                    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
                    in_progress: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
                    completed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
                    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }
                  
                  return (
                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {(item.patient?.name || 'U')[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.patient?.name || 'Unknown'}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                                {item.status === 'in_progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">📅 Date:</span>
                                <span>{item.appointmentDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">⏱️ Start Time:</span>
                                <span>{item.startTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">⏹️ End Time:</span>
                                <span>{item.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">💬 Symptoms:</span>
                                <span>{item.symptoms}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">💳 Payment:</span>
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs font-semibold">
                                  {item.paymentStatus.toUpperCase()} • ₹{item.amount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          {item.status !== 'completed' && item.status !== 'cancelled' ? (
                            <button 
                              onClick={() => {
                                if (item.doctorUrl) {
                                  window.location.href = item.doctorUrl
                                } else {
                                  alert('Consultation link not available')
                                }
                              }} 
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Join Now
                            </button>
                          ) : (
                            <button 
                              onClick={() => route(`/doctor/consultation-summary/${item.id}`)} 
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View Summary
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
