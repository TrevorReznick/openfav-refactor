import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

interface AppClientProps {
  componentName: string;
  additionalProviders?: Array<{
    children: (children: React.ReactNode) => React.ReactNode;
  }>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const DynamicWrapper = ({ providers, children }: { providers: any[], children: React.ReactNode }) => {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
};

export default function AppClient({ componentName, additionalProviders = [] }: AppClientProps) {
  const DynamicComponent = componentName
    ? lazy(() => {
        return import(/* @vite-ignore */ `../components_rc/${componentName}`)
          .catch(error => {
            console.error(`Failed to load component ${componentName}:`, error);
            return Promise.resolve({
              default: () => (
                <div className="text-red-500 p-4">
                  Failed to load component: {componentName}
                </div>
              )
            });
          });
      })
    : null;

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicWrapper providers={[...additionalProviders]}>
        <Suspense fallback={<div>Loading...</div>}>
          {DynamicComponent ? <DynamicComponent /> : null}
        </Suspense>
        <Toaster richColors position="top-right" />
      </DynamicWrapper>
    </QueryClientProvider>
  );
}
