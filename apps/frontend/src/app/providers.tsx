'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AnalyticsProvider from '@/components/analytics-provider';
import type { SettingsResponse } from '@/lib/api';

interface ProvidersProps {
  children: React.ReactNode;
  settings?: SettingsResponse | null;
}

export function Providers({ children, settings }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: false, // Don't retry failed requests
            throwOnError: false, // Don't throw errors, return undefined instead
            // Return empty data on error instead of throwing
            retryOnMount: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider settings={settings}>
        {children}
      </AnalyticsProvider>
    </QueryClientProvider>
  );
}

