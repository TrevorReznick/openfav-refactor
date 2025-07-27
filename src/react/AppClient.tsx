// ~/react/components/AppClient.tsx - Versione migliorata con gestione del caricamento
import type { FC, ComponentType, ReactNode } from 'react'
import { lazy, Suspense, useEffect, useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import DynamicWrapper from '@/react/wrappers/dynamicWrapper'
import { NavigationProvider } from '~/react/hooks/navigationContext'
import { ThemeProvider } from '@/react/providers/themeProvider'
import { ThemeToggle } from '@/react/components/ThemeToggle'
import { componentLib } from '~/react/lib/componentLib' // Import corretto
import LoadingFallback from '@/react/components/common/LoadFallback'

interface AppClientProps {
  componentName?: string
  useQueryString?: boolean
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
  // Base providers with QueryClient and Auth
  const providers = [
    ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>        
        {children}        
      </QueryClientProvider>
    ),
    ThemeProvider,
    NavigationProvider,
    ...additionalProviders,
  ]

  // Gestione speciale per componenti specifici
  const isNavbar = componentName === 'Navbar'
  const isSpecialComponent = ['Navbar', 'Header', 'Footer'].includes(componentName || '')

  // Stato per gestire il caricamento e gli errori
  const [componentState, setComponentState] = useState<{
    name: string | null;
    error: Error | null;
    isLoading: boolean;
  }>({ name: componentName || null, error: null, isLoading: !!componentName });

  // Effetto per il caricamento del componente
  useEffect(() => {
    if (!componentName) {
      setComponentState({ name: null, error: null, isLoading: false });
      return;
    }

    let isMounted = true;
    
    const loadComponent = async () => {
      try {
        setComponentState(prev => ({ ...prev, isLoading: true, error: null }));
        console.log(`🔄 Loading component: ${componentName}`);
        
        // Forza l'inizializzazione
        await componentLib.initialize();
        
        // Controlla se il componente esiste (prova entrambi i nomi)
        let finalComponentName = componentName;
        let hasComponent = await componentLib.has(componentName);
        
        if (!hasComponent) {
          // Prova con kebab-case
          const kebabName = componentName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
          if (await componentLib.has(kebabName)) {
            finalComponentName = kebabName;
            hasComponent = true;
          }
        }
        
        if (!hasComponent) {
          // Check if this is an auth-related component and provide specific guidance
          const authComponents = ['login', 'auth', 'signin', 'sign-up', 'register'];
          const isAuthComponent = authComponents.includes(componentName.toLowerCase());
          
          if (isAuthComponent) {
            const error = new Error(`Authentication component (${componentName}) not found. You may need to create this component.`);
            console.error('❌', error.message);
            if (isMounted) {
              setComponentState({
                name: componentName,
                error,
                isLoading: false
              });
            }
            return;
          }
          
          const error = new Error(`Component "${componentName}" not found in registry`);
          console.error(`❌ ${error.message}`);
          const allComponents = await componentLib.getAllComponents();
          console.log('📋 Available components:', Array.from(allComponents.keys()));
          throw error;
        }

        // Ottieni il componente
        const Component = await componentLib.getComponent(finalComponentName);
        
        if (!Component) {
          throw new Error(`Component "${finalComponentName}" configuration not found`);
        }

        console.log(`✅ Successfully loaded component: ${finalComponentName}`);
        
        if (isMounted) {
          setComponentState({
            name: finalComponentName,
            error: null,
            isLoading: false
          });
        }
      } catch (error) {
        console.error(`❌ Failed to load component ${componentName}:`, error);
        if (isMounted) {
          setComponentState({
            name: componentName,
            error: error as Error,
            isLoading: false
          });
        }
      }
    };

    loadComponent();
    
    return () => {
      isMounted = false;
    };
  }, [componentName]);

  // Crea il componente dinamico in modo memoizzato
  const DynamicComponent = useMemo(() => {
    if (!componentState.name || componentState.isLoading || componentState.error) {
      return null;
    }
    
    return lazy(async () => {
      try {
        const Component = await componentLib.getComponent(componentState.name!);
        if (!Component) {
          throw new Error(`Component "${componentState.name}" not found`);
        }
        return { default: Component };
      } catch (error) {
        console.error('Error in lazy loading:', error);
        throw error;
      }
    });
  }, [componentState.name, componentState.isLoading, componentState.error]);

  // Fallback personalizzato basato sul tipo di componente
  const renderFallback = () => {
    if (componentState.error) {
      // Special case for auth-related components not found
      const authComponents = ['login', 'auth', 'signin', 'sign-up', 'register'];
      if (componentState.name && authComponents.includes(componentState.name.toLowerCase())) {
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 m-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <h3 className="font-bold text-blue-800">Authentication Required</h3>
            </div>
            <p className="text-blue-700 mb-4">
              The {componentState.name} component is not available. This might be because:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>The authentication component is not yet implemented</li>
              <li>You need to create an authentication component in your components directory</li>
              <li>The authentication system is not properly configured</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800 space-y-2">
              <p className="font-medium">To fix this, you can:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Create an Auth component in <code className="bg-blue-200 px-1 rounded">src/react/components/auth/Auth.tsx</code> that handles login/register flows</li>
                <li>Or create specific components like <code className="bg-blue-200 px-1 rounded">Login.tsx</code> and <code className="bg-blue-200 px-1 rounded">Register.tsx</code></li>
                <li>Make sure they're properly exported as default exports</li>
                <li>Register them in your component library if needed</li>
              </ol>
              <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                <p className="text-xs font-mono text-blue-700">Example Auth.tsx:</p>
                <pre className="text-xs bg-blue-50 p-2 rounded mt-1 overflow-x-auto">
                  {`import { useState } from 'react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>
      {/* Add your auth form here */}
      <div className="mt-4 text-center text-sm">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:underline"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        );
      }

      // Default error display for other components
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 m-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-destructive text-xl">⚠️</span>
            <h3 className="font-bold text-destructive">Component Load Error</h3>
          </div>
          <p className="text-destructive mb-3">
            Failed to load component: <code className="bg-destructive/20 px-1 rounded">{componentState.name}</code>
          </p>
          <p className="text-sm text-muted-foreground">
            {componentState.error?.toString()}
          </p>
          {componentState.name && (
            <div className="mt-4 p-3 bg-muted/50 rounded text-sm">
              <p className="font-medium">Available components:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Auth', 'Login', 'Home', 'Navbar', 'Footer', 'Dashboard'].map(comp => (
                  <div key={comp} className="bg-muted/30 px-2 py-1 rounded text-xs text-center">
                    {comp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isNavbar) return <LoadingFallback />;
    
    if (isSpecialComponent || componentState.isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 rounded-full animate-bounce"></div>
            <span className="text-muted-foreground">
              {componentState.isLoading ? `Loading ${componentState.name}...` : 'Loading...'}
            </span>
          </div>
        </div>
      );
    }
    
    return <div className="p-4 text-center text-muted-foreground">Loading component...</div>;
  };

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
      <Suspense fallback={renderFallback()}>
        {DynamicComponent ? (
          <DynamicComponent />
        ) : componentState.error ? (
          renderFallback()
        ) : componentState.isLoading ? (
          renderFallback()
        ) : null}
      </Suspense>

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