/**
 * LazyImage - Optimized image component with lazy loading and format optimization
 * Automatically handles low-bandwidth optimization and progressive loading
 */

import { useState, useEffect, useRef } from 'preact/hooks'
import { useNetwork } from '../../contexts/NetworkContext'
import { imageOptimizer } from '../../utils/optimization/imageOptimizer'

export function LazyImage({ 
  src, 
  alt = '', 
  className = '', 
  placeholder = null,
  sizes = '100vw',
  quality = 'auto',
  width,
  height,
  onLoad,
  onError,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const imgRef = useRef(null)
  const { isSlowConnection } = useNetwork()

  useEffect(() => {
    if (!src) return

    // Optimize image URL based on network conditions
    const optimizedSrc = optimizeImageForNetwork(src, {
      isSlowConnection,
      quality,
      width,
      height
    })

    setCurrentSrc(optimizedSrc)

    // Set up intersection observer for lazy loading
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage(optimizedSrc)
            observer.unobserve(img)
          }
        })
      },
      { rootMargin: '50px 0px', threshold: 0.01 }
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [src, isSlowConnection, quality, width, height])

  const loadImage = (imageSrc) => {
    const img = new Image()
    
    img.onload = () => {
      setIsLoaded(true)
      setIsError(false)
      if (onLoad) onLoad()
    }
    
    img.onerror = () => {
      setIsError(true)
      setIsLoaded(false)
      if (onError) onError()
    }
    
    img.src = imageSrc
  }

  const optimizeImageForNetwork = (imageSrc, options) => {
    const { isSlowConnection, quality, width, height } = options
    
    // Skip optimization for external URLs or data URLs
    if (imageSrc.startsWith('http') || imageSrc.startsWith('data:')) {
      return imageSrc
    }

    const params = new URLSearchParams()
    
    // Set quality based on network conditions
    if (quality === 'auto') {
      params.set('quality', isSlowConnection ? '50' : '75')
    } else {
      params.set('quality', quality.toString())
    }
    
    // Set dimensions
    if (width) params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    
    // Set format preference
    if (imageOptimizer.supportedFormats.webp) {
      params.set('format', 'webp')
    }
    
    // Enable compression
    params.set('auto', 'compress')
    
    return `${imageSrc}?${params.toString()}`
  }

  const getPlaceholderSrc = () => {
    if (placeholder) return placeholder
    
    // Generate simple placeholder
    const canvas = document.createElement('canvas')
    canvas.width = width || 300
    canvas.height = height || 200
    
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f8f9fa')
    gradient.addColorStop(1, '#e9ecef')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/jpeg', 0.1)
  }

  return (
    <div className={`lazy-image-container ${className}`} {...props}>
      <img
        ref={imgRef}
        src={isLoaded ? currentSrc : getPlaceholderSrc()}
        alt={alt}
        sizes={sizes}
        className={`
          lazy-image
          ${isLoaded ? 'loaded' : 'loading'}
          ${isError ? 'error' : ''}
          transition-opacity duration-300
          ${!isLoaded ? 'blur-sm opacity-70' : 'blur-none opacity-100'}
        `}
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto'
        }}
      />
      
      {/* Loading indicator for slow connections */}
      {!isLoaded && !isError && isSlowConnection && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Optimized avatar component
export function LazyAvatar({ src, name, size = 40, className = '' }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full bg-gray-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <LazyImage
          src={src}
          alt={name}
          width={size}
          height={size}
          quality={60} // Lower quality for avatars
          className="rounded-full object-cover"
        />
      ) : (
        <span 
          className="text-gray-600 font-medium"
          style={{ fontSize: `${size * 0.4}px` }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}

// Gallery component with progressive loading
export function LazyImageGallery({ images, columns = 2, className = '' }) {
  const [visibleCount, setVisibleCount] = useState(4)
  const { isSlowConnection } = useNetwork()
  
  const loadMore = () => {
    setVisibleCount(prev => prev + (isSlowConnection ? 2 : 4))
  }
  
  const visibleImages = images.slice(0, visibleCount)
  const hasMore = visibleCount < images.length
  
  return (
    <div className={`lazy-gallery ${className}`}>
      <div 
        className={`grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {visibleImages.map((image, index) => (
          <div key={index} className="aspect-square">
            <LazyImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover rounded-lg"
              quality={isSlowConnection ? 50 : 70}
            />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Load More ({images.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

// Background image component with lazy loading
export function LazyBackgroundImage({ src, children, className = '', ...props }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [optimizedSrc, setOptimizedSrc] = useState('')
  const { isSlowConnection } = useNetwork()
  
  useEffect(() => {
    if (!src) return
    
    const quality = isSlowConnection ? 40 : 60
    const optimized = `${src}?quality=${quality}&format=webp&auto=compress`
    
    const img = new Image()
    img.onload = () => {
      setOptimizedSrc(optimized)
      setIsLoaded(true)
    }
    img.src = optimized
  }, [src, isSlowConnection])
  
  return (
    <div
      className={`lazy-background ${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        backgroundImage: isLoaded ? `url(${optimizedSrc})` : 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.3s ease'
      }}
      {...props}
    >
      {children}
    </div>
  )
}