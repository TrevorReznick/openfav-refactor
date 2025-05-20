import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeToggle } from '@/react/components/ThemeToggle';

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
        return import(/* @vite-ignore */ `../react/components/${componentName}`)
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
      <div className="flex flex-col gap-4">
        <ThemeToggle />
        <DynamicWrapper providers={[...additionalProviders]}>
          <Suspense fallback={<div>Loading...</div>}>
            {DynamicComponent ? <DynamicComponent /> : null}
          </Suspense>
          <Toaster richColors position="top-right" />
        </DynamicWrapper>
      </div>
    </QueryClientProvider>
  );
}
