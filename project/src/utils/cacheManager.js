/**
 * Cache Management utilities for PWA
 * Handles cache strategies, cleanup, and optimization
 */

class CacheManager {
  constructor() {
    this.cacheNames = {
      APP_SHELL: 'app-shell-cache',
      STATIC_ASSETS: 'static-assets-cache',
      IMAGES: 'images-cache',
      API_DATA: 'api-cache',
      MOCK_DATA: 'mock-data-cache',
      CONSULTATION: 'consultation-cache'
    };
  }

  /**
   * Preload critical resources
   */
  async preloadCriticalResources() {
    const criticalResources = [
      '/',
      '/index.css',
      '/src/main.jsx',
      '/src/app.jsx'
    ];

    try {
      const cache = await caches.open(this.cacheNames.APP_SHELL);
      await cache.addAll(criticalResources);
      console.log('Critical resources preloaded');
    } catch (error) {
      console.error('Failed to preload critical resources:', error);
    }
  }

  /**
   * Cache API response with strategy
   */
  async cacheApiResponse(url, response, strategy = 'networkFirst') {
    if (!response || !response.ok) {
      return response;
    }

    try {
      const cache = await caches.open(this.cacheNames.API_DATA);
      
      // Clone response before caching (response can only be consumed once)
      const responseClone = response.clone();
      
      switch (strategy) {
        case 'cacheFirst':
          await cache.put(url, responseClone);
          break;
        case 'networkFirst':
          // Only cache if network request succeeded
          await cache.put(url, responseClone);
          break;
        case 'staleWhileRevalidate':
          // Cache immediately, don't wait
          cache.put(url, responseClone);
          break;
        default:
          await cache.put(url, responseClone);
      }
      
      return response;
    } catch (error) {
      console.error('Failed to cache API response:', error);
      return response;
    }
  }

  /**
   * Get cached response
   */
  async getCachedResponse(url, cacheName = this.cacheNames.API_DATA) {
    try {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        console.log('Serving from cache:', url);
        return cachedResponse;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }

  /**
   * Implement cache-first strategy
   */
  async cacheFirst(url, fetchOptions = {}) {
    // Try cache first
    const cachedResponse = await this.getCachedResponse(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    try {
      const networkResponse = await fetch(url, fetchOptions);
      await this.cacheApiResponse(url, networkResponse, 'cacheFirst');
      return networkResponse;
    } catch (error) {
      console.error('Cache-first strategy failed:', error);
      throw error;
    }
  }

  /**
   * Implement network-first strategy
   */
  async networkFirst(url, fetchOptions = {}, timeout = 5000) {
    try {
      // Try network first with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const networkResponse = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (networkResponse.ok) {
        await this.cacheApiResponse(url, networkResponse, 'networkFirst');
        return networkResponse;
      }
    } catch (error) {
      console.log('Network failed, trying cache:', error.message);
    }

    // Fallback to cache
    const cachedResponse = await this.getCachedResponse(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw new Error('Both network and cache failed');
  }

  /**
   * Implement stale-while-revalidate strategy
   */
  async staleWhileRevalidate(url, fetchOptions = {}) {
    // Get cached response immediately
    const cachedResponse = await this.getCachedResponse(url);
    
    // Start network request in background
    const networkPromise = fetch(url, fetchOptions)
      .then(response => {
        if (response.ok) {
          this.cacheApiResponse(url, response, 'staleWhileRevalidate');
        }
        return response;
      })
      .catch(error => {
        console.error('Background network request failed:', error);
      });

    // Return cached response if available, otherwise wait for network
    if (cachedResponse) {
      // Don't await the network request, let it update cache in background
      networkPromise;
      return cachedResponse;
    } else {
      return await networkPromise;
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredEntries() {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
              const cacheDate = new Date(dateHeader);
              const now = new Date();
              const ageInHours = (now - cacheDate) / (1000 * 60 * 60);
              
              // Remove entries older than 24 hours for API cache
              if (cacheName.includes('api') && ageInHours > 24) {
                await cache.delete(request);
                console.log('Removed expired cache entry:', request.url);
              }
              // Remove entries older than 7 days for other caches
              else if (ageInHours > 168) {
                await cache.delete(request);
                console.log('Removed expired cache entry:', request.url);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to cleanup cache ${cacheName}:`, error);
      }
    }
  }

  /**
   * Get cache size information
   */
  async getCacheInfo() {
    const cacheInfo = {};
    
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        cacheInfo[cacheName] = {
          entryCount: requests.length,
          urls: requests.map(req => req.url)
        };
      }
      
      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {};
    }
  }

  /**
   * Warm up cache with essential resources
   */
  async warmUpCache() {
    const essentialUrls = [
      '/',
      '/src/main.jsx',
      '/src/app.jsx',
      '/src/index.css'
    ];

    try {
      const cache = await caches.open(this.cacheNames.APP_SHELL);
      
      // Only cache resources that aren't already cached
      const cachedUrls = await cache.keys();
      const cachedUrlStrings = cachedUrls.map(req => req.url);
      
      const urlsToCache = essentialUrls.filter(url => 
        !cachedUrlStrings.some(cached => cached.includes(url))
      );
      
      if (urlsToCache.length > 0) {
        await cache.addAll(urlsToCache);
        console.log('Cache warmed up with:', urlsToCache);
      }
    } catch (error) {
      console.error('Failed to warm up cache:', error);
    }
  }

  /**
   * Handle cache quota exceeded
   */
  async handleQuotaExceeded() {
    console.warn('Cache quota exceeded, cleaning up...');
    
    // Clean up least important caches first
    const cleanupOrder = [
      this.cacheNames.IMAGES,
      this.cacheNames.API_DATA,
      this.cacheNames.MOCK_DATA,
      this.cacheNames.CONSULTATION
    ];
    
    for (const cacheName of cleanupOrder) {
      try {
        const deleted = await caches.delete(cacheName);
        if (deleted) {
          console.log(`Cleaned up cache: ${cacheName}`);
          // Check if we have enough space now
          const estimate = await navigator.storage.estimate();
          if (estimate.usage / estimate.quota < 0.8) {
            break;
          }
        }
      } catch (error) {
        console.error(`Failed to cleanup cache ${cacheName}:`, error);
      }
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export default cacheManager;