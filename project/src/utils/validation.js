// Validation utility functions
export const validators = {
  required: (value, message = 'This field is required') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message
    }
    return null
  },

  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : message
  },

  phone: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(value.replace(/\s+/g, '')) ? null : message
  },

  minLength: (min) => (value, message = `Minimum ${min} characters required`) => {
    if (!value) return null
    return value.length >= min ? null : message
  },

  maxLength: (max) => (value, message = `Maximum ${max} characters allowed`) => {
    if (!value) return null
    return value.length <= max ? null : message
  },

  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null
    return regex.test(value) ? null : message
  },

  numeric: (value, message = 'Please enter numbers only') => {
    if (!value) return null
    return /^\d+$/.test(value) ? null : message
  },

  alphanumeric: (value, message = 'Please enter letters and numbers only') => {
    if (!value) return null
    return /^[a-zA-Z0-9]+$/.test(value) ? null : message
  },

  name: (value, message = 'Please enter a valid name') => {
    if (!value) return null
    const nameRegex = /^[a-zA-Z\s.'-]+$/
    return nameRegex.test(value) ? null : message
  },

  otp: (value, message = 'Please enter a valid 6-digit OTP') => {
    if (!value) return null
    return /^\d{6}$/.test(value) ? null : message
  },

  password: (value, message = 'Password must be at least 8 characters with letters and numbers') => {
    if (!value) return null
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
    return passwordRegex.test(value) ? null : message
  },

  confirmPassword: (password) => (value, message = 'Passwords do not match') => {
    if (!value) return null
    return value === password ? null : message
  },

  fileSize: (maxSizeMB) => (file, message = `File size must be less than ${maxSizeMB}MB`) => {
    if (!file) return null
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes ? null : message
  },

  fileType: (allowedTypes) => (file, message = `File type must be one of: ${allowedTypes.join(', ')}`) => {
    if (!file) return null
    return allowedTypes.includes(file.type) ? null : message
  },

  pincode: (value, message = 'Please enter a valid PIN code') => {
    if (!value) return null
    const pincodeRegex = /^[1-9][0-9]{5}$/
    return pincodeRegex.test(value) ? null : message
  },

  gst: (value, message = 'Please enter a valid GST number') => {
    if (!value) return null
    // GST format: 15 characters - 2 state code + 10 PAN + 1 entity number + 1 Z + 1 check digit
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return gstRegex.test(value) ? null : message
  },

  pan: (value, message = 'Please enter a valid PAN number') => {
    if (!value) return null
    // PAN format: 5 letters + 4 digits + 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    return panRegex.test(value) ? null : message
  }
}

// Validation runner
export function validateField(value, validationRules) {
  if (!validationRules || validationRules.length === 0) {
    return null
  }

  for (const rule of validationRules) {
    const error = rule(value)
    if (error) {
      return error
    }
  }

  return null
}

// Validate entire form
export function validateForm(formData, validationSchema) {
  const errors = {}
  let hasErrors = false

  Object.keys(validationSchema).forEach(fieldName => {
    const fieldValue = formData[fieldName]
    const fieldRules = validationSchema[fieldName]
    const error = validateField(fieldValue, fieldRules)
    
    if (error) {
      errors[fieldName] = error
      hasErrors = true
    }
  })

  return { errors, hasErrors }
}

// Standalone validation functions for convenience
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required'
    }
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check if it's a valid Indian mobile number
  // Should be 10 digits starting with 6, 7, 8, or 9
  // Or 12 digits starting with 91 (country code)
  if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) {
    return { isValid: true }
  } else if (cleanPhone.length === 12 && /^91[6-9]\d{9}$/.test(cleanPhone)) {
    return { isValid: true }
  } else {
    return {
      isValid: false,
      error: 'Please enter a valid Indian mobile number'
    }
  }
}

export function validateOTP(otp) {
  if (!otp || otp.trim() === '') {
    return {
      isValid: false,
      error: 'OTP is required'
    }
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      isValid: false,
      error: 'OTP must be 6 digits'
    }
  }

  return { isValid: true }
}

export function validateName(name) {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Name is required'
    }
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters'
    }
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, dots, hyphens and apostrophes'
    }
  }

  return { isValid: true }
}

// Common validation schemas
export const validationSchemas = {
  patientRegistration: {
    name: [validators.required(), validators.name()],
    phone: [validators.required(), validators.phone()],
    preferredLanguage: [validators.required()]
  },

  doctorRegistration: {
    name: [validators.required(), validators.name()],
    phone: [validators.required(), validators.phone()],
    email: [validators.required(), validators.email()],
    licenseNumber: [validators.required(), validators.alphanumeric()],
    specialization: [validators.required()]
  },

  hospitalRegistration: {
    name: [validators.required()],
    phone: [validators.required(), validators.phone()],
    email: [validators.required(), validators.email()],
    address: [validators.required()],
    registrationNumber: [validators.required()]
  },

  login: {
    phone: [validators.required(), validators.phone()]
  },

  otp: {
    otp: [validators.required(), validators.otp()]
  }
}