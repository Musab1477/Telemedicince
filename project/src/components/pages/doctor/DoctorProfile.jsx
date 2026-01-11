import { useState, useEffect } from 'preact/hooks'
import { useAuth } from '../../../contexts/AuthContext'
import { route } from 'preact-router'

export default function DoctorProfile(props) {
  // DEBUG: Log immediately when component function is called
  console.log('🚀 DoctorProfile COMPONENT CALLED!')
  console.log('🚀 All props received:', props)
  console.log('🚀 props.id:', props.id)
  console.log('🚀 props.doctorId:', props.doctorId)
  
  // Extract doctorId from either props.doctorId or props.id (depends on router)
  const doctorId = props.doctorId || props.id
  const { user, login } = useAuth()
  const [editing, setEditing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [doctorDetails, setDoctorDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
    
    // Fetch doctor details when component loads
    console.log('🔍 DoctorProfile mounted, fetching details...')
    fetchDoctorDetails()
  }, [])

  const fetchDoctorDetails = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL/EMPTY')
      
      if (!token) {
        console.error('❌ No access token found in localStorage!')
        setError('Authentication required. Please login again.')
        setIsLoading(false)
        return
      }
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      // Store baseUrl for later use in document URLs
      localStorage.setItem('apiBaseUrl', baseUrl)
      
      // Step 1: Get logged-in user's profile to get their ID
      console.log('📡 Step 1: Fetching logged-in user profile from:', `${apiUrl}auth/profile/`)
      
      const profileResponse = await fetch(`${apiUrl}auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}))
        console.error('❌ Profile API error:', profileResponse.status, errorData)
        setError('Failed to fetch user profile')
        setIsLoading(false)
        return
      }
      
      const profileData = await profileResponse.json()
      console.log('✅ Logged-in user profile:', profileData)
      const loggedInUserId = profileData.id
      console.log('🆔 Logged-in user ID:', loggedInUserId)
      
      // Step 2: Try to get all doctors list with full details
      console.log('📡 Step 2: Fetching all doctors from:', `${apiUrl}auth/get-doctor-list/`)
      
      try {
        const doctorListResponse = await fetch(`${apiUrl}auth/get-doctor-list/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (doctorListResponse.ok) {
          const doctorListData = await doctorListResponse.json()
          console.log('✅ All doctors list:', doctorListData)
          
          // Step 3: Find the doctor matching logged-in user's ID
          const doctorList = Array.isArray(doctorListData) ? doctorListData : (doctorListData.doctors || [])
          const matchedDoctor = doctorList.find(doc => doc.id === loggedInUserId)
          
          if (matchedDoctor) {
            console.log('✅ Found matching doctor details:', matchedDoctor)
            setDoctorDetails(matchedDoctor)
            return
          } else {
            console.warn('⚠️ No doctor found with ID:', loggedInUserId, '- falling back to profile data')
          }
        } else {
          const errorData = await doctorListResponse.json().catch(() => ({}))
          console.warn('⚠️ Doctor list API error:', doctorListResponse.status, errorData.message || errorData)
          console.log('📋 Falling back to profile data...')
        }
      } catch (listErr) {
        console.warn('⚠️ Error fetching doctor list:', listErr.message)
        console.log('📋 Falling back to profile data...')
      }
      
      // Fallback: Use profile data if doctor list API fails
      console.log('✅ Using profile data as fallback:', profileData)
      setDoctorDetails(profileData)
      
    } catch (err) {
      console.error('❌ Error fetching doctor details:', err)
      setError(err.message || 'Failed to fetch doctor details')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to construct full document URL
  const getDocumentUrl = (docPath) => {
    if (!docPath) return null
    if (docPath.startsWith('http')) return docPath // Already full URL
    const baseUrl = localStorage.getItem('apiBaseUrl') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
    return cleanBaseUrl + (docPath.startsWith('/') ? docPath.substring(1) : docPath)
  }

  // Helper function to get file extension
  const getFileExtension = (url) => {
    if (!url) return ''
    const path = url.split('?')[0] // Remove query params
    return path.split('.').pop().toLowerCase()
  }

  // Helper function to check if document is image
  const isImageDocument = (url) => {
    const ext = getFileExtension(url)
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  }

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

  const handleLogout = async () => {
    const confirmLogout = confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    setIsLoading(true)
    try {
      console.log('🚪 Logging out doctor...')
      const token = localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
      const apiUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'
      
      const response = await fetch(`${apiUrl}auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      console.log('✅ Doctor Logout Success:', data)
      
      // Clear all stored data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('apiBaseUrl')
      
      alert('✅ Logged out successfully!')
      route('/')
    } catch (err) {
      console.error('❌ Logout Error:', err)
      
      // Still clear data even if API fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('apiBaseUrl')
      
      alert('Logged out (with error, but cleared local data)')
      route('/')
    } finally {
      setIsLoading(false)
    }
  }

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    medicalLicense: '',
    specialization: '',
    qualifications: '',
    experienceYears: '',
    clinic: '',
    hospitalType: 'private',
    hospitalAddress: '',
    consultationFee: '',
    about: ''
  })

  // Update form when doctorDetails changes
  useEffect(() => {
    if (doctorDetails) {
      setForm({
        name: doctorDetails?.first_name ? `${doctorDetails.first_name} ${doctorDetails.last_name}` : '',
        phone: doctorDetails?.mobile_number || '',
        email: doctorDetails?.email || '',
        medicalLicense: doctorDetails?.doctor_license_number || '',
        specialization: doctorDetails?.specialization || '',
        qualifications: doctorDetails?.highest_qualification || '',
        experienceYears: doctorDetails?.years_of_experience || '',
        clinic: doctorDetails?.current_hospital || '',
        hospitalType: doctorDetails?.hospital_type || 'private',
        hospitalAddress: doctorDetails?.hospital_address || '',
        consultationFee: doctorDetails?.consultation_fee || '',
        about: doctorDetails?.about || ''
      })
    }
  }, [doctorDetails])

  const [documents, setDocuments] = useState({
    degreeFiles: [],
    certificateFiles: [],
    licenseScan: null,
    idProof: null,
    digitalSignature: null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (field, files) => {
    const arr = Array.from(files).map(f => ({ name: f.name, size: f.size, file: f, url: URL.createObjectURL(f) }))
    if (field === 'licenseScan' || field === 'idProof' || field === 'digitalSignature') {
      setDocuments(prev => ({ ...prev, [field]: arr[0] || null }))
    } else {
      setDocuments(prev => ({ ...prev, [field]: arr }))
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    const updated = { 
      ...user, 
      ...form,
      documents: {
        ...user?.documents,
        degreeFiles: documents.degreeFiles.length > 0 ? documents.degreeFiles.map(f => f.name) : user.documents?.degreeFiles,
        certificateFiles: documents.certificateFiles.length > 0 ? documents.certificateFiles.map(f => f.name) : user.documents?.certificateFiles,
        licenseScan: documents.licenseScan ? documents.licenseScan.name : user.documents?.licenseScan,
        idProof: documents.idProof ? documents.idProof.name : user.documents?.idProof,
      },
      digitalSignatureUrl: documents.digitalSignature ? documents.digitalSignature.url : user?.digitalSignatureUrl,
    }
    if (login) login(updated)
    setEditing(false)
  }

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', onClick: () => route('/doctor/dashboard') },
    { icon: '📅', label: 'Schedule', onClick: () => route('/doctor/schedule') },
    // { icon: '📋', label: 'EMR', onClick: () => route('/doctor/emr') },
    { icon: '💊', label: 'Prescriptions', onClick: () => route('/doctor/prescriptions') },
    { icon: '🎥', label: 'Consultations', onClick: () => route('/doctor/consultations') },
    // { icon: '👤', label: 'Profile', active: true, onClick: () => {} },
  ]

  console.log('DoctorProfile - doctorDetails:', doctorDetails)
  
  const initial = (doctorDetails?.first_name || doctorDetails?.phone || form.name || 'D')[0]?.toUpperCase()

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* DEBUG: Show doctorId */}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="h-full px-3 py-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-3">
              <div className="text-3xl">🩺</div>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400">SwasthLink</h2>
            </div>

            {/* User Profile Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {doctorDetails?.first_name && doctorDetails?.last_name 
                      ? `Dr. ${doctorDetails.first_name} ${doctorDetails.last_name}` 
                      : form.name || 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{doctorDetails?.specialization || form.specialization || 'Physician'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
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

            {/* Dark Mode Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 font-medium transition-colors">
                <span className="text-xl">🚨</span>
                <span className="text-sm">Emergency: 108</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doctor Profile</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your professional information</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl">{isDark ? '☀️' : '🌙'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
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

          {/* Profile Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {isLoading ? (
              <div className="max-w-5xl mx-auto text-center py-20">
                <div className="text-6xl mb-4 animate-spin">⏳</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading profile...</h3>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your details</p>
              </div>
            ) : error ? (
              <div className="max-w-5xl mx-auto text-center py-20">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button 
                  onClick={() => route('/doctor/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Profile Header Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                      <span className="text-5xl font-bold">{initial}</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white text-green-600 rounded-full p-2 shadow-lg">
                      {editing ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold mb-2">{doctorDetails?.first_name && doctorDetails?.last_name ? `Dr. ${doctorDetails.first_name} ${doctorDetails.last_name}` : form.name || 'Doctor'}</h2>
                    <p className="text-green-100 text-lg mb-2">{doctorDetails?.specialization || form.specialization || 'Physician'}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {doctorDetails?.years_of_experience || form.experienceYears || '0'} Years Experience
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {doctorDetails?.highest_qualification || form.qualifications || 'MBBS'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!editing ? (
                      <button 
                        onClick={() => setEditing(true)} 
                        className="bg-white text-green-600 px-6 py-3 rounded-xl font-medium hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    ) : (
                      <button 
                        onClick={() => setEditing(false)} 
                        className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all border-2 border-white/30"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!editing ? (
                <>
                  {/* Contact Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>📧</span> Email
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.email || form.email || '-'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>📱</span> Phone
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.mobile_number || form.phone || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Professional Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>🎓</span> Specialization
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.specialization || form.specialization || '-'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>📜</span> Qualifications
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.highest_qualification || form.qualifications || '-'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>⏱️</span> Experience
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.years_of_experience || form.experienceYears || '0'} Years</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>🏥</span> Hospital Type
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white capitalize">{doctorDetails?.hospital_type || form.hospitalType || 'Private'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>💰</span> Consultation Fee
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">₹{doctorDetails?.consultation_fee || form.consultationFee || '0'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>🔖</span> Medical License Number
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.doctor_license_number || form.medicalLicense || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Clinic / Hospital
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>🏥</span> Current Hospital
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.current_hospital || form.clinic || 'Not specified'}</div>
                      </div>
                      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                          <span>📍</span> Hospital Address
                        </div>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">{doctorDetails?.hospital_address || form.hospitalAddress || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Registration Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Degree Document */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <span>🎓</span> Degree Certificate
                        </div>
                        {doctorDetails?.degree_document ? (
                          <div className="space-y-2">
                            {isImageDocument(doctorDetails.degree_document) && (
                              <img 
                                src={getDocumentUrl(doctorDetails.degree_document)} 
                                alt="Degree" 
                                className="w-full h-24 object-cover rounded-lg border border-indigo-300 dark:border-indigo-600" 
                              />
                            )}
                            <a 
                              href={getDocumentUrl(doctorDetails.degree_document)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              View Document
                            </a>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Not uploaded</div>
                        )}
                      </div>
                      
                      {/* Other Certificates */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <span>📄</span> Other Certificates
                        </div>
                        {doctorDetails?.other_certificate_document ? (
                          <div className="space-y-2">
                            {isImageDocument(doctorDetails.other_certificate_document) && (
                              <img 
                                src={getDocumentUrl(doctorDetails.other_certificate_document)} 
                                alt="Certificate" 
                                className="w-full h-24 object-cover rounded-lg border border-purple-300 dark:border-purple-600" 
                              />
                            )}
                            <a 
                              href={getDocumentUrl(doctorDetails.other_certificate_document)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              View Document
                            </a>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Not uploaded</div>
                        )}
                      </div>
                      
                      {/* Medical License */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <span>🔖</span> Medical License
                        </div>
                        {doctorDetails?.medical_license_document ? (
                          <div className="space-y-2">
                            {isImageDocument(doctorDetails.medical_license_document) && (
                              <img 
                                src={getDocumentUrl(doctorDetails.medical_license_document)} 
                                alt="License" 
                                className="w-full h-24 object-cover rounded-lg border border-green-300 dark:border-green-600" 
                              />
                            )}
                            <a 
                              href={getDocumentUrl(doctorDetails.medical_license_document)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              View Document
                            </a>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Not uploaded</div>
                        )}
                      </div>
                      
                      {/* Address Proof / ID Proof */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <span>🆔</span> Address Proof / ID
                        </div>
                        {doctorDetails?.address_proof_document ? (
                          <div className="space-y-2">
                            {isImageDocument(doctorDetails.address_proof_document) && (
                              <img 
                                src={getDocumentUrl(doctorDetails.address_proof_document)} 
                                alt="Address Proof" 
                                className="w-full h-24 object-cover rounded-lg border border-yellow-300 dark:border-yellow-600" 
                              />
                            )}
                            <a 
                              href={getDocumentUrl(doctorDetails.address_proof_document)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              View Document
                            </a>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Not uploaded</div>
                        )}
                      </div>
                      
                      {/* Digital Signature */}
                      <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800 sm:col-span-2">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <span>✍️</span> Digital Signature Certificate
                        </div>
                        {doctorDetails?.digital_signature_certificate ? (
                          <div className="flex items-center gap-4">
                            <img 
                              src={getDocumentUrl(doctorDetails.digital_signature_certificate)} 
                              alt="Digital Signature" 
                              className="h-16 bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-300 dark:border-gray-600" 
                            />
                            <a 
                              href={getDocumentUrl(doctorDetails.digital_signature_certificate)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-2 rounded-lg font-medium hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              View Signature
                            </a>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">Not uploaded</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About
                    </h3>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{doctorDetails?.about || form.about || 'No information provided'}</p>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit Form */
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile Information
                  </h3>
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                          <input 
                            name="name" 
                            value={form.name} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="Dr. John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                          <input 
                            name="phone" 
                            value={form.phone} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                          <input 
                            name="email" 
                            type="email"
                            value={form.email} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="doctor@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical License Number</label>
                          <input 
                            name="medicalLicense" 
                            value={form.medicalLicense} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="MED123456789"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
                          <input 
                            name="specialization" 
                            value={form.specialization} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="Cardiology"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (years)</label>
                          <input 
                            name="experienceYears" 
                            type="number"
                            value={form.experienceYears} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualifications</label>
                          <input 
                            name="qualifications" 
                            value={form.qualifications} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="MBBS, MD"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Clinic / Hospital</label>
                          <input 
                            name="clinic" 
                            value={form.clinic} 
                            onInput={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                            placeholder="City General Hospital"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hospital Type</label>
                          <select 
                            name="hospitalType" 
                            value={form.hospitalType} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                          >
                            <option value="private">Private</option>
                            <option value="government">Government</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* About Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h4>
                      <textarea 
                        name="about" 
                        value={form.about} 
                        onInput={handleChange} 
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all resize-none"
                        placeholder="Brief description about yourself and your practice..."
                      />
                    </div>

                    {/* Documents Upload */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Documents (Optional)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🎓 Degree Certificates</label>
                          <input 
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('degreeFiles', e.target.files)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/30 dark:file:text-green-400"
                          />
                          {documents.degreeFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {documents.degreeFiles.map((file, idx) => (
                                <div key={idx} className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📄 Additional Certificates</label>
                          <input 
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('certificateFiles', e.target.files)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400"
                          />
                          {documents.certificateFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {documents.certificateFiles.map((file, idx) => (
                                <div key={idx} className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {file.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🔖 License Scan</label>
                          <input 
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('licenseScan', e.target.files)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                          />
                          {documents.licenseScan && (
                            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {documents.licenseScan.name}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🆔 ID Proof</label>
                          <input 
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('idProof', e.target.files)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 dark:file:bg-yellow-900/30 dark:file:text-yellow-400"
                          />
                          {documents.idProof && (
                            <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {documents.idProof.name}
                            </div>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">✍️ Digital Signature</label>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('digitalSignature', e.target.files)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-900/30 dark:file:text-rose-400"
                          />
                          {documents.digitalSignature && (
                            <div className="mt-2 flex items-center gap-4">
                              <img src={documents.digitalSignature.url} alt="Digital Signature Preview" className="h-16 bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-300 dark:border-gray-600" />
                              <div className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {documents.digitalSignature.name}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">📌 Note: Leave blank to keep existing documents. Only upload if you want to update.</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditing(false)} 
                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
