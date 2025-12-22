import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'

export function OfflineEMR({ patientId }) {
  console.log('OfflineEMR rendering with patientId:', patientId)
  
  // Test to see if component renders at all
  // if (true) {
  //   return (
  //     <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
  //       <h1 style={{ color: 'red', fontSize: '24px', marginBottom: '10px' }}>EMR PAGE TEST</h1>
  //       <p style={{ fontSize: '18px' }}>Patient ID from route: {patientId || 'No ID provided'}</p>
  //       <button 
  //         onClick={() => window.location.href = '/doctor/consultations'}
  //         style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
  //       >
  //         Back to Consultations
  //       </button>
  //     </div>
  //   )
  // }
  
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const mockPatients = [
    {
      id: 'pat_001',
      name: 'Priya Sharma',
      age: 28,
      gender: 'Female',
      phone: '+91-9876543210',
      lastVisit: '2024-01-10',
      condition: 'Fever and headache'
    },
    {
      id: 'pat_002',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      phone: '+91-9876543211',
      lastVisit: '2024-01-12',
      condition: 'Chest pain'
    },
    {
      id: 'pat_003',
      name: 'John Doe',
      age: 50,
      gender: 'Male',
      phone: '+91-9876543212',
      lastVisit: '2024-01-15',
      condition: 'Follow-up'
    },
    {
      id: 'pat_004',
      name: 'Anita Deshpande',
      age: 34,
      gender: 'Female',
      phone: '+91-9876543213',
      lastVisit: '2024-01-18',
      condition: 'Skin rash'
    },
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      phone: '+91-9876543210',
      lastVisit: '2024-01-10',
      condition: 'Diabetes'
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      gender: 'Female',
      phone: '+91-9876543211',
      lastVisit: '2024-01-12',
      condition: 'Hypertension'
    },
    {
      id: 3,
      name: 'Robert Wilson',
      age: 58,
      gender: 'Male',
      phone: '+91-9876543212',
      lastVisit: '2024-01-15',
      condition: 'Heart Disease'
    }
  ]

  // Auto-select patient if patientId is provided
  useEffect(() => {
    if (patientId && !selectedPatient) {
      console.log('Looking for patient with ID:', patientId)
      const patient = mockPatients.find(p => String(p.id) === String(patientId))
      console.log('Found patient:', patient)
      if (patient) {
        setSelectedPatient(patient)
      } else {
        console.log('Patient not found. Available patients:', mockPatients.map(p => ({ id: p.id, name: p.name })))
      }
    }
  }, [patientId, selectedPatient])

  const mockRecords = {
    'pat_001': [
      {
        id: 1,
        date: '2024-01-10',
        symptoms: 'Fever (102°F), headache, body ache',
        diagnosis: 'Viral Fever',
        prescription: 'Paracetamol 500mg TDS, Rest',
        notes: 'Advised plenty of fluids and rest. Follow up if fever persists beyond 3 days.'
      }
    ],
    'pat_002': [
      {
        id: 1,
        date: '2024-01-12',
        symptoms: 'Chest pain, shortness of breath',
        diagnosis: 'Suspected Angina - Needs further investigation',
        prescription: 'Aspirin 75mg OD, Nitrate spray SOS',
        notes: 'ECG shows signs of ischemia. Referred to cardiologist. Emergency protocol explained.'
      }
    ],
    'pat_003': [
      {
        id: 1,
        date: '2024-01-15',
        symptoms: 'Routine follow-up, feeling better',
        diagnosis: 'Post-treatment follow-up',
        prescription: 'Continue current medication',
        notes: 'Patient showing improvement. Advised lifestyle modifications.'
      }
    ],
    'pat_004': [
      {
        id: 1,
        date: '2024-01-18',
        symptoms: 'Skin rash, itching',
        diagnosis: 'Allergic dermatitis',
        prescription: 'Antihistamine cream, Cetirizine 10mg OD',
        notes: 'Advised to avoid allergens. Follow up in 1 week if no improvement.'
      }
    ],
    1: [
      {
        id: 1,
        date: '2024-01-10',
        symptoms: 'Increased thirst, frequent urination',
        diagnosis: 'Diabetes Type 2',
        prescription: 'Metformin 500mg twice daily',
        notes: 'Blood sugar levels elevated. Advised dietary changes.'
      },
      {
        id: 2,
        date: '2024-01-05',
        symptoms: 'Fatigue, dizziness',
        diagnosis: 'Diabetes management',
        prescription: 'Continue current medication',
        notes: 'Patient showing improvement.'
      }
    ],
    2: [
      {
        id: 3,
        date: '2024-01-12',
        symptoms: 'Headache, chest pain',
        diagnosis: 'Hypertension',
        prescription: 'Amlodipine 5mg daily',
        notes: 'Blood pressure: 150/95. Needs monitoring.'
      }
    ],
    3: [
      {
        id: 4,
        date: '2024-01-15',
        symptoms: 'Chest pain, shortness of breath',
        diagnosis: 'Angina',
        prescription: 'Nitroglycerin as needed',
        notes: 'Referred to cardiologist for further evaluation.'
      }
    ]
  }

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  const handleAddRecord = (e) => {
    e.preventDefault()
    alert('EMR record added successfully!')
    setShowAddRecord(false)
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', onClick: () => route('/doctor/dashboard') },
    { icon: '📅', label: 'Schedule', onClick: () => route('/doctor/schedule') },
    { icon: '📋', label: 'EMR', active: true, onClick: () => {} },
    { icon: '💊', label: 'Prescriptions', onClick: () => route('/doctor/prescriptions') },
    { icon: '🎥', label: 'Consultations', onClick: () => route('/doctor/consultations') },
  ]

  console.log('Rendering OfflineEMR. PatientId:', patientId, 'SelectedPatient:', selectedPatient, 'FilteredPatients:', filteredPatients.length)

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🩺</div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">SwasthLink</h2>
            </div>
            <button 
              onClick={() => route('/doctor/profile')}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">SJ</div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Cardiologist</p>
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
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-6">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                <span className="text-xl">🚨</span>
                <span className="text-sm">Emergency: 108</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Header */}
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offline EMR</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Electronic Medical Records</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full font-medium">
                    🌐 Offline Ready
                  </span>
                  <button 
                    onClick={() => setShowAddRecord(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium hidden sm:block"
                  >
                    Add Record
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {isDark ? '☀️' : '🌙'}
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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

          {/* Content Area */}
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient List */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patients</h2>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search patients..."
                    />
                  </div>

                  {/* Patient List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredPatients.map(patient => (
                      <div 
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                          selectedPatient?.id === patient.id 
                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-md' 
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{patient.age} years • {patient.gender}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{patient.condition}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Last visit: {patient.lastVisit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient Records */}
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.phone}</p>
                      </div>
                      <span className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold border-2 border-blue-200 dark:border-blue-700">
                        {selectedPatient.condition}
                      </span>
                    </div>

                    {/* Medical Records */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Medical Records
                      </h3>
                      
                      {(mockRecords[selectedPatient.id] || []).map(record => (
                        <div key={record.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="text-blue-600 dark:text-blue-400">📅</span>
                              Visit - {record.date}
                            </h4>
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                              Edit
                            </button>
                          </div>
                      
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <span className="text-red-500">🩺</span>
                                Symptoms
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400">{record.symptoms}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <span className="text-blue-500">🔬</span>
                                Diagnosis
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400">{record.diagnosis}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <span className="text-green-500">💊</span>
                                Prescription
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400">{record.prescription}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <span className="text-yellow-500">📝</span>
                                Notes
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400">{record.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!mockRecords[selectedPatient.id] || mockRecords[selectedPatient.id].length === 0) && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-4">📋</div>
                          <p>No medical records found for this patient</p>
                          <button 
                            onClick={() => setShowAddRecord(true)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Add First Record
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
                    <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Patient</h3>
                    <p className="text-gray-600 dark:text-gray-400">Choose a patient from the list to view their medical records</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Add Record Modal */}
        {showAddRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Medical Record
              </h3>
              
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Patient
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Patient</option>
                    {mockPatients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Symptoms
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe symptoms..."
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter diagnosis..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prescription
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Enter prescription..."
                    required
                  ></textarea>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddRecord(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}