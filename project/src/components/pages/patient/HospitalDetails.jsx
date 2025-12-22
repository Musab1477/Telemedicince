import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { PatientLayout } from '../../ui/PatientLayout'

// For now use the same sample data as Hospitals list. In future this should come from an API.
const HOSPITALS = [
  {
    id: 1,
    name: 'City General Hospital',
    type: 'government',
    distance: '2.5 km',
    doctors: 15,
    rating: 4.2,
    address: '12 MG Road, Central City',
    services: ['24x7 Emergency', 'Pharmacy', 'Laboratory', 'Radiology'],
    departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency']
  },
  {
    id: 2,
    name: 'Civil Health Center',
    type: 'government',
    distance: '5.2 km',
    doctors: 8,
    rating: 4.0,
    address: 'F Block, Civil Hospital Rd, Haripura, Asarwa, Ahmedabad',
    services: ['Outpatient', 'Maternity'],
    departments: ['General Medicine', 'Maternity']
  },
  {
    id: 3,
    name: 'Apollo Clinic',
    type: 'private',
    distance: '3.8 km',
    doctors: 12,
    rating: 4.5,
    address: '1A, Ahmedabad - Gandhinagar Rd, GIDC Bhat, estate, Ahmedabad, Gujarat 382428',
    services: ['Diagnostics', 'Specialist Consultations'],
    departments: ['Cardiology', 'Orthopedics']
  },
   {
      id: 4,
      name: 'Sunflower Semi-Private Hospital',
      type: 'semi',
      distance: '6.1 km',
      doctors: 6,
      rating: 3.9,
      address: '50, Lakudi Cross Rd, opp. Punjab National Bank, Nathalal Colony, Naranpura, Ahmedabad',
      services: ['Diagnostics', 'Specialist Consultations','General Medicine','Maternity'],
      departments: ['Cardiology', 'Orthopedics','General Medicine','Maternity']
    }
]

// Sample doctors per hospital id (in real app fetch from API)
const DOCTORS_BY_HOSPITAL = {
  1: [
    { id: 'd1', name: 'Dr. Rajesh Kumar', specialization: 'General Medicine', rating: 4.5 },
    { id: 'd2', name: 'Dr. Anjali Mehta', specialization: 'Pediatrics', rating: 4.6 }
  ],
  2: [
    { id: 'd3', name: 'Dr. Suresh Patil', specialization: 'General Medicine', rating: 4.0 }
  ],
  3: [
    { id: 'd4', name: 'Dr. Priya Sharma', specialization: 'Cardiology', rating: 4.7 },
    { id: 'd5', name: 'Dr. Vikram Joshi', specialization: 'Orthopedics', rating: 4.4 }
  ]
}

export default function HospitalDetails({ id }) {
  const hid = Number(id)
  const hospital = HOSPITALS.find(h => h.id === hid)
  const [doctors] = useState(() => DOCTORS_BY_HOSPITAL[hid] || [])
  
  // Feedback form state
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState({
    cleanliness: 0,
    staff: 0,
    facilities: 0,
    waitTime: 0,
    comment: ''
  })
  const [submitted, setSubmitted] = useState(false)

  // Custom hospital form state
  const [hospitalForm, setHospitalForm] = useState(null)
  const [formData, setFormData] = useState({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Load hospital's custom form
  useEffect(() => {
    try {
      const hospitalIdKey = `hospital_${hid}`
      const savedForm = localStorage.getItem(`hospital_form_${hospitalIdKey}`)
      if (savedForm) {
        const form = JSON.parse(savedForm)
        setHospitalForm(form)
        
        // Initialize form data
        const initialData = {}
        form.fields.forEach(field => {
          if (field.type === 'checkbox') {
            initialData[field.id] = []
          } else {
            initialData[field.id] = ''
          }
        })
        setFormData(initialData)
      }
    } catch (e) {
      console.error('Error loading hospital form:', e)
    }
  }, [hid])

  const handleFormFieldChange = (fieldId, value, fieldType) => {
    if (fieldType === 'checkbox') {
      const currentValues = formData[fieldId] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      setFormData({ ...formData, [fieldId]: newValues })
    } else {
      setFormData({ ...formData, [fieldId]: value })
    }
  }

  const handleSubmitCustomForm = (e) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = hospitalForm.fields.filter(f => f.required)
    for (const field of requiredFields) {
      const value = formData[field.id]
      if (!value || (Array.isArray(value) && value.length === 0)) {
        alert(`Please fill in the required field: ${field.label}`)
        return
      }
    }

    // Store submission
    const submission = {
      hospitalId: hid,
      hospitalName: hospital.name,
      formTitle: hospitalForm.title,
      formData,
      submittedAt: new Date().toISOString()
    }

    const existingSubmissions = JSON.parse(localStorage.getItem('hospitalFormSubmissions') || '[]')
    existingSubmissions.push(submission)
    localStorage.setItem('hospitalFormSubmissions', JSON.stringify(existingSubmissions))

    setFormSubmitted(true)
    setTimeout(() => {
      setFormSubmitted(false)
      setShowForm(false)
    }, 3000)
  }

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    
    // Validate rating
    if (rating === 0) {
      alert('Please provide an overall rating')
      return
    }
    
    // In real app, submit to API
    const feedbackData = {
      hospitalId: hid,
      hospitalName: hospital.name,
      overallRating: rating,
      cleanliness: feedback.cleanliness,
      staff: feedback.staff,
      facilities: feedback.facilities,
      waitTime: feedback.waitTime,
      comment: feedback.comment,
      timestamp: new Date().toISOString()
    }
    
    // Store in localStorage for demo
    const existingFeedbacks = JSON.parse(localStorage.getItem('hospitalFeedbacks') || '[]')
    existingFeedbacks.push(feedbackData)
    localStorage.setItem('hospitalFeedbacks', JSON.stringify(existingFeedbacks))
    
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setRating(0)
      setFeedback({
        cleanliness: 0,
        staff: 0,
        facilities: 0,
        waitTime: 0,
        comment: ''
      })
    }, 3000)
  }
  
  const StarRating = ({ value, onChange, label, readOnly = false }) => {
    const [hovered, setHovered] = useState(0)
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 w-28">{label}:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(0)}
              className={`text-2xl transition-colors ${
                star <= (readOnly ? value : (hovered || value))
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              } ${!readOnly && 'hover:scale-110 cursor-pointer'}`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{value > 0 ? `${value}/5` : ''}</span>
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Hospital not found.</p>
          <div className="mt-4">
            <button onClick={() => route('/patient/hospitals')} className="px-4 py-2 bg-primary-600 text-white rounded">Back to Hospitals</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PatientLayout title={hospital.name} subtitle={`${hospital.doctors} doctors available • ${hospital.type} • ${hospital.distance}`} showSidebar={false}>
      
      <div className="max-w-7xl mx-auto">
          {/* Custom Back Button */}
        <button
          onClick={() => {
            // Use browser's back button to maintain navigation flow
            window.history.back()
          }}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-xl flex items-center justify-center text-5xl flex-shrink-0">🏥</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{hospital.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <a
                  href={
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  {hospital.address}
                </a>
                {hospital.distance ? <span className="text-gray-600 dark:text-gray-400"> • {hospital.distance}</span> : null}
              </p>
              <div className="mt-3 flex items-center flex-wrap gap-4 text-sm">
                <span className="text-gray-700 dark:text-gray-300">{hospital.doctors} doctors</span>
                <span className="text-gray-700 dark:text-gray-300">⭐ {hospital.rating}</span>
                <span className="capitalize px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">{hospital.type}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.services.map((s, i) => (
                <div key={i} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium">{s}</div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Departments</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.departments.map((d, i) => (
                <div key={i} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium">{d}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Doctors at {hospital.name}</h3>
            <button onClick={() => route(`/patient/search-doctors?hospitalId=${hospital.id}&hospitalName=${encodeURIComponent(hospital.name)}`)} className="text-sm text-green-600 dark:text-green-400 hover:underline">View all</button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            {doctors.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">No doctors listed for this hospital.</div>
            ) : (
              doctors.map(d => (
                <div key={d.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-all gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center text-2xl flex-shrink-0">👨‍⚕️</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{d.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{d.specialization}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-sm text-gray-600 dark:text-gray-400">⭐ {d.rating}</div>
                    <button onClick={() => route(`/patient/doctor/${d.id}?fromHospital=${hospital.id}`)} className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">View Profile</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hospital Custom Form */}
        {hospitalForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6 border border-gray-200 dark:border-gray-700">
            {/* Hospital Header */}
            <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full flex items-center justify-center text-3xl">
                  🏥
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{hospital.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hospital.address}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Phone: +91-{Math.floor(Math.random() * 9000000000) + 1000000000} | Email: info@{hospital.name.toLowerCase().replace(/\s+/g, '')}.com
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Registration No: {hospital.type.toUpperCase()}-{hid}00{Math.floor(Math.random() * 1000)}</p>
                </div>
              </div>
            </div>
            
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{hospitalForm.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hospitalForm.description}</p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Fill Form
                </button>
              )}
            </div>

            {showForm && (
              <div className="mt-4">
                {formSubmitted ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">✓</div>
                    <p className="text-green-800 dark:text-green-300 font-medium">Form submitted successfully!</p>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">The hospital has received your information.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitCustomForm} className="space-y-4">
                    {hospitalForm.fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                          <textarea
                            rows="3"
                            value={formData[field.id] || ''}
                            onInput={(e) => handleFormFieldChange(field.id, e.target.value, field.type)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={formData[field.id] || ''}
                            onChange={(e) => handleFormFieldChange(field.id, e.target.value, field.type)}
                            required={field.required}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">{field.placeholder || 'Select an option'}</option>
                            {field.options.map((opt, idx) => (
                              <option key={idx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`${field.id}_${idx}`}
                                  name={field.id}
                                  value={opt}
                                  checked={formData[field.id] === opt}
                                  onChange={(e) => handleFormFieldChange(field.id, e.target.value, field.type)}
                                  required={field.required}
                                  className="mr-2"
                                />
                                <label htmlFor={`${field.id}_${idx}`} className="text-sm text-gray-700 dark:text-gray-300">{opt}</label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {field.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`${field.id}_${idx}`}
                                  value={opt}
                                  checked={(formData[field.id] || []).includes(opt)}
                                  onChange={(e) => handleFormFieldChange(field.id, opt, field.type)}
                                  className="mr-2"
                                />
                                <label htmlFor={`${field.id}_${idx}`} className="text-sm text-gray-700 dark:text-gray-300">{opt}</label>
                              </div>
                            ))}
                          </div>
                        ) : field.type === 'file' ? (
                          <input
                            type="file"
                            onChange={(e) => handleFormFieldChange(field.id, e.target.files[0]?.name || '', field.type)}
                            required={field.required}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={formData[field.id] || ''}
                            onInput={(e) => handleFormFieldChange(field.id, e.target.value, field.type)}
                            placeholder={field.placeholder}
                            required={field.required}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        )}
                      </div>
                    ))}

                    {/* Form Footer with Hospital Stamp */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-700 mt-6 pt-4">
                      <div className="flex justify-between items-start">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <p className="font-semibold mb-2">Declaration:</p>
                          <p>I hereby declare that all information provided above is true and accurate to the best of my knowledge.</p>
                          <p className="mt-3">Date: {new Date().toLocaleDateString()}</p>
                          <div className="mt-4 pt-2 border-t border-gray-300 dark:border-gray-600">
                            <p>Patient Signature: _____________________</p>
                          </div>
                        </div>
                        
                        <div className="text-right border-2 border-green-800 dark:border-green-600 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                          <div className="font-bold text-green-900 dark:text-green-300 text-sm mb-1">{hospital.name}</div>
                          <div className="text-[10px] text-green-800 dark:text-green-400 leading-tight mb-2">{hospital.address}</div>
                          <div className="border-t border-green-800 dark:border-green-600 pt-2 mt-2">
                            <div className="text-[10px] text-green-900 dark:text-green-300 font-semibold">OFFICIAL STAMP</div>
                            <div className="text-[9px] text-green-700 dark:text-green-400 mt-1">Reg: {hospital.type.toUpperCase()}-{hid}00{Math.floor(Math.random() * 1000)}</div>
                            <div className="text-[9px] text-green-700 dark:text-green-400">Ph: +91-{Math.floor(Math.random() * 9000000000) + 1000000000}</div>
                          </div>
                          <div className="mt-2 text-[8px] text-green-600 dark:text-green-500">★ VERIFIED ★</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                      >
                        Submit Form
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate Your Experience</h3>
          
          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-green-800 dark:text-green-300 font-medium">Thank you for your feedback!</p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">Your review helps other patients make informed decisions.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback}>
              {/* Overall Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={`text-4xl transition-all ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 scale-110'
                          : 'text-gray-300 dark:text-gray-600'
                      } hover:scale-125 cursor-pointer`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              {/* Detailed Ratings */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rate Specific Aspects:</h4>
                
                <StarRating
                  label="Cleanliness"
                  value={feedback.cleanliness}
                  onChange={(val) => setFeedback({ ...feedback, cleanliness: val })}
                />
                
                <StarRating
                  label="Staff Behavior"
                  value={feedback.staff}
                  onChange={(val) => setFeedback({ ...feedback, staff: val })}
                />
                
                <StarRating
                  label="Facilities"
                  value={feedback.facilities}
                  onChange={(val) => setFeedback({ ...feedback, facilities: val })}
                />
                
                <StarRating
                  label="Wait Time"
                  value={feedback.waitTime}
                  onChange={(val) => setFeedback({ ...feedback, waitTime: val })}
                />
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  value={feedback.comment}
                  onInput={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  placeholder="Share your experience with others..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRating(0)
                    setFeedback({
                      cleanliness: 0,
                      staff: 0,
                      facilities: 0,
                      waitTime: 0,
                      comment: ''
                    })
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}
