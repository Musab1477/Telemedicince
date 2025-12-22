import { useState, useEffect, useContext } from 'preact/hooks'
import { createContext } from 'preact'

// Toast context
const ToastContext = createContext()

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    }

    setToasts(prev => [...prev, toast])

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  // Convenience methods
  const showSuccess = (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration)
  const showError = (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration)
  const showWarning = (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration)
  const showInfo = (message, duration) => addToast(message, TOAST_TYPES.INFO, duration)

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Hook to use toast context
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Individual toast component
function ToastItem({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(toast.id), 300) // Wait for exit animation
  }

  const getToastStyles = () => {
    const baseStyles = 'flex items-center p-4 mb-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform'
    
    const typeStyles = {
      [TOAST_TYPES.SUCCESS]: 'bg-green-50 border-green-400 text-green-800',
      [TOAST_TYPES.ERROR]: 'bg-red-50 border-red-400 text-red-800',
      [TOAST_TYPES.WARNING]: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      [TOAST_TYPES.INFO]: 'bg-blue-50 border-blue-400 text-blue-800'
    }

    const animationStyles = isRemoving 
      ? 'translate-x-full opacity-0' 
      : isVisible 
        ? 'translate-x-0 opacity-100' 
        : 'translate-x-full opacity-0'

    return `${baseStyles} ${typeStyles[toast.type]} ${animationStyles}`
  }

  const getIcon = () => {
    const iconStyles = 'w-5 h-5 mr-3 flex-shrink-0'
    
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg className={`${iconStyles} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case TOAST_TYPES.ERROR:
        return (
          <svg className={`${iconStyles} text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case TOAST_TYPES.WARNING:
        return (
          <svg className={`${iconStyles} text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case TOAST_TYPES.INFO:
      default:
        return (
          <svg className={`${iconStyles} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={handleRemove}
        className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Toast container component
function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-sm">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}

// Simple standalone Toast component for direct use
export function Toast({ message, type = 'info', onClose, className = '' }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose && onClose(), 300)
  }

  const getToastStyles = () => {
    const baseStyles = 'fixed top-20 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform max-w-sm'
    
    const typeStyles = {
      success: 'bg-green-50 border-green-400 text-green-800',
      error: 'bg-red-50 border-red-400 text-red-800',
      warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      info: 'bg-blue-50 border-blue-400 text-blue-800'
    }

    const animationStyles = isVisible 
      ? 'translate-x-0 opacity-100' 
      : 'translate-x-full opacity-0'

    return `${baseStyles} ${typeStyles[type]} ${animationStyles} ${className}`
  }

  const getIcon = () => {
    const iconStyles = 'w-5 h-5 mr-3 flex-shrink-0'
    
    switch (type) {
      case 'success':
        return (
          <svg className={`${iconStyles} text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className={`${iconStyles} text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'warning':
        return (
          <svg className={`${iconStyles} text-yellow-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'info':
      default:
        return (
          <svg className={`${iconStyles} text-blue-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (!isVisible && !onClose) return null

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}