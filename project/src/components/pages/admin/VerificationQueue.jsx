import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import { useAuth } from '../../../contexts/AuthContext'
import { useI18n } from '../../../contexts/I18nContext'
import { Loader } from '../../ui/Loader'
import { Toast } from '../../ui/Toast'

export function VerificationQueue() {
  const [queueItems, setQueueItems] = useState([])
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [toast, setToast] = useState(null)

  const { user } = useAuth()
  const { t } = useI18n()

  const [pageError, setPageError] = useState(null)

  // Mock data for verification queue
  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockQueue = [
        {
          id: 'queue_001',
          type: 'hospital',
          name: 'City General Hospital',
          submittedDate: '2024-01-15T10:30:00Z',
          priority: 'high',
          status: 'pending',
          documentsComplete: true,
          autoVerifiable: false,
          riskScore: 'low'
        },
        {
          id: 'queue_002',
          type: 'doctor',
          name: 'Dr. Rajesh Kumar',
          submittedDate: '2024-01-16T14:20:00Z',
          priority: 'medium',
          status: 'pending',
          documentsComplete: true,
          autoVerifiable: true,
          riskScore: 'low'
        },
        {
          id: 'queue_003',
          type: 'hospital',
          name: 'Apollo Healthcare Center',
          submittedDate: '2024-01-17T09:15:00Z',
          priority: 'medium',
          status: 'pending',
          documentsComplete: false,
          autoVerifiable: false,
          riskScore: 'medium'
        },
        {
          id: 'queue_004',
          type: 'doctor',
          name: 'Dr. Priya Sharma',
          submittedDate: '2024-01-18T16:45:00Z',
          priority: 'low',
          status: 'pending',
          documentsComplete: true,
          autoVerifiable: true,
          riskScore: 'low'
        },
        {
          id: 'queue_005',
          type: 'doctor',
          name: 'Dr. Amit Patel',
          submittedDate: '2024-01-19T11:30:00Z',
          priority: 'high',
          status: 'pending',
          documentsComplete: true,
          autoVerifiable: false,
          riskScore: 'high'
        }
      ]
      
      setQueueItems(mockQueue)
      setIsLoading(false)
    }

    loadQueue()
  }, [])

  let filteredAndSortedItems = []
  try {
    filteredAndSortedItems = queueItems
    .filter(item => filterType === 'all' || item.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submittedDate) - new Date(a.submittedDate)
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 }
          return riskOrder[b.riskScore] - riskOrder[a.riskScore]
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  } catch (e) {
    console.error('Error preparing verification queue:', e)
    filteredAndSortedItems = []
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(filteredAndSortedItems.map(item => item.id))
      setSelectedItems(allIds)
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId, checked) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) {
      setToast({
        type: 'error',
        message: t('admin.noItemsSelected')
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update selected items status
      const reviewerName = user?.profile?.name || 'Admin'
      const updatedItems = queueItems.map(item => 
        selectedItems.has(item.id) 
          ? { ...item, status: 'approved', reviewedBy: reviewerName, reviewedDate: new Date().toISOString() }
          : item
      )
      setQueueItems(updatedItems)

      setToast({
        type: 'success',
        message: t('admin.bulkApproveSuccess', { count: selectedItems.size })
      })

      setSelectedItems(new Set())
    } catch (error) {
      console.error('Bulk approve error:', error)
      setToast({
        type: 'error',
        message: t('admin.bulkApproveError')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) {
      setToast({
        type: 'error',
        message: t('admin.noItemsSelected')
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update selected items status
      const reviewerName = user?.profile?.name || 'Admin'
      const updatedItems = queueItems.map(item => 
        selectedItems.has(item.id) 
          ? { ...item, status: 'rejected', reviewedBy: reviewerName, reviewedDate: new Date().toISOString() }
          : item
      )
      setQueueItems(updatedItems)

      setToast({
        type: 'success',
        message: t('admin.bulkRejectSuccess', { count: selectedItems.size })
      })

      setSelectedItems(new Set())
    } catch (error) {
      console.error('Bulk reject error:', error)
      setToast({
        type: 'error',
        message: t('admin.bulkRejectError')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAutoVerify = async () => {
    const autoVerifiableItems = filteredAndSortedItems.filter(item => 
      item.autoVerifiable && item.riskScore === 'low' && item.documentsComplete
    )

    if (autoVerifiableItems.length === 0) {
      setToast({
        type: 'error',
        message: t('admin.noAutoVerifiableItems')
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Update auto-verifiable items status
      const autoVerifiableIds = new Set(autoVerifiableItems.map(item => item.id))
      const updatedItems = queueItems.map(item => 
        autoVerifiableIds.has(item.id) 
          ? { ...item, status: 'approved', reviewedBy: 'Auto-Verification System', reviewedDate: new Date().toISOString() }
          : item
      )
      setQueueItems(updatedItems)

      setToast({
        type: 'success',
        message: t('admin.autoVerifySuccess', { count: autoVerifiableItems.length })
      })
    } catch (error) {
      console.error('Auto verify error:', error)
      setToast({
        type: 'error',
        message: t('admin.autoVerifyError')
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${priorityClasses[priority]}`}>
        {t(`admin.priority.${priority}`)}
      </span>
    )
  }

  const getRiskBadge = (riskScore) => {
    const riskClasses = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${riskClasses[riskScore]}`}>
        {t(`admin.risk.${riskScore}`)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader type="form" />
      </div>
    )
  }

  const pendingItems = filteredAndSortedItems.filter(item => item.status === 'pending')
  const autoVerifiableCount = pendingItems.filter(item => 
    item.autoVerifiable && item.riskScore === 'low' && item.documentsComplete
  ).length

  // If some error occurred while preparing the page, show a friendly error
  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center max-w-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('admin.queueError') || 'Error loading verification queue'}</h2>
          <p className="text-sm text-gray-600 mb-4">{pageError.message || String(pageError)}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Reload</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t('admin.verificationQueue')}
              </h1>
              <p className="text-gray-600">
                {t('admin.verificationQueueDesc')}
              </p>
            </div>
            <button 
              onClick={() => route('/admin/dashboard')}
              className="btn-secondary"
            >
              {t('common.backToDashboard')}
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="card">
            <h3 className="font-medium text-gray-700 mb-1">{t('admin.totalPending')}</h3>
            <div className="text-2xl font-bold text-gray-800">{pendingItems.length}</div>
          </div>
          <div className="card">
            <h3 className="font-medium text-gray-700 mb-1">{t('admin.autoVerifiable')}</h3>
            <div className="text-2xl font-bold text-green-600">{autoVerifiableCount}</div>
          </div>
          <div className="card">
            <h3 className="font-medium text-gray-700 mb-1">{t('admin.highPriority')}</h3>
            <div className="text-2xl font-bold text-red-600">
              {pendingItems.filter(item => item.priority === 'high').length}
            </div>
          </div>
          <div className="card">
            <h3 className="font-medium text-gray-700 mb-1">{t('admin.highRisk')}</h3>
            <div className="text-2xl font-bold text-orange-600">
              {pendingItems.filter(item => item.riskScore === 'high').length}
            </div>
          </div>
        </div>

        <div className="card">
          {/* Controls */}
          <div className="mb-6 space-y-4">
            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.filterByType')}
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">{t('admin.allTypes')}</option>
                  <option value="hospital">{t('admin.hospitals')}</option>
                  <option value="doctor">{t('admin.doctors')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="date">{t('admin.submissionDate')}</option>
                  <option value="priority">{t('admin.priority')}</option>
                  <option value="risk">{t('admin.riskScore')}</option>
                  <option value="name">{t('admin.name')}</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAutoVerify}
                disabled={isProcessing || autoVerifiableCount === 0}
                className="btn-primary"
              >
                {isProcessing ? t('common.processing') : t('admin.autoVerify')} ({autoVerifiableCount})
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={isProcessing || selectedItems.size === 0}
                className="btn-secondary"
              >
                {isProcessing ? t('common.processing') : t('admin.bulkApprove')} ({selectedItems.size})
              </button>
              <button
                onClick={handleBulkReject}
                disabled={isProcessing || selectedItems.size === 0}
                className="btn-secondary"
              >
                {isProcessing ? t('common.processing') : t('admin.bulkReject')} ({selectedItems.size})
              </button>
            </div>
          </div>

          {/* Queue Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.entity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.submitted')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.priority')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.risk')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className={selectedItems.has(item.id) ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            {item.documentsComplete ? (
                              <span className="text-green-600">✓ {t('admin.docsComplete')}</span>
                            ) : (
                              <span className="text-red-600">✗ {t('admin.docsIncomplete')}</span>
                            )}
                            {item.autoVerifiable && (
                              <span className="text-blue-600">🤖 {t('admin.autoVerifiable')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">
                        {t(`admin.${item.type}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.submittedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(item.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskBadge(item.riskScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(`admin.status.${item.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => route(`/admin/verify-entities?id=${item.id}&type=${item.type}`)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t('admin.review')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('admin.noItemsInQueue')}</p>
            </div>
          )}
        </div>
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