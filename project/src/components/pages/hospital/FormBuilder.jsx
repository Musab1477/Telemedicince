import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import { useAuth } from '../../../contexts/AuthContext'

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Long Text (Textarea)' },
  { value: 'select', label: 'Dropdown (Select)' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' }
]

export function FormBuilder() {
  const { user } = useAuth()
  const hospitalId = user?.hospitalId || 'hospital_1' // In real app, get from auth
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const [formTitle, setFormTitle] = useState('Patient Information Form')
  const [formDescription, setFormDescription] = useState('Please fill in all required information')
  const [fields, setFields] = useState([])
  const [showAddField, setShowAddField] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // New field form state
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: [] // for select, radio, checkbox
  })
  const [optionInput, setOptionInput] = useState('')

  // Dark mode initialization
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
    { icon: '✅', label: 'Doctor Requests', active: false, onClick: () => route('/hospital/doctor-requests') },
    { icon: '➕', label: 'Add Doctor', active: false, onClick: () => route('/hospital/add-doctor') },
    { icon: '📝', label: 'Form Builder', active: true, onClick: () => {} },
  ]

  // Load existing form if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`hospital_form_${hospitalId}`)
      if (saved) {
        const data = JSON.parse(saved)
        setFormTitle(data.title || 'Patient Information Form')
        setFormDescription(data.description || '')
        setFields(data.fields || [])
      }
    } catch (e) {
      console.error('Error loading form:', e)
    }
  }, [hospitalId])

  const handleAddField = () => {
    if (!newField.label.trim()) {
      alert('Please enter field label')
      return
    }

    const field = {
      id: `field_${Date.now()}`,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder,
      options: newField.options
    }

    setFields([...fields, field])
    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: []
    })
    setOptionInput('')
    setShowAddField(false)
  }

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setNewField({
        ...newField,
        options: [...newField.options, optionInput.trim()]
      })
      setOptionInput('')
    }
  }

  const handleRemoveOption = (index) => {
    const updated = [...newField.options]
    updated.splice(index, 1)
    setNewField({ ...newField, options: updated })
  }

  const handleDeleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId))
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const updated = [...fields]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    setFields(updated)
  }

  const handleMoveDown = (index) => {
    if (index === fields.length - 1) return
    const updated = [...fields]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    setFields(updated)
  }

  const handleSaveForm = () => {
    if (fields.length === 0) {
      alert('Please add at least one field to the form')
      return
    }

    const formData = {
      hospitalId,
      title: formTitle,
      description: formDescription,
      fields,
      createdAt: new Date().toISOString()
    }

    localStorage.setItem(`hospital_form_${hospitalId}`, JSON.stringify(formData))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const needsOptions = ['select', 'radio', 'checkbox'].includes(newField.type)

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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Form Builder</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create custom patient forms</p>
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
            <div className="max-w-5xl mx-auto">
              {saved && (
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <p className="text-green-800 dark:text-green-300 font-medium">✓ Form saved successfully!</p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">Patients can now see this form on your hospital profile.</p>
                </div>
              )}

              {/* Form Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Form Title
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onInput={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Patient Registration Form"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Form Description
                    </label>
                    <textarea
                      rows="2"
                      value={formDescription}
                      onInput={(e) => setFormDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Brief description for patients..."
                    />
                  </div>
                </div>
              </div>

              {/* Fields List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Form Fields</h2>
                  <button
                    onClick={() => setShowAddField(!showAddField)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    {showAddField ? 'Cancel' : '+ Add Field'}
                  </button>
                </div>

                {/* Add Field Form */}
                {showAddField && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">New Field</h3>
              
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Field Label *
                        </label>
                        <input
                          type="text"
                          value={newField.label}
                          onInput={(e) => setNewField({ ...newField, label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g., Full Name, Age, Blood Group"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Field Type
                        </label>
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField({ ...newField, type: e.target.value, options: [] })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          {FIELD_TYPES.map(ft => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={newField.placeholder}
                          onInput={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          placeholder="Hint text for the field..."
                        />
                      </div>

                      {needsOptions && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Options
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={optionInput}
                              onInput={(e) => setOptionInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter option and press Add"
                            />
                            <button
                              type="button"
                              onClick={handleAddOption}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                            >
                              Add
                            </button>
                          </div>
                          {newField.options.length > 0 && (
                            <div className="space-y-1">
                              {newField.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-600">
                                  <span className="text-sm text-gray-900 dark:text-white">{opt}</span>
                                  <button
                                    onClick={() => handleRemoveOption(idx)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="required"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="mr-2"
                        />
                        <label htmlFor="required" className="text-sm text-gray-700 dark:text-gray-300">
                          Required field
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleAddField}
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Add Field
                        </button>
                        <button
                          onClick={() => {
                            setShowAddField(false)
                            setNewField({ label: '', type: 'text', required: false, placeholder: '', options: [] })
                            setOptionInput('')
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fields List */}
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No fields added yet.</p>
                    <p className="text-sm mt-1">Click "Add Field" to start building your form.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{field.label}</h4>
                              {field.required && <span className="text-red-500 dark:text-red-400 text-sm">*</span>}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Type: <span className="font-medium">{FIELD_TYPES.find(ft => ft.value === field.type)?.label}</span>
                            </p>
                            {field.placeholder && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Placeholder: "{field.placeholder}"</p>
                            )}
                            {field.options && field.options.length > 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Options: {field.options.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`px-2 py-1 text-sm rounded ${index === 0 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === fields.length - 1}
                              className={`px-2 py-1 text-sm rounded ${index === fields.length - 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleDeleteField(field.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveForm}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Save Form
                </button>
                <button
                  onClick={() => route('/hospital/dashboard')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Preview Section */}
              {fields.length > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Preview</h2>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{formTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{formDescription}</p>
              
                    <div className="space-y-4">
                      {fields.map(field => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500 dark:text-red-400">*</span>}
                          </label>
                          
                          {field.type === 'textarea' ? (
                            <textarea
                              disabled
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              rows="3"
                            />
                          ) : field.type === 'select' ? (
                            <select disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                              <option>{field.placeholder || 'Select an option'}</option>
                              {field.options.map((opt, idx) => (
                                <option key={idx}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'radio' ? (
                            <div className="space-y-2">
                              {field.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center">
                                  <input type="radio" disabled className="mr-2" />
                                  <label className="text-sm text-gray-700 dark:text-gray-300">{opt}</label>
                                </div>
                              ))}
                            </div>
                          ) : field.type === 'checkbox' ? (
                            <div className="space-y-2">
                              {field.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center">
                                  <input type="checkbox" disabled className="mr-2" />
                                  <label className="text-sm text-gray-700 dark:text-gray-300">{opt}</label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              disabled
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  )
}

export default FormBuilder
