import { createContext, useContext, useEffect, useCallback } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'
import { toast } from 'sonner'
import { UserHelper } from '@/scripts/getAuth'
import type { UserSession } from '~/types/auth/userSession'

interface NavigationContextType {
  navigate: (path: string) => Promise<void>
  goBack: () => void
  currentPath: string
  checkAuth: () => Promise<boolean>
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)
const authHelper = UserHelper.getInstance()

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const current = useStore(currentPath)
  const previous = useStore(previousPath)

  // Sync router with store
  useEffect(() => {
    const updatePath = () => currentPath.set(window.location.pathname)
    
    // Initial sync
    updatePath()
    
    // Handle browser navigation
    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  /**
   * Check authentication status
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const session = await authHelper.getCompleteSession()
      return session.isAuthenticated && !authHelper.isTokenExpired(session)
    } catch (error) {
      console.error('Auth check failed:', error)
      return false
    }
  }, [])

  /**
   * Navigate to a new path with auth guard
   */
  const navigate = useCallback(async (path: string) => {
    console.groupCollapsed(`🧭 Navigation to ${path}`)
    try {
      // Skip auth check for public routes
      if (path.startsWith('/public')) {
        performNavigation(path)
        return
      }

      const isAuthenticated = await checkAuth()
      
      if (isAuthenticated) {
        await performNavigation(path)
      } else {
        console.warn('Navigation blocked: authentication required')
        toast.error('Please login to access this page')
        performNavigation('/login', { redirect: path })
      }
    } catch (error) {
      console.error('Navigation error:', error)
      toast.error(`Navigation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.groupEnd()
    }
  }, [checkAuth])

  /**
   * Perform the actual navigation
   */
  const performNavigation = (path: string, state?: Record<string, unknown>) => {
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
        currentPath: current,
        checkAuth
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