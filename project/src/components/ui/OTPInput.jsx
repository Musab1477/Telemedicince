import { useState, useRef, useEffect } from 'preact/hooks'
import { useI18n } from '../../contexts/I18nContext'

export function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error,
  autoFocus = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  const { t } = useI18n()
  const [otp, setOtp] = useState(value.split('').slice(0, length))
  const inputRefs = useRef([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Update internal state when value prop changes
  useEffect(() => {
    const newOtp = value.split('').slice(0, length)
    while (newOtp.length < length) {
      newOtp.push('')
    }
    setOtp(newOtp)
  }, [value, length])

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index, inputValue) => {
    // Only allow single digit
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    const otpString = newOtp.join('')
    if (onChange) {
      onChange(otpString)
    }

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete when all digits are filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString)
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        
        const otpString = newOtp.join('')
        if (onChange) {
          onChange(otpString)
        }
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    // Handle paste
    else if (e.key === 'Enter') {
      const otpString = otp.join('')
      if (otpString.length === length && onComplete) {
        onComplete(otpString)
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digits = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (digits.length > 0) {
      const newOtp = digits.split('')
      while (newOtp.length < length) {
        newOtp.push('')
      }
      setOtp(newOtp)
      
      const otpString = newOtp.join('')
      if (onChange) {
        onChange(otpString)
      }

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(digit => !digit)
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1
      inputRefs.current[focusIndex]?.focus()

      // Call onComplete if all digits are filled
      if (otpString.length === length && onComplete) {
        onComplete(otpString)
      }
    }
  }

  const handleFocus = (index) => {
    // Select all text when focusing
    inputRefs.current[index]?.select()
  }

  const getInputClassName = (index) => {
    const baseClasses = 'w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200'
    
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : otp[index]
        ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-500 bg-primary-50'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
    
    const disabledClasses = disabled
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
      : 'bg-white text-gray-900'
    
    return `${baseClasses} ${stateClasses} ${disabledClasses} ${inputClassName}`
  }

  return (
    <div className={className}>
      <div className="flex justify-center space-x-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={otp[index] || ''}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={getInputClassName(index)}
            aria-label={`Digit ${index + 1} of ${length}`}
            {...props}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center flex items-center justify-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// OTP verification component with resend functionality
export function OTPVerification({
  phoneNumber,
  onVerify,
  onResend,
  isLoading = false,
  resendCooldown = 30,
  className = '',
  ...otpProps
}) {
  const { t } = useI18n()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)

  // Resend timer countdown
  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleOTPChange = (value) => {
    setOtp(value)
    if (error) setError('')
  }

  const handleOTPComplete = async (value) => {
    if (onVerify) {
      try {
        await onVerify(value)
      } catch (err) {
        setError(err.message || 'Invalid OTP. Please try again.')
      }
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return

    setIsResending(true)
    setError('')
    
    try {
      if (onResend) {
        await onResend()
      }
      setResendTimer(resendCooldown)
      setOtp('')
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const maskedPhoneNumber = phoneNumber 
    ? `${phoneNumber.slice(0, 2)}****${phoneNumber.slice(-2)}`
    : ''

  return (
    <div className={`text-center ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('auth.verifyOTP')}
        </h3>
        <p className="text-sm text-gray-600">
          Enter the 6-digit code sent to {maskedPhoneNumber}
        </p>
      </div>

      <OTPInput
        value={otp}
        onChange={handleOTPChange}
        onComplete={handleOTPComplete}
        disabled={isLoading}
        error={error}
        autoFocus
        className="mb-6"
        {...otpProps}
      />

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0 || isResending}
          className="text-sm text-primary-600 hover:text-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isResending ? (
            'Resending...'
          ) : resendTimer > 0 ? (
            `Resend OTP in ${resendTimer}s`
          ) : (
            'Resend OTP'
          )}
        </button>

        <p className="text-xs text-gray-500">
          Didn't receive the code? Check your SMS or try resending.
        </p>
      </div>
    </div>
  )
}