import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { PatientLayout } from '../../ui/PatientLayout'

export function MyAppointments() {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    // Load appointments from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('appointments') || '[]')
      setAppointments(stored)
    } catch (e) {
      console.error('Failed to load appointments:', e)
      setAppointments([])
    }
  }, [])

  // Separate into upcoming and past
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = appointments.filter(a => {
    const apptDate = new Date(a.date)
    return apptDate >= today
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  const past = appointments.filter(a => {
    const apptDate = new Date(a.date)
    return apptDate < today
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
 

  return (
    <PatientLayout title="My Appointments" subtitle={`${upcoming.length} upcoming, ${past.length} past`}>
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{appointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{upcoming.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-2xl">
                ⏰
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-1">{past.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">📅</span>
                Upcoming Appointments
              </h2>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">{upcoming.length} total</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 dark:text-gray-400">No upcoming appointments</p>
                <button
                  onClick={() => route('/patient/search-doctors')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map(a => (
                  <div key={a.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                    <div className="flex gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-2xl flex-shrink-0">
                        👨‍⚕️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white">{a.doctorName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{a.specialty || 'Consultation'}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">📅 {a.date}</span>
                          <span className="text-gray-700 dark:text-gray-300">⏰ {a.time}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">₹{a.fee}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                          a.paymentStatus === 'paid' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {a.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {a.paymentMode === 'online' ? '💳 Online' : '🏥 At Clinic'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => {
                          route(`/patient/consultation/${a.id}`)
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Join Consultation
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this appointment?')) {
                            const updated = appointments.filter(x => x.id !== a.id)
                            localStorage.setItem('appointments', JSON.stringify(updated))
                            setAppointments(updated)
                            alert('Appointment cancelled')
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">📜</span>
                Past Appointments
              </h2>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {past.length} total
              </span>
            </div>
            {past.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No past appointments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {past.map(p => (
                  <div key={p.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                        👨‍⚕️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white">{p.doctorName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{p.specialty || 'Consultation'}</div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">📅 {p.date}</span>
                          <span className="text-gray-700 dark:text-gray-300">⏰ {p.time}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">₹{p.fee}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                          ✓ {p.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => route(`/patient/reports?appointment=${p.id}`)}
                        className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        📋 View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  )
}

export default MyAppointments
