import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { PatientLayout } from '../../ui/PatientLayout'

export function SearchDoctor() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [typeFilter, setTypeFilter] = useState('') // individual | government | private | semi

  // API state
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [specialties, setSpecialties] = useState(['General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology', 'Orthopedics'])

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

  // Fetch doctors from API
  const fetchDoctors = async (page = 1, search = '') => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.error('No auth token found')
      return
    }

    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      
      let url = `${baseUrl}auth/get-doctor-list/?page=${page}&per_page=${perPage}`
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }

      console.log('📥 Fetching Doctors:')
      console.log('URL:', url)
      console.log('Auth Token:', token.substring(0, 20) + '...')

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Error fetching doctors:', errorData)
        return
      }

      const result = await response.json()
      console.log('✅ Doctors fetched successfully:', result)
      
      if (result.doctors && Array.isArray(result.doctors)) {
        setDoctors(result.doctors)
        setCurrentPage(result.current_page || 1)
        setTotalPages(result.total_pages || 1)
        setTotalRecords(result.total_records || 0)
        
        // Extract unique specializations from doctors
        const uniqueSpecialties = [...new Set(result.doctors.map(d => d.specialization).filter(Boolean))]
        if (uniqueSpecialties.length > 0) {
          setSpecialties(uniqueSpecialties)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching doctors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors(1, '')
  }, [])

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    // Fetch with new search term
    setTimeout(() => {
      fetchDoctors(1, value)
    }, 300)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchDoctors(newPage, searchTerm)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = !selectedSpecialty || doctor.specialization === selectedSpecialty
    return matchesSpecialty
  })

  const handleDoctorClick = (doctor) => {
    // Pass doctor data to DoctorProfile component via route
    // Store doctor data in sessionStorage so it persists during navigation
    sessionStorage.setItem('selectedDoctorData', JSON.stringify(doctor))
    
    // If operating in single-hospital mode and we have hospitalId, pass it so doctor profile Back returns to the hospital
    if (hospitalId) {
      route(`/patient/doctor/${doctor.id}?fromHospital=${hospitalId}`)
    } else {
      route(`/patient/doctor/${doctor.id}`)
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
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search by doctor name or specialty..."
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
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading doctors...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No doctors found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {filteredDoctors.map(doctor => (
                  <div 
                    key={doctor.id}
                    onClick={() => handleDoctorClick(doctor)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">👨‍⚕️</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </h3>
                        <p className="text-green-600 dark:text-green-400 font-medium">{doctor.specialization}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{doctor.email}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{doctor.mobile_number}</p>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDoctorClick(doctor) }}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium w-full sm:w-auto"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  
                  <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages} ({totalRecords} total)
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}