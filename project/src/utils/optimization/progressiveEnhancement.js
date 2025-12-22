/**
 * Progressive Enhancement utilities
 * Provides graceful degradation and feature detection for low-bandwidth environments
 */

class ProgressiveEnhancementManager {
  constructor() {
    this.features = {
      javascript: true,
      css: true,
      webp: false,
      avif: false,
      intersectionObserver: false,
      serviceWorker: false,
      webRTC: false,
      geolocation: false,
      localStorage: false,
      indexedDB: false,
      networkInformation: false
    }
    
    this.capabilities = {
      canPlayVideo: false,
      canPlayAudio: false,
      touchSupport: false,
      highDPI: false,
      reducedMotion: false
    }
    
    this.networkConditions = {
      isOnline: navigator.onLine,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0
    }
    
    this.init()
  }

  /**
   * Initialize progressive enhancement
   */
  init() {
    this.detectFeatures()
    this.detectCapabilities()
    this.detectNetworkConditions()
    this.setupEventListeners()
    this.applyEnhancements()
  }

  /**
   * Detect browser features
   */
  detectFeatures() {
    // JavaScript is obviously available if this runs
    this.features.javascript = true
    
    // CSS support
    this.features.css = 'CSS' in window
    
    // Image format support
    this.features.webp = this.supportsWebP()
    this.features.avif = this.supportsAVIF()
    
    // Modern APIs
    this.features.intersectionObserver = 'IntersectionObserver' in window
    this.features.serviceWorker = 'serviceWorker' in navigator
    this.features.webRTC = 'RTCPeerConnection' in window
    this.features.geolocation = 'geolocation' in navigator
    this.features.localStorage = this.supportsLocalStorage()
    this.features.indexedDB = 'indexedDB' in window
    this.features.networkInformation = 'connection' in navigator
  }

  /**
   * Detect device capabilities
   */
  detectCapabilities() {
    // Media playback
    const video = document.createElement('video')
    const audio = document.createElement('audio')
    
    this.capabilities.canPlayVideo = !!(video.canPlayType && video.canPlayType('video/mp4'))
    this.capabilities.canPlayAudio = !!(audio.canPlayType && audio.canPlayType('audio/mpeg'))
    
    // Touch support
    this.capabilities.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    // High DPI display
    this.capabilities.highDPI = window.devicePixelRatio > 1
    
    // Reduced motion preference
    this.capabilities.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Detect network conditions
   */
  detectNetworkConditions() {
    this.networkConditions.isOnline = navigator.onLine
    
    if (this.features.networkInformation) {
      const connection = navigator.connection
      this.networkConditions.connectionType = connection.type || 'unknown'
      this.networkConditions.effectiveType = connection.effectiveType || 'unknown'
      this.networkConditions.downlink = connection.downlink || 0
      this.networkConditions.rtt = connection.rtt || 0
    }
  }

  /**
   * Setup event listeners for dynamic conditions
   */
  setupEventListeners() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.networkConditions.isOnline = true
      this.onNetworkChange()
    })
    
    window.addEventListener('offline', () => {
      this.networkConditions.isOnline = false
      this.onNetworkChange()
    })
    
    // Network information changes
    if (this.features.networkInformation) {
      navigator.connection.addEventListener('change', () => {
        this.detectNetworkConditions()
        this.onNetworkChange()
      })
    }
  }

  /**
   * Apply progressive enhancements based on capabilities
   */
  applyEnhancements() {
    // Add feature classes to document
    this.addFeatureClasses()
    
    // Apply network-based optimizations
    this.applyNetworkOptimizations()
    
    // Setup accessibility enhancements
    this.setupAccessibilityEnhancements()
    
    // Configure media enhancements
    this.configureMediaEnhancements()
  }

  /**
   * Add CSS classes based on detected features
   */
  addFeatureClasses() {
    const classes = []
    
    // JavaScript support
    classes.push('js')
    document.documentElement.classList.remove('no-js')
    
    // Feature support classes
    Object.entries(this.features).forEach(([feature, supported]) => {
      classes.push(supported ? feature : `no-${feature}`)
    })
    
    // Capability classes
    Object.entries(this.capabilities).forEach(([capability, supported]) => {
      classes.push(supported ? capability : `no-${capability}`)
    })
    
    // Network classes
    if (this.networkConditions.effectiveType !== 'unknown') {
      classes.push(`connection-${this.networkConditions.effectiveType}`)
    }
    
    classes.push(this.networkConditions.isOnline ? 'online' : 'offline')
    
    document.documentElement.classList.add(...classes)
  }

  /**
   * Apply network-based optimizations
   */
  applyNetworkOptimizations() {
    const isSlowConnection = this.isSlowConnection()
    
    if (isSlowConnection) {
      // Reduce image quality
      this.optimizeImagesForSlowConnection()
      
      // Disable non-essential animations
      this.disableNonEssentialAnimations()
      
      // Prioritize critical resources
      this.prioritizeCriticalResources()
      
      // Enable data saver mode
      this.enableDataSaverMode()
    }
  }

  /**
   * Setup accessibility enhancements
   */
  setupAccessibilityEnhancements() {
    // Respect reduced motion preference
    if (this.capabilities.reducedMotion) {
      document.documentElement.classList.add('reduce-motion')
      this.disableAnimations()
    }
    
    // Enhance keyboard navigation
    this.enhanceKeyboardNavigation()
    
    // Improve focus management
    this.improveFocusManagement()
    
    // Add ARIA enhancements
    this.addAriaEnhancements()
  }

  /**
   * Configure media enhancements
   */
  configureMediaEnhancements() {
    // Configure video playback
    if (this.capabilities.canPlayVideo) {
      this.enhanceVideoPlayback()
    } else {
      this.provideVideoFallbacks()
    }
    
    // Configure audio playback
    if (this.capabilities.canPlayAudio) {
      this.enhanceAudioPlayback()
    } else {
      this.provideAudioFallbacks()
    }
  }

  /**
   * Check if connection is slow
   */
  isSlowConnection() {
    const effectiveType = this.networkConditions.effectiveType
    return effectiveType === 'slow-2g' || effectiveType === '2g' || 
           (this.networkConditions.downlink > 0 && this.networkConditions.downlink < 1)
  }

  /**
   * Optimize images for slow connection
   */
  optimizeImagesForSlowConnection() {
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      // Add low-quality class for CSS targeting
      img.classList.add('low-bandwidth')
      
      // Reduce image quality if data attributes are available
      if (img.dataset.lowQualitySrc) {
        img.src = img.dataset.lowQualitySrc
      }
    })
  }

  /**
   * Disable non-essential animations
   */
  disableNonEssentialAnimations() {
    document.documentElement.classList.add('reduce-animations')
    
    // Disable CSS animations via style injection
    const style = document.createElement('style')
    style.textContent = `
      .reduce-animations *,
      .reduce-animations *::before,
      .reduce-animations *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .reduce-animations .animate-spin,
      .reduce-animations .animate-pulse {
        animation: none !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Prioritize critical resources
   */
  prioritizeCriticalResources() {
    // Preload critical resources
    const criticalResources = [
      { href: '/src/main.jsx', as: 'script' },
      { href: '/src/index.css', as: 'style' }
    ]
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as
      document.head.appendChild(link)
    })
  }

  /**
   * Enable data saver mode
   */
  enableDataSaverMode() {
    document.documentElement.classList.add('data-saver')
    
    // Store preference
    if (this.features.localStorage) {
      localStorage.setItem('dataSaverMode', 'true')
    }
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('dataSaverEnabled'))
  }

  /**
   * Disable animations for reduced motion
   */
  disableAnimations() {
    const style = document.createElement('style')
    style.textContent = `
      .reduce-motion *,
      .reduce-motion *::before,
      .reduce-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Enhance keyboard navigation
   */
  enhanceKeyboardNavigation() {
    // Add visible focus indicators
    const style = document.createElement('style')
    style.textContent = `
      .js-focus-visible :focus:not(.focus-visible) {
        outline: none;
      }
      
      .js-focus-visible .focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }
    `
    document.head.appendChild(style)
    
    // Add focus-visible polyfill behavior
    document.documentElement.classList.add('js-focus-visible')
  }

  /**
   * Improve focus management
   */
  improveFocusManagement() {
    // Skip links for screen readers
    this.addSkipLinks()
    
    // Focus trap for modals
    this.setupFocusTraps()
  }

  /**
   * Add skip links for accessibility
   */
  addSkipLinks() {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50'
    
    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  /**
   * Setup focus traps for modals
   */
  setupFocusTraps() {
    // This would integrate with modal components
    // Implementation depends on your modal system
  }

  /**
   * Add ARIA enhancements
   */
  addAriaEnhancements() {
    // Add live regions for dynamic content
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.id = 'live-region'
    document.body.appendChild(liveRegion)
  }

  /**
   * Enhance video playback
   */
  enhanceVideoPlayback() {
    // Add video controls and fallbacks
    const videos = document.querySelectorAll('video')
    videos.forEach(video => {
      video.controls = true
      video.preload = this.isSlowConnection() ? 'none' : 'metadata'
    })
  }

  /**
   * Provide video fallbacks
   */
  provideVideoFallbacks() {
    const videos = document.querySelectorAll('video')
    videos.forEach(video => {
      const fallback = document.createElement('p')
      fallback.textContent = 'Video playback is not supported on this device.'
      video.parentNode.insertBefore(fallback, video.nextSibling)
    })
  }

  /**
   * Enhance audio playback
   */
  enhanceAudioPlayback() {
    const audios = document.querySelectorAll('audio')
    audios.forEach(audio => {
      audio.controls = true
      audio.preload = this.isSlowConnection() ? 'none' : 'metadata'
    })
  }

  /**
   * Provide audio fallbacks
   */
  provideAudioFallbacks() {
    const audios = document.querySelectorAll('audio')
    audios.forEach(audio => {
      const fallback = document.createElement('p')
      fallback.textContent = 'Audio playback is not supported on this device.'
      audio.parentNode.insertBefore(fallback, audio.nextSibling)
    })
  }

  /**
   * Handle network condition changes
   */
  onNetworkChange() {
    this.applyNetworkOptimizations()
    
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('networkConditionChanged', {
      detail: this.networkConditions
    }))
  }

  /**
   * Test WebP support
   */
  supportsWebP() {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  /**
   * Test AVIF support
   */
  supportsAVIF() {
    // Basic AVIF support detection
    return 'createImageBitmap' in window
  }

  /**
   * Test localStorage support
   */
  supportsLocalStorage() {
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Get current enhancement level
   */
  getEnhancementLevel() {
    if (this.isSlowConnection() || !this.features.javascript) {
      return 'basic'
    } else if (this.networkConditions.effectiveType === '3g') {
      return 'enhanced'
    } else {
      return 'full'
    }
  }

  /**
   * Get feature support summary
   */
  getFeatureSupport() {
    return {
      features: this.features,
      capabilities: this.capabilities,
      networkConditions: this.networkConditions,
      enhancementLevel: this.getEnhancementLevel()
    }
  }
}

// Export singleton instance
export const progressiveEnhancement = new ProgressiveEnhancementManager()

// Utility functions
export const isFeatureSupported = (feature) => {
  return progressiveEnhancement.features[feature] || false
}

export const hasCapability = (capability) => {
  return progressiveEnhancement.capabilities[capability] || false
}

export const getNetworkConditions = () => {
  return progressiveEnhancement.networkConditions
}

export const getEnhancementLevel = () => {
  return progressiveEnhancement.getEnhancementLevel()
}

export default progressiveEnhancement