import { useState, useEffect } from 'preact/hooks'
import { useTranslation } from '../../../contexts/I18nContext'

export function PaymentLight({ amount, doctorName, bookingDetails, onPaymentSuccess, onBack }) {
  const { t } = useTranslation()
  const [paymentMethod, setPaymentMethod] = useState('upi') // 'upi', 'sms'
  const [upiId, setUpiId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending') // 'pending', 'processing', 'success', 'failed'
  const [errors, setErrors] = useState({})

  // Generate UPI QR code (mock implementation)
  useEffect(() => {
    if (paymentMethod === 'upi') {
      // Mock UPI QR code generation
      const upiString = `upi://pay?pa=doctor@paytm&pn=${encodeURIComponent(doctorName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Consultation with ${doctorName}`)}`
      
      // In a real implementation, you would generate an actual QR code
      // For now, we'll use a placeholder
      setQrCode(`data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="40" y="40" width="120" height="120" fill="white"/>
          <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">UPI QR</text>
          <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="10" fill="black">₹${amount}</text>
        </svg>
      `)}`)
    }
  }, [paymentMethod, amount, doctorName])

  const validateUpiId = (upi) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
    return upiRegex.test(upi)
  }

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  }

  const handleUpiPayment = async () => {
    const newErrors = {}
    
    if (!upiId) {
      newErrors.upiId = t('payment.upiIdRequired')
    } else if (!validateUpiId(upiId)) {
      newErrors.upiId = t('payment.invalidUpiId')
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock success (90% success rate)
      if (Math.random() > 0.1) {
        setPaymentStatus('success')
        setTimeout(() => {
          onPaymentSuccess({
            method: 'upi',
            transactionId: `TXN${Date.now()}`,
            amount: amount,
            upiId: upiId
          })
        }, 1000)
      } else {
        setPaymentStatus('failed')
      }
    } catch (error) {
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSmsPayment = async () => {
    const newErrors = {}
    
    if (!phoneNumber) {
      newErrors.phoneNumber = t('payment.phoneRequired')
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = t('payment.invalidPhone')
    }

    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      // Mock SMS payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success
      setPaymentStatus('success')
      setTimeout(() => {
        onPaymentSuccess({
          method: 'sms',
          transactionId: `SMS${Date.now()}`,
          amount: amount,
          phoneNumber: phoneNumber
        })
      }, 1000)
    } catch (error) {
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetryPayment = () => {
    setPaymentStatus('pending')
    setErrors({})
  }

  const renderPaymentMethods = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 mb-4">{t('payment.selectMethod')}</h3>
      
      <div className="grid gap-4">
        {/* UPI Payment */}
        <button
          onClick={() => setPaymentMethod('upi')}
          className={`p-4 text-left rounded-lg border-2 transition-colors ${
            paymentMethod === 'upi'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{t('payment.upiPayment')}</h4>
              <p className="text-sm text-gray-600">{t('payment.upiDescription')}</p>
            </div>
          </div>
        </button>

        {/* SMS Payment */}
        <button
          onClick={() => setPaymentMethod('sms')}
          className={`p-4 text-left rounded-lg border-2 transition-colors ${
            paymentMethod === 'sms'
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{t('payment.smsPayment')}</h4>
              <p className="text-sm text-gray-600">{t('payment.smsDescription')}</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderUpiPayment = () => (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="card text-center">
        <h4 className="font-medium text-gray-800 mb-4">{t('payment.scanQrCode')}</h4>
        <div className="flex justify-center mb-4">
          <img src={qrCode} alt="UPI QR Code" className="w-48 h-48 border border-gray-200 rounded-lg" />
        </div>
        <p className="text-sm text-gray-600 mb-2">{t('payment.scanWithUpiApp')}</p>
        <p className="text-lg font-bold text-primary-600">₹{amount}</p>
      </div>

      {/* Manual UPI ID Entry */}
      <div className="card">
        <h4 className="font-medium text-gray-800 mb-4">{t('payment.orEnterUpiId')}</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.upiId')} *
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => {
                setUpiId(e.target.value)
                if (errors.upiId) {
                  setErrors(prev => ({ ...prev, upiId: '' }))
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.upiId ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="yourname@paytm"
              disabled={isProcessing}
            />
            {errors.upiId && (
              <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
            )}
          </div>

          <button
            onClick={handleUpiPayment}
            disabled={isProcessing || !upiId}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isProcessing ? t('payment.processing') : `${t('payment.payNow')} ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  )

  const renderSmsPayment = () => (
    <div className="space-y-6">
      <div className="card">
        <h4 className="font-medium text-gray-800 mb-4">{t('payment.smsPaymentDetails')}</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('payment.phoneNumber')} *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (errors.phoneNumber) {
                  setErrors(prev => ({ ...prev, phoneNumber: '' }))
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="9876543210"
              disabled={isProcessing}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">{t('payment.howSmsWorks')}</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t('payment.smsStep1')}</li>
              <li>• {t('payment.smsStep2')}</li>
              <li>• {t('payment.smsStep3')}</li>
            </ul>
          </div>

          <button
            onClick={handleSmsPayment}
            disabled={isProcessing || !phoneNumber}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isProcessing ? t('payment.sendingSms') : `${t('payment.sendSms')} ₹${amount}`}
          </button>
        </div>
      </div>
    </div>
  )

  const renderPaymentStatus = () => {
    if (paymentStatus === 'processing') {
      return (
        <div className="card text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('payment.processingPayment')}</h3>
          <p className="text-gray-600">{t('payment.pleaseWait')}</p>
        </div>
      )
    }

    if (paymentStatus === 'success') {
      return (
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('payment.paymentSuccessful')}</h3>
          <p className="text-gray-600">{t('payment.redirectingToConfirmation')}</p>
        </div>
      )
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="card text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('payment.paymentFailed')}</h3>
          <p className="text-gray-600 mb-4">{t('payment.paymentFailedDesc')}</p>
          <button onClick={handleRetryPayment} className="btn-primary">
            {t('payment.retryPayment')}
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-4">{t('payment.paymentSummary')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('payment.doctor')}:</span>
            <span className="font-medium">{doctorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('payment.date')}:</span>
            <span className="font-medium">{bookingDetails.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('payment.time')}:</span>
            <span className="font-medium">{bookingDetails.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('payment.consultationType')}:</span>
            <span className="font-medium">{bookingDetails.type}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-medium text-gray-800">{t('payment.totalAmount')}:</span>
            <span className="font-bold text-primary-600">₹{amount}</span>
          </div>
        </div>
      </div>

      {paymentStatus === 'pending' && (
        <>
          {renderPaymentMethods()}
          {paymentMethod === 'upi' && renderUpiPayment()}
          {paymentMethod === 'sms' && renderSmsPayment()}
        </>
      )}

      {renderPaymentStatus()}

      {paymentStatus === 'pending' && (
        <div className="flex justify-between">
          <button onClick={onBack} className="btn-secondary">
            ← {t('common.back')}
          </button>
        </div>
      )}
    </div>
  )
}