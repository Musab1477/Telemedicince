import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { useTranslation } from '../../../contexts/I18nContext'
import { PatientLayout } from '../../ui/PatientLayout'

export function NGOs() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const ngos = [
    { 
      id: 1, 
      name: 'Health For All Foundation', 
      type: 'healthcare', 
      distance: '1.8 km', 
      volunteers: 25, 
      rating: 4.5, 
      address: '15 Gandhi Nagar, Central District',
      focus: ['Free Health Camps', 'Medicine Distribution', 'Health Awareness']
    },
    { 
      id: 2, 
      name: 'Care & Cure NGO', 
      type: 'healthcare', 
      distance: '3.5 km', 
      volunteers: 18, 
      rating: 4.3, 
      address: '45 Ring Road, Satellite, Ahmedabad',
      focus: ['Blood Donation Camps', 'Emergency Support', 'Medical Aid']
    },
    { 
      id: 3, 
      name: 'Smile Foundation', 
      type: 'children', 
      distance: '4.2 km', 
      volunteers: 30, 
      rating: 4.7, 
      address: '78 SG Highway, Bodakdev, Ahmedabad, Gujarat 380054',
      focus: ['Child Healthcare', 'Education', 'Nutrition Programs']
    },
    { 
      id: 4, 
      name: 'Elderly Care Trust', 
      type: 'elderly', 
      distance: '5.8 km', 
      volunteers: 15, 
      rating: 4.4, 
      address: '22 Ashram Road, Ellis Bridge, Ahmedabad',
      focus: ['Senior Citizen Health', 'Home Care', 'Medical Consultations']
    },
    { 
      id: 5, 
      name: 'Rural Health Initiative', 
      type: 'rural', 
      distance: '7.1 km', 
      volunteers: 22, 
      rating: 4.2, 
      address: '89 Sarkhej-Gandhinagar Highway, Sola, Ahmedabad',
      focus: ['Rural Healthcare', 'Mobile Clinics', 'Health Education']
    },
    { 
      id: 6, 
      name: 'Women Wellness Centre', 
      type: 'women', 
      distance: '2.9 km', 
      volunteers: 20, 
      rating: 4.6, 
      address: '12 CG Road, Navrangpura, Ahmedabad, Gujarat 380009',
      focus: ['Maternal Health', 'Womens Healthcare', 'Family Planning']
    }
  ]

  const parseDistanceKm = (d) => {
    if (!d) return Infinity
    const m = d.match(/([0-9]+\.?[0-9]*)/)
    return m ? parseFloat(m[1]) : Infinity
  }

  const handleNGOClick = (ngo) => route(`/patient/ngo/${ngo.id}`)

  // compute filtered lists
  const ngosFiltered = ngos.filter(n => {
    if (filter && filter !== 'all' && n.type !== filter) return false
    if (!query) return true
    const q = query.toLowerCase()
    if (q.includes('near')) return parseDistanceKm(n.distance) <= 5
    return n.name.toLowerCase().includes(q) || 
           n.address.toLowerCase().includes(q) || 
           (n.distance && n.distance.toLowerCase().includes(q)) ||
           n.focus.some(f => f.toLowerCase().includes(q))
  })

  const totalResults = ngosFiltered.length

  return (
    <PatientLayout title={t('Nearby NGOs')} subtitle={`${totalResults} NGOs found`}>
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
                placeholder="Search NGOs, areas or services (try 'nearby')..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filter Buttons */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Filter by Focus Area</label>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => setFilter('all')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('healthcare')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'healthcare' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Healthcare
                </button>
                <button 
                  onClick={() => setFilter('children')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'children' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Children
                </button>
                <button 
                  onClick={() => setFilter('elderly')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'elderly' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Elderly Care
                </button>
                <button 
                  onClick={() => setFilter('rural')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'rural' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Rural Health
                </button>
                <button 
                  onClick={() => setFilter('women')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'women' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Women Health
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {ngosFiltered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🤝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No NGOs found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try a different filter or search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ngosFiltered.map(n => (
                <div key={n.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all cursor-pointer" onClick={() => handleNGOClick(n)}>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center text-3xl flex-shrink-0">🤝</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{n.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.address} • {n.distance}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400 gap-4">
                          <span className="flex items-center">{n.volunteers} volunteers</span>
                          <span className="flex items-center">⭐ {n.rating}</span>
                          <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{n.type}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {n.focus.slice(0, 2).map((f, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                              {f}
                            </span>
                          ))}
                          {n.focus.length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 rounded">
                              +{n.focus.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <button onClick={(e) => { e.stopPropagation(); handleNGOClick(n) }} className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">View Details</button>
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

export default NGOs
