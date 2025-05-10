import type { FC, ComponentType, ReactNode } from 'react'
import { lazy, Suspense } from 'react'
import DynamicWrapper from '@/components/tsx/builders/DynamicWrapper'
import { NavigationProvider } from '@/hooks/NavigationContext'
import { ThemeProvider } from '@/components/tsx/theme-provider'
import componentLib from '@/api/tsx/componentRegistry'
import LoadingFallback from '@/components/tsx/common/LoadFallback'
import { AuthProvider } from '@/scripts/authContext'

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
  // Providers di base: Theme e Navigation
  const providers = [
    ThemeProvider,
    NavigationProvider,
    AuthProvider,
    ...additionalProviders,
  ]

  // Se il componente richiesto è Navbar, gestiamo in modo specifico
  const isNavbar = componentName === 'Navbar'

  // Caricamento dinamico in base al componentName
  const DynamicComponent = componentName
    ? lazy(() => {
        console.log(`🔄 Loading component: ${componentName}`)
        return componentLib.get(componentName).import()
      })
    : null

  // Costruiamo il contenuto da renderizzare
  const content = (
    <div className="bg-background">
      {DynamicComponent && (
        <Suspense fallback={isNavbar ? <LoadingFallback /> : <div className="p-4">Loading component...</div>}>
          <DynamicComponent />
        </Suspense>
      )}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )

  return (
    <DynamicWrapper providers={providers}>
      {content}
    </DynamicWrapper>
  )
}

export default AppClient