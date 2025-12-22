import { useState, useEffect, useRef } from 'preact/hooks'
import { route } from 'preact-router'
import { useI18n } from '../../../contexts/I18nContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useNetwork } from '../../../contexts/NetworkContext'
import { Toast } from '../../ui/Toast'
import { Loader } from '../../ui/Loader'

// Mock patient data for consultation
const MOCK_CONSULTATION_DATA = {
  apt_001: {
    id: 'apt_001',
    patient: {
      id: 'pat_001',
      name: 'Priya Sharma',
      age: 28,
      gender: 'Female',
      phone: '+91 9876543210'
    },
    appointmentTime: '09:00 AM',
    symptoms: 'Fever and headache for 3 days',
    urgency: 'medium',
    type: 'video',
    status: 'scheduled'
  },
  apt_002: {
    id: 'apt_002',
    patient: {
      id: 'pat_002',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      phone: '+91 9876543211'
    },
    appointmentTime: '10:30 AM',
    symptoms: 'Chest pain and shortness of breath',
    urgency: 'high',
    type: 'audio',
    status: 'in_progress'
  }
}

const CONNECTION_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
  FAILED: 'failed'
}

export function ConsultationRoom({ appointmentId }) {
  const { t } = useI18n()
  const { user } = useAuth()
  const { isOffline, connectionSpeed } = useNetwork()
  const [consultation, setConsultation] = useState(null)
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.CONNECTING)
  const [callType, setCallType] = useState('video') // 'video' or 'audio'
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [networkQuality, setNetworkQuality] = useState('good')
  const [ended, setEnded] = useState(false)
  const [callSummary, setCallSummary] = useState(null)
  
  const videoRef = useRef()
  const remoteVideoRef = useRef()
  const callTimerRef = useRef()

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  // Load consultation data
  useEffect(() => {
    const loadConsultation = async () => {
      setIsLoading(true)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Resolve effective appointment id:
        // 1) use appointmentId prop
        // 2) use any queued next_appointment stored in localStorage
        // 3) fallback to first non-completed mock consultation
        let effectiveId = appointmentId
        if (!effectiveId) {
          try {
            const storedNext = localStorage.getItem('next_appointment')
            if (storedNext) {
              effectiveId = storedNext
              // consume it
              localStorage.removeItem('next_appointment')
            }
          } catch (e) {
            // ignore
          }
        }

        if (!effectiveId) {
          effectiveId = Object.keys(MOCK_CONSULTATION_DATA).find(id => MOCK_CONSULTATION_DATA[id].status !== 'completed') || Object.keys(MOCK_CONSULTATION_DATA)[0]
        }

        const consultationData = MOCK_CONSULTATION_DATA[effectiveId]
        if (!consultationData) {
          showToast('Consultation not found', 'error')
          route('/doctor/dashboard')
          return
        }
        
  setConsultation(consultationData)
        setCallType(consultationData.type)
        
        // Initialize mock chat messages
        setChatMessages([
          {
            id: 1,
            sender: 'patient',
            message: 'Hello Doctor, I can hear you clearly',
            timestamp: new Date(Date.now() - 300000).toISOString()
          }
        ])
        
      } catch (error) {
        console.error('Error loading consultation:', error)
        showToast('Failed to load consultation', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadConsultation()
  }, [appointmentId])

  // Simulate connection establishment
  useEffect(() => {
    if (!consultation) return

    const establishConnection = async () => {
      setConnectionState(CONNECTION_STATES.CONNECTING)
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (isOffline) {
        setConnectionState(CONNECTION_STATES.FAILED)
        showToast('Cannot connect while offline', 'error')
        return
      }
      
      setConnectionState(CONNECTION_STATES.CONNECTED)
      showToast('Connected to patient', 'success')
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }

    establishConnection()

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [consultation, isOffline])

  // Monitor network quality
  useEffect(() => {
    if (connectionSpeed === 'slow') {
      setNetworkQuality('poor')
      if (callType === 'video') {
        showToast('Poor connection detected. Consider switching to audio only.', 'warning')
      }
    } else {
      setNetworkQuality('good')
    }
  }, [connectionSpeed, callType])

  // Auto-reconnect logic
  useEffect(() => {
    if (connectionState === CONNECTION_STATES.DISCONNECTED && !isOffline) {
      setConnectionState(CONNECTION_STATES.RECONNECTING)
      
      setTimeout(() => {
        setConnectionState(CONNECTION_STATES.CONNECTED)
        showToast('Reconnected successfully', 'success')
      }, 3000)
    }
  }, [connectionState, isOffline])

  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted)
    showToast(isAudioMuted ? 'Microphone unmuted' : 'Microphone muted', 'info')
  }

  const toggleVideo = () => {
    setIsVideoMuted(!isVideoMuted)
    showToast(isVideoMuted ? 'Camera enabled' : 'Camera disabled', 'info')
  }

  const switchToAudio = () => {
    setCallType('audio')
    setIsVideoMuted(true)
    showToast('Switched to audio-only mode', 'info')
  }

  const switchToVideo = () => {
    if (networkQuality === 'poor') {
      showToast('Video quality may be poor due to network conditions', 'warning')
    }
    setCallType('video')
    setIsVideoMuted(false)
    showToast('Switched to video mode', 'info')
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      sender: 'doctor',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate patient response
    setTimeout(() => {
      const responses = [
        'Thank you, Doctor',
        'I understand',
        'Yes, that makes sense',
        'I will follow your advice'
      ]
      
      const response = {
        id: Date.now() + 1,
        sender: 'patient',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      }
      
      setChatMessages(prev => [...prev, response])
    }, 2000)
  }

  const endConsultation = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
    }
    // mark consultation completed in mock data
    try {
      if (consultation && consultation.id) {
        const now = new Date().toISOString()
        // update mock
        if (MOCK_CONSULTATION_DATA[consultation.id]) {
          MOCK_CONSULTATION_DATA[consultation.id] = {
            ...MOCK_CONSULTATION_DATA[consultation.id],
            status: 'completed',
            endedAt: now,
            durationSeconds: callDuration
          }
        }
        // persist minimal state so dashboard or next session can read it
        try {
          const persisted = JSON.parse(localStorage.getItem('mock_consultations') || '{}')
          persisted[consultation.id] = MOCK_CONSULTATION_DATA[consultation.id]
          localStorage.setItem('mock_consultations', JSON.stringify(persisted))
        } catch (e) {
          // ignore persistence errors
        }

        // prepare summary for UI
        setCallSummary({
          appointmentId: consultation.id,
          patient: consultation.patient,
          durationSeconds: callDuration,
          endedAt: new Date().toISOString()
        })
      }
    } catch (e) {
      console.error('Error finalizing consultation:', e)
    }

    showToast('Consultation ended', 'info')
    setEnded(true)
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader type="form" />
          <p className="mt-4">Loading consultation...</p>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Consultation not found</p>
        </div>
      </div>
    )
  }

  // If the consultation has just ended, show summary and the remaining patient list
  if (ended && callSummary) {
    const remaining = Object.keys(MOCK_CONSULTATION_DATA)
      .map(id => ({ id, ...MOCK_CONSULTATION_DATA[id] }))
      .filter(item => item.status !== 'completed')

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultation completed</h2>
          <p className="text-sm text-gray-600 mb-4">Summary for {callSummary.patient.name}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Patient</div>
              <div className="font-medium text-gray-900">{callSummary.patient.name}</div>
              <div className="text-sm text-gray-600">{callSummary.patient.age} • {callSummary.patient.gender}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium text-gray-900">{formatDuration(callSummary.durationSeconds)}</div>
              <div className="text-sm text-gray-600">Ended: {new Date(callSummary.endedAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Remaining Patients Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Remaining Patients
            </h3>
            {remaining.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✔️</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Done!</div>
                <div className="text-gray-600 dark:text-gray-400">No more patients in the queue</div>
              </div>
            ) : (
              <div className="space-y-3">
                {remaining.map(item => (
                  <div key={item.id} className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(item.patient?.name || item.name || 'U')[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{item.patient?.name || item.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{item.type || item.appointmentTime || ''}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          try { localStorage.setItem('next_appointment', item.id) } catch (e) {}
                          route('/doctor/consultationRoom')
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button 
              onClick={() => route(`/doctor/emr/${callSummary.patient.id}`)} 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Open EMR
            </button>
            <button 
              onClick={() => route('/doctor/dashboard')} 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center border-b-2 border-gray-700 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="text-white">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">👨‍⚕️</span>
              {consultation.patient.name}
            </h1>
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <span>{consultation.patient.age} years</span>
              <span>•</span>
              <span>{consultation.patient.gender}</span>
              <span>•</span>
              <span className="text-yellow-400">{consultation.urgency || 'Normal'}</span>
            </p>
          </div>
          
          {/* Modern Connection Status */}
          <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-full border border-gray-600">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              connectionState === CONNECTION_STATES.CONNECTED ? 'bg-green-500' :
              connectionState === CONNECTION_STATES.CONNECTING || connectionState === CONNECTION_STATES.RECONNECTING ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm text-white font-medium capitalize">
              {connectionState === CONNECTION_STATES.RECONNECTING ? 'Reconnecting...' : connectionState}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-white">
          {/* Modern Call Duration */}
          <div className="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-blue-200">{formatDuration(callDuration)}</span>
            </div>
          </div>
          
          {/* Network Quality Badge */}
          {networkQuality === 'poor' && (
            <div className="flex items-center text-orange-400 text-sm bg-orange-500/20 border border-orange-500/30 px-3 py-2 rounded-lg animate-pulse">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Poor Connection</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video/Audio Area */}
        <div className="flex-1 relative">
          {callType === 'video' ? (
            <div className="h-full relative">
              {/* Remote Video */}
              <div className="h-full bg-gray-800 flex items-center justify-center">
                {connectionState === CONNECTION_STATES.CONNECTED ? (
                  <div className="text-center text-white">
                    <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-lg">{consultation.patient.name}</p>
                    <p className="text-sm text-gray-400">Video connected</p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <div className="animate-pulse">
                      <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4"></div>
                    </div>
                    <p className="text-lg">Connecting...</p>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
                {!isVideoMuted ? (
                  <div className="h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-xs">You</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Audio Only Mode
            <div className="h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-48 h-48 bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold mb-2">{consultation.patient.name}</p>
                <p className="text-gray-400">Audio Call</p>
                
                {/* Audio Visualization */}
                <div className="flex justify-center space-x-1 mt-6">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 bg-green-500 rounded-full animate-pulse ${
                        i === 0 ? 'h-4' : i === 1 ? 'h-6' : i === 2 ? 'h-8' : i === 3 ? 'h-6' : 'h-4'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Network Quality Warning */}
          {networkQuality === 'poor' && callType === 'video' && (
            <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Poor connection
                <button
                  onClick={switchToAudio}
                  className="ml-2 underline hover:no-underline"
                >
                  Switch to audio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modern Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-l-2 border-gray-700 flex flex-col shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 border-b-2 border-blue-500">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat Messages
                </h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-white hover:text-gray-200 bg-blue-500/30 p-1 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-md ${
                      msg.sender === 'doctor'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'doctor' ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t-2 border-gray-700 bg-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border-2 border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Controls */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-t-2 border-gray-700 shadow-2xl">
        <div className="flex justify-center items-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all transform hover:scale-110 shadow-lg ${
              isAudioMuted ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-600'
            } text-white`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isAudioMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-110 shadow-lg ${
              isVideoMuted ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-600'
            } text-white`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isVideoMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
          </button>

          {/* Call Type Switch */}
          {callType === 'video' ? (
            <button
              onClick={switchToAudio}
              className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all transform hover:scale-110 shadow-lg border-2 border-blue-500"
              title="Switch to audio only"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={switchToVideo}
              className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all transform hover:scale-110 shadow-lg border-2 border-blue-500"
              title="Switch to video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 shadow-lg ${
              showChat ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-2 border-green-500' : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-gray-600'
            } text-white`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* End Call */}
          <button
            onClick={endConsultation}
            className="p-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all transform hover:scale-110 shadow-2xl border-2 border-red-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.664 1.664M21 21l-1.664-1.664m-7.336 0L3 12l9-9 9 9-9 9z" />
            </svg>
          </button>
        </div>

        {/* Modern Patient Info */}
        <div className="mt-4 text-center">
          <div className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-xl border-2 border-gray-600 shadow-lg">
            <p className="text-sm font-medium text-gray-300">Symptoms:</p>
            <p className="font-semibold">{consultation.symptoms}</p>
            <p className="text-sm mt-1">
              <span className="font-medium text-gray-300">Urgency:</span>
              <span className={`ml-2 capitalize px-2 py-1 rounded-full text-xs font-bold ${
                consultation.urgency === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500' :
                consultation.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500' :
                'bg-green-500/20 text-green-300 border border-green-500'
              }`}>{consultation.urgency}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}