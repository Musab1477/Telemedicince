import { useState } from 'preact/hooks'
import { useI18n } from '../../contexts/I18nContext'

export function InputField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  inputClassName = '',
  labelClassName = '',
  icon,
  rightIcon,
  onRightIconClick,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  autoFocus = false,
  ...props
}) {
  const { t } = useI18n()
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleFocus = (e) => {
    setIsFocused(true)
    if (props.onFocus) props.onFocus(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    if (onBlur) onBlur(e)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`
  const hasError = Boolean(error)
  const isPasswordType = type === 'password'
  const actualType = isPasswordType && showPassword ? 'text' : type

  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2'
    
    const stateClasses = hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : isFocused
        ? 'border-primary-500 focus:border-primary-500 focus:ring-primary-500'
        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
    
    const disabledClasses = disabled
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
      : 'bg-white text-gray-900'
    
    const paddingClasses = icon ? 'pl-10' : (isPasswordType || rightIcon) ? 'pr-10' : ''
    
    return `${baseClasses} ${stateClasses} ${disabledClasses} ${paddingClasses} ${inputClassName}`
  }

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-1'
    const colorClasses = hasError ? 'text-red-700' : 'text-gray-700'
    return `${baseClasses} ${colorClasses} ${labelClassName}`
  }

  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {!required && (
            <span className="text-gray-400 text-xs ml-1">
              ({t('forms.optional')})
            </span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}

        {/* Input field */}
        <input
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={getInputClasses()}
          {...props}
        />

        {/* Right icon or password toggle */}
        {(isPasswordType || rightIcon) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isPasswordType ? (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            ) : rightIcon ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {rightIcon}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !hasError && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {/* Character count */}
      {maxLength && value && (
        <p className="mt-1 text-xs text-gray-400 text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  )
}

// Specialized input components
export function PhoneInput({ countryCode = '+91', ...props }) {
  return (
    <InputField
      type="tel"
      placeholder="9876543210"
      icon={
        <span className="text-sm text-gray-500">{countryCode}</span>
      }
      {...props}
    />
  )
}

export function EmailInput(props) {
  return (
    <InputField
      type="email"
      placeholder="user@example.com"
      autoComplete="email"
      icon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      }
      {...props}
    />
  )
}

export function SearchInput({ onSearch, ...props }) {
  return (
    <InputField
      type="search"
      placeholder="Search..."
      rightIcon={
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      onRightIconClick={onSearch}
      {...props}
    />
  )
}