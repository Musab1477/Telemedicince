import { useAuth } from '../../contexts/AuthContext'
import { route } from 'preact-router'
import { useEffect } from 'preact/hooks'

// Component to protect routes that require authentication
export function ProtectedRoute({ children, requiredRole = null, requireVerification = false }) {
  const { user, isAuthenticated, hasRole, isVerified, isLoading } = useAuth()

  console.log('ProtectedRoute - user:', user)
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated())
  console.log('ProtectedRoute - requiredRole:', requiredRole)
  console.log('ProtectedRoute - hasRole:', requiredRole ? hasRole(requiredRole) : 'N/A')
  console.log('ProtectedRoute - isLoading:', isLoading)

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.log('ProtectedRoute - Redirecting to /login (not authenticated)')
      route('/login')
      return
    }

    // Check if specific role is required
    if (requiredRole && !hasRole(requiredRole)) {
      console.log('ProtectedRoute - Redirecting to /unauthorized (wrong role)')
      route('/unauthorized')
      return
    }

    // Check if verification is required (for doctors and hospitals)
    if (requireVerification && !isVerified()) {
      console.log('ProtectedRoute - Redirecting to /verification-pending (not verified)')
      route('/verification-pending')
      return
    }
  }, [user, isLoading, requiredRole, requireVerification])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or authorized
  if (!isAuthenticated() || 
      (requiredRole && !hasRole(requiredRole)) || 
      (requireVerification && !isVerified())) {
    return null
  }

  return children
}

// Component to redirect authenticated users away from auth pages
export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated()) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'patient':
          route('/patient/dashboard')
          break
        case 'doctor':
          route('/doctor/dashboard')
          break
        case 'hospital':
          route('/hospital/dashboard')
          break
        case 'admin':
          route('/admin/dashboard')
          break
        default:
          route('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, user])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if authenticated (will redirect)
  if (isAuthenticated()) {
    return null
  }

  return children
}