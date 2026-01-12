import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { InputField } from '../../ui/InputField'
import { FileUpload } from '../../ui/FileUpload'
import { Toast } from '../../ui/Toast'
import { useI18n } from '../../../contexts/I18nContext'
import { useAuth } from '../../../contexts/AuthContext'
import { validators } from '../../../utils/validation'

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Gynecology',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Psychiatry',
  'Ophthalmology',
  'ENT',
  'Radiology',
  'Anesthesiology',
  'Emergency Medicine',
  'Surgery'
]

export function AddDoctorManually() {
  const { t } = useI18n()
  const { user } = useAuth()
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

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', active: false, onClick: () => route('/hospital/dashboard') },
    { icon: '📋', label: 'Patients', active: false, onClick: () => route('/hospital/patients-record') },
    { icon: '👨‍⚕️', label: 'Manage Doctors', active: false, onClick: () => route('/hospital/doctors') },
    // { icon: '✅', label: 'Doctor Requests', active: false, onClick: () => route('/hospital/doctor-requests') },
    { icon: '➕', label: 'Add Doctor', active: true, onClick: () => {} },
    { icon: '📝', label: 'Form Builder', active: false, onClick: () => route('/hospital/form-builder') },
  ]

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
    experience: '',
    licenseNumber: '',
    qualifications: '',
    
    // Documents
    licenseDocument: null,
    degreeDocument: null,
    idProof: null
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = t('hospital.addDoctor.errors.nameRequired')
    }

    if (!validators.phone(formData.phone)) {
      newErrors.phone = t('hospital.addDoctor.errors.invalidPhone')
    }

    if (!validators.email(formData.email)) {
      newErrors.email = t('hospital.addDoctor.errors.invalidEmail')
    }

    if (!formData.specialization) {
      newErrors.specialization = t('hospital.addDoctor.errors.specializationRequired')
    }

    if (!formData.experience.trim()) {
      newErrors.experience = t('hospital.addDoctor.errors.experienceRequired')
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = t('hospital.addDoctor.errors.licenseRequired')
    }

    if (!formData.qualifications.trim()) {
      newErrors.qualifications = t('hospital.addDoctor.errors.qualificationsRequired')
    }

    if (!formData.licenseDocument) {
      newErrors.licenseDocument = t('hospital.addDoctor.errors.licenseDocRequired')
    }

    if (!formData.degreeDocument) {
      newErrors.degreeDocument = t('hospital.addDoctor.errors.degreeDocRequired')
    }

    if (!formData.idProof) {
      newErrors.idProof = t('hospital.addDoctor.errors.idProofRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const doctorData = {
        ...formData,
        hospitalId: user?.profile?.hospitalId,
        hospitalName: user?.profile?.hospitalName,
        addedBy: user?.profile?.name || 'Hospital Admin',
        addedDate: new Date(),
        status: 'active', // Government hospitals can directly add doctors
        verificationStatus: 'verified'
      }

      console.log('Adding doctor:', doctorData)
      
      setToast({
        type: 'success',
        message: t('hospital.addDoctor.success')
      })
      
      // Redirect to doctors list after success
      setTimeout(() => {
        route('/hospital/doctors')
      }, 2000)
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || t('hospital.addDoctor.errors.addFailed')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user is from government hospital
  // if (user?.profile?.type !== 'government') {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
  //         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           ❌
  //         </div>
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">
  //           {t('hospital.addDoctor.accessDenied')}
  //         </h3>
  //         <p className="text-gray-600 mb-4">
  //           {t('hospital.addDoctor.governmentOnly')}
  //         </p>
  //         <button
  //           onClick={() => route('/hospital/dashboard')}
  //           className="btn-primary"
  //         >
  //           {t('common.backToDashboard')}
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('hospital.addDoctor.title')}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('hospital.addDoctor.description')}
                    </p>
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
            <div className="max-w-4xl mx-auto">

              {/* Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t('hospital.addDoctor.basicInfo')}
                    </h2>
              
                    <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <InputField
                    label={t('hospital.addDoctor.doctorName')}
                    value={formData.name}
                    onChange={(value) => updateFormData('name', value)}
                    error={errors.name}
                    required
                  />
                </div>

                <div>
                  <InputField
                    label={t('hospital.addDoctor.phone')}
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => updateFormData('phone', value)}
                    error={errors.phone}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <InputField
                    label={t('hospital.addDoctor.email')}
                    type="email"
                    value={formData.email}
                    onChange={(value) => updateFormData('email', value)}
                    error={errors.email}
                    required
                  />
                </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('hospital.addDoctor.specialization')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.specialization}
                          onChange={(e) => updateFormData('specialization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">{t('hospital.addDoctor.selectSpecialization')}</option>
                          {SPECIALIZATIONS.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                        {errors.specialization && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specialization}</p>
                        )}
                      </div>

                <div>
                  <InputField
                    label={t('hospital.addDoctor.experience')}
                    value={formData.experience}
                    onChange={(value) => updateFormData('experience', value)}
                    error={errors.experience}
                    placeholder="e.g., 5 years"
                    required
                  />
                </div>

                <div>
                  <InputField
                    label={t('hospital.addDoctor.licenseNumber')}
                    value={formData.licenseNumber}
                    onChange={(value) => updateFormData('licenseNumber', value)}
                    error={errors.licenseNumber}
                    required
                  />
                </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('hospital.addDoctor.qualifications')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.qualifications}
                        onChange={(e) => updateFormData('qualifications', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={t('hospital.addDoctor.qualificationsPlaceholder')}
                      />
                      {errors.qualifications && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.qualifications}</p>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t('hospital.addDoctor.documents')}
                    </h2>
              
              <div className="space-y-4">
                <div>
                  <FileUpload
                    label={t('hospital.addDoctor.licenseDocument')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5 * 1024 * 1024}
                    onFileSelect={(files) => updateFormData('licenseDocument', files[0])}
                    error={errors.licenseDocument}
                    required
                  />
                </div>

                <div>
                  <FileUpload
                    label={t('hospital.addDoctor.degreeDocument')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5 * 1024 * 1024}
                    onFileSelect={(files) => updateFormData('degreeDocument', files[0])}
                    error={errors.degreeDocument}
                    required
                  />
                </div>

                <div>
                  <FileUpload
                    label={t('hospital.addDoctor.idProof')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxSize={5 * 1024 * 1024}
                    onFileSelect={(files) => updateFormData('idProof', files[0])}
                    error={errors.idProof}
                    required
                  />
                </div>
              </div>

                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        {t('hospital.addDoctor.documentRequirements')}
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                        <li>• {t('hospital.addDoctor.docReq1')}</li>
                        <li>• {t('hospital.addDoctor.docReq2')}</li>
                        <li>• {t('hospital.addDoctor.docReq3')}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => route('/hospital/dashboard')}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t('hospital.addDoctor.adding') : t('hospital.addDoctor.addDoctor')}
                    </button>
                  </div>
                </form>
              </div>
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

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}