import { route } from 'preact-router'

export function AdminLogin() {
  const handleLogin = (e) => {
    e.preventDefault()
    route('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">👑</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Login</h1>
            <p className="text-gray-600">Secure access to platform administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your admin key"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Login as Admin
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-2">Not registered yet?</p>
            <button 
              onClick={() => alert('Admin registration requires special authorization. Contact system administrator.')}
              className="text-red-600 hover:text-red-700 text-sm font-medium mb-4"
            >
              Request Admin Access
            </button>
            <div>
              <button 
                onClick={() => route('/')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}