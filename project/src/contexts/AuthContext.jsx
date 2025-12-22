import { createContext } from 'preact'
import { useContext, useState, useEffect } from 'preact/hooks'

// Create the authentication context
const AuthContext = createContext()

// User roles enum
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital',
  ADMIN: 'admin'
}

// Authentication provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('swasthlink_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        localStorage.removeItem('swasthlink_user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = (userData) => {
    try {
      setUser(userData)
      localStorage.setItem('swasthlink_user', JSON.stringify(userData))
      return true
    } catch (error) {
      console.error('Error saving user to localStorage:', error)
      return false
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem('swasthlink_user')
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (!user) return false

    // Patients and admins don't require an explicit verification flag to be considered authenticated
    if (user.role === USER_ROLES.PATIENT || user.role === USER_ROLES.ADMIN) {
      return true
    }

    // Doctors and hospitals must be verified to access protected routes
    return user.isVerified === true
  }

  // Check if user is verified (for doctors and hospitals)
  const isVerified = () => {
    return user && user.isVerified === true
  }

  const contextValue = {
    user,
    isLoading,
    login,
    logout,
    hasRole,
    isAuthenticated,
    isVerified,
    USER_ROLES
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}