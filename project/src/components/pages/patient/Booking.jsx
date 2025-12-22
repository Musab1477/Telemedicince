import { route } from 'preact-router'

export function Booking({ doctorId }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button 
              onClick={() => route(`/patient/doctor/${doctorId}`)}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Book Consultation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking System</h2>
          <p className="text-gray-600 mb-6">This feature will be implemented in the next phase</p>
          
          <button 
            onClick={() => route('/patient/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}