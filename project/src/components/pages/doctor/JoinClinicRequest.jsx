import { useState } from 'preact/hooks'
import { route } from 'preact-router'

export function JoinClinicRequest() {
  const [searchTerm, setSearchTerm] = useState('')


  const mockHospitals = [
    {
      id: 1,
      name: 'City General Hospital',
      type: 'Government',
      location: 'Mumbai, Maharashtra',
      departments: ['General Medicine', 'Cardiology', 'Pediatrics'],
      doctors: 45,
      rating: 4.2
    },
    {
      id: 2,
      name: 'Apollo Hospital',
      type: 'Private',
      location: 'Delhi, Delhi',
      departments: ['Cardiology', 'Neurology', 'Oncology'],
      doctors: 120,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Rural Health Center',
      type: 'Government',
      location: 'Pune, Maharashtra',
      departments: ['General Medicine', 'Gynecology'],
      doctors: 15,
      rating: 4.0
    }
  ]

  const filteredHospitals = mockHospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendRequest = (hospitalId) => {
    alert(`Request sent to hospital ID: ${hospitalId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button 
              onClick={() => route('/doctor/dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Join Clinic/Hospital</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 sm:mr-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search hospitals by name or location..."
              />
            </div>
            <button 
              onClick={() => route('/doctor/independent')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Independent Practice
            </button>
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredHospitals.length} hospitals found
          </h2>

          {filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🏥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
              <p className="text-gray-600">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHospitals.map(hospital => (
                <div key={hospital.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🏥</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                          <p className="text-blue-600 font-medium">{hospital.type} Hospital</p>
                          <p className="text-gray-600 text-sm">{hospital.location}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>⭐ {hospital.rating}</span>
                            <span>👨‍⚕️ {hospital.doctors} doctors</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-700 font-medium">Departments:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {hospital.departments.map(dept => (
                                <span key={dept} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <button 
                        onClick={() => handleSendRequest(hospital.id)}
                        className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Send Join Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Search for hospitals or clinics you want to join</li>
            <li>• Send a join request with your credentials</li>
            <li>• Hospital admin will review and approve your request</li>
            <li>• Once approved, you'll receive access to their system</li>
            <li>• Alternatively, you can start your independent practice</li>
          </ul>
        </div>
      </div>
    </div>
  )
}