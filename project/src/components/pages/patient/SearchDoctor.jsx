import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { PatientLayout } from '../../ui/PatientLayout'

export function SearchDoctor() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [typeFilter, setTypeFilter] = useState('') // individual | government | private | semi

  // Detect single-hospital mode via query param (hospitalId preferred)
  let singleHospital = false
  let hospitalName = null
  let hospitalId = null
  try {
    const params = new URLSearchParams(window.location.search)
    singleHospital = params.get('singleHospital') === '1' || params.get('singleHospital') === 'true'
    hospitalName = params.get('hospitalName') ? decodeURIComponent(params.get('hospitalName')) : (params.get('hospital') ? decodeURIComponent(params.get('hospital')) : null)
    hospitalId = params.get('hospitalId') ? Number(params.get('hospitalId')) : null
    if (hospitalId) singleHospital = true
  } catch (e) {
    // ignore
  }

  // Expanded mock doctors (ids as string keys to match doctor profile keys)
  const mockDoctors = [
    {
      id: 'd1',
      name: 'Dr. Rajesh Kumar',
      specialty: 'General Medicine',
      hospital: 'City General Hospital',
      area: 'Central',
      diseases: ['diabetes', 'hypertension'],
      type: 'government',
      experience: '15 years',
      rating: 4.5,
      fee: 300,
      nextSlot: '10:00 AM',
      distance: '2.5 km'
    },
    {
      id: 'd2',
      name: 'Dr. Anjali Mehta',
      specialty: 'Pediatrics',
      hospital: 'City General Hospital',
      area: 'Central',
      diseases: ['fever', 'infections'],
      type: 'government',
      experience: '10 years',
      rating: 4.6,
      fee: 350,
      nextSlot: '2:00 PM',
      distance: '2.6 km'
    },
    {
      id: 'd3',
      name: 'Dr. Priya Sharma',
      specialty: 'Cardiology',
      hospital: 'Apollo Clinic',
      area: 'Park Avenue',
      diseases: ['heart disease'],
      type: 'private',
      experience: '8 years',
      rating: 4.7,
      fee: 400,
      nextSlot: '4:30 PM',
      distance: '3.8 km'
    },
    {
      id: 'd4',
      name: 'Dr. Suresh Patil',
      specialty: 'General Medicine',
      hospital: 'Rural Health Center',
      area: 'Northside',
      diseases: ['malaria'],
      type: 'government',
      experience: '12 years',
      rating: 4.0,
      fee: 250,
      nextSlot: '11:00 AM',
      distance: '5.2 km'
    },
    {
      id: 'd5',
      name: 'Dr. Vikram Joshi',
      specialty: 'Orthopedics',
      hospital: 'Apollo Clinic',
      area: 'Park Avenue',
      diseases: ['fracture'],
      type: 'private',
      experience: '9 years',
      rating: 4.4,
      fee: 380,
      nextSlot: '3:00 PM',
      distance: '3.8 km'
    }
  ]

  const specialties = ['General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology', 'Orthopedics']

  const filteredDoctors = mockDoctors.filter(doctor => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch = !q || (
      doctor.name.toLowerCase().includes(q) ||
      doctor.specialty.toLowerCase().includes(q) ||
      (doctor.hospital && doctor.hospital.toLowerCase().includes(q)) ||
      (doctor.area && doctor.area.toLowerCase().includes(q)) ||
      (doctor.diseases && doctor.diseases.join(' ').toLowerCase().includes(q))
    )
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty
    const matchesType = !typeFilter || doctor.type === typeFilter
    // if singleHospital mode and hospitalName provided, prefer that hospital's doctors only
    const matchesHospital = !singleHospital || !hospitalName || (doctor.hospital && doctor.hospital.toLowerCase().includes(hospitalName.toLowerCase()))
    return matchesSearch && matchesSpecialty && matchesType && matchesHospital
  })

  const handleDoctorClick = (doctorId) => {
    // If operating in single-hospital mode and we have hospitalId, pass it so doctor profile Back returns to the hospital
    if (hospitalId) {
      route(`/patient/doctor/${doctorId}?fromHospital=${hospitalId}`)
    } else {
      route(`/patient/doctor/${doctorId}`)
    }
  }
  return (
    <PatientLayout 
      title="Find Doctors" 
      subtitle={`${filteredDoctors.length} doctors available`}
      showSidebar={!singleHospital}
    >
      <div className="max-w-6xl mx-auto">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search by doctor name, specialty, or disease..."
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Specialty</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSpecialty('')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !selectedSpecialty 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {specialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSpecialty === specialty 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No doctors found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredDoctors.map(doctor => (
                <div 
                  key={doctor.id}
                  onClick={() => handleDoctorClick(doctor.id)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">👨‍⚕️</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                      <p className="text-green-600 dark:text-green-400 font-medium">{doctor.specialty}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{doctor.hospital}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">⭐ {doctor.rating}</span>
                        <span className="text-gray-600 dark:text-gray-400">📍 {doctor.distance}</span>
                        <span className="text-gray-600 dark:text-gray-400">🕒 {doctor.experience}</span>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{doctor.fee}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Next: {doctor.nextSlot}</div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDoctorClick(doctor.id) }}
                        className="mt-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium w-full sm:w-auto"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}