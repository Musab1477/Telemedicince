import { useState, useRef } from 'preact/hooks'
import { useI18n } from '../../contexts/I18nContext'

export function FileUpload({
  name,
  label,
  accept = '*/*',
  multiple = false,
  maxSize = 5, // MB
  maxFiles = 1,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  onFileSelect,
  onFileRemove,
  onUploadProgress,
  showPreview = true,
  allowedTypes = [],
  ...props
}) {
  const { t } = useI18n()
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef()

  const validateFile = (file) => {
    const errors = []

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      errors.push(`File size must be less than ${maxSize}MB`)
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
    }

    return errors
  }

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles)
    const validFiles = []
    const fileErrors = {}

    fileArray.forEach((file, index) => {
      const errors = validateFile(file)
      if (errors.length > 0) {
        fileErrors[file.name] = errors[0]
      } else {
        validFiles.push({
          file,
          id: Date.now() + index,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'ready'
        })
      }
    })

    // Check max files limit
    const totalFiles = files.length + validFiles.length
    if (totalFiles > maxFiles) {
      const allowedCount = maxFiles - files.length
      validFiles.splice(allowedCount)
    }

    const newFiles = [...files, ...validFiles]
    setFiles(newFiles)

    if (onFileSelect) {
      onFileSelect(newFiles.map(f => f.file), fileErrors)
    }
  }

  const handleFileRemove = (fileId) => {
    const newFiles = files.filter(f => f.id !== fileId)
    setFiles(newFiles)
    
    if (onFileRemove) {
      onFileRemove(newFiles.map(f => f.file))
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    } else if (fileType === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  }

  const canAddMoreFiles = files.length < maxFiles

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload area */}
      {canAddMoreFiles && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
            {...props}
          />

          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">
                  {t('common.upload')} a file
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {allowedTypes.length > 0 
                  ? `${allowedTypes.join(', ')} up to ${maxSize}MB`
                  : `Up to ${maxSize}MB`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center p-3 bg-white border border-gray-200 rounded-lg"
            >
              {/* File icon */}
              <div className="flex-shrink-0 mr-3">
                {getFileIcon(fileItem.type)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileItem.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileItem.size)}
                </p>
                
                {/* Upload progress */}
                {uploadProgress[fileItem.id] && (
                  <div className="mt-1">
                    <div className="bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[fileItem.id]}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress[fileItem.id]}% uploaded
                    </p>
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleFileRemove(fileItem.id)}
                disabled={disabled}
                className="ml-3 text-gray-400 hover:text-red-500 focus:outline-none disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {/* File count info */}
      {maxFiles > 1 && (
        <p className="mt-2 text-xs text-gray-500">
          {files.length} of {maxFiles} files selected
        </p>
      )}
    </div>
  )
}