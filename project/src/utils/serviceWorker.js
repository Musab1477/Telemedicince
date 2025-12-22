/**
 * Service Worker utilities for PWA functionality
 * Handles registration, updates, and background sync
 */

import { Workbox } from 'workbox-window';

class ServiceWorkerManager {
  constructor() {
    this.wb = null;
    this.registration = null;
    this.updateAvailable = false;
  }

  /**
   * Initialize and register service worker
   */
  async init() {
    if ('serviceWorker' in navigator) {
      this.wb = new Workbox('/sw.js');
      
      // Listen for service worker events
      this.setupEventListeners();
      
      try {
        this.registration = await this.wb.register();
        console.log('Service Worker registered successfully');
        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      console.warn('Service Worker not supported in this browser');
      return null;
    }
  }

  /**
   * Set up event listeners for service worker lifecycle
   */
  setupEventListeners() {
    // Service worker is waiting to activate
    this.wb.addEventListener('waiting', (event) => {
      console.log('New service worker is waiting to activate');
      this.updateAvailable = true;
      this.showUpdatePrompt();
    });

    // Service worker has been activated
    this.wb.addEventListener('controlling', (event) => {
      console.log('New service worker is now controlling the page');
      window.location.reload();
    });

    // Service worker installation failed
    this.wb.addEventListener('redundant', (event) => {
      console.log('Service worker became redundant');
    });

    // Listen for background sync events
    this.wb.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        this.handleBackgroundSyncMessage(event.data);
      }
    });
  }

  /**
   * Show update prompt to user
   */
  showUpdatePrompt() {
    // This would integrate with your toast/notification system
    const updateConfirmed = confirm(
      'A new version of SwasthLink is available. Update now?'
    );
    
    if (updateConfirmed) {
      this.skipWaiting();
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  skipWaiting() {
    if (this.wb && this.updateAvailable) {
      this.wb.messageSkipWaiting();
    }
  }

  /**
   * Handle background sync messages from service worker
   */
  handleBackgroundSyncMessage(data) {
    switch (data.action) {
      case 'SYNC_COMPLETE':
        console.log('Background sync completed:', data.payload);
        // Notify UI components about successful sync
        this.notifyComponents('syncComplete', data.payload);
        break;
      case 'SYNC_FAILED':
        console.error('Background sync failed:', data.payload);
        // Notify UI components about failed sync
        this.notifyComponents('syncFailed', data.payload);
        break;
      default:
        console.log('Unknown background sync message:', data);
    }
  }

  /**
   * Notify UI components about service worker events
   */
  notifyComponents(eventType, payload) {
    // Dispatch custom events that components can listen to
    window.dispatchEvent(new CustomEvent('sw-event', {
      detail: { type: eventType, payload }
    }));
  }

  /**
   * Queue action for background sync
   */
  async queueBackgroundSync(action, data) {
    if (this.registration && this.registration.sync) {
      try {
        // Store the action in IndexedDB for the service worker to process
        await this.storeOfflineAction(action, data);
        
        // Register background sync
        await this.registration.sync.register('swasthlink-background-sync');
        console.log('Background sync registered for:', action);
      } catch (error) {
        console.error('Failed to queue background sync:', error);
        throw error;
      }
    } else {
      console.warn('Background sync not supported');
      // Fallback: try to process immediately when online
      if (navigator.onLine) {
        await this.processOfflineAction(action, data);
      }
    }
  }

  /**
   * Store offline action in IndexedDB
   */
  async storeOfflineAction(action, data) {
    // This would integrate with your existing IndexedDB utilities
    const { openDB } = await import('./storage/indexedDB.js');
    const db = await openDB();
    
    const actionItem = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    };

    const tx = db.transaction('offlineActions', 'readwrite');
    await tx.objectStore('offlineActions').add(actionItem);
    await tx.complete;
  }

  /**
   * Process offline action (fallback when background sync not available)
   */
  async processOfflineAction(action, data) {
    // This would integrate with your API layer
    console.log('Processing offline action:', action, data);
    // Implementation would depend on the specific action type
  }

  /**
   * Get cache usage statistics
   */
  async getCacheStats() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
        };
      } catch (error) {
        console.error('Failed to get cache stats:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear specific caches
   */
  async clearCache(cacheName) {
    if ('caches' in window) {
      try {
        const deleted = await caches.delete(cacheName);
        console.log(`Cache ${cacheName} cleared:`, deleted);
        return deleted;
      } catch (error) {
        console.error(`Failed to clear cache ${cacheName}:`, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map(name => caches.delete(name));
        await Promise.all(deletePromises);
        console.log('All caches cleared');
        return true;
      } catch (error) {
        console.error('Failed to clear all caches:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Check if app is running in standalone mode (installed as PWA)
   */
  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  /**
   * Show install prompt for PWA
   */
  async showInstallPrompt() {
    // This would be called when beforeinstallprompt event is fired
    // Implementation depends on how you handle the install prompt in your app
    console.log('Install prompt would be shown here');
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  serviceWorkerManager.init().catch(console.error);
}

export default serviceWorkerManager;