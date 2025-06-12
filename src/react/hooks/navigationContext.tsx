'use client'

import { createContext, useContext, useEffect, useCallback, useState } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'
import { toast } from 'sonner'

interface NavigationContextType {
  navigate: (path: string) => Promise<void>
  goBack: () => void
  currentPath: string
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false)
  const current = useStore(currentPath)
  const previous = useStore(previousPath)

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Sync router with store
  useEffect(() => {
    if (!isClient) return
    
    const updatePath = () => currentPath.set(window.location.pathname)
    
    // Initial sync
    updatePath()
    
    // Handle browser navigation
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [isClient])

  /**
   * Navigate to a new path
   */
  const navigate = useCallback(async (path: string) => {
    console.groupCollapsed(`🧭 Navigation to ${path}`)
    try {
      await performNavigation(path)
    } catch (error) {
      console.error('Navigation error:', error)
      toast.error(`Navigation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.groupEnd()
    }
  }, [])

  /**
   * Perform the actual navigation
   */
  const performNavigation = (path: string, state?: Record<string, unknown>) => {
    if (!isClient) return
    
    previousPath.set(current)
    currentPath.set(path)
    window.history.pushState(state ?? {}, '', path)
    console.debug('Navigation completed:', path)
    toast.dismiss() // Clear previous toasts
    toast.success(`Navigated to ${path}`)
  }

  /**
   * Go back to previous page
   */
  const goBack = useCallback(() => {
    if (previous) {
      currentPath.set(previous)
      window.history.back()
      toast.info('Returned to previous page')
    } else {
      toast.warning('No navigation history available')
      navigate('/') // Fallback to home
    }
  }, [previous, navigate])

  return (
    <NavigationContext.Provider 
      value={{ 
        navigate, 
        goBack, 
        currentPath: current
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

/**
 * Custom hook for navigation
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}