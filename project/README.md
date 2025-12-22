# SwasthLink - Telemedicine Platform

A low-bandwidth optimized telemedicine platform designed for rural healthcare connectivity.

## Project Setup

This project is built with:
- **Vite** - Fast build tool and dev server
- **Preact** - Lightweight React alternative (3KB vs 42KB)
- **Tailwind CSS** - Utility-first CSS framework
- **PWA** - Progressive Web App with offline functionality
- **Workbox** - Service worker for caching and offline support

## Features

- ✅ Progressive Web App (PWA) functionality
- ✅ Offline-first architecture with service workers
- ✅ Low-bandwidth optimization (2G network support)
- ✅ Brotli and Gzip compression
- ✅ Code splitting and lazy loading
- ✅ Responsive design with Tailwind CSS
- ✅ Network status detection and optimization

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Bundle Analysis

Current production build sizes:
- **Total JS**: ~16KB gzipped (vendor + app)
- **CSS**: ~2.3KB gzipped
- **HTML**: ~1.3KB gzipped

## PWA Features

- Service worker with Workbox
- Offline caching strategies
- Background sync for form submissions
- Network-first for dynamic content
- Cache-first for static assets

## Performance Optimizations

- System fonts only (no external font requests)
- SVG icons for scalability
- WebP/AVIF image support with fallbacks
- Critical CSS inlining
- Preact for minimal bundle size
- Tree shaking and dead code elimination

## Browser Support

- Modern browsers with ES2015+ support
- Progressive enhancement for older browsers
- Offline functionality where supported

## Next Steps

This foundation is ready for implementing the SwasthLink telemedicine platform features including:
- Role-based authentication (Patient, Doctor, Hospital, Admin)
- Multi-language support (Hindi, Tamil, Marathi, English)
- Consultation booking and management
- Offline EMR capabilities
- Low-bandwidth video/audio calling