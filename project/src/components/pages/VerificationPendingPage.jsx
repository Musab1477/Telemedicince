import { route } from 'preact-router'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'preact/hooks'
import api from '../../utils/api'

export function VerificationPendingPage() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    route('/')
  }

  const [pending, setPending] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pendingDoctorRegistration')
      if (raw) setPending(JSON.parse(raw))
    } catch (err) {
      // ignore
    }
    // if there's a registrationId saved, try to fetch status from API
    async function fetchStatusIfNeeded() {
      try {
        const raw = localStorage.getItem('pendingDoctorRegistration')
        if (!raw) return
        const p = JSON.parse(raw)
        if (p?.registrationId) {
          setLoadingStatus(true)
          const resp = await api.getRegistrationStatus(p.registrationId)
          setServerStatus(resp)
        }
      } catch (err) {
        // ignore
      } finally {
        setLoadingStatus(false)
      }
    }
    fetchStatusIfNeeded()
  }, [])

  async function handleResend() {
    try {
      if (pending?.registrationId) {
        await api.resendRegistration(pending.registrationId)
        alert('Verification request resent to hospital admin. You will be notified when approved.')
        return
      }
    } catch (err) {
      console.warn('Resend failed', err)
    }
    // fallback
    alert('Verification request resent (local mock). You will be notified when approved.')
  }

  async function handleCancelRegistration() {
    if (!confirm('Cancel your pending registration? This will delete the pending request stored locally.')) return
    try {
      if (pending?.registrationId) {
        await api.cancelRegistration(pending.registrationId)
      }
    } catch (err) {
      console.warn('Cancel request failed or not supported', err)
    }
    try { localStorage.removeItem('pendingDoctorRegistration') } catch (err) {}
    setPending(null)
    route('/')
  }

  async function checkStatus() {
    try {
      const raw = localStorage.getItem('pendingDoctorRegistration')
      if (!raw) return alert('No pending registration found')
      const p = JSON.parse(raw)
      if (!p?.registrationId) return alert('No registration id available to check status')
      setLoadingStatus(true)
      const resp = await api.getRegistrationStatus(p.registrationId)
      setServerStatus(resp)
      if (resp?.status === 'approved') alert('Your account has been approved. You will receive access details shortly.')
      else alert(`Current status: ${resp?.status || 'unknown'}`)
    } catch (err) {
      console.warn('Status check failed', err)
      alert('Unable to check status right now. Please try again later.')
    } finally {
      setLoadingStatus(false)
    }
  }

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'doctor': return 'Doctor'
      case 'hospital': return 'Hospital'
      default: return 'Account'
    }
  }

  const getVerificationMessage = () => {
    switch (user?.role) {
      case 'doctor':
        return 'Your doctor registration is being reviewed. You will receive access once your credentials are verified by the hospital administration.'
      case 'hospital':
        return 'Your hospital registration is being reviewed. You will receive access once your documents are verified by the platform administrators.'
      default:
        return 'Your account is pending verification. Please wait for approval.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="card text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {getRoleDisplayName()} Verification Pending
            </h1>
            <p className="text-gray-600 mb-4">
              {getVerificationMessage()}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              {user?.role === 'doctor' && (
                <>
                  <li>• Hospital admin reviews your credentials</li>
                  <li>• Verification typically takes 1-2 business days</li>
                  <li>• You'll receive SMS notification when approved</li>
                </>
              )}
              {user?.role === 'hospital' && (
                <>
                  <li>• Platform admin reviews your documents</li>
                  <li>• Verification typically takes 2-3 business days</li>
                  <li>• You'll receive email notification when approved</li>
                </>
              )}
            </ul>
          </div>

          {pending && (
            <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Your submitted details (local copy)</h3>
              <div className="text-sm text-gray-700 space-y-2 text-left">
                <div><span className="font-medium">Name:</span> {pending.fullName}</div>
                <div><span className="font-medium">Phone:</span> {pending.phone}</div>
                <div><span className="font-medium">Email:</span> {pending.email}</div>
                <div><span className="font-medium">License:</span> {pending.medicalLicense}</div>
                <div><span className="font-medium">Specialization:</span> {pending.specialization}</div>
                <div><span className="font-medium">Hospital Type:</span> {pending.hospitalType}</div>
                <div><span className="font-medium">Uploaded files:</span>
                  <div className="mt-1 text-xs text-gray-600">
                    <div>Degrees: {pending.documents?.degreeFiles?.length ? pending.documents.degreeFiles.join(', ') : 'None'}</div>
                    <div>Certificates: {pending.documents?.certificateFiles?.length ? pending.documents.certificateFiles.join(', ') : 'None'}</div>
                    <div>License Scan: {pending.documents?.licenseScan || 'None'}</div>
                    <div>ID Proof: {pending.documents?.idProof || 'None'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={checkStatus}
              className="btn-primary w-full"
              disabled={loadingStatus}
            >
              {loadingStatus ? 'Checking...' : 'Check Status Again'}
            </button>
            <button 
              onClick={handleLogout}
              className="btn-secondary w-full"
            >
              Logout
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>Need help? Contact support at support@swasthlink.in</p>
          </div>
        </div>
      </div>
    </div>
  )
}