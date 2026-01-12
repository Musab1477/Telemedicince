import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { useAuth } from '../../../contexts/AuthContext'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'

const FREQUENCY_OPTIONS = [
  { key: 'once', value: 'Once a day' },
  { key: 'twice', value: 'Twice a day' },
  { key: 'thrice', value: 'Thrice a day' },
  { key: 'sos', value: 'SOS' }
]

const TIMING_OPTIONS = [
  { key: 'before_food', value: 'Before Food' },
  { key: 'after_food', value: 'After Food' },
  { key: 'empty_stomach', value: 'Empty Stomach' }
]

export function OfflineEMR({ patientId }) {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [editForm, setEditForm] = useState({ diagnosis: '', additional_notes: '', medicines: [] })
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [prescriptionLoading, setPrescriptionLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [error, setError] = useState(null)

  const doctorId = user?.id || user?.doctor_id || user?.user_id

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Fetch doctor profile
    fetchDoctorProfile()
  }, [])

  const fetchDoctorProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      const response = await fetch(`${apiUrl}auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        console.log('✅ Profile loaded:', data)
      }
    } catch (err) {
      console.error('❌ Profile fetch error:', err)
    }
  }

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

  // Fetch patients list
  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        const accessToken = localStorage.getItem('accessToken')
        const cleanBase = BASE_URL.replace(/\/$/, '')
        const response = await fetch(`${cleanBase}/doctor/${doctorId}/patients/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.status}`)
        }
        
        const data = await response.json()
        setPatients(data.patients || [])
      } catch (err) {
        console.error('Error fetching patients:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [doctorId])

  // Auto-select patient if patientId is provided
  useEffect(() => {
    if (patientId && patients.length > 0 && !selectedPatient) {
      const patient = patients.find(p => String(p.id) === String(patientId))
      if (patient) {
        handlePatientSelect(patient)
      }
    }
  }, [patientId, patients])

  // Fetch prescriptions when patient is selected
  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient)
    setPrescriptions([])
    
    if (!doctorId || !patient.id) return
    
    try {
      setPrescriptionLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      const cleanBase = BASE_URL.replace(/\/$/, '')
      const response = await fetch(`${cleanBase}/doctor/${doctorId}/patient/${patient.id}/prescriptions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prescriptions: ${response.status}`)
      }
      
      const data = await response.json()
      setPrescriptions(data.prescriptions || [])
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
    } finally {
      setPrescriptionLoading(false)
    }
  }

  // Open edit modal with prefilled data
  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription)
    setEditForm({
      diagnosis: prescription.diagnosis || '',
      additional_notes: prescription.additional_notes || '',
      medicines: prescription.medicines?.map(med => ({
        id: med.id,
        medicine_name: med.medicine_name || '',
        dose: med.dose || '',
        frequency: med.frequency || 'once',
        timing: med.timing || 'after_food',
        duration: med.duration || ''
      })) || []
    })
    setShowEditModal(true)
  }

  // Update prescription API call
  const handleUpdatePrescription = async (e) => {
    e.preventDefault()
    if (!editingPrescription) return

    try {
      setUpdateLoading(true)
      const accessToken = localStorage.getItem('accessToken')
      const cleanBase = BASE_URL.replace(/\/$/, '')
      
      const payload = {
        diagnosis: editForm.diagnosis,
        additional_notes: editForm.additional_notes,
        medicines: editForm.medicines.map(med => ({
          medicine_name: med.medicine_name,
          dose: med.dose,
          frequency: med.frequency,
          timing: med.timing,
          duration: med.duration
        }))
      }

      const response = await fetch(`${cleanBase}/doctor/prescription/${editingPrescription.id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Failed to update prescription: ${response.status}`)
      }

      // Refresh prescriptions
      if (selectedPatient) {
        await handlePatientSelect(selectedPatient)
      }
      
      setShowEditModal(false)
      setEditingPrescription(null)
      alert('Prescription updated successfully!')
    } catch (err) {
      console.error('Error updating prescription:', err)
      alert('Failed to update prescription: ' + err.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  // Medicine form handlers
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...editForm.medicines]
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value }
    setEditForm({ ...editForm, medicines: updatedMedicines })
  }

  const addMedicine = () => {
    setEditForm({
      ...editForm,
      medicines: [...editForm.medicines, { medicine_name: '', dose: '', frequency: 'once', timing: 'after_food', duration: '' }]
    })
  }

  const removeMedicine = (index) => {
    const updatedMedicines = editForm.medicines.filter((_, i) => i !== index)
    setEditForm({ ...editForm, medicines: updatedMedicines })
  }

  const filteredPatients = patients.filter(patient =>
    patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobile_number?.includes(searchTerm)
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
    // { icon: '💊', label: 'Prescriptions', onClick: () => route('/doctor/prescriptions') },
    { icon: '🎥', label: 'Consultations', onClick: () => route('/doctor/consultations') },
  ]

  const getSignatureUrl = (signaturePath) => {
    if (!signaturePath) return null
    const cleanBase = BASE_URL.replace(/\/$/, '')
    if (signaturePath.startsWith('http')) return signaturePath
    return `${cleanBase}${signaturePath}`
  }

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
              onClick={() => profileData?.id && route(`/doctor/profile/${profileData.id}`)}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6 hover:from-green-100 hover:to-emerald-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                  {user?.full_name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.full_name || 'Doctor'}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.specialization || 'Specialist'}</p>
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
                  <button
                    onClick={() => route('/')}
                    className="hidden sm:flex items-center gap-2 bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
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
                  
                  <div className="mb-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search patients..."
                    />
                  </div>

                  {loading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Loading patients...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8 text-red-500">
                      <p>Error: {error}</p>
                    </div>
                  )}

                  {!loading && !error && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredPatients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <p>No patients found</p>
                        </div>
                      ) : (
                        filteredPatients.map(patient => (
                          <div 
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                              selectedPatient?.id === patient.id 
                                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-md' 
                                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                            }`}
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white">{patient.full_name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{patient.age} years • {patient.gender}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{patient.mobile_number}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Records */}
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedPatient.full_name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{selectedPatient.age} years • {selectedPatient.gender} • {selectedPatient.mobile_number}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Prescriptions
                      </h3>

                      {prescriptionLoading && (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading prescriptions...</p>
                        </div>
                      )}
                      
                      {!prescriptionLoading && prescriptions.map(prescription => (
                        <div key={prescription.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span className="text-blue-600 dark:text-blue-400">📅</span>
                              {new Date(prescription.created_at).toLocaleDateString()}
                            </h4>
                            <button 
                              onClick={() => handleEditPrescription(prescription)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                            >
                              ✏️ Edit
                            </button>
                          </div>
                      
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <span className="text-blue-500">🔬</span>Diagnosis
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400">{prescription.diagnosis}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                <span className="text-yellow-500">📝</span>Notes
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400">{prescription.additional_notes || 'No additional notes'}</p>
                            </div>
                          </div>

                          {prescription.medicines && prescription.medicines.length > 0 && (
                            <div className="mt-4">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <span className="text-green-500">💊</span>Medicines
                              </h5>
                              <div className="space-y-2">
                                {prescription.medicines.map(medicine => (
                                  <div key={medicine.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="font-medium text-gray-900 dark:text-white">{medicine.medicine_name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {medicine.dose} • {FREQUENCY_OPTIONS.find(f => f.key === medicine.frequency)?.value || medicine.frequency} • {TIMING_OPTIONS.find(t => t.key === medicine.timing)?.value || medicine.timing} • {medicine.duration}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {prescription.digital_signature && (
                            <div className="mt-4">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <span className="text-purple-500">✍️</span>Digital Signature
                              </h5>
                              <img 
                                src={getSignatureUrl(prescription.digital_signature)} 
                                alt="Doctor's Signature" 
                                className="h-16 object-contain bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {!prescriptionLoading && prescriptions.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="text-4xl mb-4">📋</div>
                          <p>No prescriptions found for this patient</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
                    <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Patient</h3>
                    <p className="text-gray-600 dark:text-gray-400">Choose a patient from the list to view their prescriptions</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Edit Prescription Modal */}
        {showEditModal && editingPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-blue-600">✏️</span>Edit Prescription
                </h3>
              </div>
              
              <form onSubmit={handleUpdatePrescription} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnosis</label>
                  <input
                    type="text"
                    value={editForm.diagnosis}
                    onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter diagnosis..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
                  <textarea
                    value={editForm.additional_notes}
                    onChange={(e) => setEditForm({ ...editForm, additional_notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter notes..."
                  ></textarea>
                </div>

                {/* Medicines Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicines</label>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editForm.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medicine {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ❌ Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Medicine Name</label>
                            <input
                              type="text"
                              value={medicine.medicine_name}
                              onChange={(e) => handleMedicineChange(index, 'medicine_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                              placeholder="Medicine name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dosage</label>
                            <input
                              type="text"
                              value={medicine.dose}
                              onChange={(e) => handleMedicineChange(index, 'dose', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                              placeholder="e.g. 500mg"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                            <select
                              value={medicine.frequency}
                              onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                            >
                              {FREQUENCY_OPTIONS.map(opt => (
                                <option key={opt.key} value={opt.key}>{opt.value}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Timing</label>
                            <select
                              value={medicine.timing}
                              onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                            >
                              {TIMING_OPTIONS.map(opt => (
                                <option key={opt.key} value={opt.key}>{opt.value}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Duration (in days)</label>
                            <input
                              type="text"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
                              placeholder="e.g. 5 days"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {editForm.medicines.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No medicines added. Click "Add Medicine" to add one.</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingPrescription(null); }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    {updateLoading ? 'Updating...' : 'Update Prescription'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient</label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Diagnosis</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                    placeholder="Enter diagnosis..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                    rows="3"
                    placeholder="Enter notes..."
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
