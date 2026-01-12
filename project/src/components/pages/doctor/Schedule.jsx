import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

export function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('check') // 'check', 'week' or 'day'
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileData, setProfileData] = useState(null)
  
  // Check Schedule API data
  const [scheduleData, setScheduleData] = useState([])
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Fetch schedule data when component loads
    fetchScheduleData()
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

  // Update selectedDate when switching to day view
  useEffect(() => {
    if (viewMode === 'day') {
      setSelectedDate(getNextDateAfterLastSchedule())
    }
  }, [viewMode, scheduleData])

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

    setIsLoadingSchedule(true)
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
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  const fetchScheduleData = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    setIsLoadingSchedule(true)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      
      console.log('📥 Fetching Schedule Data:')
      console.log('URL:', `${baseUrl}doctor/view-schedule/`)
      console.log('Auth Token:', token.substring(0, 20) + '...')

      const response = await fetch(`${baseUrl}doctor/view-schedule/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error fetching schedule:', errorData)
        return
      }

      const result = await response.json()
      console.log('✅ Schedule data fetched successfully:', result)
      
      if (result.data && Array.isArray(result.data)) {
        setScheduleData(result.data)
      }
    } catch (error) {
      console.error('❌ Error fetching schedule:', error)
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  const initialMock = {
    '2024-01-15': [
      { id: 1, time: '09:00', patient: 'John Doe', type: 'General Checkup', status: 'confirmed' },
      { id: 2, time: '10:30', patient: 'Jane Smith', type: 'Follow-up', status: 'confirmed' },
      { id: 3, time: '14:00', patient: 'Robert Wilson', type: 'Consultation', status: 'pending' },
      { id: 4, time: '15:30', patient: 'Available Slot', type: 'free', status: 'available', note: '' }
    ],
    '2024-01-16': [
      { id: 5, time: '09:30', patient: 'Mary Johnson', type: 'Checkup', status: 'confirmed' },
      { id: 6, time: '11:00', patient: 'Available Slot', type: 'free', status: 'available', note: '' },
      { id: 7, time: '16:00', patient: 'David Brown', type: 'Consultation', status: 'confirmed' }
    ]
  }

  // schedule state persisted in localStorage under key 'mock_schedule'
  const [schedule, setSchedule] = useState(() => {
    try {
      const raw = localStorage.getItem('mock_schedule')
      return raw ? JSON.parse(raw) : initialMock
    } catch (e) {
      return initialMock
    }
  })

  // day offs mapping
  const [dayOffs, setDayOffs] = useState(() => {
    try {
      const raw = localStorage.getItem('schedule_day_offs')
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  })

  // editing slot state: { date, slotId }
  const [editingSlot, setEditingSlot] = useState(null)

  // Add time range state
  const [timeRange, setTimeRange] = useState({ start: '09:00', startPeriod: 'AM', end: '10:00', endPeriod: 'AM' })

  // Weekly schedule state
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    try {
      const raw = localStorage.getItem('weekly_schedule')
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  })

  // Weekly day offs state
  const [weeklyDayOffs, setWeeklyDayOffs] = useState(() => {
    try {
      const raw = localStorage.getItem('weekly_day_offs')
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  })

  // Removed days state (days to exclude from payload)
  const [removedDays, setRemovedDays] = useState(() => {
    try {
      const raw = localStorage.getItem('removed_days')
      return raw ? JSON.parse(raw) : {}
    } catch (e) {
      return {}
    }
  })

  // Modal state for check schedule
  const [modalData, setModalData] = useState(null)
  const [modalEditStart, setModalEditStart] = useState('')
  const [modalEditEnd, setModalEditEnd] = useState('')
  const [modalEditStartPeriod, setModalEditStartPeriod] = useState('AM')
  const [modalEditEndPeriod, setModalEditEndPeriod] = useState('AM')
  const [modalIsMarkingOff, setModalIsMarkingOff] = useState(false)

  // API state variables
  const [apiType, setApiType] = useState('day')
  const [isMarkingOff, setIsMarkingOff] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    try { localStorage.setItem('mock_schedule', JSON.stringify(schedule)) } catch (e) {}
  }, [schedule])

  useEffect(() => {
    try { localStorage.setItem('schedule_day_offs', JSON.stringify(dayOffs)) } catch (e) {}
  }, [dayOffs])

  useEffect(() => {
    try { localStorage.setItem('weekly_schedule', JSON.stringify(weeklySchedule)) } catch (e) {}
  }, [weeklySchedule])

  useEffect(() => {
    try { localStorage.setItem('weekly_day_offs', JSON.stringify(weeklyDayOffs)) } catch (e) {}
  }, [weeklyDayOffs])

  useEffect(() => {
    try { localStorage.setItem('removed_days', JSON.stringify(removedDays)) } catch (e) {}
  }, [removedDays])

  // Initialize modal fields when modalData changes
  useEffect(() => {
    if (modalData) {
      setModalIsMarkingOff(modalData.is_off || false)
      if (modalData.start_time_display) {
        const timeParts = modalData.start_time_display.split(' ')
        setModalEditStart(modalData.start_time || '09:00')
        setModalEditStartPeriod(timeParts[1] || 'AM')
      } else {
        setModalEditStart('09:00')
        setModalEditStartPeriod('AM')
      }
      
      if (modalData.end_time_display) {
        const timeParts = modalData.end_time_display.split(' ')
        setModalEditEnd(modalData.end_time || '10:00')
        setModalEditEndPeriod(timeParts[1] || 'AM')
      } else {
        setModalEditEnd('10:00')
        setModalEditEndPeriod('AM')
      }
    }
  }, [modalData])

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'available': return 'bg-green-50 text-green-800 border-green-200'
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const handleSlotClick = (date, slot) => {
    setEditingSlot({ date, slotId: slot.id })
  }

  const toggleSlotAvailability = (date, slotId) => {
    setSchedule(prev => {
      const copy = { ...prev }
      const list = (copy[date] || []).map(s => {
        if (s.id === slotId) {
          const newStatus = s.status === 'available' ? 'unavailable' : 'available'
          return { ...s, status: newStatus }
        }
        return s
      })
      copy[date] = list
      return copy
    })
  }

  const saveSlotNote = (date, slotId, note) => {
    setSchedule(prev => {
      const copy = { ...prev }
      copy[date] = (copy[date] || []).map(s => s.id === slotId ? { ...s, note } : s)
      return copy
    })
  }

  const markDayOff = (date) => {
    setDayOffs(prev => {
      const copy = { ...prev }
      copy[date] = !copy[date]
      return copy
    })
  }

  const addAvailableSlot = (date, time) => {
    const newId = Date.now()
    setSchedule(prev => {
      const copy = { ...prev }
      const list = copy[date] ? [...copy[date]] : []
      list.push({ id: newId, time, patient: 'Available Slot', type: 'free', status: 'available', note: '' })
      copy[date] = list
      return copy
    })
  }

  const getNextEightDays = () => {
    const days = []
    // Start from the day after the last scheduled date
    let startDate = new Date()
    
    if (scheduleData && scheduleData.length > 0) {
      // Find the last scheduled date
      const lastSchedule = scheduleData[scheduleData.length - 1]
      if (lastSchedule && lastSchedule.date) {
        const lastDate = new Date(lastSchedule.date)
        startDate = new Date(lastDate)
        startDate.setDate(startDate.getDate() + 1) // Start from next day
      }
    }
    
    for (let i = 0; i < 8; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      days.push({ dateStr, dayName })
    }
    return days
  }

  const getLastScheduleDate = () => {
    if (scheduleData && scheduleData.length > 0) {
      const lastSchedule = scheduleData[scheduleData.length - 1]
      if (lastSchedule && lastSchedule.date) {
        return new Date(lastSchedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      }
    }
    return null
  }

  const getNextDateAfterLastSchedule = () => {
    if (scheduleData && scheduleData.length > 0) {
      const lastSchedule = scheduleData[scheduleData.length - 1]
      if (lastSchedule && lastSchedule.date) {
        const nextDate = new Date(lastSchedule.date)
        nextDate.setDate(nextDate.getDate() + 1)
        return nextDate.toISOString().split('T')[0]
      }
    }
    return new Date().toISOString().split('T')[0]
  }

  const toggleWeeklyDayOff = (dateStr) => {
    setWeeklyDayOffs(prev => {
      const copy = { ...prev }
      copy[dateStr] = !copy[dateStr]
      return copy
    })
  }

  const formatDateLong = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatDateShort = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getAuthToken = () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        return token
      }
      // Fallback: try to get from user object
      const user = localStorage.getItem('user')
      if (user) {
        const userData = JSON.parse(user)
        return userData.token || null
      }
      return null
    } catch (e) {
      console.error('Error getting auth token:', e)
      return null
    }
  }

  const convertTo24Hour = (time, period) => {
    let [hours, minutes] = time.split(':')
    hours = parseInt(hours)
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`
  }

  const formatTimeFor12Hour = (time, period) => {
    // time is in 24-hour format (HH:MM), period is AM/PM
    // Just return the time with the period
    return `${time} ${period}`
  }

  const saveScheduleToAPI = async () => {
    const token = getAuthToken()
    if (!token) {
      alert('Authorization failed. Please login again.')
      route('/doctor/login')
      return
    }

    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const payload = isMarkingOff
        ? {
            type: 'day',
            date: selectedDate,
            is_off: true
          }
        : {
            type: 'day',
            date: selectedDate,
            start_time: formatTimeFor12Hour(timeRange.start, timeRange.startPeriod),
            end_time: formatTimeFor12Hour(timeRange.end, timeRange.endPeriod)
          }

      console.log('📤 Sending API Request:')
      console.log('URL:', `${baseUrl}/doctor/add-schedule/`)
      console.log('Payload:', payload)
      console.log('Auth Token:', token.substring(0, 20) + '...')

      const response = await fetch(`${baseUrl}doctor/add-schedule/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Response Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ Error Response Data:', errorData)
        
        let errorMsg = errorData.message || errorData.error || `API Error: ${response.statusText}`
        
        // Check if single date field exists
        if (errorData.date) {
          errorMsg = `${errorMsg}\nSchedule Already Exist For This Date: ${errorData.date}`
        }
        
        // Check if dates array is in error response
        if (errorData.dates && Array.isArray(errorData.dates) && errorData.dates.length > 0) {
          const dateList = errorData.dates.join(', ')
          errorMsg = `${errorMsg}\nConflict Dates: ${dateList}`
        }
        
        throw new Error(errorMsg)
      }

      const result = await response.json()
      console.log('✅ Schedule saved successfully:', result)
      
      // Show success alert with dates info if available
      let successMsg = 'Schedule saved successfully!'
      if (result.dates && Array.isArray(result.dates) && result.dates.length > 0) {
        successMsg += '\nDates: ' + result.dates.join(', ')
      }
      alert(successMsg)
      
      // Reset the form after successful save
      if (isMarkingOff) {
        setIsMarkingOff(false)
      } else {
        setTimeRange({ start: '09:00', startPeriod: 'AM', end: '10:00', endPeriod: 'AM' })
      }
      
      // Redirect to Check Schedule view
      setViewMode('check')
    } catch (error) {
      console.error('❌ Error saving schedule:', error)
      alert('Error saving schedule: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const saveWeeklyScheduleToAPI = async () => {
    const token = getAuthToken()
    if (!token) {
      alert('Authorization failed. Please login again.')
      route('/doctor/login')
      return
    }

    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      
      // Build the days array from the weeklySchedule and weeklyDayOffs
      const days = getNextEightDays()
        .filter(day => !removedDays[day.dateStr]) // Exclude removed days
        .map(day => {
          if (weeklyDayOffs[day.dateStr]) {
            // Day is marked as off
            return {
              date: day.dateStr,
              is_off: true
            }
          } else {
            // Day has time slots
            return {
              date: day.dateStr,
              start_time: formatTimeFor12Hour(weeklySchedule[day.dateStr]?.start || '09:00', weeklySchedule[day.dateStr]?.startPeriod || 'AM'),
              end_time: formatTimeFor12Hour(weeklySchedule[day.dateStr]?.end || '10:00', weeklySchedule[day.dateStr]?.endPeriod || 'AM')
            }
          }
        })

      const payload = {
        type: 'weekly',
        days: days
      }

      console.log('📤 Sending Weekly Schedule API Request:')
      console.log('URL:', `${baseUrl}/doctor/add-schedule/`)
      console.log('Payload:', JSON.stringify(payload, null, 2))
      console.log('Auth Token:', token.substring(0, 20) + '...')

      const response = await fetch(`${baseUrl}doctor/add-schedule/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Response Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ Error Response Data:', errorData)
        
        let errorMsg = errorData.message || errorData.error || `API Error: ${response.statusText}`
        
        // Check if single date field exists
        if (errorData.date) {
          errorMsg = `${errorMsg}\nSchedule Exist For This Date: ${errorData.date}`
        }
        
        // Check if dates array is in error response
        if (errorData.dates && Array.isArray(errorData.dates) && errorData.dates.length > 0) {
          const dateList = errorData.dates.join(', ')
          errorMsg = `${errorMsg}\nConflict Dates: ${dateList}`
        }
        
        throw new Error(errorMsg)
      }

      const result = await response.json()
      console.log('✅ Weekly schedule saved successfully:', result)
      
      // Clear all weekly schedule data for fresh start
      setWeeklySchedule({})
      setWeeklyDayOffs({})
      setRemovedDays({})
      
      // Show success alert
      let successMsg = 'Weekly Schedule Created'
      if (result.dates && Array.isArray(result.dates) && result.dates.length > 0) {
        successMsg += '\nDates: ' + result.dates.join(', ')
      }
      alert(successMsg)
      
      // Redirect to Check Schedule view
      setViewMode('check')
      
      // Show success message
      setSuccessMessage('Your Next 8 Days Schedule is Set Successfully')
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      
    } catch (error) {
      console.error('❌ Error saving weekly schedule:', error)
      alert('Error saving weekly schedule: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', onClick: () => route('/doctor/dashboard') },
    { icon: '📅', label: 'Schedule', active: true, onClick: () => {} },
    { icon: '📋', label: 'EMR', onClick: () => route('/doctor/emr') },
    { icon: '💊', label: 'Prescriptions', onClick: () => route('/doctor/prescriptions') },
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage appointments and availability</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('check')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'check' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Check Schedule
                    </button>
                    <button
                      onClick={() => setViewMode('day')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'day' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'week' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Week
                    </button>
                  </div>
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
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{successMessage}</span>
                </div>
              </div>
            )}
            
            {/* Date Selector - Only for Day View */}
            {viewMode === 'day' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
                <div className="mb-4">
                  {getLastScheduleDate() && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 mb-4">
                      <p className="text-sm font-medium">
                        You Have added Schedule Till <strong>{getLastScheduleDate()}</strong>
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage your appointments and availability</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        setIsMarkingOff(!isMarkingOff)
                        markDayOff(selectedDate)
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dayOffs[selectedDate] ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                    >
                      {dayOffs[selectedDate] ? 'Mark Available' : 'Mark Day Off'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule View */}
            {viewMode === 'check' ? (
              /* Check Schedule View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Schedule</h3>
                  <button
                    onClick={fetchScheduleData}
                    disabled={isLoadingSchedule}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoadingSchedule ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                {isLoadingSchedule ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading schedule data...</p>
                  </div>
                ) : scheduleData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">No schedule data available</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">Day & Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">From Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">To Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">Status</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduleData.map((item, idx) => {
                          const dateObj = new Date(item.date)
                          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          
                          return (
                            <tr key={item.id} className={`border border-gray-200 dark:border-gray-600 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                                <div className="font-medium">{dayName}, {formattedDate}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                                <div className="font-medium">
                                  {item.is_off ? '-' : (item.start_time_display || '-')}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                                <div className="font-medium">
                                  {item.is_off ? '-' : (item.end_time_display || '-')}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm border border-gray-200 dark:border-gray-600">
                                {item.is_off ? (
                                  <span className="inline-block px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">Day Off</span>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">Available</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center border border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={() => setModalData(item)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Modal for Edit Schedule */}
                {modalData && (
                  <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {new Date(modalData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>
                        <button
                          onClick={() => {
                            setModalData(null)
                            setModalIsMarkingOff(false)
                          }}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-4 mb-6">
                        {!modalIsMarkingOff ? (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">From Time</label>
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  value={modalEditStart}
                                  onChange={(e) => setModalEditStart(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select
                                  value={modalEditStartPeriod}
                                  onChange={(e) => setModalEditStartPeriod(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option>AM</option>
                                  <option>PM</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">To Time</label>
                              <div className="flex gap-2">
                                <input
                                  type="time"
                                  value={modalEditEnd}
                                  onChange={(e) => setModalEditEnd(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <select
                                  value={modalEditEndPeriod}
                                  onChange={(e) => setModalEditEndPeriod(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option>AM</option>
                                  <option>PM</option>
                                </select>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                            <p className="text-sm font-medium">This day is marked as <strong>Day Off</strong></p>
                            <p className="text-sm mt-2">Time fields are disabled</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setModalIsMarkingOff(!modalIsMarkingOff)
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            modalIsMarkingOff
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {modalIsMarkingOff ? 'Mark Available' : 'Mark Day Off'}
                        </button>
                        <button
                          onClick={() => {
                            setModalData(null)
                            setModalIsMarkingOff(false)
                          }}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            const token = getAuthToken()
                            if (!token) {
                              alert('Authorization failed. Please login again.')
                              route('/doctor/login')
                              return
                            }

                            setIsLoading(true)
                            try {
                              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
                              
                              let payload
                              if (modalIsMarkingOff) {
                                // Mark as Day Off
                                payload = {
                                  is_off: true,
                                  reason: ""
                                }
                              } else {
                                // Save time schedule - format time properly
                                const startTimeParts = modalEditStart.split(':')
                                const endTimeParts = modalEditEnd.split(':')
                                
                                payload = {
                                  start_time: `${startTimeParts[0]}:${startTimeParts[1]} ${modalEditStartPeriod}`,
                                  end_time: `${endTimeParts[0]}:${endTimeParts[1]} ${modalEditEndPeriod}`,
                                  is_off: false
                                }
                              }

                              console.log('📤 Updating Schedule:')
                              console.log('Schedule ID:', modalData.id)
                              console.log('URL:', `${baseUrl}doctor/update-schedule/${modalData.id}/`)
                              console.log('Payload:', payload)
                              console.log('Auth Token:', token.substring(0, 20) + '...')

                              const response = await fetch(`${baseUrl}doctor/update-schedule/${modalData.id}/`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(payload)
                              })

                              console.log('Response Status:', response.status)

                              if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}))
                                console.log('❌ Error Response Data:', errorData)
                                let errorMsg = errorData.message || errorData.error || `API Error: ${response.statusText}`
                                
                                if (errorData.date) {
                                  errorMsg = `${errorMsg}\nSchedule Already Exist For This Date: ${errorData.date}`
                                }
                                
                                if (errorData.dates && Array.isArray(errorData.dates) && errorData.dates.length > 0) {
                                  const dateList = errorData.dates.join(', ')
                                  errorMsg = `${errorMsg}\nConflict Dates: ${dateList}`
                                }
                                
                                throw new Error(errorMsg)
                              }

                              const result = await response.json()
                              console.log('✅ Schedule updated successfully:', result)
                              
                              alert('Schedule updated successfully!')
                              
                              // Refresh schedule data
                              fetchScheduleData()
                              
                              // Close modal
                              setModalData(null)
                              setModalIsMarkingOff(false)
                            } catch (error) {
                              console.error('❌ Error updating schedule:', error)
                              alert('Error updating schedule: ' + error.message)
                            } finally {
                              setIsLoading(false)
                            }
                          }}
                          disabled={isLoading}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : viewMode === 'day' ? (
              /* Day View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Appointments for {new Date(selectedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </h3>
                {dayOffs[selectedDate] && (
                  <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                    This day is marked as <strong>Day Off</strong>. Scheduling and edits are disabled.
                  </div>
                )}

                {/* Add Available Time Range */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add Available Time Slot</h4>
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">From Time</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={timeRange.start}
                          onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
                          disabled={dayOffs[selectedDate]}
                          className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            dayOffs[selectedDate] 
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        />
                        <select
                          value={timeRange.startPeriod}
                          onChange={(e) => setTimeRange({ ...timeRange, startPeriod: e.target.value })}
                          disabled={dayOffs[selectedDate]}
                          className={`px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            dayOffs[selectedDate] 
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <option>AM</option>
                          <option>PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">To Time</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={timeRange.end}
                          onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
                          disabled={dayOffs[selectedDate]}
                          className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            dayOffs[selectedDate] 
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        />
                        <select
                          value={timeRange.endPeriod}
                          onChange={(e) => setTimeRange({ ...timeRange, endPeriod: e.target.value })}
                          disabled={dayOffs[selectedDate]}
                          className={`px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            dayOffs[selectedDate] 
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <option>AM</option>
                          <option>PM</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={saveScheduleToAPI}
                      disabled={isLoading}
                      className="px-6 py-2 rounded-lg font-medium transition-colors bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(schedule[selectedDate] || []).filter(slot => slot.patient !== 'Available Slot').map(slot => (
                    <div 
                      key={slot.id}
                      onClick={!dayOffs[selectedDate] ? () => handleSlotClick(selectedDate, slot) : undefined}
                      className={`border-2 rounded-xl p-4 transition-all ${dayOffs[selectedDate] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-[1.01]'} ${
                        slot.status === 'confirmed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800' :
                        slot.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800' :
                        slot.status === 'available' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border-blue-200 dark:border-blue-800' :
                        'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-3 py-2 rounded-lg">{slot.time}</div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{slot.patient}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{slot.type}</div>
                            {slot.note && <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Note: {slot.note}</div>}
                          </div>
                        </div>
                        <div
                          onClick={!dayOffs[selectedDate] ? (e) => { e.stopPropagation(); toggleSlotAvailability(selectedDate, slot.id) } : undefined}
                          title="Toggle availability"
                          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                            dayOffs[selectedDate] ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : 
                            slot.status === 'confirmed' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                            slot.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 
                            slot.status === 'available' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                            'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {slot.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Week View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set Your Weekly Schedule</h3>
                  {getLastScheduleDate() && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                      <p className="text-sm font-medium">
                        You Have added Schedule Till <strong>{getLastScheduleDate()}</strong>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {getNextEightDays().map(day => (
                    <div key={day.dateStr} className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-all ${removedDays[day.dateStr] ? 'opacity-50 border-red-300 dark:border-red-600' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{day.dayName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date: {day.dateStr}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWeeklyDayOff(day.dateStr)}
                            disabled={removedDays[day.dateStr]}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              removedDays[day.dateStr]
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : weeklyDayOffs[day.dateStr]
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {weeklyDayOffs[day.dateStr] ? 'Mark Available' : 'Mark Day Off'}
                          </button>
                          <button
                            onClick={() => setRemovedDays(prev => ({
                              ...prev,
                              [day.dateStr]: !prev[day.dateStr]
                            }))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              removedDays[day.dateStr]
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-orange-600 hover:bg-orange-700 text-white'
                            }`}
                          >
                            {removedDays[day.dateStr] ? 'Add Back' : 'Remove'}
                          </button>
                        </div>
                      </div>

                      {!removedDays[day.dateStr] && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">From Time</label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={weeklySchedule[day.dateStr]?.start || '09:00'}
                                onChange={(e) => setWeeklySchedule(prev => ({
                                  ...prev,
                                  [day.dateStr]: { ...prev[day.dateStr], start: e.target.value }
                                }))}
                                disabled={weeklyDayOffs[day.dateStr]}
                                className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  weeklyDayOffs[day.dateStr] 
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              />
                              <select
                                value={weeklySchedule[day.dateStr]?.startPeriod || 'AM'}
                                onChange={(e) => setWeeklySchedule(prev => ({
                                  ...prev,
                                  [day.dateStr]: { ...prev[day.dateStr], startPeriod: e.target.value }
                                }))}
                                disabled={weeklyDayOffs[day.dateStr]}
                                className={`px-2 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  weeklyDayOffs[day.dateStr] 
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              >
                                <option>AM</option>
                                <option>PM</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">To Time</label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                value={weeklySchedule[day.dateStr]?.end || '10:00'}
                                onChange={(e) => setWeeklySchedule(prev => ({
                                  ...prev,
                                  [day.dateStr]: { ...prev[day.dateStr], end: e.target.value }
                                }))}
                                disabled={weeklyDayOffs[day.dateStr]}
                                className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  weeklyDayOffs[day.dateStr] 
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              />
                              <select
                                value={weeklySchedule[day.dateStr]?.endPeriod || 'AM'}
                                onChange={(e) => setWeeklySchedule(prev => ({
                                  ...prev,
                                  [day.dateStr]: { ...prev[day.dateStr], endPeriod: e.target.value }
                                }))}
                                disabled={weeklyDayOffs[day.dateStr]}
                                className={`px-2 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  weeklyDayOffs[day.dateStr] 
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                              >
                                <option>AM</option>
                                <option>PM</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {removedDays[day.dateStr] && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                          <p className="text-sm font-medium">This day has been removed and will not be included in the schedule</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={saveWeeklyScheduleToAPI}
                  disabled={isLoading}
                  className="mt-6 w-full px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Weekly Schedule'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}


