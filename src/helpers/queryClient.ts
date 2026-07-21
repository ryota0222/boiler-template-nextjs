import { QueryClient } from '@tanstack/react-query';

const defaultStaleTimeMs = 60_000;

// staleTime が 0 のままだと、SSR で描画済みのデータをハイドレーション直後にクライアントが再取得してしまう
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTimeMs,
      },
    },
  });
