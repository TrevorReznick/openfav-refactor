import { createContext, useContext } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'

interface NavigationContextType {
  navigate: (path: string) => void
  currentPath: string
  previousPath: string
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const currentPathValue = useStore(currentPath)
  const previousPathValue = useStore(previousPath)

  const navigate = (path: string) => {
    previousPath.set(window.location.pathname)
    currentPath.set(path)
    window.location.href = path
  }

  return (
    <NavigationContext.Provider 
      value={{ 
        navigate, 
        currentPath: currentPathValue, 
        previousPath: previousPathValue 
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}