import { dbManager, STORES } from './indexedDB'
import { offlineQueue, SYNC_ACTIONS, SYNC_PRIORITY } from '../sync/offlineQueue'

// EMR record status
export const EMR_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  SYNCED: 'synced',
  SYNC_PENDING: 'sync_pending',
  SYNC_FAILED: 'sync_failed'
}

export class EMRStorage {
  // Create new EMR record
  async createEMR(emrData) {
    try {
      const emrRecord = {
        ...emrData,
        id: `emr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: EMR_STATUS.DRAFT,
        syncStatus: 'pending'
      }

      // Save to IndexedDB
      await dbManager.add(STORES.EMR_RECORDS, emrRecord)
      
      // Add to sync queue if online or queue for later
      await offlineQueue.addToQueue(
        SYNC_ACTIONS.EMR_CREATE,
        emrRecord,
        SYNC_PRIORITY.MEDIUM,
        { emrId: emrRecord.id }
      )

      console.log('EMR record created:', emrRecord.id)
      return emrRecord
    } catch (error) {
      console.error('Error creating EMR record:', error)
      throw error
    }
  }

  // Update existing EMR record
  async updateEMR(emrId, updates) {
    try {
      const existingRecord = await dbManager.get(STORES.EMR_RECORDS, emrId)
      if (!existingRecord) {
        throw new Error('EMR record not found')
      }

      const updatedRecord = {
        ...existingRecord,
        ...updates,
        updatedAt: new Date(),
        syncStatus: 'pending'
      }

      // Save to IndexedDB
      await dbManager.put(STORES.EMR_RECORDS, updatedRecord)
      
      // Add to sync queue
      await offlineQueue.addToQueue(
        SYNC_ACTIONS.EMR_UPDATE,
        updatedRecord,
        SYNC_PRIORITY.MEDIUM,
        { emrId: updatedRecord.id }
      )

      console.log('EMR record updated:', emrId)
      return updatedRecord
    } catch (error) {
      console.error('Error updating EMR record:', error)
      throw error
    }
  }

  // Get EMR record by ID
  async getEMR(emrId) {
    try {
      return await dbManager.get(STORES.EMR_RECORDS, emrId)
    } catch (error) {
      console.error('Error getting EMR record:', error)
      throw error
    }
  }

  // Get all EMR records for a patient
  async getPatientEMRs(patientId) {
    try {
      return await dbManager.getAllByIndex(STORES.EMR_RECORDS, 'patientId', patientId)
    } catch (error) {
      console.error('Error getting patient EMRs:', error)
      return []
    }
  }

  // Get all EMR records for a doctor
  async getDoctorEMRs(doctorId) {
    try {
      return await dbManager.getAllByIndex(STORES.EMR_RECORDS, 'doctorId', doctorId)
    } catch (error) {
      console.error('Error getting doctor EMRs:', error)
      return []
    }
  }

  // Get EMRs by sync status
  async getEMRsBySync(syncStatus) {
    try {
      return await dbManager.getAllByIndex(STORES.EMR_RECORDS, 'syncStatus', syncStatus)
    } catch (error) {
      console.error('Error getting EMRs by sync status:', error)
      return []
    }
  }

  // Mark EMR as synced
  async markAsSynced(emrId, serverData = {}) {
    try {
      const record = await dbManager.get(STORES.EMR_RECORDS, emrId)
      if (!record) return

      const updatedRecord = {
        ...record,
        ...serverData,
        syncStatus: 'synced',
        syncedAt: new Date()
      }

      await dbManager.put(STORES.EMR_RECORDS, updatedRecord)
      console.log('EMR marked as synced:', emrId)
    } catch (error) {
      console.error('Error marking EMR as synced:', error)
    }
  }

  // Delete EMR record
  async deleteEMR(emrId) {
    try {
      await dbManager.delete(STORES.EMR_RECORDS, emrId)
      console.log('EMR record deleted:', emrId)
    } catch (error) {
      console.error('Error deleting EMR record:', error)
      throw error
    }
  }

  // Get EMR statistics
  async getEMRStats(doctorId = null) {
    try {
      let records
      if (doctorId) {
        records = await this.getDoctorEMRs(doctorId)
      } else {
        records = await dbManager.getAll(STORES.EMR_RECORDS)
      }

      const stats = {
        total: records.length,
        draft: 0,
        completed: 0,
        synced: 0,
        pending: 0,
        failed: 0
      }

      records.forEach(record => {
        switch (record.syncStatus) {
          case 'synced':
            stats.synced++
            break
          case 'pending':
            stats.pending++
            break
          case 'failed':
            stats.failed++
            break
        }

        switch (record.status) {
          case EMR_STATUS.DRAFT:
            stats.draft++
            break
          case EMR_STATUS.COMPLETED:
            stats.completed++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting EMR stats:', error)
      return { total: 0, draft: 0, completed: 0, synced: 0, pending: 0, failed: 0 }
    }
  }

  // Search EMRs
  async searchEMRs(query, filters = {}) {
    try {
      let records = await dbManager.getAll(STORES.EMR_RECORDS)

      // Apply filters
      if (filters.patientId) {
        records = records.filter(r => r.patientId === filters.patientId)
      }
      if (filters.doctorId) {
        records = records.filter(r => r.doctorId === filters.doctorId)
      }
      if (filters.status) {
        records = records.filter(r => r.status === filters.status)
      }
      if (filters.dateFrom) {
        records = records.filter(r => new Date(r.createdAt) >= new Date(filters.dateFrom))
      }
      if (filters.dateTo) {
        records = records.filter(r => new Date(r.createdAt) <= new Date(filters.dateTo))
      }

      // Apply text search
      if (query) {
        const searchTerm = query.toLowerCase()
        records = records.filter(record => {
          return (
            record.consultationNotes?.toLowerCase().includes(searchTerm) ||
            record.diagnosis?.toLowerCase().includes(searchTerm) ||
            record.symptoms?.toLowerCase().includes(searchTerm)
          )
        })
      }

      // Sort by creation date (newest first)
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return records
    } catch (error) {
      console.error('Error searching EMRs:', error)
      return []
    }
  }
}

// Create singleton instance
export const emrStorage = new EMRStorage()