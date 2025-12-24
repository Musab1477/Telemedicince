import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

function loadAppointments() {
  try { return JSON.parse(localStorage.getItem('appointments') || '[]') } catch (e) { return [] }
}

function saveAppointments(list) {
  localStorage.setItem('appointments', JSON.stringify(list))
}

export function Payment() {
  const [bookingData, setBookingData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true)
      console.log('✅ Razorpay loaded')
    } else {
      console.warn('⚠️ Razorpay not loaded')
    }
  }, [])

  useEffect(() => {
    const data = localStorage.getItem('pendingBooking')
    if (!data) {
      alert('No booking information found')
      route('/patient/dashboard')
      return
    }
    setBookingData(JSON.parse(data))
  }, [])

  // Extract start time from slot string like "09:00 AM - 10:00 AM" -> "09:00"
  const extractStartTime = (timeSlot) => {
    if (!timeSlot) return timeSlot
    if (timeSlot.includes('-')) {
      const startPart = timeSlot.split('-')[0].trim() // "09:00 AM"
      // Convert "09:00 AM" to "09:00" (24-hour format)
      const match = startPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (match) {
        let hours = parseInt(match[1])
        const minutes = match[2]
        const period = match[3]
        if (period) {
          if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
          if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
        }
        return `${String(hours).padStart(2, '0')}:${minutes}`
      }
      return startPart
    }
    return timeSlot
  }

  // Extract end time from slot string like "09:00 AM - 10:00 AM" -> "10:00"
  const extractEndTime = (timeSlot) => {
    if (!timeSlot) return timeSlot
    if (timeSlot.includes('-')) {
      const endPart = timeSlot.split('-')[1].trim() // "10:00 AM"
      // Convert "10:00 AM" to "10:00" (24-hour format)
      const match = endPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (match) {
        let hours = parseInt(match[1])
        const minutes = match[2]
        const period = match[3]
        if (period) {
          if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
          if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
        }
        return `${String(hours).padStart(2, '0')}:${minutes}`
      }
      return endPart
    }
    // If no dash, calculate 1 hour later
    const match = timeSlot.match(/(\d{1,2}):(\d{2})/)
    if (match) {
      const hours = (parseInt(match[1]) + 1) % 24
      return `${String(hours).padStart(2, '0')}:${match[2]}`
    }
    return timeSlot
  }

  const handlePayNow = async () => {
    if (!bookingData || !razorpayLoaded) {
      alert('Payment system not ready. Please refresh the page.')
      return
    }

    setIsProcessing(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Please login to continue')
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      console.log('🌐 API Base URL:', apiBaseUrl)
      console.log('📡 Creating Razorpay Order...')
      
      const orderResponse = await fetch(`${apiBaseUrl}patient/payments/create-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bookingData.fee
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}))
        console.error('❌ Failed to create order:', errorData)
        throw new Error('Failed to create payment order')
      }

      const orderData = await orderResponse.json()
      console.log('✅ Order created:', orderData)

      const razorpayOrderId = orderData.order_id
      // Razorpay key from environment or config
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_live_YOUR_KEY_HERE'
      
      console.log('🔑 Razorpay Key ID:', razorpayKeyId)
      console.log('📦 Order ID:', razorpayOrderId)
      console.log('💵 Amount in Paise:', bookingData.fee * 100)

      const options = {
        key: razorpayKeyId,
        amount: bookingData.fee * 100,
        currency: 'INR',
        name: 'Telemedicine Appointment',
        description: `Appointment with ${bookingData.doctorName}`,
        order_id: razorpayOrderId,
        
        handler: async function (response) {
          console.log('✅ PAYMENT SUCCESSFUL!')
          console.log('💰 Payment Response:', response)
          console.log('📊 Payment ID:', response.razorpay_payment_id)
          console.log('📦 Order ID:', response.razorpay_order_id)
          console.log('🔐 Signature:', response.razorpay_signature)
          
          try {
            console.log('🔄 अब verify-payment API को call करते हैं...')
            
            const verifyPayload = {
              doctor_id: bookingData.doctorId,
              date: bookingData.date,
              start_time: extractStartTime(bookingData.time),
              end_time: extractEndTime(bookingData.time),
              amount: bookingData.fee,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }
            
            console.log('📤 VERIFY REQUEST PAYLOAD:')
            console.log(JSON.stringify(verifyPayload, null, 2))
            console.log('🌐 URL:', `${apiBaseUrl}patient/payments/verify-payment/`)
            
            const verifyResponse = await fetch(`${apiBaseUrl}patient/payments/verify-payment/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(verifyPayload)
            })

            console.log('📥 VERIFY RESPONSE STATUS:', verifyResponse.status)
            
            const verifyData = await verifyResponse.json()
            console.log('📥 VERIFY RESPONSE DATA:')
            console.log(JSON.stringify(verifyData, null, 2))

            if (!verifyResponse.ok) {
              console.error('❌ PAYMENT VERIFICATION FAILED!')
              console.error('Error:', verifyData)
              throw new Error(verifyData.detail || verifyData.message || 'Payment verification failed')
            }

            console.log('✅ PAYMENT VERIFIED SUCCESSFULLY!')

            const appointments = loadAppointments()
            const newAppt = {
              id: verifyData.appointment_id || 'appt_' + Date.now(),
              doctorId: bookingData.doctorId,
              doctorName: bookingData.doctorName,
              specialty: bookingData.specialty,
              date: bookingData.date,
              time: bookingData.time,
              fee: bookingData.fee,
              status: 'confirmed',
              paymentMode: 'online',
              paymentMethod: 'razorpay',
              paymentStatus: 'paid',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              createdAt: new Date().toISOString()
            }
            
            appointments.push(newAppt)
            saveAppointments(appointments)
            localStorage.removeItem('pendingBooking')
            
            setIsProcessing(false)
            alert(`✅ Payment Successful!\n\nAppointment Confirmed\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nDoctor: ${bookingData.doctorName}`)
            route('/patient/appointments')
          } catch (verifyError) {
            console.error('❌ VERIFICATION ERROR!')
            console.error('Error Message:', verifyError.message)
            console.error('Full Error:', verifyError)
            alert('❌ Payment verification failed: ' + verifyError.message + '\n\nPlease check console for details.')
            setIsProcessing(false)
          }
        },
        
        prefill: {
          name: localStorage.getItem('userFullName') || 'Patient',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        
        theme: { color: '#10B981' },
        
        modal: {
          ondismiss: function() {
            console.log('❌ Payment modal dismissed by user')
            setIsProcessing(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (error) {
      console.error('❌ Payment Error:', error)
      alert(`Payment Error: ${error.message}`)
      setIsProcessing(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading booking details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => {
                localStorage.removeItem('pendingBooking')
                route(`/patient/doctor/${bookingData.doctorId}`)
              }}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Appointment Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Appointment Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-medium text-gray-900">{bookingData.doctorName}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Specialty</span>
                  <span className="font-medium text-gray-900">{bookingData.specialty}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">{bookingData.date}</span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">{bookingData.time}</span>
                </div>
                
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                  <span className="text-green-700 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">₹{bookingData.fee}</span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>ℹ️ Secure Payment:</strong> You will be redirected to Razorpay's secure payment gateway. Your payment information is safe and encrypted.
                </p>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">🧪 Test Mode - Use these credentials:</p>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Card:</strong> 4111 1111 1111 1111</p>
                  <p><strong>Expiry:</strong> Any future date (12/25)</p>
                  <p><strong>CVV:</strong> Any 3 digits (123)</p>
                  <p><strong>UPI:</strong> success@razorpay</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium text-gray-900">{bookingData.doctorName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium text-gray-900">{bookingData.date}</p>
                <p className="font-medium text-gray-900">{bookingData.time}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Consultation Fee</p>
                <p className="text-3xl font-bold text-green-600">₹{bookingData.fee}</p>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isProcessing || !razorpayLoaded}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                isProcessing || !razorpayLoaded
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isProcessing ? '⏳ Processing...' : `Pay ₹${bookingData.fee}`}
            </button>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 text-center">
                ✓ Secured by Razorpay
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Payment

