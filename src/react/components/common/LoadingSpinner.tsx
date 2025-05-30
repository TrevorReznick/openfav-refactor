import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils/utils'
import { loadingStore } from '@/store'
import { useStore } from '@nanostores/react'
import { Loader2 } from 'lucide-react'

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

  const isLoading = useStore(loadingStore)
  const [showSpinner, setShowSpinner] = useState(false)

  // Add a small delay before showing the spinner to prevent flashing on quick loads
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isLoading) {
      timer = setTimeout(() => {
        setShowSpinner(true)
      }, 100)
    } else {
      setShowSpinner(false)
    }
    
    return () => clearTimeout(timer)
  }, [isLoading])
  
  if (!showSpinner) return null

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen && 'fixed inset-0 bg-background/80 z-50',
        className
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg">
        <Loader2 className={cn(
          'animate-spin',
          size === 'sm' ? 'h-4 w-4' :
          size === 'md' ? 'h-8 w-8' :
          'h-12 w-12',
          'text-primary'
        )} />
        {message && (
          <p className="text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
