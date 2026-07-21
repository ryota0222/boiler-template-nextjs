'use client';

import type React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { createQueryClient } from '@/helpers/queryClient';

export const QueryProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
