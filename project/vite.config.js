import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // App Shell - Cache First
          {
            urlPattern: /^https:\/\/localhost:3000\/$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-shell-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          },
          // Static Assets - Cache First
          {
            urlPattern: /\.(?:js|css|html)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // Images - Cache First with longer expiration
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              }
            }
          },
          // API Data - Network First with fallback
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          },
          // Mock Data - Stale While Revalidate
          {
            urlPattern: /\/mock\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mock-data-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              }
            }
          },
          // Consultation Data - Network First (real-time priority)
          {
            urlPattern: /\/(consultations|appointments|emr)\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'consultation-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              networkTimeoutSeconds: 5
            }
          }
        ],
        // Background Sync for offline actions
        backgroundSync: {
          name: 'swasthlink-background-sync',
          options: {
            maxRetentionTime: 24 * 60 // 24 hours in minutes
          }
        }
      },
      manifest: {
        name: 'SwasthLink - Telemedicine Platform',
        short_name: 'SwasthLink',
        description: 'Low-bandwidth optimized telemedicine platform for rural healthcare',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['preact', 'preact/hooks'],
          router: ['preact-router']
        }
      }
    }
  },
  server: {
    port: 3000
  }
})