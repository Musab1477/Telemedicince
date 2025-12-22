import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import api from '../../../utils/api'

export function DoctorRegister() {
  const [step, setStep] = useState(1)
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    medicalLicense: '',
    specialization: '',
    experience: '',
    qualification: '',
    hospital: '',
    hospitalType: 'private', // private | government
  })

  const [documents, setDocuments] = useState({
    degreeFiles: [],
    certificateFiles: [],
    licenseScan: null,
    idProof: null,
    digitalSignature: null,
  })

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleFileChange(field, files) {
    // convert FileList to array and store minimal info for preview
    const arr = Array.from(files).map(f => ({ name: f.name, size: f.size, file: f, url: URL.createObjectURL(f) }))
    if (field === 'licenseScan' || field === 'idProof' || field === 'digitalSignature') {
      setDocuments(prev => ({ ...prev, [field]: arr[0] || null }))
    } else {
      setDocuments(prev => ({ ...prev, [field]: arr }))
    }
  }

  function goNext() {
    // basic validation for step 1
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.medicalLicense) {
      alert('Please fill required personal information (first name, last name, phone, email, license) before continuing.')
      return
    }
    setStep(2)
  }

  function goBack() {
    setStep(s => Math.max(1, s - 1))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.medicalLicense) {
        throw new Error('Please fill all required personal information fields')
      }

      // Validate required documents
      if (documents.degreeFiles.length === 0) {
        throw new Error('Please upload at least one degree/medical certificate')
      }
      if (!documents.licenseScan) {
        throw new Error('Please upload your medical license scan')
      }
      if (!documents.idProof) {
        throw new Error('Please upload your government ID/address proof')
      }
      if (!documents.digitalSignature) {
        throw new Error('Please upload your digital signature')
      }

      // Create FormData to handle both text and file data
      const formDataToSend = new FormData()

      // Add text fields
      formDataToSend.append('first_name', formData.firstName)
      formDataToSend.append('last_name', formData.lastName)
      formDataToSend.append('mobile_number', formData.phone)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('doctor_license_number', formData.medicalLicense)
      formDataToSend.append('specialization', formData.specialization)
      formDataToSend.append('years_of_experience', parseInt(formData.experience, 10) || 0)
      formDataToSend.append('highest_qualification', formData.qualification)
      
      // Add current hospital (optional)
      if (formData.hospital) {
        formDataToSend.append('current_hospital', formData.hospital)
      }

      // Add degree files (required)
      documents.degreeFiles.forEach((file, index) => {
        if (file && file.file) {
          formDataToSend.append(`degree_document`, file.file, file.name)
        }
      })

      // Add certificate files (optional)
      documents.certificateFiles.forEach((file, index) => {
        if (file && file.file) {
          formDataToSend.append(`other_certificate_document`, file.file, file.name)
        }
      })

      // Add license scan (required)
      if (documents.licenseScan && documents.licenseScan.file) {
        formDataToSend.append('medical_license_document', documents.licenseScan.file, documents.licenseScan.name)
      }

      // Add ID proof (required)
      if (documents.idProof && documents.idProof.file) {
        formDataToSend.append('address_proof_document', documents.idProof.file, documents.idProof.name)
      }

      // Add digital signature (required)
      if (documents.digitalSignature && documents.digitalSignature.file) {
        formDataToSend.append('digital_signature_certificate', documents.digitalSignature.file, documents.digitalSignature.name)
      }

      console.log('📤 Sending Doctor Registration with All Documents and Files')
      console.log('Personal Info:', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.phone,
        email: formData.email,
        doctor_license_number: formData.medicalLicense,
        specialization: formData.specialization,
        years_of_experience: parseInt(formData.experience, 10) || 0,
        highest_qualification: formData.qualification,
        current_hospital: formData.hospital || 'Not provided'
      })
      console.log('Document Files Being Sent:', {
        degree_files: documents.degreeFiles.map(f => f.name),
        certificate_files: documents.certificateFiles.map(f => f.name),
        license_scan: documents.licenseScan?.name,
        id_proof: documents.idProof?.name,
        digital_signature: documents.digitalSignature?.name
      })
      console.log('FormData Content:', formDataToSend)

      // Call API with FormData
      const response = await api.createDoctorWithFiles(formDataToSend)

      console.log('✅ Doctor Registration Success Response:', response)
      console.log('Response Type:', typeof response)
      console.log('Response Keys:', Object.keys(response))

      // Store doctor info and generated password in localStorage
      localStorage.setItem('doctorRegistered', JSON.stringify({
        id: response.doctor?.id,
        firstName: response.doctor?.first_name,
        lastName: response.doctor?.last_name,
        email: response.doctor?.email,
        phone: response.doctor?.mobile_number,
        role: response.doctor?.role,
        generatedPassword: response.generated_password
      }))

      // Show success alert with generated password
      alert(`Registration Successful!\n\nYour temporary password has been sent to your email.\n\nPassword: ${response.generated_password}`)
      route('/doctor/login')
      return
    } catch (err) {
      console.error('❌ Doctor Registration Error:', err)
      console.error('Error Status:', err.status)
      console.error('Error Body:', err.body)
      console.error('Error Message:', err.message)
      
      const errorMsg = err.body?.message || err.message || 'Registration failed. Please try again.'
      setError(errorMsg)
      alert('Error: ' + errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <button 
                  onClick={() => route('/doctor/login')}
                  className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Login
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Doctor Registration</h1>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-colors">
            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                👨‍⚕️
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Doctor Registration</h2>
              <p className="text-gray-600 dark:text-gray-400">Provide personal details, then upload documents for verification</p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step >= 1 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      1
                    </div>
                    <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Personal Info</span>
                  </div>

                  {/* Connector Line */}
                  <div className={`w-16 sm:w-24 h-1 mx-2 transition-colors ${
                    step >= 2 
                      ? 'bg-green-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}></div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step >= 2 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Documents</span>
                  </div>
                </div>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                    <input 
                      type="text" 
                      value={formData.firstName} 
                      onInput={e => updateFormData('firstName', e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                      placeholder="First name" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                    <input 
                      type="text" 
                      value={formData.lastName} 
                      onInput={e => updateFormData('lastName', e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                      placeholder="Last name" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onInput={e => updateFormData('phone', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                    placeholder="+91 XXXXX XXXXX" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onInput={e => updateFormData('email', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                    placeholder="doctor@example.com" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical License Number *</label>
                    <input 
                      type="text" 
                      value={formData.medicalLicense} 
                      onInput={e => updateFormData('medicalLicense', e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                      placeholder="MH12345" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization *</label>
                    <input 
                      type="text" 
                      value={formData.specialization} 
                      onInput={e => updateFormData('specialization', e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                      placeholder="e.g., Cardiology, Pediatrics" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Years of Experience *</label>
                    <input 
                      type="number" 
                      value={formData.experience} 
                      onInput={e => updateFormData('experience', e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                      placeholder="Enter number of years" 
                      min="0"
                      max="70"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Highest Qualification *</label>
                    <input 
                      type="text" 
                      value={formData.qualification} 
                      onInput={e => updateFormData('qualification', e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                      placeholder="MBBS, MD" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Hospital/Clinic (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.hospital} 
                    onInput={e => updateFormData('hospital', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors" 
                    placeholder="Hospital/Clinic Name" 
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={goNext} 
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl"
                  >
                    Next: Documents →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📄 Degree / Medical Certificates *
                  </label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,.pdf" 
                    onChange={(e) => handleFileChange('degreeFiles', e.target.files)} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 dark:file:bg-green-900/20 file:text-green-700 dark:file:text-green-300 file:cursor-pointer hover:file:bg-green-100 dark:hover:file:bg-green-900/30 transition-colors"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {documents.degreeFiles.length === 0 ? (
                      <span className="italic">No files selected</span>
                    ) : (
                      <ul className="space-y-1">
                        {documents.degreeFiles.map(f => (
                          <li key={f.name} className="flex items-center">
                            <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📜 Other Certificates (optional)
                  </label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,.pdf" 
                    onChange={(e) => handleFileChange('certificateFiles', e.target.files)} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 file:cursor-pointer hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30 transition-colors"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {documents.certificateFiles.length === 0 ? (
                      <span className="italic">No files selected</span>
                    ) : (
                      <ul className="space-y-1">
                        {documents.certificateFiles.map(f => (
                          <li key={f.name} className="flex items-center">
                            <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🔖 Medical License Scan *
                    </label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={(e) => handleFileChange('licenseScan', e.target.files)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 dark:file:bg-amber-900/20 file:text-amber-700 dark:file:text-amber-300 file:cursor-pointer hover:file:bg-amber-100 dark:hover:file:bg-amber-900/30 transition-colors"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {documents.licenseScan ? (
                        <span className="flex items-center">
                          <span className="text-amber-600 dark:text-amber-400 mr-2">✓</span>
                          {documents.licenseScan.name}
                        </span>
                      ) : (
                        <span className="italic">No file selected</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🆔 Government ID / Address Proof *
                    </label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={(e) => handleFileChange('idProof', e.target.files)} 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 dark:file:bg-purple-900/20 file:text-purple-700 dark:file:text-purple-300 file:cursor-pointer hover:file:bg-purple-100 dark:hover:file:bg-purple-900/30 transition-colors"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {documents.idProof ? (
                        <span className="flex items-center">
                          <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                          {documents.idProof.name}
                        </span>
                      ) : (
                        <span className="italic">No file selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ✍️ Digital Signature Certificate *
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(This will appear on all prescriptions)</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*,.png,.jpg,.jpeg" 
                    onChange={(e) => handleFileChange('digitalSignature', e.target.files)} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-50 dark:file:bg-pink-900/20 file:text-pink-700 dark:file:text-pink-300 file:cursor-pointer hover:file:bg-pink-100 dark:hover:file:bg-pink-900/30 transition-colors"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {documents.digitalSignature ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="flex items-center">
                          <span className="text-pink-600 dark:text-pink-400 mr-2">✓</span>
                          {documents.digitalSignature.name}
                        </span>
                        {documents.digitalSignature.url && (
                          <img 
                            src={documents.digitalSignature.url} 
                            alt="Signature preview" 
                            className="h-16 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 p-2" 
                          />
                        )}
                      </div>
                    ) : (
                      <span className="italic">No signature uploaded</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Upload a transparent PNG image of your handwritten signature or a scanned signature image
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button 
                    type="button" 
                    onClick={goBack} 
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                      isLoading
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg transition-colors font-medium shadow-lg ${
                      isLoading
                        ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                    }`}
                  >
                    {isLoading ? 'Processing...' : 'Submit Registration ✓'}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Already registered?</p>
            <button 
              onClick={() => route('/doctor/login')}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
            >
              Login Here
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}