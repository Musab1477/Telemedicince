import { useState, useMemo, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

// Placeholder image
const DEFAULT_PROFILE = 'https://via.placeholder.com/120?text=Dr'

export function ManageDoctors() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    localStorage.setItem('darkMode', newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Mock dataset - replace with API calls later
  const [doctors, setDoctors] = useState([
    { id: 'd1', name: 'Dr. Amit Sharma', category: 'Cardiology', years: 12, rating: 4.6, fees: 1200, surgeries: ['Bypass'], photo: DEFAULT_PROFILE, active: true, license: 'MH12345' },
    { id: 'd2', name: 'Dr. Priya Patel', category: 'Pediatrics', years: 8, rating: 4.4, fees: 800, surgeries: [], photo: DEFAULT_PROFILE, active: true, license: 'MH67890' },
    { id: 'd3', name: 'Dr. Sanjay Rao', category: 'Orthopedics', years: 15, rating: 4.8, fees: 1500, surgeries: ['Knee Replacement','Hip Replacement'], photo: DEFAULT_PROFILE, active: true, license: 'MH22222' },
    { id: 'd4', name: 'Dr. Neha Verma', category: 'Dermatology', years: 6, rating: 4.2, fees: 600, surgeries: [], photo: DEFAULT_PROFILE, active: false, license: 'MH33333' },
  ])

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(doctors.map(d => d.category))
    return ['All', ...Array.from(cats)]
  }, [doctors])

  const visibleDoctors = useMemo(() => {
    if (selectedCategory === 'All') return doctors
    return doctors.filter(d => d.category === selectedCategory)
  }, [doctors, selectedCategory])

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId)

  function handleViewDoctor(id) {
    setSelectedDoctorId(id)
  }

  function handleToggleActive(id) {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d))
  }

  function handleDeleteDoctor(id) {
    if (!confirm('Delete this doctor? This action cannot be undone.')) return
    setDoctors(prev => prev.filter(d => d.id !== id))
    if (selectedDoctorId === id) setSelectedDoctorId(null)
  }

  function handleAddDoctor(form) {
    const newDoctor = { id: `d${Date.now()}`, photo: DEFAULT_PROFILE, active: true, ...form }
    setDoctors(prev => [newDoctor, ...prev])
    setIsAddOpen(false)
  }

  function handleEditDoctor(updated) {
    setDoctors(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d))
    setIsEditOpen(false)
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: false, onClick: () => route('/hospital/dashboard') },
    { icon: '📋', label: 'Patients', active: false, onClick: () => route('/hospital/patients-record') },
    { icon: '👨‍⚕️', label: 'Manage Doctors', active: true, onClick: () => {} },
    // { icon: '✅', label: 'Doctor Requests', active: false, onClick: () => route('/hospital/doctor-requests') },
    { icon: '➕', label: 'Add Doctor', active: false, onClick: () => route('/hospital/add-doctor') },
    { icon: '📝', label: 'Form Builder', active: false, onClick: () => route('/hospital/form-builder') },
  ]

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🏥</div>
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">SwasthLink</h2>
            </div>

            <button 
              onClick={() => route('/hospital/profile')}
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-purple-100 hover:to-pink-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  H
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">City General Hospital</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Hospital Admin</p>
                </div>
              </div>
            </button>

            <nav className="space-y-1">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Doctors</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage doctor profiles and specialties</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={isDark ? 'Light Mode' : 'Dark Mode'}
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>

                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="hidden sm:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    + Add Doctor
                  </button>

                  <button
                    onClick={() => route('/')}
                    className="hidden sm:flex items-center gap-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories */}
              <aside className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onClick={() => setSelectedCategory(cat)}
                      >{cat}</button>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Doctors list */}
              <main className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white">Doctors — {selectedCategory}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{visibleDoctors.length} found</div>
                </div>

                <div className="space-y-3">
                  {visibleDoctors.map(doc => (
                    <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center justify-between hover:border-purple-300 dark:hover:border-purple-600 transition-all">
                      <div className="flex items-center space-x-4">
                        <img src={doc.photo} alt={doc.name} className="w-16 h-16 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {doc.name} 
                            {!doc.active && <span className="text-xs text-red-600 dark:text-red-400 ml-2">(Denied)</span>}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{doc.category} • {doc.years} yrs</div>
                          <div className="text-sm text-yellow-600 dark:text-yellow-500">⭐ {doc.rating} • ₹{doc.fees}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button onClick={() => { handleViewDoctor(doc.id); setIsEditOpen(false); }} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">View</button>
                        <button onClick={() => { setSelectedDoctorId(doc.id); setIsEditOpen(true); }} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors">Edit</button>
                        <button onClick={() => handleToggleActive(doc.id)} className={`px-3 py-1 rounded-lg text-sm transition-colors ${doc.active ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{doc.active ? 'Deny' : 'Allow'}</button>
                        <button onClick={() => handleDeleteDoctor(doc.id)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </main>

              {/* Doctor profile / details */}
              <aside className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                {selectedDoctor ? (
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-20 h-20 rounded-full object-cover" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDoctor.name}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedDoctor.category} • {selectedDoctor.years} yrs</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-500">⭐ {selectedDoctor.rating}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <div><span className="font-medium text-gray-900 dark:text-white">Fees:</span> ₹{selectedDoctor.fees}</div>
                      <div><span className="font-medium text-gray-900 dark:text-white">License:</span> {selectedDoctor.license}</div>
                      <div><span className="font-medium text-gray-900 dark:text-white">Surgeries:</span> {selectedDoctor.surgeries.length ? selectedDoctor.surgeries.join(', ') : 'None'}</div>
                      <div><span className="font-medium text-gray-900 dark:text-white">Status:</span> {selectedDoctor.active ? <span className="text-green-600 dark:text-green-400">Active</span> : <span className="text-red-600 dark:text-red-400">Denied</span>}</div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <button onClick={() => { setIsEditOpen(true); }} className="w-full px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">Edit</button>
                      <button onClick={() => handleToggleActive(selectedDoctor.id)} className={`w-full px-3 py-2 rounded-lg transition-colors ${selectedDoctor.active ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{selectedDoctor.active ? 'Deny' : 'Allow'}</button>
                      <button onClick={() => handleDeleteDoctor(selectedDoctor.id)} className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Select a doctor to see full profile and actions</div>
                )}
              </aside>
            </div>
          </main>
        </div>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          ></div>
        )}
      </div>

      {/* Add / Edit modals (simple inline forms) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto shadow-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Add Doctor</h3>
            <DoctorForm onCancel={() => setIsAddOpen(false)} onSubmit={handleAddDoctor} isDark={isDark} />
          </div>
        </div>
      )}

      {isEditOpen && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto shadow-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Edit Doctor</h3>
            <DoctorForm initial={selectedDoctor} onCancel={() => setIsEditOpen(false)} onSubmit={handleEditDoctor} isDark={isDark} />
          </div>
        </div>
      )}
    </div>
  )
}

function DoctorForm({ initial = {}, onSubmit, onCancel, isDark }) {
  const [form, setForm] = useState({
    id: initial.id || null,
    name: initial.name || '',
    category: initial.category || '',
    years: initial.years || 0,
    rating: initial.rating || 4.0,
    fees: initial.fees || 0,
    surgeries: initial.surgeries ? initial.surgeries.join(', ') : '',
    license: initial.license || '',
  })

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function submit(e) {
    e.preventDefault()
    const surgeries = form.surgeries.split(',').map(s => s.trim()).filter(Boolean)
    onSubmit({ ...form, surgeries })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
        <input id="doctor-name" required placeholder="Full name" value={form.name} onInput={e => update('name', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category / Specialty</label>
        <input id="doctor-category" required placeholder="Category" value={form.category} onInput={e => update('category', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
        <input id="doctor-years" type="number" placeholder="Years" value={form.years} onInput={e => update('years', Number(e.target.value))} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
        <input id="doctor-rating" type="number" step="0.1" placeholder="Rating" value={form.rating} onInput={e => update('rating', Number(e.target.value))} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consultation Fees (INR)</label>
        <input id="doctor-fees" type="number" placeholder="Fees" value={form.fees} onInput={e => update('fees', Number(e.target.value))} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Surgeries / Procedures (comma separated)</label>
        <input id="doctor-surgeries" placeholder="Surgeries (comma separated)" value={form.surgeries} onInput={e => update('surgeries', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License number</label>
        <input id="doctor-license" placeholder="License number" value={form.license} onInput={e => update('license', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500" />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">Save</button>
      </div>
    </form>
  )
}

export default ManageDoctors
