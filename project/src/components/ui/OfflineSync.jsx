/**
 * OfflineSync - Component for managing offline data synchronization
 * Shows sync status and provides manual sync controls
 */

import { useState, useEffect } from 'preact/hooks'
import { useNetwork } from '../../contexts/NetworkContext'
import { useTranslation } from '../../contexts/I18nContext'

export function OfflineSync({ className = '', showDetails = false }) {
  const { 
    isOnline, 
    syncStats, 
    hasPendingSync, 
    hasFailedSync,
    forceSyncQueue,
    clearCompletedSync,
    updateSyncStats
  } = useNetwork()
  
  const { t } = useTranslation()
  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)

  useEffect(() => {
    // Update last sync time when sync completes
    if (!hasPendingSync && syncStats.completed > 0) {
      setLastSyncTime(new Date())
    }
  }, [hasPendingSync, syncStats.completed])

  const handleManualSync = async () => {
    if (!isOnline || isManualSyncing) return
    
    setIsManualSyncing(true)
    try {
      await forceSyncQueue()
      await updateSyncStats()
    } catch (error) {
      console.error('Manual sync failed:', error)
    } finally {
      setIsManualSyncing(false)
    }
  }

  const handleClearCompleted = async () => {
    try {
      await clearCompletedSync()
    } catch (error) {
      console.error('Failed to clear completed items:', error)
    }
  }

  if (!showDetails && !hasPendingSync && !hasFailedSync) {
    return null
  }

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">
          {t('sync.title')}
        </h3>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <div className="flex items-center text-green-600 text-xs">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
              {t('network.online')}
            </div>
          ) : (
            <div className="flex items-center text-red-600 text-xs">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
              {t('network.offline')}
            </div>
          )}
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{syncStats.pending}</div>
          <div className="text-gray-600 text-xs">{t('sync.pending')}</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-semibold text-gray-900">{syncStats.completed}</div>
          <div className="text-gray-600 text-xs">{t('sync.completed')}</div>
        </div>
        {showDetails && (
          <>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">{syncStats.inProgress}</div>
              <div className="text-gray-600 text-xs">{t('sync.inProgress')}</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold text-red-600">{syncStats.failed}</div>
              <div className="text-gray-600 text-xs">{t('sync.failed')}</div>
            </div>
          </>
        )}
      </div>

      {/* Sync Status Messages */}
      {hasPendingSync && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="flex items-center text-blue-800">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
            {t('sync.syncingItems', { count: syncStats.pending })}
          </div>
        </div>
      )}

      {hasFailedSync && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <div className="flex items-center text-red-800">
            <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('sync.failedItems', { count: syncStats.failed })}
          </div>
        </div>
      )}

      {/* Last Sync Time */}
      {lastSyncTime && (
        <div className="mb-3 text-xs text-gray-500">
          {t('sync.lastSync')}: {lastSyncTime.toLocaleTimeString()}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleManualSync}
          disabled={!isOnline || isManualSyncing || (!hasPendingSync && !hasFailedSync)}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isManualSyncing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
              {t('sync.syncing')}
            </div>
          ) : (
            t('sync.syncNow')
          )}
        </button>

        {showDetails && syncStats.completed > 0 && (
          <button
            onClick={handleClearCompleted}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {t('sync.clearCompleted')}
          </button>
        )}
      </div>

      {/* Offline Help Text */}
      {!isOnline && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <div className="flex items-start">
            <svg className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('sync.offlineHelp')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for headers/toolbars
export function OfflineSyncIndicator({ className = '' }) {
  const { isOnline, hasPendingSync, hasFailedSync, syncStats } = useNetwork()
  const { t } = useTranslation()

  if (!hasPendingSync && !hasFailedSync) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {hasPendingSync && (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
          <span className="text-xs">{syncStats.pending}</span>
        </div>
      )}
      
      {hasFailedSync && (
        <div className="flex items-center text-red-600">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs">{syncStats.failed}</span>
        </div>
      )}
    </div>
  )
}