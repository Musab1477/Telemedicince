import { useState, useEffect, useRef } from 'preact/hooks'
import { useTranslation } from '../../../contexts/I18nContext'

export function ConsultationLive(props) {
  const { t } = useTranslation()
  // route param from preact-router is available as props.id
  const routeId = props.id || props.bookingId

  // load booking from localStorage (same key used by DoctorProfile)
  const loadAppointments = () => {
    try { return JSON.parse(localStorage.getItem('appointments') || '[]') } catch (e) { return [] }
  }

  const [booking, setBooking] = useState(null)
  const [doctor, setDoctor] = useState(props.doctor || null)
  const [connectionStatus, setConnectionStatus] = useState('connecting') // 'connecting', 'connected', 'reconnecting', 'disconnected'
  const [callType, setCallType] = useState('audio') // 'audio', 'video'
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [networkQuality, setNetworkQuality] = useState('good') // 'poor', 'fair', 'good', 'excellent'
  const [consultationStarted, setConsultationStarted] = useState(false)
  const [consultationDuration, setConsultationDuration] = useState(0)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [doctorOnline, setDoctorOnline] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const durationIntervalRef = useRef(null)

  // Mock consultation setup
  useEffect(() => {
    // Load booking and doctor info based on route id
    if (routeId) {
      const appts = loadAppointments()
      const b = appts.find(a => a.id === routeId)
      if (b) {
        setBooking(b)
        if (!doctor) {
          // create a minimal doctor object from booking data
          setDoctor({
            id: b.doctorId || null,
            name: b.doctorName || 'Doctor',
            specialty: b.doctorSpecialty || ''
          })
        }
      }
    }

    // Simulate connection process
    const connectToConsultation = async () => {
      setConnectionStatus('connecting')
      
      try {
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mock doctor availability check
        const isDoctorAvailable = Math.random() > 0.2 // 80% chance doctor is available
        
        if (isDoctorAvailable) {
          setDoctorOnline(true)
          setConnectionStatus('connected')
          setConsultationStarted(true)
          
          // Start duration timer
          durationIntervalRef.current = setInterval(() => {
            setConsultationDuration(prev => prev + 1)
          }, 1000)
          
          // Simulate network quality changes
          const networkInterval = setInterval(() => {
            const qualities = ['poor', 'fair', 'good', 'excellent']
            const randomQuality = qualities[Math.floor(Math.random() * qualities.length)]
            setNetworkQuality(randomQuality)
          }, 10000)
          
          return () => clearInterval(networkInterval)
        } else {
          setConnectionStatus('disconnected')
        }
      } catch (error) {
        setConnectionStatus('disconnected')
      }
    }

    connectToConsultation()

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [])

  // If booking or doctor data is not available, show a friendly message instead of crashing
  if (!booking && !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-lg">
          <div className="text-4xl mb-4">📞</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('consultation.noActiveConsultation') || 'No active consultation'}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('consultation.noActiveConsultationDesc') || 'We could not find an active consultation for this session. Please check your appointments or try again later.'}</p>
          <div className="flex justify-center space-x-3">
            <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-200 rounded-lg">Go Back</button>
            <a href="/patient/appointments" className="px-4 py-2 bg-blue-600 text-white rounded-lg">My Appointments</a>
          </div>
        </div>
      </div>
    )
  }

  // Auto-reconnect logic
  useEffect(() => {
    if (connectionStatus === 'disconnected' && reconnectAttempts < 3) {
      const reconnectTimer = setTimeout(() => {
        setConnectionStatus('reconnecting')
        setReconnectAttempts(prev => prev + 1)
        
        // Simulate reconnection
        setTimeout(() => {
          if (Math.random() > 0.3) { // 70% success rate
            setConnectionStatus('connected')
            setReconnectAttempts(0)
          } else {
            setConnectionStatus('disconnected')
          }
        }, 3000)
      }, 5000)

      return () => clearTimeout(reconnectTimer)
    }
  }, [connectionStatus, reconnectAttempts])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    if (!isVideoEnabled) {
      setCallType('video')
    } else {
      setCallType('audio')
    }
  }

  const switchToAudio = () => {
    setCallType('audio')
    setIsVideoEnabled(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'patient',
        text: newMessage.trim(),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Mock doctor response
      setTimeout(() => {
        const doctorResponse = {
          id: Date.now() + 1,
          sender: 'doctor',
          text: t('consultation.doctorAutoResponse'),
          timestamp: new Date()
        }
        setChatMessages(prev => [...prev, doctorResponse])
      }, 2000)
    }
  }

  const handleEndConsultation = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
    onEndConsultation({
      duration: consultationDuration,
      bookingId: bookingId
    })
  }

  const renderConnectionStatus = () => {
    if (connectionStatus === 'connecting') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('consultation.connecting')}</h3>
            <p className="text-gray-600">{t('consultation.connectingToDoctor')}</p>
          </div>
        </div>
      )
    }

    if (connectionStatus === 'reconnecting') {
      return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            {t('consultation.reconnecting')} (${reconnectAttempts}/3)
          </div>
        </div>
      )
    }

    if (connectionStatus === 'disconnected') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('consultation.connectionLost')}</h3>
            <p className="text-gray-600 mb-4">{t('consultation.connectionLostDesc')}</p>
            <button onClick={handleEndConsultation} className="btn-primary">
              {t('consultation.endConsultation')}
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  const renderNetworkBanner = () => {
    if (networkQuality === 'poor') {
      return (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span>{t('consultation.poorConnection')}</span>
            <button onClick={switchToAudio} className="text-red-600 underline text-xs">
              {t('consultation.switchToAudio')}
            </button>
          </div>
        </div>
      )
    }

    if (networkQuality === 'fair') {
      return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 text-sm">
          {t('consultation.fairConnection')}
        </div>
      )
    }

    return null
  }

  const renderVideoArea = () => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {callType === 'video' && isVideoEnabled ? (
        <>
          {/* Remote video (doctor) */}
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
          
          {/* Local video (patient) - picture in picture */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
          </div>
        </>
      ) : (
        /* Audio-only mode */
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">{doctor.name}</h3>
            <p className="text-gray-300">{t('consultation.audioCall')}</p>
            
            {/* Audio visualization */}
            <div className="flex justify-center mt-4 space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-1 bg-primary-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connection status overlay */}
      {!doctorOnline && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>{t('consultation.waitingForDoctor')}</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderControls = () => (
    <div className="flex items-center justify-center space-x-4 py-4">
      {/* Mute button */}
      <button
        onClick={toggleMute}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isMuted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMuted ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          )}
        </svg>
      </button>

      {/* Video toggle button */}
      <button
        onClick={toggleVideo}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          !isVideoEnabled ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isVideoEnabled ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-4.5-4.5m0 0L8.5 11.5M18.364 18.364L16.5 16.5m0 0L8.5 8.5" />
          )}
        </svg>
      </button>

      {/* Chat toggle button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* End call button */}
      <button
        onClick={handleEndConsultation}
        className="w-12 h-12 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l1.664 1.664M21 21l-1.664-1.664m0 0L3 3m16.336 16.336L3 3" />
        </svg>
      </button>
    </div>
  )

  const renderChat = () => {
    if (!showChat) return null

    return (
      <div className="fixed right-4 top-4 bottom-20 w-80 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-gray-800">{t('consultation.chat')}</h3>
          <button
            onClick={() => setShowChat(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.sender === 'patient'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('consultation.typeMessage')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {renderConnectionStatus()}
      {renderNetworkBanner()}
      
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{doctor.name}</h1>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-mono text-gray-800">
              {formatDuration(consultationDuration)}
            </div>
            <div className={`text-xs ${
              connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus === 'connected' ? t('consultation.connected') : t('consultation.disconnected')}
            </div>
          </div>
        </div>

        {/* Video/Audio Area */}
        <div className="max-w-4xl mx-auto">
          {renderVideoArea()}
          {renderControls()}
        </div>
      </div>

      {renderChat()}
    </div>
  )
}