import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { useTranslation } from '../../../contexts/I18nContext'
import { PatientLayout } from '../../ui/PatientLayout'

export function Hospitals() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const hospitals = [
    { id: 1, name: 'City General Hospital', type: 'government', distance: '2.5 km', doctors: 15, rating: 4.2, address: '12 MG Road, Central City' },
    { id: 2, name: 'Civil Health Center', type: 'government', distance: '5.2 km', doctors: 8, rating: 4.0, address: 'F Block, Civil Hospital Rd, Haripura, Asarwa, Ahmedabad' },
    { id: 3, name: 'Apollo Clinic', type: 'private', distance: '3.8 km', doctors: 12, rating: 4.5, address: '1A, Ahmedabad - Gandhinagar Rd, GIDC Bhat, estate, Ahmedabad, Gujarat 382428' },
    { id: 4, name: 'Sunflower Semi-Private Hospital', type: 'semi', distance: '6.1 km', doctors: 6, rating: 3.9, address: '50, Lakudi Cross Rd, opp. Punjab National Bank, Nathalal Colony, Naranpura, Ahmedabad' }
  ]

  const mockIndividualDoctors = [
    { id: 'd1', name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', rating: 4.5, fee: 300, distance: '2.5 km' },
    { id: 'd2', name: 'Dr. Anjali Mehta', specialty: 'Pediatrics', rating: 4.6, fee: 350, distance: '3.1 km' },
    { id: 'd5', name: 'Dr. Vikram Joshi', specialty: 'Orthopedics', rating: 4.4, fee: 380, distance: '4.0 km' },
    { id: 'd6', name: 'Dr. Paras Patel', specialty: 'Diabetologist', rating: 4.6, fee: 600, distance: '5.1 km' },

  ]

  const parseDistanceKm = (d) => {
    if (!d) return Infinity
    const m = d.match(/([0-9]+\.?[0-9]*)/)
    return m ? parseFloat(m[1]) : Infinity
  }

  const handleHospitalClick = (hospital) => route(`/patient/hospital/${hospital.id}`)
  const handleDoctorClick = (doctor) => route(`/patient/doctor/${doctor.id}`)

  // compute filtered lists
  const hospitalsFiltered = hospitals.filter(h => {
    if (filter && filter !== 'all' && filter !== 'individual' && h.type !== filter) return false
    if (!query) return true
    const q = query.toLowerCase()
    if (q.includes('near')) return parseDistanceKm(h.distance) <= 5
    return h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || (h.distance && h.distance.toLowerCase().includes(q))
  })

  const doctorsFiltered = mockIndividualDoctors.filter(d => {
    if (!query) return true
    const q = query.toLowerCase()
    return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || (d.distance && d.distance.toLowerCase().includes(q))
  })

  const totalResults = filter === 'individual' ? doctorsFiltered.length : hospitalsFiltered.length

  return (
    <PatientLayout title={t('patient.nearbyHospitals')} subtitle={`${totalResults} ${filter === 'individual' ? 'doctors' : 'hospitals'} found`}>
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
                value={query} 
                onInput={(e) => setQuery(e.target.value)} 
                placeholder="Search hospitals, areas or doctors (try 'nearby')..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filter Buttons */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Type</label>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setFilter('all')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('government')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'government' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Government
                </button>
                <button 
                  onClick={() => setFilter('private')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'private' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Private
                </button>
                <button 
                  onClick={() => setFilter('semi')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'semi' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Semi-private
                </button>
                <button 
                  onClick={() => setFilter('individual')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'individual' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Individual Doctors
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {filter === 'individual' ? (
            doctorsFiltered.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👨‍⚕️</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No doctors found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try a different filter or search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {doctorsFiltered.map(d => (
                  <div key={d.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer" onClick={() => handleDoctorClick(d)}>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center text-3xl flex-shrink-0">👨‍⚕️</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{d.specialty} • {d.distance}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-4">
                            <span className="flex items-center">⭐ {d.rating}</span>
                            <span className="flex items-center">₹ {d.fee}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto">
                        <button onClick={(e) => { e.stopPropagation(); handleDoctorClick(d) }} className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">View Profile</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            hospitalsFiltered.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏥</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hospitals found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try a different filter or search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {hospitalsFiltered.map(h => (
                  <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer" onClick={() => handleHospitalClick(h)}>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full flex items-center justify-center text-3xl flex-shrink-0">🏥</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{h.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{h.address} • {h.distance}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-4">
                            <span className="flex items-center">{h.doctors} doctors</span>
                            <span className="flex items-center">⭐ {h.rating}</span>
                            <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{h.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-auto">
                        <button onClick={(e) => { e.stopPropagation(); handleHospitalClick(h) }} className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">View Doctors</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </PatientLayout>
  )
}

export default Hospitals
