import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { PatientLayout } from '../../ui/PatientLayout'

// Sample NGO data
const NGOS = [
  {
    id: 1,
    name: 'Health For All Foundation',
    type: 'healthcare',
    distance: '1.8 km',
    volunteers: 25,
    rating: 4.5,
    address: '15 Gandhi Nagar, Central District',
    focus: ['Free Health Camps', 'Medicine Distribution', 'Health Awareness', 'Medical Support'],
    email: 'contact@healthforall.org',
    phone: '+91-9876543210',
    established: '2015',
    registration: 'NGO-HC-2015-001',
    description: 'Health For All Foundation is dedicated to providing free healthcare services to underprivileged communities. We organize regular health camps, distribute essential medicines, and conduct health awareness programs.',
    services: [
      'Free Medical Checkups',
      'Medicine Distribution',
      'Health Education Workshops',
      'Vaccination Drives',
      'Emergency Medical Aid'
    ],
    achievements: [
      'Served over 50,000 patients',
      '100+ health camps organized',
      'Distributed medicines worth ₹10 lakhs',
      'Vaccinated 5,000+ children'
    ],
    workingHours: 'Monday - Saturday: 9:00 AM - 6:00 PM',
    donationInfo: 'Accepting donations for medicines and medical equipment'
  },
  {
    id: 2,
    name: 'Care & Cure NGO',
    type: 'healthcare',
    distance: '3.5 km',
    volunteers: 18,
    rating: 4.3,
    address: '45 Ring Road, Satellite, Ahmedabad',
    focus: ['Blood Donation Camps', 'Emergency Support', 'Medical Aid', 'Patient Care'],
    email: 'info@careandcure.org',
    phone: '+91-9876543211',
    established: '2017',
    registration: 'NGO-HC-2017-002',
    description: 'Care & Cure NGO focuses on emergency medical support and blood donation initiatives. We work closely with hospitals to ensure timely medical assistance to those in need.',
    services: [
      'Blood Donation Drives',
      '24/7 Emergency Support',
      'Patient Financial Aid',
      'Medical Equipment Donation',
      'Ambulance Services'
    ],
    achievements: [
      '15,000+ units of blood collected',
      'Provided emergency aid to 8,000+ patients',
      'Supported 200+ critical surgeries',
      'Active blood donor database of 5,000+'
    ],
    workingHours: '24/7 Emergency Support Available',
    donationInfo: 'Help us save lives - donate blood or contribute funds'
  },
  {
    id: 3,
    name: 'Smile Foundation',
    type: 'children',
    distance: '4.2 km',
    volunteers: 30,
    rating: 4.7,
    address: '78 SG Highway, Bodakdev, Ahmedabad, Gujarat 380054',
    focus: ['Child Healthcare', 'Education', 'Nutrition Programs', 'Immunization'],
    email: 'support@smilefoundation.org',
    phone: '+91-9876543212',
    established: '2012',
    registration: 'NGO-CH-2012-003',
    description: 'Smile Foundation works towards ensuring every child has access to quality healthcare and education. We run nutrition programs and healthcare initiatives for underprivileged children.',
    services: [
      'Child Health Checkups',
      'Nutrition Programs',
      'Education Support',
      'Immunization Camps',
      'Pediatric Care'
    ],
    achievements: [
      'Supported 20,000+ children',
      'Provided education to 5,000+ kids',
      'Running 25+ nutrition centers',
      'Immunized 10,000+ children'
    ],
    workingHours: 'Monday - Friday: 10:00 AM - 5:00 PM',
    donationInfo: 'Sponsor a child\'s education or healthcare'
  },
  {
    id: 4,
    name: 'Elderly Care Trust',
    type: 'elderly',
    distance: '5.8 km',
    volunteers: 15,
    rating: 4.4,
    address: '22 Ashram Road, Ellis Bridge, Ahmedabad',
    focus: ['Senior Citizen Health', 'Home Care', 'Medical Consultations', 'Physiotherapy'],
    email: 'care@elderlycaretrust.org',
    phone: '+91-9876543213',
    established: '2016',
    registration: 'NGO-EC-2016-004',
    description: 'Elderly Care Trust is committed to providing comprehensive healthcare services to senior citizens. We offer home care services, medical consultations, and physiotherapy.',
    services: [
      'Home Healthcare',
      'Regular Medical Checkups',
      'Physiotherapy Sessions',
      'Medicine Delivery',
      'Elder Companion Program'
    ],
    achievements: [
      'Serving 1,000+ elderly citizens',
      'Provided 10,000+ home visits',
      'Distributed free medicines to 500+ seniors',
      'Conducted 50+ health awareness sessions'
    ],
    workingHours: 'Monday - Saturday: 8:00 AM - 7:00 PM',
    donationInfo: 'Support elderly care services and medical supplies'
  },
  {
    id: 5,
    name: 'Rural Health Initiative',
    type: 'rural',
    distance: '7.1 km',
    volunteers: 22,
    rating: 4.2,
    address: '89 Sarkhej-Gandhinagar Highway, Sola, Ahmedabad',
    focus: ['Rural Healthcare', 'Mobile Clinics', 'Health Education', 'Sanitation'],
    email: 'contact@ruralhealthinitiative.org',
    phone: '+91-9876543214',
    established: '2014',
    registration: 'NGO-RH-2014-005',
    description: 'Rural Health Initiative brings healthcare to remote villages through mobile clinics and health education programs. We focus on preventive care and sanitation.',
    services: [
      'Mobile Medical Clinics',
      'Health Education Programs',
      'Sanitation Awareness',
      'Free Medicine Distribution',
      'Maternal Health Support'
    ],
    achievements: [
      'Reached 100+ remote villages',
      'Conducted 200+ mobile clinics',
      'Trained 500+ health workers',
      'Improved sanitation in 50+ villages'
    ],
    workingHours: 'Monday - Saturday: 9:00 AM - 5:00 PM (Office)',
    donationInfo: 'Help us reach more villages with healthcare'
  },
  {
    id: 6,
    name: 'Women Wellness Centre',
    type: 'women',
    distance: '2.9 km',
    volunteers: 20,
    rating: 4.6,
    address: '12 CG Road, Navrangpura, Ahmedabad, Gujarat 380009',
    focus: ['Maternal Health', 'Womens Healthcare', 'Family Planning', 'Counseling'],
    email: 'info@womenwellness.org',
    phone: '+91-9876543215',
    established: '2018',
    registration: 'NGO-WH-2018-006',
    description: 'Women Wellness Centre provides comprehensive healthcare services for women, including maternal health, family planning, and counseling services.',
    services: [
      'Prenatal & Postnatal Care',
      'Family Planning Counseling',
      'Women Health Checkups',
      'Mental Health Support',
      'Health Education Workshops'
    ],
    achievements: [
      'Supported 5,000+ pregnant women',
      'Conducted 150+ health camps',
      'Provided counseling to 3,000+ women',
      'Distributed 20,000+ hygiene kits'
    ],
    workingHours: 'Monday - Saturday: 9:00 AM - 6:00 PM',
    donationInfo: 'Support women\'s health and wellness programs'
  }
]

export default function NGODetails({ id }) {
  const ngoId = Number(id)
  const ngo = NGOS.find(n => n.id === ngoId)
  
  // Feedback form state
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState({
    impact: 0,
    transparency: 0,
    communication: 0,
    effectiveness: 0,
    comment: ''
  })
  const [submitted, setSubmitted] = useState(false)

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'volunteer'
  })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    
    // Validate rating
    if (rating === 0) {
      alert('Please provide an overall rating')
      return
    }
    
    // In real app, submit to API
    const feedbackData = {
      ngoId: ngoId,
      ngoName: ngo.name,
      overallRating: rating,
      impact: feedback.impact,
      transparency: feedback.transparency,
      communication: feedback.communication,
      effectiveness: feedback.effectiveness,
      comment: feedback.comment,
      timestamp: new Date().toISOString()
    }
    
    // Store in localStorage for demo
    const existingFeedbacks = JSON.parse(localStorage.getItem('ngoFeedbacks') || '[]')
    existingFeedbacks.push(feedbackData)
    localStorage.setItem('ngoFeedbacks', JSON.stringify(existingFeedbacks))
    
    setSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setRating(0)
      setFeedback({
        impact: 0,
        transparency: 0,
        communication: 0,
        effectiveness: 0,
        comment: ''
      })
    }, 3000)
  }

  const handleSubmitContact = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill in all required fields')
      return
    }
    
    // Store submission
    const submission = {
      ngoId: ngoId,
      ngoName: ngo.name,
      ...contactForm,
      submittedAt: new Date().toISOString()
    }
    
    const existingSubmissions = JSON.parse(localStorage.getItem('ngoContactSubmissions') || '[]')
    existingSubmissions.push(submission)
    localStorage.setItem('ngoContactSubmissions', JSON.stringify(existingSubmissions))
    
    setContactSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setContactSubmitted(false)
      setContactForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        interest: 'volunteer'
      })
    }, 3000)
  }
  
  const StarRating = ({ value, onChange, label, readOnly = false }) => {
    const [hovered, setHovered] = useState(0)
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 w-32">{label}:</span>
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

  if (!ngo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">NGO not found.</p>
          <div className="mt-4">
            <button onClick={() => route('/patient/ngos')} className="px-4 py-2 bg-primary-600 text-white rounded">Back to NGOs</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PatientLayout title={ngo.name} subtitle={`${ngo.volunteers} volunteers • ${ngo.type} • ${ngo.distance}`} showSidebar={false}>
      
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

        {/* NGO Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl flex items-center justify-center text-5xl flex-shrink-0">🤝</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ngo.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ngo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  {ngo.address}
                </a>
                {ngo.distance ? <span className="text-gray-600 dark:text-gray-400"> • {ngo.distance}</span> : null}
              </p>
              <div className="mt-3 flex items-center flex-wrap gap-4 text-sm">
                <span className="text-gray-700 dark:text-gray-300">{ngo.volunteers} volunteers</span>
                <span className="text-gray-700 dark:text-gray-300">⭐ {ngo.rating}</span>
                <span className="capitalize px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">{ngo.type}</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">Est. {ngo.established}</span>
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <p><strong>Registration:</strong> {ngo.registration}</p>
                <p><strong>Working Hours:</strong> {ngo.workingHours}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{ngo.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {ngo.focus.map((f, i) => (
                <div key={i} className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services Provided</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ngo.services.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                <span className="text-gray-800 dark:text-gray-200 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ngo.achievements.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <span className="text-purple-600 dark:text-purple-400 text-2xl">🏆</span>
                <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <a href={`mailto:${ngo.email}`} className="text-green-600 dark:text-green-400 hover:underline">{ngo.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <a href={`tel:${ngo.phone}`} className="text-green-600 dark:text-green-400 hover:underline">{ngo.phone}</a>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>💝 {ngo.donationInfo}</strong>
            </p>
          </div>
        </div>

        {/* Contact/Volunteer Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Get Involved</h3>
          
          {contactSubmitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-green-800 dark:text-green-300 font-medium">Thank you for your interest!</p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">The NGO will contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onInput={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onInput={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onInput={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91-XXXXXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I want to <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contactForm.interest}
                    onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="donate">Make a Donation</option>
                    <option value="partner">Partner with NGO</option>
                    <option value="query">General Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  value={contactForm.message}
                  onInput={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell us how you'd like to help or any questions you have..."
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit
              </button>
            </form>
          )}
        </div>

        {/* Feedback Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate this NGO</h3>
          
          {submitted ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-green-800 dark:text-green-300 font-medium">Thank you for your feedback!</p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">Your rating helps others make informed decisions.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Overall Rating</label>
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
                      } hover:scale-125`}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-gray-600 dark:text-gray-400 self-center">{rating}/5</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <StarRating
                  value={feedback.impact}
                  onChange={(val) => setFeedback({ ...feedback, impact: val })}
                  label="Impact"
                />
                <StarRating
                  value={feedback.transparency}
                  onChange={(val) => setFeedback({ ...feedback, transparency: val })}
                  label="Transparency"
                />
                <StarRating
                  value={feedback.communication}
                  onChange={(val) => setFeedback({ ...feedback, communication: val })}
                  label="Communication"
                />
                <StarRating
                  value={feedback.effectiveness}
                  onChange={(val) => setFeedback({ ...feedback, effectiveness: val })}
                  label="Effectiveness"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments (Optional)</label>
                <textarea
                  rows="3"
                  value={feedback.comment}
                  onInput={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  placeholder="Share your experience with this NGO..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      </div>
    </PatientLayout>
  )
}
