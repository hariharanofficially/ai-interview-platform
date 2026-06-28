import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration.
 *
 * Default behavior:
 * - Stale time: 5 minutes (data stays fresh, no refetch on focus)
 * - Retry: 1 time for queries (not mutations)
 * - Refetch on window focus: disabled in dev, enabled in prod
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          5 * 60 * 1000,  // 5 minutes
      gcTime:             10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry:              1,
      refetchOnWindowFocus: (import.meta as any).env.PROD,
      refetchOnMount:     true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
