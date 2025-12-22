import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('patient')

  // Get role from URL params if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roleParam = urlParams.get('role')
    if (roleParam) {
      setSelectedRole(roleParam)
    }
  }, [])

  const handleRoleChange = (role) => {
    setSelectedRole(role)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Simple navigation to dashboards
    switch (selectedRole) {
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
        alert('Please select a role')
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'patient': return 'Patient'
      case 'doctor': return 'Doctor'
      case 'hospital': return 'Hospital Admin'
      case 'admin': return 'Super Admin'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-600">Access your SwasthLink account</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['patient', 'doctor', 'hospital', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`p-3 text-sm rounded-lg border-2 transition-colors ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {getRoleDisplayName(role)}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+91-XXXXXXXXXX"
              />
            </div>

            {selectedRole !== 'patient' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedRole === 'doctor' ? 'Doctor Key' : 
                   selectedRole === 'hospital' ? 'Hospital Key' : 'Admin Key'}
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your key"
                />
              </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4">
              Login as {getRoleDisplayName(selectedRole)}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => route('/')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}