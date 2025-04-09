import { createContext, useContext, useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'

interface NavigationContextType {
  navigate: (path: string) => void
  goBack: () => void
  currentPath: string
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

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

  const navigate = (path: string) => {
    try {
      previousPath.set(current)
      currentPath.set(path)
      window.history.pushState({}, '', path)
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }

  const goBack = () => {
    if (previous) {
      currentPath.set(previous)
      window.history.back()
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