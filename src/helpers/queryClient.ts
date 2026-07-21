import { QueryClient } from '@tanstack/react-query';

const defaultStaleTimeMs = 60_000;

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTimeMs,
      },
    },
  });
