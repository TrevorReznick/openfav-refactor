import type { FC, ComponentType, ReactNode } from 'react'
import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import DynamicWrapper from '@/react/DynamicWrapper'
import { NavigationProvider } from '@/react/hooks/NavigationContext'
import { ThemeProvider } from '@/react/providers/themeProvider'
import { ThemeToggle } from '@/react/components/ThemeToggle'
import componentLib from '@/react/lib/componentRegistry' // Path corretto
import LoadingFallback from '@/react/components/common/LoadFallback'


interface AppClientProps {
  componentName?: string
  useQueryString?: boolean // Mantieni per compatibilità
  children?: ReactNode
  additionalProviders?: Array<ComponentType<{ children: ReactNode }>>
  showThemeToggle?: boolean
  showToaster?: boolean
}

// QueryClient per React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

const AppClient: FC<AppClientProps> = ({
  componentName,
  useQueryString = false,
  children,
  additionalProviders = [],
  showThemeToggle = false,
  showToaster = true
}) => {
  // Providers di base con QueryClient
  const providers = [
    ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    ThemeProvider,
    NavigationProvider,
    ...additionalProviders,
  ]

  // Gestione speciale per componenti specifici
  const isNavbar = componentName === 'Navbar'
  const isSpecialComponent = ['Navbar', 'Header', 'Footer'].includes(componentName || '')

  // Caricamento dinamico con error handling migliorato
  const DynamicComponent = componentName
    ? lazy(async () => {
        try {
          console.log(`🔄 Loading component: ${componentName}`)
          
          if (!componentLib.has(componentName)) {
            console.error(`❌ Component "${componentName}" not found in registry`)
            console.log('📋 Available components:', componentLib.list())
            throw new Error(`Component "${componentName}" not registered`)
          }

          const componentConfig = componentLib.get(componentName)
          const module = await componentConfig.import()
          
          console.log(`✅ Successfully loaded component: ${componentName}`)
          return module
        } catch (error) {
          console.error(`❌ Failed to load component ${componentName}:`, error)
          
          // Componente di errore più informativo
          return {
            default: () => (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 m-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-destructive text-xl">⚠️</span>
                  <h3 className="font-bold text-destructive">Component Load Error</h3>
                </div>
                <p className="text-destructive mb-3">
                  Failed to load component: <code className="bg-destructive/20 px-1 rounded">{componentName}</code>
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Debug Information
                  </summary>
                  <div className="mt-2 space-y-2 text-xs">
                    <div>
                      <strong>Available components:</strong>
                      <div className="bg-muted p-2 rounded mt-1">
                        {componentLib.list().join(', ') || 'None registered'}
                      </div>
                    </div>
                    <div>
                      <strong>Error:</strong>
                      <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
                        {error?.toString()}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )
          }
        }
      })
    : null

  // Fallback personalizzato basato sul tipo di componente
  const renderFallback = () => {
    if (isNavbar) return <LoadingFallback />
    if (isSpecialComponent) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 rounded-full animate-bounce"></div>
            <span className="text-muted-foreground">Loading {componentName}...</span>
          </div>
        </div>
      )
    }
    return <div className="p-4 text-center text-muted-foreground">Loading component...</div>
  }

  // Contenuto principale
  const content = (
    <div className="bg-background min-h-screen">
      {/* Theme Toggle se richiesto */}
      {showThemeToggle && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}

      {/* Componente dinamico */}
      {DynamicComponent && (
        <Suspense fallback={renderFallback()}>
          <DynamicComponent />
        </Suspense>
      )}

      {/* Contenuto principale */}
      {children && (
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      )}

      {/* Toaster se richiesto */}
      {showToaster && (
        <Toaster 
          richColors 
          position="top-right" 
          toastOptions={{
            className: 'bg-background border-border',
          }}
        />
      )}
    </div>
  )

  return (
    <DynamicWrapper providers={providers}>
      {content}
    </DynamicWrapper>
  )
}

export default AppClient
