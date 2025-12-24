import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { PatientLayout } from '../../ui/PatientLayout'

// StarRating Component for detailed feedback
function StarRating({ label, value, onChange }) {
  const [hovered, setHovered] = useState(0)
  
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`text-2xl transition-all ${
              star <= (hovered || value)
                ? 'text-yellow-400 scale-110'
                : 'text-gray-300 dark:text-gray-600'
            } hover:scale-125 cursor-pointer`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

// Mock data fallback
const DOCTORS = {
  d1: {
    id: 'd1',
    name: 'Dr. Rajesh Kumar',
    specialty: 'General Medicine',
    hospital: 'City General Hospital',
    address: '12 MG Road, Central City',
    experience: '15 years',
    rating: 4.5,
    fee: 300,
    offDates: []
  },
  d2: {
    id: 'd2',
    name: 'Dr. Anjali Mehta',
    specialty: 'Pediatrics',
    hospital: 'City General Hospital',
    address: '12 MG Road, Central City',
    experience: '10 years',
    rating: 4.6,
    fee: 350,
    offDates: []
  },
  d3: {
    id: 'd3',
    name: 'Dr. Suresh Patil',
    specialty: 'General Medicine',
    hospital: 'Rural Health Center',
    address: 'Village Lane, Northside',
    experience: '12 years',
    rating: 4.0,
    fee: 250,
    offDates: []
  },
  d4: {
    id: 'd4',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiology',
    hospital: 'Apollo Clinic',
    address: '7 Park Avenue',
    experience: '8 years',
    rating: 4.7,
    fee: 400,
    offDates: []
  },
  d5: {
    id: 'd5',
    name: 'Dr. Vikram Joshi',
    specialty: 'Orthopedics',
    hospital: 'Apollo Clinic',
    address: '7 Park Avenue',
    experience: '9 years',
    rating: 4.4,
    fee: 380,
    offDates: []
  },
  d6: {
    id: 'd6',
    name: 'Dr. Paras Patel',
    specialty: 'Diabetologist',
    hospital: 'Individual',
    address: '7 Park Avenue',
    experience: '6 years',
    rating: 4.6,
    fee: 600,
    offDates: []
  }
}

const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

function loadAppointments() {
  try { return JSON.parse(localStorage.getItem('appointments') || '[]') } catch (e) { return [] }
}

function saveAppointments(list) {
  localStorage.setItem('appointments', JSON.stringify(list))
}

function formatDateISO(d) {
  return d.toISOString().split('T')[0]
}

export function DoctorProfile({ id, doctorData }) {
  // Accept doctor data passed from SearchDoctor or from sessionStorage
  const key = id == null ? 'd1' : String(id)
  
  // Parse passed doctor data or use fallback from mock data
  const parseDoctor = () => {
    // Try to get data from sessionStorage first (set by SearchDoctor)
    let passedData = doctorData
    if (!passedData) {
      try {
        const stored = sessionStorage.getItem('selectedDoctorData')
        if (stored) {
          passedData = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Could not parse stored doctor data:', e)
      }
    }

    if (passedData) {
      // Data from SearchDoctor - API response format
      return {
        id: passedData.id || id,
        name: `Dr. ${passedData.first_name || ''} ${passedData.last_name || ''}`.trim(),
        specialty: passedData.specialization || passedData.specialty || 'Medical Professional',
        hospital: passedData.hospital_name || passedData.hospital || 'Independent Practice',
        address: passedData.address || '',
        experience: passedData.experience || '5+ years',
        fee: passedData.consultation_fee || passedData.fee || 500,
        rating: passedData.rating || 4.5,
        email: passedData.email || '',
        mobile: passedData.mobile_number || '',
        offDates: passedData.off_dates || []
      }
    }
    // Fallback to mock data
    const mockDoctor = DOCTORS[key] || DOCTORS['d1']
    return mockDoctor
  }

  const [doctor, setDoctor] = useState(parseDoctor)

  // detect if we were opened from a hospital details page
  let fromHospitalId = null
  try {
    const params = new URLSearchParams(window.location.search)
    const fh = params.get('fromHospital')
    if (fh) fromHospitalId = Number(fh)
  } catch (e) {
    // ignore
  }

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [days, setDays] = useState([])
  const [isBooking, setIsBooking] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState({
    knowledge: 0,
    communication: 0,
    punctuality: 0,
    treatment: 0,
    comment: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Fetch available slots from API when doctor profile loads
  useEffect(() => {
    if (!doctor || !doctor.id) return

    const fetchAvailableSlots = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.warn('⚠️ No auth token, using mock slots')
        // Use default slots if no token
        const arr = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          arr.push({
            date: formatDateISO(d),
            display: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            isWeekend: d.getDay() === 0,
            slots: DEFAULT_SLOTS
          })
        }
        setDays(arr)
        return
      }

      setIsLoadingSlots(true)
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        const url = `${baseUrl}doctor/available-slots/${doctor.id}/`

        console.log('📥 Fetching Available Slots:')
        console.log('URL:', url)
        console.log('Doctor ID:', doctor.id)

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Response Status:', response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('❌ Failed to fetch slots:', response.status, errorData)
          throw new Error(`Failed to fetch slots (Status: ${response.status})`)
        }

        const result = await response.json()
        console.log('✅ Slots fetched successfully:', result)

        // Parse API response and convert to component format
        if (result.data && Array.isArray(result.data)) {
          const daysWithSlots = result.data.map(dayData => ({
            date: dayData.date,
            display: `${dayData.day.substring(0, 3)} ${dayData.date.split('-')[2]}`,
            isWeekend: false,
            slots: dayData.slots.map(slot => ({
              start_time: slot.start_time,
              end_time: slot.end_time,
              display: `${slot.start_time} - ${slot.end_time}`,
              is_available: slot.is_available
            }))
          }))

          console.log('📦 Formatted Days with Slots:', daysWithSlots)
          setDays(daysWithSlots)
        }
      } catch (error) {
        console.error('❌ Error fetching slots:', error)
        // Fallback to default slots on error
        const arr = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          arr.push({
            date: formatDateISO(d),
            display: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
            isWeekend: d.getDay() === 0,
            slots: DEFAULT_SLOTS.map(time => ({
              display: time,
              start_time: time,
              end_time: time
            }))
          })
        }
        setDays(arr)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [doctor])
  
  useEffect(() => {
    if (!selectedDate) return
    const appointments = loadAppointments()
    const booked = appointments
      .filter(a => a.doctorId === doctor.id && a.date === selectedDate)
      .map(a => a.time)
    setBookedSlots(booked)
    setSelectedSlot(null)
  }, [selectedDate, doctor])

  const availableSlots = selectedDate 
    ? days.find(d => d.date === selectedDate)?.slots || []
    : []

  const isDateDisabled = (d) => {
    // No dates are disabled - use all available slots from API
    return false
  }

  function handleBook() {
    if (!selectedDate || !selectedSlot) return alert('Please select a date and time')
    
    // Store booking data for payment page
    const bookingData = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: selectedDate,
      time: selectedSlot.display || selectedSlot,
      fee: doctor.fee
    }
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    
    // Navigate to payment page
    route('/patient/payment')
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    
    if (!rating) return alert('Please select an overall rating')
    if (!feedback.comment.trim()) return alert('Please enter feedback')

    const token = localStorage.getItem('accessToken')
    if (!token) return alert('Please login to submit feedback')

    setIsSubmittingFeedback(true)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}doctor/add-feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          overall_rating: rating,
          knowledge_rating: feedback.knowledge,
          communication_rating: feedback.communication,
          punctuality_rating: feedback.punctuality,
          treatment_rating: feedback.treatment,
          comment: feedback.comment
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setSubmitted(true)
      setRating(0)
      setFeedback({
        knowledge: 0,
        communication: 0,
        punctuality: 0,
        treatment: 0,
        comment: ''
      })
      
      // Reset submission message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  // Show error if no doctor data available
  if (!doctor) {
    return (
      <PatientLayout title="Doctor Not Found" subtitle="This doctor is unavailable" showSidebar={false}>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Doctor not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The doctor you're looking for is not available.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout title="Book Consultation" subtitle={`Schedule appointment with ${doctor.name}`} showSidebar={false}>
      <div className="max-w-5xl mx-auto">
        {/* Custom Back Button */}
        <button
          onClick={() => {
            // Use browser's back button to maintain navigation flow
            window.history.back()
          }}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center text-4xl flex-shrink-0">👨‍⚕️</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{doctor.name}</h2>
              <div className="text-green-600 dark:text-green-400 font-medium text-lg">{doctor.specialty}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                <span>{doctor.hospital}</span>
                {doctor.address ? (
                  <>
                    <span> • </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:underline"
                    >
                      {doctor.address}
                    </a>
                  </>
                ) : null}
                <span> • {doctor.experience}</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-gray-700 dark:text-gray-300">⭐ {doctor.rating}</span>
                <span className="text-gray-700 dark:text-gray-300">•</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">₹{doctor.fee} Consultation Fee</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Date</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {days.map(d => {
                const disabled = isDateDisabled(d.date)
                const isSelected = selectedDate === d.date
                return (
                  <button
                    key={d.date}
                    disabled={disabled}
                    onClick={() => !disabled && setSelectedDate(d.date)}
                    className={`min-w-[110px] p-3 rounded-lg text-left border transition-all ${disabled ? 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-600' : isSelected ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:shadow hover:border-green-300 dark:hover:border-green-600'} `}
                  >
                    <div className="text-sm font-medium">{d.display}</div>
                    <div className="text-xs mt-1 opacity-80">{new Date(d.date).toLocaleDateString()}</div>
                    {disabled && <div className="text-xs text-red-500 dark:text-red-400 mt-1">Unavailable</div>}
                  </button>
                )
              })}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Available Time Slots</h3>
              {selectedDate ? (
                availableSlots.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">No slots available on this date.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map((slot, idx) => {
                      const slotKey = typeof slot === 'string' ? slot : (slot.display || `${slot.start_time}-${slot.end_time}`)
                      const isSelected = selectedSlot === slot
                      const isBooked = slot.is_available === false
                      return (
                        <button
                          key={idx}
                          onClick={() => !isBooked && setSelectedSlot(slot)}
                          disabled={isBooked}
                          className={`py-3 px-3 rounded-lg border text-sm font-medium transition-all relative ${
                            isBooked 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-60' 
                              : isSelected 
                              ? 'bg-green-600 text-white border-green-600 shadow-md' 
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-green-300 dark:hover:border-green-600'
                          }`}
                        >
                          <div>{typeof slot === 'string' ? slot : slot.display || `${slot.start_time} - ${slot.end_time}`}</div>
                          {isBooked && <div className="text-xs mt-1 font-semibold text-red-500 dark:text-red-400">Booked</div>}
                        </button>
                      )
                    })}
                  </div>
                )
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">Please select a date to view available slots.</div>
              )}
            </div>
          </div>

          <aside className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Doctor: <span className="font-medium text-gray-900 dark:text-white">{doctor.name}</span></div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">Specialty: <span className="font-medium text-gray-900 dark:text-white">{doctor.specialty}</span></div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">Fee: <span className="font-medium text-green-600 dark:text-green-400">₹{doctor.fee}</span></div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Selected Date</div>
              <div className="font-medium text-gray-900 dark:text-white">{selectedDate || '-'}</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">Selected Time</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {selectedSlot 
                  ? (typeof selectedSlot === 'string' ? selectedSlot : (selectedSlot.display || `${selectedSlot.start_time} - ${selectedSlot.end_time}`))
                  : '-'
                }
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedDate || !selectedSlot}
              className={`w-full py-3 rounded-lg text-white font-medium transition-all ${(!selectedDate || !selectedSlot) ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}`}
            >
              {`Proceed to Payment - ₹${doctor.fee}`}
            </button>
          </aside>
        </div>

        {/* Feedback Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate This Doctor</h3>
          
          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-green-800 dark:text-green-300 font-medium">Thank you for your feedback!</p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">Your review helps other patients choose the right doctor.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback}>
              {/* Overall Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={`text-4xl transition-all ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 scale-110'
                          : 'text-gray-300 dark:text-gray-600'
                      } hover:scale-125 cursor-pointer`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Detailed Ratings */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rate Specific Aspects:</h4>
                
                <StarRating
                  label="Knowledge & Expertise"
                  value={feedback.knowledge}
                  onChange={(val) => setFeedback({ ...feedback, knowledge: val })}
                />
                
                <StarRating
                  label="Communication"
                  value={feedback.communication}
                  onChange={(val) => setFeedback({ ...feedback, communication: val })}
                />
                
                <StarRating
                  label="Punctuality"
                  value={feedback.punctuality}
                  onChange={(val) => setFeedback({ ...feedback, punctuality: val })}
                />
                
                <StarRating
                  label="Treatment Effectiveness"
                  value={feedback.treatment}
                  onChange={(val) => setFeedback({ ...feedback, treatment: val })}
                />
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  value={feedback.comment}
                  onInput={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  placeholder="Share your experience with this doctor..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !rating}
                  className={`flex-1 text-white py-3 rounded-lg font-medium transition-colors shadow-md ${
                    isSubmittingFeedback || !rating
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRating(0)
                    setFeedback({
                      knowledge: 0,
                      communication: 0,
                      punctuality: 0,
                      treatment: 0,
                      comment: ''
                    })
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}