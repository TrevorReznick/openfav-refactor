import type { FC, ComponentType, ReactNode } from 'react'
import DynamicWrapper from '@/components/tsx/builders/DynamicWrapper'
import { NavigationProvider } from '@/hooks/NavigationContext'
import { ThemeProvider } from '@/components/tsx/theme-provider'
import { lazy, Suspense } from 'react'
import componentLib from '@/api/tsx/componentRegistry'

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
  
  // Handle layout components differently
  const isLayout = componentName === 'Navbar' || componentName === 'HeaderHero'
  
  const DynamicComponent = componentName 
    ? lazy(() => {
        console.log(`🔄 Loading component: ${componentName}`)
        return componentLib.get(componentName).import()
      })
    : null

  return (
    <DynamicWrapper providers={providers}>
      {isLayout ? (
        // Layout components (Navbar, Hero) render directly
        <Suspense fallback={<div className="h-16 bg-secondary/50" />}>
          {DynamicComponent && <DynamicComponent />}
        </Suspense>
      ) : (
        // Content components get wrapped with container
        <div className="bg-background">
          <Suspense fallback={<div className="p-4">Loading component...</div>}>
            {DynamicComponent && <DynamicComponent />}
          </Suspense>
          {children && (
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          )}
        </div>
      )}
    </DynamicWrapper>
  )
}

export default AppClient