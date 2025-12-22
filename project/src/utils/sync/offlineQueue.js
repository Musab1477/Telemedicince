import { dbManager, STORES } from '../storage/indexedDB'

// Action types for sync queue
export const SYNC_ACTIONS = {
  USER_REGISTER: 'user_register',
  USER_UPDATE: 'user_update',
  CONSULTATION_BOOK: 'consultation_book',
  CONSULTATION_UPDATE: 'consultation_update',
  EMR_CREATE: 'emr_create',
  EMR_UPDATE: 'emr_update',
  PRESCRIPTION_CREATE: 'prescription_create',
  PRESCRIPTION_UPDATE: 'prescription_update',
  FILE_UPLOAD: 'file_upload'
}

// Priority levels
export const SYNC_PRIORITY = {
  HIGH: 1,    // Critical operations (emergency consultations)
  MEDIUM: 2,  // Important operations (regular consultations, prescriptions)
  LOW: 3      // Background operations (profile updates, file uploads)
}

// Sync status
export const SYNC_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

export class OfflineQueue {
  constructor() {
    this.isProcessing = false
    this.maxRetries = 3
    this.retryDelays = [1000, 5000, 15000] // 1s, 5s, 15s
    this.backgroundSyncSupported = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
  }

  // Add item to sync queue
  async addToQueue(action, payload, priority = SYNC_PRIORITY.MEDIUM, metadata = {}) {
    try {
      const queueItem = {
        action,
        payload,
        priority,
        metadata,
        timestamp: new Date(),
        status: SYNC_STATUS.PENDING,
        retryCount: 0,
        lastAttempt: null,
        error: null
      }

      const id = await dbManager.add(STORES.SYNC_QUEUE, queueItem)
      console.log(`Added item to sync queue: ${action} (ID: ${id})`)
      
      // Register background sync if supported
      if (this.backgroundSyncSupported) {
        await this.registerBackgroundSync()
      }
      
      // Try to process queue if online
      if (navigator.onLine) {
        this.processQueue()
      }

      return id
    } catch (error) {
      console.error('Error adding to sync queue:', error)
      throw error
    }
  }

  // Register background sync with service worker
  async registerBackgroundSync() {
    try {
      const registration = await navigator.serviceWorker.ready
      if (registration.sync) {
        await registration.sync.register('swasthlink-background-sync')
        console.log('Background sync registered')
      }
    } catch (error) {
      console.error('Failed to register background sync:', error)
    }
  }

  // Get all pending items from queue
  async getPendingItems() {
    try {
      const allItems = await dbManager.getAllByIndex(STORES.SYNC_QUEUE, 'status', SYNC_STATUS.PENDING)
      
      // Sort by priority (lower number = higher priority) then by timestamp
      return allItems.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return new Date(a.timestamp) - new Date(b.timestamp)
      })
    } catch (error) {
      console.error('Error getting pending items:', error)
      return []
    }
  }

  // Process the sync queue
  async processQueue() {
    if (this.isProcessing || !navigator.onLine) {
      return
    }

    this.isProcessing = true
    console.log('Processing sync queue...')

    try {
      const pendingItems = await this.getPendingItems()
      
      for (const item of pendingItems) {
        try {
          await this.processItem(item)
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error)
          await this.handleItemError(item, error)
        }
      }
    } catch (error) {
      console.error('Error processing sync queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process individual queue item
  async processItem(item) {
    console.log(`Processing sync item: ${item.action} (ID: ${item.id})`)

    // Update status to in progress
    await this.updateItemStatus(item.id, SYNC_STATUS.IN_PROGRESS)

    try {
      // Simulate API call based on action type
      const result = await this.executeAction(item.action, item.payload, item.metadata)
      
      // Mark as completed
      await this.updateItemStatus(item.id, SYNC_STATUS.COMPLETED, null, result)
      console.log(`Successfully synced: ${item.action} (ID: ${item.id})`)
      
    } catch (error) {
      throw error // Will be handled by handleItemError
    }
  }

  // Execute the actual sync action (mock implementation)
  async executeAction(action, payload, metadata) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Mock API responses based on action type
    switch (action) {
      case SYNC_ACTIONS.USER_REGISTER:
        return { userId: `user_${Date.now()}`, status: 'registered' }
      
      case SYNC_ACTIONS.CONSULTATION_BOOK:
        return { consultationId: `consult_${Date.now()}`, status: 'booked' }
      
      case SYNC_ACTIONS.EMR_CREATE:
        return { emrId: `emr_${Date.now()}`, status: 'created' }
      
      case SYNC_ACTIONS.PRESCRIPTION_CREATE:
        return { prescriptionId: `rx_${Date.now()}`, status: 'created' }
      
      default:
        return { status: 'processed' }
    }
  }

  // Handle item processing error
  async handleItemError(item, error) {
    const newRetryCount = item.retryCount + 1
    
    if (newRetryCount <= this.maxRetries) {
      // Schedule retry
      const delay = this.retryDelays[newRetryCount - 1] || this.retryDelays[this.retryDelays.length - 1]
      
      setTimeout(() => {
        this.retryItem(item.id, newRetryCount, error.message)
      }, delay)
      
      console.log(`Scheduling retry ${newRetryCount}/${this.maxRetries} for item ${item.id} in ${delay}ms`)
    } else {
      // Max retries reached, mark as failed
      await this.updateItemStatus(item.id, SYNC_STATUS.FAILED, error.message)
      console.error(`Max retries reached for item ${item.id}:`, error)
    }
  }

  // Retry a failed item
  async retryItem(itemId, retryCount, errorMessage) {
    try {
      const item = await dbManager.get(STORES.SYNC_QUEUE, itemId)
      if (!item || item.status !== SYNC_STATUS.FAILED) {
        return // Item was already processed or doesn't exist
      }

      // Update retry count and reset status
      const updatedItem = {
        ...item,
        status: SYNC_STATUS.PENDING,
        retryCount,
        lastAttempt: new Date(),
        error: errorMessage
      }

      await dbManager.put(STORES.SYNC_QUEUE, updatedItem)
      
      // Try processing again if online
      if (navigator.onLine) {
        this.processQueue()
      }
    } catch (error) {
      console.error(`Error retrying item ${itemId}:`, error)
    }
  }

  // Update item status
  async updateItemStatus(itemId, status, error = null, result = null) {
    try {
      const item = await dbManager.get(STORES.SYNC_QUEUE, itemId)
      if (!item) return

      const updatedItem = {
        ...item,
        status,
        lastAttempt: new Date(),
        error,
        result
      }

      await dbManager.put(STORES.SYNC_QUEUE, updatedItem)
    } catch (error) {
      console.error(`Error updating item status:`, error)
    }
  }

  // Clear completed items (cleanup)
  async clearCompleted() {
    try {
      const completedItems = await dbManager.getAllByIndex(STORES.SYNC_QUEUE, 'status', SYNC_STATUS.COMPLETED)
      
      for (const item of completedItems) {
        await dbManager.delete(STORES.SYNC_QUEUE, item.id)
      }
      
      console.log(`Cleared ${completedItems.length} completed sync items`)
    } catch (error) {
      console.error('Error clearing completed items:', error)
    }
  }

  // Handle background sync event (called by service worker)
  async handleBackgroundSync() {
    console.log('Handling background sync event')
    
    try {
      await this.processQueue()
      
      // Notify service worker of completion
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'BACKGROUND_SYNC_COMPLETE',
          timestamp: new Date().toISOString()
        })
      }
      
      return true
    } catch (error) {
      console.error('Background sync failed:', error)
      
      // Notify service worker of failure
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'BACKGROUND_SYNC_FAILED',
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
      
      return false
    }
  }

  // Get queue statistics
  async getQueueStats() {
    try {
      const allItems = await dbManager.getAll(STORES.SYNC_QUEUE)
      
      const stats = {
        total: allItems.length,
        pending: 0,
        inProgress: 0,
        completed: 0,
        failed: 0
      }

      allItems.forEach(item => {
        switch (item.status) {
          case SYNC_STATUS.PENDING:
            stats.pending++
            break
          case SYNC_STATUS.IN_PROGRESS:
            stats.inProgress++
            break
          case SYNC_STATUS.COMPLETED:
            stats.completed++
            break
          case SYNC_STATUS.FAILED:
            stats.failed++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting queue stats:', error)
      return { total: 0, pending: 0, inProgress: 0, completed: 0, failed: 0 }
    }
  }
}

// Create singleton instance
export const offlineQueue = new OfflineQueue()