import { route } from 'preact-router'

export function HomePage() {
  const handlePatientClick = () => {
    route('/patient/login')
  }

  const handleDoctorClick = () => {
    route('/doctor/login')
  }

  const handleHospitalClick = () => {
    route('/hospital/login')
  }

  const handleNGOClick = () => {
    route('/ngo/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏥</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-600">
              SwasthLink
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Healthcare for Everyone
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Low-bandwidth optimized telemedicine platform connecting rural communities with quality healthcare
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Patient Card */}
            <div
              onClick={handlePatientClick}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-8 text-center border border-gray-200"
            >
              <div className="text-6xl mb-5">🩺</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Patient</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Book consultations, access health records & connect with doctors
              </p>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Login as Patient
              </button>
            </div>

            {/* Doctor Card */}
            <div
              onClick={handleDoctorClick}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-8 text-center border border-gray-200"
            >
              <div className="text-6xl mb-5">👨‍⚕️</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Doctor</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Manage patients, consultations, prescriptions & EMR records
              </p>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Login as Doctor
              </button>
            </div>

            {/* Hospital Admin Card */}
            <div
              onClick={handleHospitalClick}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-8 text-center border border-gray-200"
            >
              <div className="text-6xl mb-5">🏥</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Hospital</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Manage doctors, operations, patient data & hospital resources
              </p>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Login as Hospital
              </button>
            </div>

            {/* NGO Card */}
            <div
              onClick={handleNGOClick}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer p-8 text-center border border-gray-200"
            >
              <div className="text-6xl mb-5">🤝</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">NGO</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Manage programs, volunteers, donations & community impact
              </p>
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Login as NGO
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-900 mb-1">Low Bandwidth</h4>
              <p className="text-gray-600 text-sm">Works on 2G/3G networks</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">🌍</div>
              <h4 className="font-semibold text-gray-900 mb-1">Rural Reach</h4>
              <p className="text-gray-600 text-sm">Bridging healthcare gaps</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
              <p className="text-gray-600 text-sm">Fully encrypted data</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-semibold text-gray-900 mb-1">Instant Connect</h4>
              <p className="text-gray-600 text-sm">Quick consultations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-gray-500 text-sm">
        <p>© 2025 SwasthLink - Empowering Rural Healthcare</p>
      </div>
    </div>
  )
}