/**
 * Data Synchronization utilities for offline functionality
 * Handles syncing local data with server when connection is restored
 */

import { dbManager, STORES } from '../storage/indexedDB.js'
import { offlineQueue, SYNC_ACTIONS, SYNC_STATUS } from '../sync/offlineQueue.js'

class DataSyncManager {
  constructor() {
    this.syncInProgress = false
    this.conflictResolutionStrategy = 'timestamp' // 'timestamp', 'server', 'client', 'manual'
  }

  /**
   * Initialize data sync manager
   */
  async init() {
    // Listen for online events
    window.addEventListener('online', this.handleOnlineEvent.bind(this))
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this))
    }
    
    console.log('Data sync manager initialized')
  }

  /**
   * Handle online event - trigger sync when connection restored
   */
  async handleOnlineEvent() {
    console.log('Connection restored, starting data sync...')
    await this.syncAllData()
  }

  /**
   * Handle service worker messages
   */
  handleServiceWorkerMessage(event) {
    if (event.data && event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
      console.log('Background sync completed')
      this.notifyUI('syncComplete', event.data)
    }
  }

  /**
   * Sync all offline data
   */
  async syncAllData() {
    if (this.syncInProgress) {
      console.log('Sync already in progress')
      return
    }

    this.syncInProgress = true
    
    try {
      // Sync different data types in priority order
      await this.syncUserData()
      await this.syncConsultations()
      await this.syncEMRRecords()
      await this.syncPrescriptions()
      
      console.log('All data synced successfully')
      this.notifyUI('allSyncComplete')
    } catch (error) {
      console.error('Data sync failed:', error)
      this.notifyUI('syncError', error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Sync user data (profiles, preferences)
   */
  async syncUserData() {
    try {
      const userData = await dbManager.getAll(STORES.USER_DATA)
      
      for (const user of userData) {
        if (user.needsSync) {
          await this.syncUserRecord(user)
        }
      }
    } catch (error) {
      console.error('User data sync failed:', error)
      throw error
    }
  }

  /**
   * Sync individual user record
   */
  async syncUserRecord(user) {
    try {
      // Mock API call - replace with actual API
      const response = await this.mockApiCall('PUT', `/api/users/${user.userId}`, user)
      
      if (response.ok) {
        // Update local record
        const updatedUser = { ...user, needsSync: false, lastSynced: new Date() }
        await dbManager.put(STORES.USER_DATA, updatedUser)
        console.log(`User ${user.userId} synced successfully`)
      } else {
        throw new Error(`Failed to sync user ${user.userId}`)
      }
    } catch (error) {
      console.error(`User sync failed for ${user.userId}:`, error)
      // Mark for retry
      await this.markForRetry(STORES.USER_DATA, user.userId, error.message)
    }
  }

  /**
   * Sync consultation data
   */
  async syncConsultations() {
    try {
      const consultations = await dbManager.getAllByIndex(STORES.CONSULTATIONS, 'status', 'pending_sync')
      
      for (const consultation of consultations) {
        await this.syncConsultationRecord(consultation)
      }
    } catch (error) {
      console.error('Consultation sync failed:', error)
      throw error
    }
  }

  /**
   * Sync individual consultation record
   */
  async syncConsultationRecord(consultation) {
    try {
      const response = await this.mockApiCall('POST', '/api/consultations', consultation)
      
      if (response.ok) {
        const serverData = await response.json()
        
        // Handle potential conflicts
        const resolvedData = await this.resolveConflicts(consultation, serverData)
        
        // Update local record
        const updatedConsultation = { 
          ...resolvedData, 
          status: 'synced', 
          lastSynced: new Date() 
        }
        await dbManager.put(STORES.CONSULTATIONS, updatedConsultation)
        
        console.log(`Consultation ${consultation.id} synced successfully`)
      } else {
        throw new Error(`Failed to sync consultation ${consultation.id}`)
      }
    } catch (error) {
      console.error(`Consultation sync failed for ${consultation.id}:`, error)
      await this.markForRetry(STORES.CONSULTATIONS, consultation.id, error.message)
    }
  }

  /**
   * Sync EMR records
   */
  async syncEMRRecords() {
    try {
      const emrRecords = await dbManager.getAllByIndex(STORES.EMR_RECORDS, 'syncStatus', 'pending')
      
      for (const emr of emrRecords) {
        await this.syncEMRRecord(emr)
      }
    } catch (error) {
      console.error('EMR sync failed:', error)
      throw error
    }
  }

  /**
   * Sync individual EMR record
   */
  async syncEMRRecord(emr) {
    try {
      const response = await this.mockApiCall('POST', '/api/emr', emr)
      
      if (response.ok) {
        const serverData = await response.json()
        
        // Update local record
        const updatedEMR = { 
          ...emr, 
          syncStatus: 'synced', 
          serverId: serverData.id,
          lastSynced: new Date() 
        }
        await dbManager.put(STORES.EMR_RECORDS, updatedEMR)
        
        console.log(`EMR record ${emr.id} synced successfully`)
      } else {
        throw new Error(`Failed to sync EMR record ${emr.id}`)
      }
    } catch (error) {
      console.error(`EMR sync failed for ${emr.id}:`, error)
      await this.markForRetry(STORES.EMR_RECORDS, emr.id, error.message)
    }
  }

  /**
   * Sync prescription data
   */
  async syncPrescriptions() {
    try {
      const prescriptions = await dbManager.getAll(STORES.PRESCRIPTIONS)
      const pendingPrescriptions = prescriptions.filter(p => p.syncStatus === 'pending')
      
      for (const prescription of pendingPrescriptions) {
        await this.syncPrescriptionRecord(prescription)
      }
    } catch (error) {
      console.error('Prescription sync failed:', error)
      throw error
    }
  }

  /**
   * Sync individual prescription record
   */
  async syncPrescriptionRecord(prescription) {
    try {
      const response = await this.mockApiCall('POST', '/api/prescriptions', prescription)
      
      if (response.ok) {
        const serverData = await response.json()
        
        // Update local record
        const updatedPrescription = { 
          ...prescription, 
          syncStatus: 'synced',
          serverId: serverData.id,
          lastSynced: new Date() 
        }
        await dbManager.put(STORES.PRESCRIPTIONS, updatedPrescription)
        
        console.log(`Prescription ${prescription.id} synced successfully`)
      } else {
        throw new Error(`Failed to sync prescription ${prescription.id}`)
      }
    } catch (error) {
      console.error(`Prescription sync failed for ${prescription.id}:`, error)
      await this.markForRetry(STORES.PRESCRIPTIONS, prescription.id, error.message)
    }
  }

  /**
   * Resolve conflicts between local and server data
   */
  async resolveConflicts(localData, serverData) {
    switch (this.conflictResolutionStrategy) {
      case 'timestamp':
        // Use the most recently modified data
        const localTime = new Date(localData.lastModified || localData.timestamp)
        const serverTime = new Date(serverData.lastModified || serverData.timestamp)
        return localTime > serverTime ? localData : serverData

      case 'server':
        // Always prefer server data
        return serverData

      case 'client':
        // Always prefer local data
        return localData

      case 'manual':
        // Require manual resolution (would show UI prompt)
        return await this.promptUserForConflictResolution(localData, serverData)

      default:
        return serverData
    }
  }

  /**
   * Prompt user for manual conflict resolution
   */
  async promptUserForConflictResolution(localData, serverData) {
    // This would show a UI component for manual conflict resolution
    // For now, return server data as fallback
    console.log('Manual conflict resolution needed:', { localData, serverData })
    return serverData
  }

  /**
   * Mark record for retry after sync failure
   */
  async markForRetry(storeName, recordId, errorMessage) {
    try {
      const record = await dbManager.get(storeName, recordId)
      if (record) {
        const updatedRecord = {
          ...record,
          syncRetryCount: (record.syncRetryCount || 0) + 1,
          lastSyncError: errorMessage,
          lastSyncAttempt: new Date()
        }
        await dbManager.put(storeName, updatedRecord)
      }
    } catch (error) {
      console.error('Failed to mark record for retry:', error)
    }
  }

  /**
   * Mock API call for development
   */
  async mockApiCall(method, url, data = null) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    // Simulate success/failure
    const success = Math.random() > 0.1 // 90% success rate
    
    if (success) {
      return {
        ok: true,
        json: async () => ({
          id: `server_${Date.now()}`,
          ...data,
          serverTimestamp: new Date().toISOString()
        })
      }
    } else {
      throw new Error('Mock API call failed')
    }
  }

  /**
   * Notify UI components about sync events
   */
  notifyUI(eventType, data = null) {
    window.dispatchEvent(new CustomEvent('dataSync', {
      detail: { type: eventType, data }
    }))
  }

  /**
   * Get sync statistics
   */
  async getSyncStats() {
    try {
      const stats = {
        pendingSync: 0,
        syncErrors: 0,
        lastSyncTime: null
      }

      // Count pending items across all stores
      const stores = [STORES.USER_DATA, STORES.CONSULTATIONS, STORES.EMR_RECORDS, STORES.PRESCRIPTIONS]
      
      for (const store of stores) {
        const records = await dbManager.getAll(store)
        stats.pendingSync += records.filter(r => 
          r.needsSync || r.syncStatus === 'pending' || r.status === 'pending_sync'
        ).length
        
        stats.syncErrors += records.filter(r => 
          r.lastSyncError || r.syncRetryCount > 0
        ).length

        // Find most recent sync time
        const syncTimes = records
          .map(r => r.lastSynced)
          .filter(Boolean)
          .map(t => new Date(t))
        
        if (syncTimes.length > 0) {
          const mostRecent = new Date(Math.max(...syncTimes))
          if (!stats.lastSyncTime || mostRecent > stats.lastSyncTime) {
            stats.lastSyncTime = mostRecent
          }
        }
      }

      return stats
    } catch (error) {
      console.error('Failed to get sync stats:', error)
      return { pendingSync: 0, syncErrors: 0, lastSyncTime: null }
    }
  }

  /**
   * Force sync specific data type
   */
  async forceSyncDataType(dataType) {
    switch (dataType) {
      case 'users':
        await this.syncUserData()
        break
      case 'consultations':
        await this.syncConsultations()
        break
      case 'emr':
        await this.syncEMRRecords()
        break
      case 'prescriptions':
        await this.syncPrescriptions()
        break
      default:
        throw new Error(`Unknown data type: ${dataType}`)
    }
  }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager()

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  dataSyncManager.init().catch(console.error)
}

export default dataSyncManager