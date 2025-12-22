import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

export function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('week') // 'week' or 'day'
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

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

  useEffect(() => {
    try { localStorage.setItem('mock_schedule', JSON.stringify(schedule)) } catch (e) {}
  }, [schedule])

  useEffect(() => {
    try { localStorage.setItem('schedule_day_offs', JSON.stringify(dayOffs)) } catch (e) {}
  }, [dayOffs])

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage appointments and availability</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
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
            {/* Date Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 mb-6">
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
                    onClick={() => markDayOff(selectedDate)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dayOffs[selectedDate] ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  >
                    {dayOffs[selectedDate] ? 'Mark Available' : 'Mark Day Off'}
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule View */}
            {viewMode === 'day' ? (
              /* Day View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Appointments for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                {dayOffs[selectedDate] && (
                  <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                    This day is marked as <strong>Day Off</strong>. Scheduling and edits are disabled.
                  </div>
                )}
                <div className="space-y-3">
                  {(schedule[selectedDate] || []).map(slot => (
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
              
                  {(!schedule[selectedDate] || schedule[selectedDate].length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-4">📅</div>
                      <p>No appointments scheduled for this date</p>
                    </div>
                  )}
                </div>
                {/* Inline editor for selected slot */}
                {editingSlot && editingSlot.date === selectedDate && (
                  (() => {
                    const list = schedule[selectedDate] || []
                    const slot = list.find(s => s.id === editingSlot.slotId)
                    if (!slot) return null
                    let noteVal = slot.note || ''
                    return (
                      <div className="mt-4 border-2 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Edit Slot — {slot.time}</h4>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${slot.status === 'available' ? 'bg-green-600 text-white' : slot.status === 'unavailable' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}>{slot.status}</div>
                          <button onClick={() => toggleSlotAvailability(selectedDate, slot.id)} className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">Toggle Availability</button>
                          <button onClick={() => setEditingSlot(null)} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Close</button>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Note</label>
                          <textarea defaultValue={noteVal} id="slot-note-input" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => {
                              const val = document.getElementById('slot-note-input').value
                              saveSlotNote(selectedDate, slot.id, val)
                              setEditingSlot(null)
                            }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">Save Note</button>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                )}
              </div>
            ) : (
              /* Week View */
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Schedule</h3>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                  {/* Week Header */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 p-2">Time</div>
                    {weekDays.map(day => (
                      <div key={day} className="text-sm font-medium text-gray-600 dark:text-gray-400 p-2 text-center">
                        {day}
                      </div>
                    ))}
                  </div>
                
                  {/* Time Slots */}
                  <div className="space-y-2">
                    {timeSlots.map(time => (
                      <div key={time} className="grid grid-cols-8 gap-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 p-2 font-medium">{time}</div>
                      {weekDays.map((day, dayIndex) => {
                        const dayDate = new Date()
                        dayDate.setDate(dayDate.getDate() + dayIndex)
                        const dateStr = dayDate.toISOString().split('T')[0]
                          const daySchedule = schedule[dateStr] || []
                          const slot = daySchedule.find(s => s.time === time)
                        
                          return (
                            <div 
                              key={`${day}-${time}`}
                              className={`p-2 rounded-lg border-2 text-xs cursor-pointer hover:shadow-md transition-all ${
                                slot ? (
                                  slot.status === 'confirmed' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' :
                                  slot.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800' :
                                  slot.status === 'available' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800' :
                                  'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                ) : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                              onClick={() => slot && handleSlotClick(dateStr, slot)}
                            >
                              {slot ? (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium truncate text-gray-900 dark:text-white">{slot.patient}</div>
                                    <div className="text-gray-600 dark:text-gray-400 truncate">{slot.type}</div>
                                  </div>
                                  <div onClick={(e) => { e.stopPropagation(); toggleSlotAvailability(dateStr, slot.id) }} className={`ml-2 px-2 py-1 rounded-lg text-xs cursor-pointer transition-colors ${
                                    slot.status === 'available' ? 'bg-green-600 hover:bg-green-700 text-white' : 
                                    slot.status === 'unavailable' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                                    'bg-gray-400 hover:bg-gray-500 text-white'
                                  }`}>{slot.status}</div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <button onClick={(e) => { e.stopPropagation(); addAvailableSlot(dateStr, time) }} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-green-600 hover:text-white transition-colors">+ Add</button>
                                </div>
                              )}
                            </div>
                          )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Today's Appointments</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">6</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Confirmed</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">2</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">4</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available Slots</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}


