// 1. src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Logica personalizzata per i retry
        if (error instanceof Error && error.message === 'Network Error') {
          return true
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
})