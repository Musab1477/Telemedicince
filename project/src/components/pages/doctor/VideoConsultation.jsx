import { useState, useEffect, useRef } from 'preact/hooks'
import { route } from 'preact-router'

export default function VideoConsultation({ appointmentId }) {
  console.log('🎥 VideoConsultation LOADED! appointmentId:', appointmentId)
  
  const [isDark, setIsDark] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [prescription, setPrescription] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoOpened, setVideoOpened] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const videoWindowRef = useRef(null)

  useEffect(() => {
    console.log('🎥 VideoConsultation useEffect running')
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('No token found')
          setLoading(false)
          return
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
        const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'

        console.log('📡 Fetching appointment:', appointmentId)

        const response = await fetch(`${apiUrl}patient/appointments/list/?status=all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📥 Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Appointments data:', data)
          
          const appointmentsArray = Array.isArray(data) ? data : (data.appointments || [])
          const apt = appointmentsArray.find(a => a.id.toString() === appointmentId?.toString())
          
          if (apt) {
            console.log('✅ Found appointment:', apt)
            setAppointment(apt)
            if (apt.doctor_link) {
              setVideoUrl(apt.doctor_link)
            }
          } else {
            setAppointment({
              patient_name: 'Patient',
              appointment_date: new Date().toISOString().split('T')[0],
              start_time: '10:00'
            })
          }
        } else {
          setAppointment({
            patient_name: 'Patient',
            appointment_date: new Date().toISOString().split('T')[0],
            start_time: '10:00'
          })
        }
      } catch (err) {
        console.error('❌ Error:', err)
        setAppointment({
          patient_name: 'Patient',
          appointment_date: new Date().toISOString().split('T')[0],
          start_time: '10:00'
        })
      } finally {
        setLoading(false)
      }
    }

    if (appointmentId) {
      fetchAppointment()
    } else {
      setLoading(false)
      setAppointment({
        patient_name: 'Patient',
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: '10:00'
      })
    }
  }, [appointmentId])

  const openVideoCall = (url) => {
    if (!url) return
    
    // Open in new tab (user can snap it to left side using Win + Left Arrow)
    videoWindowRef.current = window.open(url, '_blank')
    setVideoOpened(true)
    setShowUrlInput(false)
  }

  const handleSavePrescription = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'

      const prescriptionData = {
        appointment_id: appointmentId,
        diagnosis: diagnosis,
        medicines: medicines,
        prescription: prescription,
        notes: notes
      }

      const response = await fetch(`${apiUrl}doctor/prescription/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Failed to save prescription')
      }
    } catch (err) {
      console.error('Error saving prescription:', err)
      alert('Error saving prescription')
    } finally {
      setSaving(false)
    }
  }

  const handleEndConsultation = async () => {
    if (confirm('Are you sure you want to end this consultation?')) {
      if (prescription || diagnosis || medicines) {
        await handleSavePrescription()
      }
      // Close video window if open
      if (videoWindowRef.current && !videoWindowRef.current.closed) {
        videoWindowRef.current.close()
      }
      route('/doctor/consultations')
    }
  }

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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading consultation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        
        {/* Top Header Bar with Video Call Button */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => route('/doctor/consultations')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">📝 Prescription</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{appointment?.patient_name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Video Call Button */}
              {!videoOpened ? (
                videoUrl ? (
                  <button
                    onClick={() => openVideoCall(videoUrl)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 animate-pulse"
                  >
                    🎥 Open Video Call
                  </button>
                ) : (
                  <button
                    onClick={() => setShowUrlInput(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    🔗 Add Video Link
                  </button>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Video Active
                  </span>
                  <button
                    onClick={() => openVideoCall(videoUrl)}
                    className="text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Reopen
                  </button>
                </div>
              )}
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              
              <button
                onClick={handleEndConsultation}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                End
              </button>
            </div>
          </div>
          
          {/* URL Input (shown when clicking Add Video Link) */}
          {showUrlInput && (
            <div className="max-w-4xl mx-auto mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Paste video call URL here..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                id="videoUrlInput"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setVideoUrl(e.target.value)
                    openVideoCall(e.target.value)
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('videoUrlInput')
                  if (input?.value) {
                    setVideoUrl(input.value)
                    openVideoCall(input.value)
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Open
              </button>
              <button
                onClick={() => setShowUrlInput(false)}
                className="text-gray-500 hover:text-gray-700 px-2"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Tip for side-by-side windows */}
          {videoOpened && (
            <div className="max-w-4xl mx-auto mt-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">Win</kbd> + <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">←</kbd> on video window to snap left, then <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">Win</kbd> + <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">→</kbd> on this window to snap right. Both windows will stay visible!
              </p>
            </div>
          )}
        </header>

        {/* Full Page Prescription Form */}
        <main className="max-w-4xl mx-auto p-4 sm:p-6">
          
          {/* Patient Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-2xl">
                {appointment?.patient_name?.[0] || 'P'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {appointment?.patient_name || 'Patient Name'}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>📅 {appointment?.appointment_date || 'Date'}</span>
                  <span>⏰ {appointment?.start_time || 'Time'}</span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    In Consultation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Notification */}
          {saved && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
              <span className="text-xl">✅</span>
              <span className="font-medium">Prescription saved successfully!</span>
            </div>
          )}

          {/* Prescription Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            
            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🩺 Diagnosis
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-lg"
              />
            </div>

            {/* Medicines */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                💊 Medicines
              </label>
              <textarea
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
                placeholder="Tab. Paracetamol 500mg - 1-0-1 x 5 days&#10;Tab. Pantoprazole 40mg - 1-0-0 x 7 days"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono"
              />
              
              {/* Quick Medicine Templates */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setMedicines(prev => prev + (prev ? '\n' : '') + 'Tab. Paracetamol 500mg - 1-0-1 x 5 days')}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200"
                >
                  + Paracetamol
                </button>
                <button
                  onClick={() => setMedicines(prev => prev + (prev ? '\n' : '') + 'Tab. Azithromycin 500mg - 1-0-0 x 3 days')}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200"
                >
                  + Azithromycin
                </button>
                <button
                  onClick={() => setMedicines(prev => prev + (prev ? '\n' : '') + 'Tab. Pantoprazole 40mg - 1-0-0 x 7 days')}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200"
                >
                  + Pantoprazole
                </button>
                <button
                  onClick={() => setMedicines(prev => prev + (prev ? '\n' : '') + 'Tab. Cetirizine 10mg - 0-0-1 x 5 days')}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-200"
                >
                  + Cetirizine
                </button>
              </div>
            </div>

            {/* Prescription / Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📝 Instructions for Patient
              </label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="• Take medicines after food&#10;• Drink plenty of water&#10;• Rest for 2-3 days&#10;• Follow up after 1 week if symptoms persist"
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📋 Private Notes (Not visible to patient)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes for your reference..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSavePrescription}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all"
              >
                {saving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Prescription
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="px-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
