import { useI18n } from '../../contexts/I18nContext'

export function Loader({ type = 'default', count = 1, className = '' }) {
  const { t } = useI18n()

  const renderSkeleton = (skeletonType, index) => {
    switch (skeletonType) {
      case 'form':
        return (
          <div key={index} className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 loading-skeleton"></div>
              <div className="h-10 bg-gray-200 rounded loading-skeleton"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 loading-skeleton"></div>
              <div className="h-10 bg-gray-200 rounded loading-skeleton"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/5 loading-skeleton"></div>
              <div className="h-24 bg-gray-200 rounded loading-skeleton"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 loading-skeleton"></div>
          </div>
        )

      case 'list':
        return (
          <div key={index} className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full loading-skeleton"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 loading-skeleton"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 loading-skeleton"></div>
              </div>
            </div>
          </div>
        )

      case 'card':
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gray-200 rounded-lg loading-skeleton"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3 loading-skeleton"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 loading-skeleton"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded loading-skeleton"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 loading-skeleton"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6 loading-skeleton"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20 loading-skeleton"></div>
              <div className="h-8 bg-gray-200 rounded w-16 loading-skeleton"></div>
            </div>
          </div>
        )

      case 'consultation':
        return (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full loading-skeleton"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 loading-skeleton"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 loading-skeleton"></div>
                </div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded-full loading-skeleton"></div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4 loading-skeleton"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded loading-skeleton"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5 loading-skeleton"></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-24 loading-skeleton"></div>
              <div className="h-10 bg-gray-200 rounded w-20 loading-skeleton"></div>
            </div>
          </div>
        )

      case 'table':
        return (
          <div key={index} className="space-y-2">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded loading-skeleton"></div>
              <div className="h-4 bg-gray-200 rounded loading-skeleton"></div>
              <div className="h-4 bg-gray-200 rounded loading-skeleton"></div>
              <div className="h-4 bg-gray-200 rounded loading-skeleton"></div>
            </div>
          </div>
        )

      case 'spinner':
        return (
          <div key={index} className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )

      default:
        return (
          <div key={index} className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 loading-skeleton"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 loading-skeleton"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 loading-skeleton"></div>
          </div>
        )
    }
  }

  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: count }, (_, index) => renderSkeleton(type, index))}
    </div>
  )
}

// Specialized loader components for common use cases
export function FormLoader({ className = '' }) {
  return <Loader type="form" className={className} />
}

export function ListLoader({ count = 3, className = '' }) {
  return <Loader type="list" count={count} className={className} />
}

export function CardLoader({ count = 1, className = '' }) {
  return <Loader type="card" count={count} className={className} />
}

export function ConsultationLoader({ className = '' }) {
  return <Loader type="consultation" className={className} />
}

export function TableLoader({ count = 5, className = '' }) {
  return <Loader type="table" count={count} className={className} />
}

export function SpinnerLoader({ className = '' }) {
  return <Loader type="spinner" className={className} />
}