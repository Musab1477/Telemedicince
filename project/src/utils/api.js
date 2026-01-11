// Use VITE environment variable for API base URL
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'
const BASE_URL = (typeof window !== 'undefined' && window.__API_BASE__) || VITE_API_BASE_URL

async function request(path, options = {}) {
  // Ensure BASE_URL ends without trailing slash, and path starts with /
  const cleanBase = BASE_URL.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${cleanBase}${cleanPath}`
  
  console.log('API Request:', fullUrl) // Debug log
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  const res = await fetch(fullUrl, {
    ...options,
    headers
  })
  const contentType = res.headers.get('content-type') || ''
  let body = null
  if (contentType.includes('application/json')) body = await res.json()
  else body = await res.text()

  if (!res.ok) {
    const err = new Error(body?.message || `Request failed: ${res.status}`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export async function postDoctorRegistration(formFields = {}, files = {}) {
  // formFields: object of scalar values
  // files: { degreeFiles: [File], certificateFiles: [File], licenseScan: File, idProof: File }
  const fd = new FormData()
  Object.keys(formFields).forEach(k => {
    if (formFields[k] !== undefined && formFields[k] !== null) fd.append(k, formFields[k])
  })

  // append files
  if (files.degreeFiles && files.degreeFiles.length) {
    files.degreeFiles.forEach((f, i) => fd.append('degreeFiles', f, f.name))
  }
  if (files.certificateFiles && files.certificateFiles.length) {
    files.certificateFiles.forEach((f, i) => fd.append('certificateFiles', f, f.name))
  }
  if (files.licenseScan) fd.append('licenseScan', files.licenseScan, files.licenseScan.name)
  if (files.idProof) fd.append('idProof', files.idProof, files.idProof.name)

  // POST to registrations endpoint
  return await request('/registrations/doctor', { method: 'POST', body: fd })
}

export async function getRegistrationStatus(registrationId) {
  return await request(`/registrations/${encodeURIComponent(registrationId)}`, { method: 'GET' })
}

export async function resendRegistration(registrationId) {
  return await request(`/registrations/${encodeURIComponent(registrationId)}/resend`, { method: 'POST' })
}

export async function cancelRegistration(registrationId) {
  return await request(`/registrations/${encodeURIComponent(registrationId)}`, { method: 'DELETE' })
}

export async function createPatient(payload) {
  return await request('/auth/create-patient/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function createDoctor(payload) {
  return await request('/auth/create-doctor/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function createDoctorWithFiles(formData) {
  // For FormData, we need to use fetch directly without JSON stringification
  // and let the request helper handle the URL construction
  const cleanBase = BASE_URL.replace(/\/$/, '')
  const fullUrl = `${cleanBase}/auth/create-doctor/`
  
  console.log('API Request with Files:', fullUrl)
  
  const res = await fetch(fullUrl, {
    method: 'POST',
    body: formData
    // Note: Do NOT set Content-Type header when using FormData - browser will set it automatically
  })

  const contentType = res.headers.get('content-type') || ''
  let body = null
  if (contentType.includes('application/json')) body = await res.json()
  else body = await res.text()

  if (!res.ok) {
    const err = new Error(body?.message || `Request failed: ${res.status}`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

export async function createHospital(payload) {
  return await request('/auth/create-hospital/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// Patient Login APIs
export async function loginPatient(mobileNumber) {
  console.log('📤 Patient Login Request:', { mobile_number: mobileNumber })
  return await request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber })
  })
}

export async function verifyOTP(userId, otp) {
  console.log('📤 OTP Verification Request:', { user_id: userId, otp })
  return await request('/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, otp })
  })
}

export async function logoutPatient() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Patient Logout Request')
  return await request('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

export async function getPatientProfile() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Get Patient Profile Request')
  return await request('/auth/profile/', {
    method: 'GET',
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

export async function updatePatientProfile(profileData) {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Update Patient Profile Request:', profileData)
  return await request('/auth/profile/', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

// Doctor Login APIs
export async function loginDoctor(mobileNumber, password) {
  console.log('📤 Doctor Login Request:', { mobile_number: mobileNumber, password })
  return await request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber, password })
  })
}

export async function verifyDoctorOTP(userId, otp) {
  console.log('📤 Doctor OTP Verification Request:', { user_id: userId, otp })
  return await request('/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, otp })
  })
}

export async function logoutDoctor() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Doctor Logout Request')
  return await request('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

export async function getDoctorProfile() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Get Doctor Profile Request')
  return await request('/auth/profile/', {
    method: 'GET',
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

// Hospital Login APIs
export async function loginHospital(mobileNumber, password) {
  console.log('📤 Hospital Login Request:', { mobile_number: mobileNumber, password })
  return await request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber, password })
  })
}

export async function verifyHospitalOTP(userId, otp) {
  console.log('📤 Hospital OTP Verification Request:', { user_id: userId, otp })
  return await request('/auth/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, otp })
  })
}

export async function logoutHospital() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Hospital Logout Request')
  return await request('/auth/logout/', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

export async function getHospitalProfile() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Get Hospital Profile Request')
  return await request('/auth/profile/', {
    method: 'GET',
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

// NGO APIs
export async function createNGO(payload) {
  console.log('📤 NGO Registration Request:', payload)
  return await request('/auth/ngo/register/', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function loginNGO(mobileNumber, password) {
  console.log('📤 NGO Login Request:', { mobile_number: mobileNumber, password })
  return await request('/auth/ngo/login/', {
    method: 'POST',
    body: JSON.stringify({ mobile_number: mobileNumber, password })
  })
}

export async function verifyNGOOTP(userId, otp) {
  console.log('📤 NGO OTP Verification Request:', { user_id: userId, otp })
  return await request('/auth/ngo/verify-otp/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, otp })
  })
}

export async function logoutNGO() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 NGO Logout Request')
  return await request('/auth/ngo/logout/', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

export async function getNGOProfile() {
  const accessToken = localStorage.getItem('accessToken')
  console.log('📤 Get NGO Profile Request')
  return await request('/auth/ngo/profile/', {
    method: 'GET',
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
  })
}

export default { postDoctorRegistration, getRegistrationStatus, resendRegistration, cancelRegistration, createPatient, createDoctor, createDoctorWithFiles, createHospital, loginPatient, verifyOTP, logoutPatient, getPatientProfile, updatePatientProfile, loginDoctor, verifyDoctorOTP, logoutDoctor, getDoctorProfile, loginHospital, verifyHospitalOTP, logoutHospital, getHospitalProfile, createNGO, loginNGO, verifyNGOOTP, logoutNGO, getNGOProfile }
