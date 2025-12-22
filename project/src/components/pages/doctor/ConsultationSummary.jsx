import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

export default function ConsultationSummary({ id }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // load persisted mock consultations
  let consultations = {}
  try {
    const raw = localStorage.getItem('mock_consultations')
    consultations = raw ? JSON.parse(raw) : {}
  } catch (e) {
    consultations = {}
  }

  const appointment = consultations[id]

  if (!appointment) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center max-w-md">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Summary not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No summary available for this consultation.</p>
            <button 
              onClick={() => route('/doctor/consultations')} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Consultations
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Consultation Summary</h1>
            <p className="text-center text-green-100 text-lg">{appointment.patient?.name || 'Unknown patient'}</p>
          </div>

          {/* Patient Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Patient Name</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{appointment.patient?.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {appointment.patient?.age} years • {appointment.patient?.gender}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                    appointment.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {appointment.appointmentTime || (appointment.endedAt ? new Date(appointment.endedAt).toLocaleString() : '—')}
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Consultation Details
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Symptoms</div>
                    <div className="text-gray-900 dark:text-white font-medium mt-1">{appointment.symptoms || '—'}</div>
                  </div>
                </div>
              </div>
              
              {appointment.endedAt && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🕒</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Ended At</div>
                      <div className="text-gray-900 dark:text-white font-medium mt-1">{new Date(appointment.endedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {appointment.durationSeconds != null && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏱️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</div>
                      <div className="text-gray-900 dark:text-white font-medium mt-1">{formatDuration(appointment.durationSeconds)}</div>
                    </div>
                  </div>
                </div>
              )}

              {appointment.type && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{appointment.type === 'video' ? '📹' : '🎙️'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Consultation Type</div>
                      <div className="text-gray-900 dark:text-white font-medium mt-1 capitalize">{appointment.type}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            {appointment.patient?.id && (
              <button 
                onClick={() => {
                  console.log('Open EMR clicked, patient ID:', appointment.patient.id)
                  console.log('Navigating to:', `/doctor/emr/${appointment.patient.id}`)
                  route(`/doctor/emr/${appointment.patient.id}`)
                }} 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Open EMR
              </button>
            )}
            <button 
              onClick={() => route('/doctor/consultations')} 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Back to Consultations
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
