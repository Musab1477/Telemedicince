import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'

// Mock payment gateways
const PAYMENT_METHODS = {
  UPI: [
    { id: 'gpay', name: 'Google Pay', icon: '🟢' },
    { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
    { id: 'paytm', name: 'Paytm', icon: '🔵' },
    { id: 'upi', name: 'Other UPI', icon: '💳' }
  ],
  CARD: [
    { id: 'credit', name: 'Credit Card', icon: '💳' },
    { id: 'debit', name: 'Debit Card', icon: '💳' }
  ],
  WALLET: [
    { id: 'paytm_wallet', name: 'Paytm Wallet', icon: '👛' },
    { id: 'mobikwik', name: 'MobiKwik', icon: '👛' },
    { id: 'freecharge', name: 'FreeCharge', icon: '👛' }
  ],
  NETBANKING: [
    { id: 'sbi', name: 'State Bank of India', icon: '🏦' },
    { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
    { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
    { id: 'axis', name: 'Axis Bank', icon: '🏦' },
    { id: 'other', name: 'Other Banks', icon: '🏦' }
  ]
}

function loadAppointments() {
  try { return JSON.parse(localStorage.getItem('appointments') || '[]') } catch (e) { return [] }
}

function saveAppointments(list) {
  localStorage.setItem('appointments', JSON.stringify(list))
}

export function Payment() {
  const [bookingData, setBookingData] = useState(null)
  const [paymentMode, setPaymentMode] = useState('online') // 'online' or 'offline'
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('UPI')
  const [processing, setProcessing] = useState(false)
  
  // Card details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })
  
  // UPI details
  const [upiId, setUpiId] = useState('')
  
  // Offline payment details
  const [offlineReference, setOfflineReference] = useState('')

  useEffect(() => {
    // Get booking data from localStorage
    const data = localStorage.getItem('pendingBooking')
    if (!data) {
      alert('No booking information found')
      route('/patient/dashboard')
      return
    }
    setBookingData(JSON.parse(data))
  }, [])

  const handlePaymentSuccess = () => {
    setProcessing(true)
    
    setTimeout(() => {
      // Create appointment
      const appointments = loadAppointments()
      const newAppt = {
        id: 'appt_' + Date.now(),
        doctorId: bookingData.doctorId,
        doctorName: bookingData.doctorName,
        specialty: bookingData.specialty,
        date: bookingData.date,
        time: bookingData.time,
        fee: bookingData.fee,
        status: paymentMode === 'online' ? 'confirmed' : 'pending_payment',
        paymentMode: paymentMode,
        paymentMethod: paymentMode === 'online' ? selectedMethod : 'offline',
        paymentStatus: paymentMode === 'online' ? 'paid' : 'pending',
        paymentReference: paymentMode === 'online' ? `TXN${Date.now()}` : offlineReference,
        createdAt: new Date().toISOString()
      }
      
      appointments.push(newAppt)
      saveAppointments(appointments)
      
      // Clear pending booking
      localStorage.removeItem('pendingBooking')
      
      setProcessing(false)
      
      // Navigate to appointments
      route('/patient/appointments')
      
      setTimeout(() => {
        if (paymentMode === 'online') {
          alert(`Payment successful! ✓\nAppointment confirmed for ${bookingData.date} at ${bookingData.time}`)
        } else {
          alert(`Booking confirmed! Please pay ₹${bookingData.fee} at the clinic.\nAppointment: ${bookingData.date} at ${bookingData.time}`)
        }
      }, 100)
    }, 2000)
  }

  const isFormValid = () => {
    if (paymentMode === 'offline') {
      return true // Offline payment doesn't need validation
    }

    if (!selectedMethod) return false

    if (selectedCategory === 'CARD') {
      return cardDetails.number.length >= 16 && 
             cardDetails.name.length > 0 && 
             cardDetails.expiry.length >= 5 && 
             cardDetails.cvv.length >= 3
    }

    if (selectedCategory === 'UPI' && selectedMethod !== 'upi') {
      return true // Pre-installed apps don't need UPI ID
    }

    if (selectedCategory === 'UPI' && selectedMethod === 'upi') {
      return upiId.includes('@')
    }

    return true
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Mode</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => {
                    setPaymentMode('online')
                    setSelectedMethod(null)
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMode === 'online'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-medium">Pay Online</div>
                  <div className="text-xs text-gray-600 mt-1">Instant confirmation</div>
                </button>

                <button
                  onClick={() => {
                    setPaymentMode('offline')
                    setSelectedMethod('cash')
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMode === 'offline'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-3xl mb-2">💵</div>
                  <div className="font-medium">Pay at Clinic</div>
                  <div className="text-xs text-gray-600 mt-1">Pay during visit</div>
                </button>
              </div>

              {paymentMode === 'online' ? (
                <>
                  {/* Payment Categories */}
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Payment Method</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(PAYMENT_METHODS).map(category => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category)
                            setSelectedMethod(null)
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category === 'UPI' ? 'UPI' : 
                           category === 'CARD' ? 'Card' :
                           category === 'WALLET' ? 'Wallet' : 'Net Banking'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3 mb-6">
                    {PAYMENT_METHODS[selectedCategory].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          selectedMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="font-medium text-gray-900">{method.name}</span>
                        </div>
                        {selectedMethod === method.id && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Payment Details Form */}
                  {selectedMethod && selectedCategory === 'CARD' && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-gray-900">Enter Card Details</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          value={cardDetails.number}
                          onInput={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16)
                            setCardDetails({ ...cardDetails, number: val })
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="JOHN DOE"
                          value={cardDetails.name}
                          onInput={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            placeholder="12/25"
                            maxLength="5"
                            value={cardDetails.expiry}
                            onInput={(e) => {
                              let val = e.target.value.replace(/\D/g, '')
                              if (val.length >= 2) {
                                val = val.slice(0, 2) + '/' + val.slice(2, 4)
                              }
                              setCardDetails({ ...cardDetails, expiry: val })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength="3"
                            value={cardDetails.cvv}
                            onInput={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                              setCardDetails({ ...cardDetails, cvv: val })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'upi' && selectedCategory === 'UPI' && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h4 className="font-medium text-gray-900">Enter UPI ID</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          placeholder="yourname@paytm"
                          value={upiId}
                          onInput={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {selectedMethod && !['credit', 'debit', 'upi'].includes(selectedMethod) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        You will be redirected to complete the payment securely.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Pay at Clinic</h3>
                  <p className="text-sm text-green-800 mb-4">
                    Your appointment will be confirmed. Please pay ₹{bookingData.fee} at the clinic during your visit.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-green-800">
                      <span>✓</span>
                      <span>Bring cash or card to the clinic</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-green-800">
                      <span>✓</span>
                      <span>Payment accepted at reception</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-green-800">
                      <span>✓</span>
                      <span>Get receipt after payment</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Any reference or note..."
                      value={offlineReference}
                      onInput={(e) => setOfflineReference(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-medium text-gray-900">{bookingData.doctorName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Specialty</span>
                  <span className="font-medium text-gray-900">{bookingData.specialty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">{bookingData.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">{bookingData.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">₹{bookingData.fee}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{bookingData.fee}</span>
                </div>
                <p className="text-xs text-gray-500">Inclusive of all taxes</p>
              </div>

              <button
                onClick={handlePaymentSuccess}
                disabled={!isFormValid() || processing}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  !isFormValid() || processing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : paymentMode === 'online'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : paymentMode === 'online' ? (
                  `Pay ₹${bookingData.fee}`
                ) : (
                  'Confirm Booking'
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>🔒</span>
                <span>Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
