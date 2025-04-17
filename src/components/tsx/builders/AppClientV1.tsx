import type { FC, ComponentType, ReactNode } from 'react'
import DynamicWrapper from '@/components/tsx/builders/DynamicWrapper'
import { NavigationProvider } from '@/hooks/NavigationContext'
import { ThemeProvider } from '@/components/tsx/theme-provider'
import { lazy, Suspense } from 'react'
import componentLib from '@/api/tsx/componentRegistry'
import LoadingFallback from '@/components/tsx/common/LoadFallback'

interface AppClientProps {
  componentName?: string
  children?: ReactNode
  useQueryString?: boolean
  additionalProviders?: Array<ComponentType<{ children: ReactNode }>>
}

const AppClient: FC<AppClientProps> = ({ 
  componentName,
  children,
  useQueryString,
  additionalProviders = []
}) => {
  // Base providers including router
  const providers = [
    ThemeProvider, 
    NavigationProvider, 
    ...additionalProviders
  ]
  
  // Handle Navbar separately
  const isNavbar = componentName === 'Navbar'
  
  // Dynamically load components using registry
  const DynamicComponent = componentName 
    ? lazy(() => componentLib.get(componentName).import())
    : null

  console.log(`🔄 Loading component: ${componentName}`)

  return (
    <DynamicWrapper providers={providers}>
      <div className="bg-background">
        {isNavbar && (
          <Suspense fallback={<LoadingFallback />}>
            {DynamicComponent && <DynamicComponent />}
          </Suspense>
        )}
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