import type { FC, ComponentType, ReactNode } from 'react'
import DynamicWrapper from '@/components/tsx/builders/DynamicWrapper'
import { NavigationProvider } from '@/hooks/NavigationContext'
import { ThemeProvider } from '@/components/tsx/theme-provider'
import { lazy, Suspense } from 'react'
import Navbar from '@/components/tsx/common/Navbar'

// Define available components map (excluding Navbar)
const componentsMap: Record<string, () => Promise<{ default: ComponentType }>> = {
  PostsComponent: () => import('@/components/tsx/dynamic/PostsComponent'),
  TestComponent: () => import('@/components/tsx/dynamic/TestComponent'),
  // Add more components as needed
}

interface AppClientProps {
  componentName?: string
  children?: ReactNode
  additionalProviders?: Array<ComponentType<{ children: ReactNode }>>
}

const AppClient: FC<AppClientProps> = ({ 
  componentName,
  children,
  additionalProviders = []
}) => {
  const providers = [ThemeProvider, NavigationProvider, ...additionalProviders]
  
  // Handle Navbar separately
  const isNavbar = componentName === 'Navbar'
  
  // Dynamically load other components
  const DynamicComponent = componentName && !isNavbar
    ? lazy(componentsMap[componentName] || (() => Promise.reject(new Error(`Component ${componentName} not found`))))
    : null

  return (
    <DynamicWrapper providers={providers}>
      <div className="min-h-screen bg-background">
        {isNavbar && <Navbar />}
        {!isNavbar && DynamicComponent && (
          <Suspense fallback={<div className="p-4">Loading component...</div>}>
            <DynamicComponent />
          </Suspense>
        )}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </DynamicWrapper>
  )
}

export default AppClient


