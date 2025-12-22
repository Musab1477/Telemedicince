import { useNetwork } from '../../contexts/NetworkContext'
import { useTranslation } from '../../contexts/I18nContext'

export function NetworkStatusBanner() {
  const { 
    isOnline, 
    isSlowConnection, 
    syncStats, 
    hasPendingSync, 
    hasFailedSync,
    forceSyncQueue 
  } = useNetwork()
  
  const { t } = useTranslation()

  const handleRetrySync = () => {
    forceSyncQueue()
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
            <span>{t('network.offline')}</span>
          </div>
          {hasPendingSync && (
            <div className="text-xs mt-1 opacity-90">
              {syncStats.pending} {t('network.items')} waiting to sync
            </div>
          )}
        </div>
      )}

      {/* Slow Connection Banner */}
      {isOnline && isSlowConnection && (
        <div className="bg-yellow-600 text-white text-center py-2 px-4 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{t('network.slowConnection')}</span>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {isOnline && hasPendingSync && (
        <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>{t('network.syncing')} {syncStats.pending} {t('network.items')}...</span>
          </div>
        </div>
      )}

      {/* Failed Sync Banner */}
      {isOnline && hasFailedSync && !hasPendingSync && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 text-sm">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
              </svg>
              <span>{syncStats.failed} {t('network.itemsFailed')}</span>
            </div>
            <button 
              onClick={handleRetrySync}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}