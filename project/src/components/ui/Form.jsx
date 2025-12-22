import { useState } from 'preact/hooks'
import { validateForm } from '../../utils/validation'
import { useI18n } from '../../contexts/I18nContext'
import { SpinnerLoader } from './Loader'

export function Form({
  children,
  onSubmit,
  validationSchema = {},
  initialData = {},
  className = '',
  submitButtonText = 'Submit',
  submitButtonClassName = '',
  showSubmitButton = true,
  isLoading = false,
  disabled = false,
  resetOnSubmit = false,
  ...props
}) {
  const { t } = useI18n()
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const markFieldTouched = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const validateSingleField = (name, value) => {
    if (!validationSchema[name]) return null

    const fieldRules = validationSchema[name]
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }

  const handleFieldChange = (name, value) => {
    updateField(name, value)
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateSingleField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleFieldBlur = (name) => {
    markFieldTouched(name)
    const value = formData[name]
    const error = validateSingleField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (disabled || isLoading || isSubmitting) return

    // Validate entire form
    const { errors: validationErrors, hasErrors } = validateForm(formData, validationSchema)
    
    if (hasErrors) {
      setErrors(validationErrors)
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
      setTouched(allTouched)
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(formData, {
        setFieldError: (field, error) => {
          setErrors(prev => ({ ...prev, [field]: error }))
        },
        setFormData,
        resetForm: () => {
          setFormData(initialData)
          setErrors({})
          setTouched({})
        }
      })

      if (resetOnSubmit) {
        setFormData(initialData)
        setErrors({})
        setTouched({})
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContext = {
    formData,
    errors,
    touched,
    isSubmitting: isSubmitting || isLoading,
    disabled,
    updateField: handleFieldChange,
    markFieldTouched: handleFieldBlur,
    setFieldError: (field, error) => {
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className} {...props}>
      <FormContext.Provider value={formContext}>
        {children}
        
        {showSubmitButton && (
          <div className="mt-6">
            <button
              type="submit"
              disabled={disabled || isLoading || isSubmitting}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${submitButtonClassName}`}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <SpinnerLoader className="mr-2" />
                  {t('common.loading')}
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        )}
      </FormContext.Provider>
    </form>
  )
}

// Form context for child components
import { createContext } from 'preact'
import { useContext } from 'preact/hooks'

const FormContext = createContext()

export function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a Form component')
  }
  return context
}

// Form field wrapper component
export function FormField({ name, children, className = '' }) {
  const { formData, errors, touched, updateField, markFieldTouched } = useFormContext()
  
  const fieldProps = {
    name,
    value: formData[name] || '',
    onChange: (e) => updateField(name, e.target.value),
    onBlur: () => markFieldTouched(name),
    error: touched[name] ? errors[name] : null
  }

  return (
    <div className={className}>
      {typeof children === 'function' ? children(fieldProps) : children}
    </div>
  )
}