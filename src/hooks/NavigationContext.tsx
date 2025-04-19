import { createContext, useContext, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'
import { authGuard } from '@/scripts/authGuard'
import { toast } from 'sonner'

interface NavigationContextType {
  navigate: (path: string) => void
  goBack: () => void
  currentPath: string
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)
authGuard()

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const current = useStore(currentPath)
  const previous = useStore(previousPath)

  useEffect(() => {
    // Sync initial path with store
    currentPath.set(window.location.pathname)

    // Listen for popstate events (browser back/forward)
    const handlePopState = () => {
      currentPath.set(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = async (path: string) => {
    try {
      console.group('🧭 Navigation Attempt')
      console.log('Navigating to:', path)

      // Check auth middleware
      const canProceed = await authGuard()
      
      if (canProceed) {
        previousPath.set(current)
        currentPath.set(path)
        window.history.pushState({}, '', path)
        console.log('Navigation successful')
        toast.success(`Navigated to ${path}`)
      } else {
        console.log('Navigation blocked by middleware')
        toast.error('Navigation blocked: Authentication required')
      }
    } catch (error: any) {
      console.error('Navigation failed:', error)
      toast.error(`Navigation failed: ${error.message}`)
    } finally {
      console.groupEnd()
    }
  }

  const goBack = () => {
    if (previous) {
      currentPath.set(previous)
      window.history.back()
      toast.info(`Returned to previous page`)
    } else {
      toast.warning('No previous page available')
    }
  }

  return (
    <NavigationContext.Provider value={{ navigate, goBack, currentPath: current }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}