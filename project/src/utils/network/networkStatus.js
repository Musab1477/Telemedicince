import { offlineQueue } from '../sync/offlineQueue'

// Network connection types
export const CONNECTION_TYPES = {
  OFFLINE: 'offline',
  SLOW_2G: 'slow-2g',
  '2G': '2g',
  '3G': '3g',
  '4G': '4g',
  UNKNOWN: 'unknown'
}

// Network speed categories
export const NETWORK_SPEED = {
  OFFLINE: 'offline',
  SLOW: 'slow',      // 2G, slow-2g
  MODERATE: 'moderate', // 3G
  FAST: 'fast'       // 4G+
}

export class NetworkStatusManager {
  constructor() {
    this.isOnline = navigator.onLine
    this.connectionType = this.getConnectionType()
    this.networkSpeed = this.getNetworkSpeed()
    this.listeners = new Set()
    
    this.init()
  }

  init() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // Listen for connection changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', this.handleConnectionChange.bind(this))
    }

    // Periodic connectivity check
    this.startConnectivityCheck()
  }

  // Get current connection type
  getConnectionType() {
    if (!navigator.onLine) {
      return CONNECTION_TYPES.OFFLINE
    }

    if ('connection' in navigator && navigator.connection.effectiveType) {
      return navigator.connection.effectiveType
    }

    return CONNECTION_TYPES.UNKNOWN
  }

  // Categorize network speed
  getNetworkSpeed() {
    if (!this.isOnline) {
      return NETWORK_SPEED.OFFLINE
    }

    switch (this.connectionType) {
      case CONNECTION_TYPES.SLOW_2G:
      case CONNECTION_TYPES['2G']:
        return NETWORK_SPEED.SLOW
      case CONNECTION_TYPES['3G']:
        return NETWORK_SPEED.MODERATE
      case CONNECTION_TYPES['4G']:
        return NETWORK_SPEED.FAST
      default:
        return NETWORK_SPEED.MODERATE // Default assumption
    }
  }

  // Handle online event
  handleOnline() {
    console.log('Network: Back online')
    this.isOnline = true
    this.connectionType = this.getConnectionType()
    this.networkSpeed = this.getNetworkSpeed()
    
    this.notifyListeners({
      isOnline: true,
      connectionType: this.connectionType,
      networkSpeed: this.networkSpeed,
      event: 'online'
    })

    // Process offline queue when back online
    offlineQueue.processQueue()
  }

  // Handle offline event
  handleOffline() {
    console.log('Network: Gone offline')
    this.isOnline = false
    this.connectionType = CONNECTION_TYPES.OFFLINE
    this.networkSpeed = NETWORK_SPEED.OFFLINE
    
    this.notifyListeners({
      isOnline: false,
      connectionType: this.connectionType,
      networkSpeed: this.networkSpeed,
      event: 'offline'
    })
  }

  // Handle connection type change
  handleConnectionChange() {
    const newConnectionType = this.getConnectionType()
    const newNetworkSpeed = this.getNetworkSpeed()
    
    if (newConnectionType !== this.connectionType || newNetworkSpeed !== this.networkSpeed) {
      console.log(`Network: Connection changed from ${this.connectionType} to ${newConnectionType}`)
      
      this.connectionType = newConnectionType
      this.networkSpeed = newNetworkSpeed
      
      this.notifyListeners({
        isOnline: this.isOnline,
        connectionType: this.connectionType,
        networkSpeed: this.networkSpeed,
        event: 'change'
      })
    }
  }

  // Periodic connectivity check (fallback for unreliable events)
  startConnectivityCheck() {
    setInterval(() => {
      const wasOnline = this.isOnline
      const currentlyOnline = navigator.onLine
      
      if (wasOnline !== currentlyOnline) {
        if (currentlyOnline) {
          this.handleOnline()
        } else {
          this.handleOffline()
        }
      }
    }, 5000) // Check every 5 seconds
  }

  // Add network status listener
  addListener(callback) {
    this.listeners.add(callback)
    
    // Immediately call with current status
    callback({
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      networkSpeed: this.networkSpeed,
      event: 'initial'
    })

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Notify all listeners
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })
  }

  // Get current network status
  getStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      networkSpeed: this.networkSpeed
    }
  }

  // Check if current connection is slow
  isSlowConnection() {
    return this.networkSpeed === NETWORK_SPEED.SLOW
  }

  // Check if offline
  isOffline() {
    return !this.isOnline
  }

  // Test actual connectivity (ping test)
  async testConnectivity() {
    if (!navigator.onLine) {
      return false
    }

    try {
      // Try to fetch a small resource with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.log('Connectivity test failed:', error.message)
      return false
    }
  }

  // Get connection info for debugging
  getConnectionInfo() {
    const info = {
      online: navigator.onLine,
      connectionType: this.connectionType,
      networkSpeed: this.networkSpeed
    }

    if ('connection' in navigator) {
      const conn = navigator.connection
      info.effectiveType = conn.effectiveType
      info.downlink = conn.downlink
      info.rtt = conn.rtt
      info.saveData = conn.saveData
    }

    return info
  }
}

// Create singleton instance
export const networkStatus = new NetworkStatusManager()

// Utility functions
export function isSlowNetwork() {
  return networkStatus.isSlowConnection()
}

export function isOffline() {
  return networkStatus.isOffline()
}

export function getNetworkSpeed() {
  return networkStatus.networkSpeed
}

export function addNetworkListener(callback) {
  return networkStatus.addListener(callback)
}