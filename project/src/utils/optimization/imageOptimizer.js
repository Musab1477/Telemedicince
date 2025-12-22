/**
 * Image optimization utilities for low-bandwidth networks
 * Handles lazy loading, format optimization, and progressive enhancement
 */

class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats()
    this.intersectionObserver = null
    this.lazyImages = new Set()
    this.initLazyLoading()
  }

  /**
   * Detect supported image formats
   */
  detectSupportedFormats() {
    const formats = {
      webp: false,
      avif: false,
      jpeg: true,
      png: true
    }

    // Test WebP support
    const webpCanvas = document.createElement('canvas')
    webpCanvas.width = 1
    webpCanvas.height = 1
    formats.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

    // Test AVIF support (basic check)
    formats.avif = 'createImageBitmap' in window

    return formats
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px 0px', // Load images 50px before they come into view
          threshold: 0.01
        }
      )
    }
  }

  /**
   * Handle intersection observer callback
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        this.loadImage(img)
        this.intersectionObserver.unobserve(img)
        this.lazyImages.delete(img)
      }
    })
  }

  /**
   * Add image to lazy loading queue
   */
  addLazyImage(img) {
    if (this.intersectionObserver) {
      this.lazyImages.add(img)
      this.intersectionObserver.observe(img)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img)
    }
  }

  /**
   * Load image with optimization
   */
  loadImage(img) {
    const src = img.dataset.src
    const srcset = img.dataset.srcset
    
    if (src) {
      // Optimize source URL
      const optimizedSrc = this.optimizeImageUrl(src)
      
      // Create new image to preload
      const newImg = new Image()
      
      newImg.onload = () => {
        img.src = optimizedSrc
        if (srcset) {
          img.srcset = this.optimizeSrcSet(srcset)
        }
        img.classList.add('loaded')
        img.classList.remove('loading')
      }
      
      newImg.onerror = () => {
        // Fallback to original source
        img.src = src
        img.classList.add('error')
        img.classList.remove('loading')
      }
      
      newImg.src = optimizedSrc
    }
  }

  /**
   * Optimize image URL based on supported formats and network conditions
   */
  optimizeImageUrl(url) {
    // Skip optimization for external URLs or already optimized URLs
    if (url.startsWith('http') || url.includes('optimized')) {
      return url
    }

    const networkSpeed = this.getNetworkSpeed()
    const devicePixelRatio = window.devicePixelRatio || 1
    
    // Determine optimal format
    let format = 'jpeg'
    if (this.supportedFormats.avif && networkSpeed !== 'slow') {
      format = 'avif'
    } else if (this.supportedFormats.webp) {
      format = 'webp'
    }

    // Determine optimal quality and size
    let quality = 80
    let maxWidth = 800
    
    if (networkSpeed === 'slow') {
      quality = 60
      maxWidth = 400
    } else if (networkSpeed === 'moderate') {
      quality = 70
      maxWidth = 600
    }

    // Adjust for high DPI displays
    if (devicePixelRatio > 1 && networkSpeed !== 'slow') {
      maxWidth *= Math.min(devicePixelRatio, 2)
    }

    // Build optimized URL (this would integrate with your image service)
    const params = new URLSearchParams({
      format,
      quality: quality.toString(),
      width: maxWidth.toString(),
      auto: 'compress'
    })

    return `${url}?${params.toString()}`
  }

  /**
   * Optimize srcset attribute
   */
  optimizeSrcSet(srcset) {
    return srcset
      .split(',')
      .map(src => {
        const [url, descriptor] = src.trim().split(' ')
        return `${this.optimizeImageUrl(url)} ${descriptor || ''}`
      })
      .join(', ')
  }

  /**
   * Get current network speed
   */
  getNetworkSpeed() {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = navigator.connection
      const effectiveType = connection.effectiveType
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow'
        case '3g':
          return 'moderate'
        case '4g':
        default:
          return 'fast'
      }
    }

    // Fallback: assume moderate speed
    return 'moderate'
  }

  /**
   * Create responsive image with lazy loading
   */
  createResponsiveImage(src, alt, className = '', sizes = '100vw') {
    const img = document.createElement('img')
    
    // Set up lazy loading
    img.dataset.src = src
    img.alt = alt
    img.className = `lazy-image loading ${className}`
    img.sizes = sizes
    
    // Create placeholder
    const placeholder = this.createPlaceholder()
    img.src = placeholder
    
    // Add to lazy loading queue
    this.addLazyImage(img)
    
    return img
  }

  /**
   * Create low-quality placeholder
   */
  createPlaceholder(width = 40, height = 30) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    
    // Create simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f0f0f0')
    gradient.addColorStop(1, '#e0e0e0')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    return canvas.toDataURL('image/jpeg', 0.1)
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(urls) {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = this.optimizeImageUrl(url)
      document.head.appendChild(link)
    })
  }

  /**
   * Progressive image loading with blur effect
   */
  loadProgressiveImage(container, src, alt = '') {
    const img = document.createElement('img')
    const placeholder = document.createElement('div')
    
    // Set up placeholder
    placeholder.className = 'image-placeholder'
    placeholder.style.cssText = `
      background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
      filter: blur(5px);
      transition: opacity 0.3s ease;
    `
    
    // Set up main image
    img.className = 'progressive-image'
    img.alt = alt
    img.style.cssText = `
      opacity: 0;
      transition: opacity 0.3s ease;
    `
    
    img.onload = () => {
      img.style.opacity = '1'
      placeholder.style.opacity = '0'
      setTimeout(() => {
        if (placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder)
        }
      }, 300)
    }
    
    // Load optimized image
    img.src = this.optimizeImageUrl(src)
    
    // Add to container
    container.appendChild(placeholder)
    container.appendChild(img)
    
    return img
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }
    this.lazyImages.clear()
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer()

// CSS for lazy loading (to be added to your CSS)
export const lazyLoadingCSS = `
.lazy-image {
  transition: opacity 0.3s ease;
}

.lazy-image.loading {
  opacity: 0.7;
  filter: blur(2px);
}

.lazy-image.loaded {
  opacity: 1;
  filter: none;
}

.lazy-image.error {
  opacity: 0.5;
  background: #f0f0f0;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* Progressive enhancement for slow connections */
@media (max-width: 768px) and (max-resolution: 1dppx) {
  .lazy-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
`

export default imageOptimizer