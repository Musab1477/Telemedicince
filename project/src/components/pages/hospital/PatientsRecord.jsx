import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { route } from 'preact-router'

const STORAGE_KEY = 'hospital_patients'

const samplePatients = [
  {
    id: 'p-001',
    name: 'Asha Kapoor',
    age: 54,
    gender: 'Female',
    contact: '+91 98xxxxxxx01',
    diagnosis: 'Pneumonia',
    admissionDate: '2025-10-28',
    dischargeDate: null,
    room: 'A-102',
    attendingDoctor: 'Dr. Rahul Mehta',
    vitals: { bp: '130/80', hr: 88, temp: '99.1 F', resp: 20 },
    medications: ['Azithromycin 500mg', 'Paracetamol 500mg'],
    notes: 'Responding to antibiotics. Monitor oxygen saturation.'
  },
  {
    id: 'p-002',
    name: 'Rakesh Jain',
    age: 67,
    gender: 'Male',
    contact: '+91 98xxxxxxx02',
    diagnosis: 'Hip Fracture (post-op)',
    admissionDate: '2025-10-20',
    dischargeDate: null,
    room: 'B-210',
    attendingDoctor: 'Dr. Priya Sharma',
    vitals: { bp: '140/85', hr: 76, temp: '98.6 F', resp: 16 },
    medications: ['Low-molecular heparin', 'Analgesics'],
    notes: 'Physiotherapy scheduled. Pain controlled.'
  },
  {
    id: 'p-003',
    name: 'Meena Deshmukh',
    age: 45,
    gender: 'Female',
    contact: '+91 98xxxxxxx03',
    diagnosis: 'Recovered - Dengue',
    admissionDate: '2025-09-05',
    dischargeDate: '2025-09-12',
    room: 'C-305',
    attendingDoctor: 'Dr. Sunil Rao',
    vitals: { bp: '120/78', hr: 72, temp: '98.4 F', resp: 14 },
    medications: [],
    notes: 'Discharged in stable condition. Follow-up after 7 days.'
  },
  {
    id: 'p-004',
    name: 'Vikram Singh',
    age: 32,
    gender: 'Male',
    contact: '+91 98xxxxxxx04',
    diagnosis: 'Appendicitis (post-op)',
    admissionDate: '2025-08-10',
    dischargeDate: '2025-08-15',
    room: 'D-101',
    attendingDoctor: 'Dr. Meera Iyer',
    vitals: { bp: '118/76', hr: 70, temp: '98.2 F', resp: 14 },
    medications: ['Antibiotics (completed)'],
    notes: 'Routine recovery. No complications.'
  }
]

const PatientsRecord = () => {
  const [patients, setPatients] = useState([])
  const [tab, setTab] = useState('inpatients') // 'inpatients' or 'past'
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(null)
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

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setPatients(JSON.parse(raw))
      } catch (e) {
        console.error('Failed to parse patients from storage', e)
        setPatients(samplePatients)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePatients))
      }
    } else {
      setPatients(samplePatients)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(samplePatients))
    }
  }, [])

  const save = (next) => {
    setPatients(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const inpatients = patients.filter(p => !p.dischargeDate)
  const pastPatients = patients.filter(p => p.dischargeDate)

  const filtered = (tab === 'inpatients' ? inpatients : pastPatients).filter(p => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
  })

  const admitPatient = (newPatient) => {
    const next = [{ ...newPatient, id: `p-${Date.now()}` }, ...patients]
    save(next)
  }

  const dischargePatient = (id) => {
    const next = patients.map(p => p.id === id ? { ...p, dischargeDate: new Date().toISOString().slice(0,10) } : p)
    save(next)
    setExpanded(null)
  }

  const reopenPatient = (id) => {
    const next = patients.map(p => p.id === id ? { ...p, dischargeDate: null } : p)
    save(next)
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: false, onClick: () => route('/hospital/dashboard') },
    { icon: '📋', label: 'Patients', active: true, onClick: () => {} },
    { icon: '👨‍⚕️', label: 'Manage Doctors', active: false, onClick: () => route('/hospital/manage-doctors') },
    { icon: '✅', label: 'Doctor Requests', active: false, onClick: () => route('/hospital/doctor-requests') },
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients Record</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">View current inpatients and past patients</p>
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
            {/* Tab and Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => setTab('inpatients')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='inpatients' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                >
                  Current Inpatients ({inpatients.length})
                </button>
                <button 
                  onClick={() => setTab('past')} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==='past' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                >
                  Past Patients ({pastPatients.length})
                </button>
              </div>
              <input 
                placeholder="Search by name / id / diagnosis" 
                value={query} 
                onInput={(e) => setQuery(e.target.value)} 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-sm w-full sm:w-auto" 
              />
            </div>

            {/* Patients List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              {filtered.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-400 py-12">No patients found.</div>
              ) : (
                <div className="space-y-4">{filtered.map(p => (
                  <div key={p.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-300 dark:hover:border-purple-600 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{p.gender} • {p.age} yrs</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">{p.id}</span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Diagnosis: <span className="font-medium text-purple-600 dark:text-purple-400">{p.diagnosis}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Attending: {p.attendingDoctor} • Room: {p.room}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admitted: {p.admissionDate}</div>
                        {p.dischargeDate && <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Discharged: {p.dischargeDate}</div>}
                        <div className="flex gap-2">
                          { !p.dischargeDate ? (
                            <button onClick={() => dischargePatient(p.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Discharge</button>
                          ) : (
                            <button onClick={() => reopenPatient(p.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Re-admit</button>
                          )}
                          <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">{expanded === p.id ? 'Hide' : 'Details'}</button>
                        </div>
                      </div>
                    </div>

                    {expanded === p.id && (
                      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-gray-700 dark:text-gray-300"><strong>Contact:</strong> {p.contact}</div>
                            <div className="mt-3 text-gray-700 dark:text-gray-300"><strong>Vitals:</strong></div>
                            <ul className="list-disc list-inside text-sm ml-4 text-gray-600 dark:text-gray-400">
                              <li>BP: {p.vitals.bp}</li>
                              <li>HR: {p.vitals.hr} bpm</li>
                              <li>Temp: {p.vitals.temp}</li>
                              <li>Resp: {p.vitals.resp} /min</li>
                            </ul>
                          </div>
                          <div>
                            <div className="text-gray-700 dark:text-gray-300"><strong>Medications:</strong></div>
                            {p.medications.length ? (
                              <ul className="list-disc list-inside text-sm ml-4 text-gray-600 dark:text-gray-400">
                                {p.medications.map((m, i) => <li key={i}>{m}</li>)}
                              </ul>
                            ) : <div className="text-sm text-gray-500 dark:text-gray-400">No active medications</div>}

                            <div className="mt-3 text-gray-700 dark:text-gray-300"><strong>Notes:</strong></div>
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{p.notes}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}
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
    </div>
  )
}

export default PatientsRecord
