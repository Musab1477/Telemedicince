/**
 * Critical CSS utilities for above-the-fold optimization
 * Handles critical CSS extraction and inlining for faster initial page loads
 */

class CriticalCSSManager {
  constructor() {
    this.criticalCSS = ''
    this.nonCriticalCSS = []
    this.isInitialized = false
  }

  /**
   * Initialize critical CSS management
   */
  init() {
    if (this.isInitialized) return
    
    this.extractCriticalCSS()
    this.setupNonCriticalLoading()
    this.isInitialized = true
  }

  /**
   * Extract critical CSS for above-the-fold content
   */
  extractCriticalCSS() {
    // Define critical CSS selectors (above-the-fold content)
    const criticalSelectors = [
      // Layout
      'html', 'body', '*',
      '.min-h-screen', '.bg-gray-50',
      
      // Navigation
      '.navbar', '.nav-item', '.nav-link',
      '.sidebar', '.menu-item',
      
      // Network banner
      '.network-banner', '.offline-banner', '.slow-connection-banner',
      
      // Loading states
      '.loader', '.skeleton', '.loading',
      '.animate-spin', '.animate-pulse',
      
      // Critical components
      '.hero', '.header', '.main-content',
      '.login-form', '.register-form',
      '.dashboard-header', '.quick-actions',
      
      // Typography
      'h1', 'h2', 'h3', 'p', 'span',
      '.text-sm', '.text-base', '.text-lg', '.text-xl',
      '.font-medium', '.font-semibold', '.font-bold',
      
      // Colors
      '.text-gray-900', '.text-gray-600', '.text-gray-500',
      '.bg-white', '.bg-blue-600', '.bg-red-600', '.bg-yellow-600',
      '.border-gray-300', '.border-blue-600',
      
      // Layout utilities
      '.flex', '.grid', '.block', '.inline-block',
      '.items-center', '.justify-center', '.justify-between',
      '.space-x-2', '.space-x-4', '.space-y-2', '.space-y-4',
      '.p-2', '.p-4', '.px-4', '.py-2', '.m-4', '.mb-4',
      '.w-full', '.h-full', '.max-w-md', '.max-w-lg',
      
      // Responsive
      '.sm\\:block', '.md\\:flex', '.lg\\:grid',
      '.sm\\:text-base', '.md\\:text-lg',
      
      // Interactive states
      '.hover\\:bg-blue-700', '.focus\\:outline-none', '.focus\\:ring-2',
      '.disabled\\:bg-gray-300', '.disabled\\:cursor-not-allowed',
      
      // Transitions
      '.transition-colors', '.transition-opacity', '.duration-300'
    ]

    // Extract CSS rules for critical selectors
    this.criticalCSS = this.generateCriticalCSS(criticalSelectors)
  }

  /**
   * Generate critical CSS string
   */
  generateCriticalCSS(selectors) {
    // This is a simplified version - in production, you'd use tools like:
    // - critical (npm package)
    // - penthouse
    // - puppeteer with CSS coverage
    
    return `
/* Critical CSS - Inlined for fast loading */
html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-white {
  background-color: #ffffff;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-red-600 {
  background-color: #dc2626;
}

.bg-yellow-600 {
  background-color: #d97706;
}

.text-white {
  color: #ffffff;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.flex {
  display: flex;
}

.grid {
  display: grid;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.text-sm {
  font-size: 0.875rem;
}

.text-base {
  font-size: 1rem;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.p-2 {
  padding: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-full {
  width: 100%;
}

.rounded {
  border-radius: 0.25rem;
}

.border {
  border-width: 1px;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Network status banners */
.network-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 0.5rem 1rem;
  text-align: center;
  font-size: 0.875rem;
}

/* Loading states */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive utilities */
@media (min-width: 640px) {
  .sm\\:block {
    display: block;
  }
  .sm\\:text-base {
    font-size: 1rem;
  }
}

@media (min-width: 768px) {
  .md\\:flex {
    display: flex;
  }
  .md\\:text-lg {
    font-size: 1.125rem;
  }
}

/* Focus states for accessibility */
.focus\\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover states */
.hover\\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

/* Disabled states */
.disabled\\:bg-gray-300:disabled {
  background-color: #d1d5db;
}

.disabled\\:cursor-not-allowed:disabled {
  cursor: not-allowed;
}
`
  }

  /**
   * Setup non-critical CSS loading
   */
  setupNonCriticalLoading() {
    // Load non-critical CSS asynchronously
    const nonCriticalStylesheets = [
      '/src/index.css', // Main stylesheet (non-critical parts)
      // Add other non-critical stylesheets here
    ]

    nonCriticalStylesheets.forEach(href => {
      this.loadNonCriticalCSS(href)
    })
  }

  /**
   * Load non-critical CSS asynchronously
   */
  loadNonCriticalCSS(href) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = function() {
      this.onload = null
      this.rel = 'stylesheet'
    }
    
    // Fallback for browsers that don't support preload
    const noscript = document.createElement('noscript')
    const fallbackLink = document.createElement('link')
    fallbackLink.rel = 'stylesheet'
    fallbackLink.href = href
    noscript.appendChild(fallbackLink)
    
    document.head.appendChild(link)
    document.head.appendChild(noscript)
  }

  /**
   * Inline critical CSS
   */
  inlineCriticalCSS() {
    const style = document.createElement('style')
    style.textContent = this.criticalCSS
    style.setAttribute('data-critical', 'true')
    
    // Insert before any existing stylesheets
    const firstLink = document.querySelector('link[rel="stylesheet"]')
    if (firstLink) {
      document.head.insertBefore(style, firstLink)
    } else {
      document.head.appendChild(style)
    }
  }

  /**
   * Remove critical CSS after full CSS loads
   */
  removeCriticalCSS() {
    const criticalStyle = document.querySelector('style[data-critical="true"]')
    if (criticalStyle) {
      // Wait a bit to ensure full CSS is loaded
      setTimeout(() => {
        criticalStyle.remove()
      }, 1000)
    }
  }

  /**
   * Get critical CSS string for server-side rendering
   */
  getCriticalCSS() {
    return this.criticalCSS
  }

  /**
   * Optimize CSS delivery for low-bandwidth
   */
  optimizeForLowBandwidth() {
    // Remove unused CSS classes
    this.removeUnusedCSS()
    
    // Compress CSS
    this.compressCSS()
    
    // Defer non-critical CSS
    this.deferNonCriticalCSS()
  }

  /**
   * Remove unused CSS classes (simplified version)
   */
  removeUnusedCSS() {
    // This would integrate with tools like PurgeCSS
    // For now, just remove some common unused classes
    const unusedSelectors = [
      '.text-purple-600', '.bg-purple-600', // If purple is not used
      '.text-indigo-600', '.bg-indigo-600', // If indigo is not used
      '.xl\\:text-6xl', '.2xl\\:text-7xl', // Very large text sizes
    ]
    
    // Remove unused selectors from stylesheets
    unusedSelectors.forEach(selector => {
      this.removeCSSRule(selector)
    })
  }

  /**
   * Remove specific CSS rule
   */
  removeCSSRule(selector) {
    const stylesheets = document.styleSheets
    
    for (let i = 0; i < stylesheets.length; i++) {
      const stylesheet = stylesheets[i]
      try {
        const rules = stylesheet.cssRules || stylesheet.rules
        for (let j = rules.length - 1; j >= 0; j--) {
          if (rules[j].selectorText === selector) {
            stylesheet.deleteRule(j)
          }
        }
      } catch (e) {
        // Cross-origin stylesheets may throw errors
        console.warn('Cannot access stylesheet:', e)
      }
    }
  }

  /**
   * Compress CSS by removing whitespace and comments
   */
  compressCSS() {
    this.criticalCSS = this.criticalCSS
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
      .replace(/\s*{\s*/g, '{') // Remove spaces around braces
      .replace(/;\s*/g, ';') // Remove spaces after semicolons
      .trim()
  }

  /**
   * Defer non-critical CSS loading
   */
  deferNonCriticalCSS() {
    const links = document.querySelectorAll('link[rel="stylesheet"]')
    
    links.forEach(link => {
      // Skip critical CSS
      if (link.hasAttribute('data-critical')) return
      
      // Convert to preload and load asynchronously
      link.rel = 'preload'
      link.as = 'style'
      link.onload = function() {
        this.onload = null
        this.rel = 'stylesheet'
      }
    })
  }
}

// Export singleton instance
export const criticalCSSManager = new CriticalCSSManager()

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      criticalCSSManager.init()
    })
  } else {
    criticalCSSManager.init()
  }
}

export default criticalCSSManager