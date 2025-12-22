/**
 * OfflineForm - Wrapper component that handles form submissions in offline mode
 * Automatically queues form data for background sync when offline
 */

import { useState } from 'preact/hooks'
import { useNetwork } from '../../contexts/NetworkContext'
import { useTranslation } from '../../contexts/I18nContext'
import { SYNC_ACTIONS, SYNC_PRIORITY } from '../../utils/sync/offlineQueue'

export function OfflineForm({ 
  children, 
  onSubmit, 
  syncAction, 
  priority = SYNC_PRIORITY.MEDIUM,
  className = '',
  ...props 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', 'queued'
  const { isOnline, addToOfflineQueue } = useNetwork()
  const { t } = useTranslation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const formData = new FormData(event.target)
      const data = Object.fromEntries(formData.entries())

      if (isOnline) {
        // Online: submit normally
        await onSubmit(data, event)
        setSubmitStatus('success')
      } else {
        // Offline: queue for background sync
        await addToOfflineQueue(syncAction, data, priority, {
          formId: event.target.id || 'unknown',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
        setSubmitStatus('queued')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${className} ${!isOnline ? 'offline-form' : ''}`}
      {...props}
    >
      {children}
      
      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('form.submitSuccess')}
          </div>
        </div>
      )}
      
      {submitStatus === 'queued' && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('form.queuedForSync')}
          </div>
          <p className="text-sm mt-1 opacity-75">
            {t('form.willSyncWhenOnline')}
          </p>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('form.submitError')}
          </div>
        </div>
      )}
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 text-gray-600 rounded">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
            {t('form.offlineMode')}
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              {isOnline ? t('form.submitting') : t('form.queuing')}
            </span>
          </div>
        </div>
      )}
    </form>
  )
}

// Higher-order component for wrapping existing forms
export function withOfflineSupport(WrappedComponent, syncAction, priority = SYNC_PRIORITY.MEDIUM) {
  return function OfflineEnabledForm(props) {
    return (
      <OfflineForm 
        syncAction={syncAction} 
        priority={priority}
        onSubmit={props.onSubmit}
        className={props.className}
      >
        <WrappedComponent {...props} />
      </OfflineForm>
    )
  }
}

// Specific form wrappers for common use cases
export const OfflineRegistrationForm = (props) => (
  <OfflineForm 
    syncAction={SYNC_ACTIONS.USER_REGISTER} 
    priority={SYNC_PRIORITY.HIGH}
    {...props} 
  />
)

export const OfflineBookingForm = (props) => (
  <OfflineForm 
    syncAction={SYNC_ACTIONS.CONSULTATION_BOOK} 
    priority={SYNC_PRIORITY.HIGH}
    {...props} 
  />
)

export const OfflineEMRForm = (props) => (
  <OfflineForm 
    syncAction={SYNC_ACTIONS.EMR_CREATE} 
    priority={SYNC_PRIORITY.MEDIUM}
    {...props} 
  />
)

export const OfflinePrescriptionForm = (props) => (
  <OfflineForm 
    syncAction={SYNC_ACTIONS.PRESCRIPTION_CREATE} 
    priority={SYNC_PRIORITY.MEDIUM}
    {...props} 
  />
)