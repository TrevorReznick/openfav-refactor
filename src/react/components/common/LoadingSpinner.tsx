import React from 'react'
import { cn } from '../../lib/utils/utils'
import { useLoading } from '@/store'

interface LoadingSpinnerProps {
  id?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  id,
  className,
  size = 'md',
  fullScreen = false,
  message,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  }

  // If an ID is provided, only show when that specific loading state is true
  const shouldShow = id ? useLoading(id) : true

  if (!shouldShow) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen && 'fixed inset-0 bg-background/80 z-50',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className={cn(
            'animate-spin rounded-full border-t-transparent',
            sizeClasses[size],
            'border-primary'
          )}
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        {message && (
          <p className="text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
