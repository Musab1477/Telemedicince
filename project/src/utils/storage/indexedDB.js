import { openDB } from 'idb'

const DB_NAME = 'SwasthLinkDB'
const DB_VERSION = 1

// Store names
export const STORES = {
  USER_DATA: 'userData',
  EMR_RECORDS: 'emrRecords',
  CONSULTATIONS: 'consultations',
  PRESCRIPTIONS: 'prescriptions',
  SYNC_QUEUE: 'syncQueue',
  CACHED_DATA: 'cachedData',
  OFFLINE_ACTIONS: 'offlineActions'
}

// Initialize IndexedDB
export async function initDB() {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // User data store
        if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
          const userStore = db.createObjectStore(STORES.USER_DATA, {
            keyPath: 'userId'
          })
          userStore.createIndex('role', 'role')
          userStore.createIndex('lastUpdated', 'lastUpdated')
        }

        // EMR records store
        if (!db.objectStoreNames.contains(STORES.EMR_RECORDS)) {
          const emrStore = db.createObjectStore(STORES.EMR_RECORDS, {
            keyPath: 'id',
            autoIncrement: true
          })
          emrStore.createIndex('patientId', 'patientId')
          emrStore.createIndex('doctorId', 'doctorId')
          emrStore.createIndex('timestamp', 'timestamp')
          emrStore.createIndex('syncStatus', 'syncStatus')
        }

        // Consultations store
        if (!db.objectStoreNames.contains(STORES.CONSULTATIONS)) {
          const consultStore = db.createObjectStore(STORES.CONSULTATIONS, {
            keyPath: 'id'
          })
          consultStore.createIndex('patientId', 'patientId')
          consultStore.createIndex('doctorId', 'doctorId')
          consultStore.createIndex('status', 'status')
          consultStore.createIndex('scheduledTime', 'scheduledTime')
        }

        // Prescriptions store
        if (!db.objectStoreNames.contains(STORES.PRESCRIPTIONS)) {
          const prescStore = db.createObjectStore(STORES.PRESCRIPTIONS, {
            keyPath: 'id'
          })
          prescStore.createIndex('consultationId', 'consultationId')
          prescStore.createIndex('patientId', 'patientId')
          prescStore.createIndex('doctorId', 'doctorId')
          prescStore.createIndex('createdAt', 'createdAt')
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true
          })
          syncStore.createIndex('action', 'action')
          syncStore.createIndex('priority', 'priority')
          syncStore.createIndex('timestamp', 'timestamp')
          syncStore.createIndex('status', 'status')
          syncStore.createIndex('retryCount', 'retryCount')
        }

        // Offline actions store (for service worker background sync)
        if (!db.objectStoreNames.contains(STORES.OFFLINE_ACTIONS)) {
          const offlineStore = db.createObjectStore(STORES.OFFLINE_ACTIONS, {
            keyPath: 'id'
          })
          offlineStore.createIndex('action', 'action')
          offlineStore.createIndex('timestamp', 'timestamp')
          offlineStore.createIndex('status', 'status')
          offlineStore.createIndex('retryCount', 'retryCount')
        }

        // Cached data store
        if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
          const cacheStore = db.createObjectStore(STORES.CACHED_DATA, {
            keyPath: 'key'
          })
          cacheStore.createIndex('expiresAt', 'expiresAt')
          cacheStore.createIndex('category', 'category')
        }
      }
    })

    console.log('IndexedDB initialized successfully')
    return db
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error)
    throw error
  }
}

// Generic database operations
export class IndexedDBManager {
  constructor() {
    this.db = null
    this.initPromise = this.init()
  }

  async init() {
    if (!this.db) {
      this.db = await initDB()
    }
    return this.db
  }

  async ensureDB() {
    await this.initPromise
    return this.db
  }

  // Generic CRUD operations
  async add(storeName, data) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    
    try {
      const result = await store.add(data)
      await tx.complete
      return result
    } catch (error) {
      console.error(`Error adding to ${storeName}:`, error)
      throw error
    }
  }

  async put(storeName, data) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    
    try {
      const result = await store.put(data)
      await tx.complete
      return result
    } catch (error) {
      console.error(`Error updating ${storeName}:`, error)
      throw error
    }
  }

  async get(storeName, key) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    
    try {
      return await store.get(key)
    } catch (error) {
      console.error(`Error getting from ${storeName}:`, error)
      throw error
    }
  }

  async getAll(storeName, query = null, count = null) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    
    try {
      return await store.getAll(query, count)
    } catch (error) {
      console.error(`Error getting all from ${storeName}:`, error)
      throw error
    }
  }

  async delete(storeName, key) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    
    try {
      await store.delete(key)
      await tx.complete
    } catch (error) {
      console.error(`Error deleting from ${storeName}:`, error)
      throw error
    }
  }

  async clear(storeName) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    
    try {
      await store.clear()
      await tx.complete
    } catch (error) {
      console.error(`Error clearing ${storeName}:`, error)
      throw error
    }
  }

  async getByIndex(storeName, indexName, key) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const index = store.index(indexName)
    
    try {
      return await index.get(key)
    } catch (error) {
      console.error(`Error getting by index from ${storeName}:`, error)
      throw error
    }
  }

  async getAllByIndex(storeName, indexName, key = null) {
    const db = await this.ensureDB()
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const index = store.index(indexName)
    
    try {
      return await index.getAll(key)
    } catch (error) {
      console.error(`Error getting all by index from ${storeName}:`, error)
      throw error
    }
  }
}

// Create singleton instance
export const dbManager = new IndexedDBManager()