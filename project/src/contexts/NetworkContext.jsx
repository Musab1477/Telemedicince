import { createContext } from 'preact'
import { useContext, useState, useEffect } from 'preact/hooks'
import { networkStatus, NETWORK_SPEED, CONNECTION_TYPES } from '../utils/network/networkStatus'
import { offlineQueue } from '../utils/sync/offlineQueue'

// Create the network context
const NetworkContext = createContext()

// Network provider component
export function NetworkProvider({ children }) {
  const [networkState, setNetworkState] = useState({
    isOnline: navigator.onLine,
    connectionType: CONNECTION_TYPES.UNKNOWN,
    networkSpeed: NETWORK_SPEED.MODERATE,
    isSlowConnection: false
  })

  const [syncStats, setSyncStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    failed: 0
  })

  useEffect(() => {
    // Subscribe to network status changes
    const unsubscribe = networkStatus.addListener((status) => {
      setNetworkState({
        isOnline: status.isOnline,
        connectionType: status.connectionType,
        networkSpeed: status.networkSpeed,
        isSlowConnection: status.networkSpeed === NETWORK_SPEED.SLOW
      })

      // Update sync stats when network status changes
      updateSyncStats()
    })

    // Initial sync stats load
    updateSyncStats()

    // Periodic sync stats update
    const statsInterval = setInterval(updateSyncStats, 10000) // Every 10 seconds

    return () => {
      unsubscribe()
      clearInterval(statsInterval)
    }
  }, [])

  const updateSyncStats = async () => {
    try {
      const stats = await offlineQueue.getQueueStats()
      setSyncStats(stats)
    } catch (error) {
      console.error('Error updating sync stats:', error)
    }
  }

  // Add item to offline queue
  const addToOfflineQueue = async (action, payload, priority, metadata) => {
    try {
      return await offlineQueue.addToQueue(action, payload, priority, metadata)
    } catch (error) {
      console.error('Error adding to offline queue:', error)
      throw error
    }
  }

  // Force sync queue processing
  const forceSyncQueue = async () => {
    if (networkState.isOnline) {
      await offlineQueue.processQueue()
      await updateSyncStats()
    }
  }

  // Clear completed sync items
  const clearCompletedSync = async () => {
    await offlineQueue.clearCompleted()
    await updateSyncStats()
  }

  // Test network connectivity
  const testConnectivity = async () => {
    return await networkStatus.testConnectivity()
  }

  // Get detailed connection info
  const getConnectionInfo = () => {
    return networkStatus.getConnectionInfo()
  }

  const contextValue = {
    // Network state
    isOnline: networkState.isOnline,
    isOffline: !networkState.isOnline,
    connectionType: networkState.connectionType,
    networkSpeed: networkState.networkSpeed,
    isSlowConnection: networkState.isSlowConnection,
    
    // Sync state
    syncStats,
    hasPendingSync: syncStats.pending > 0 || syncStats.inProgress > 0,
    hasFailedSync: syncStats.failed > 0,
    
    // Actions
    addToOfflineQueue,
    forceSyncQueue,
    clearCompletedSync,
    testConnectivity,
    getConnectionInfo,
    updateSyncStats,
    
    // Constants
    NETWORK_SPEED,
    CONNECTION_TYPES
  }

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  )
}

// Custom hook to use network context
export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

// Utility hooks
export function useOfflineQueue() {
  const { addToOfflineQueue, syncStats, forceSyncQueue, clearCompletedSync } = useNetwork()
  return {
    addToQueue: addToOfflineQueue,
    stats: syncStats,
    forceSync: forceSyncQueue,
    clearCompleted: clearCompletedSync
  }
}

export function useNetworkStatus() {
  const { isOnline, isOffline, connectionType, networkSpeed, isSlowConnection } = useNetwork()
  return {
    isOnline,
    isOffline,
    connectionType,
    networkSpeed,
    isSlowConnection
  }
}