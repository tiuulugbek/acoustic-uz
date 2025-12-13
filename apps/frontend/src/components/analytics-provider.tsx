'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initAnalytics, trackPageView } from '@/lib/analytics';
import type { SettingsResponse } from '@/lib/api';

interface AnalyticsProviderProps {
  settings?: SettingsResponse | null;
  children: React.ReactNode;
}

export default function AnalyticsProvider({ settings, children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    if (!settings) return;

    const featureFlags = settings.featureFlags as any;
    const analyticsEnabled = featureFlags?.integrations?.analytics === true;

    if (!analyticsEnabled) {
      console.log('[Analytics] Analytics is disabled in settings');
      return;
    }

    // Get analytics IDs from settings
    const googleAnalyticsId = settings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID;
    const yandexMetrikaId = settings?.yandexMetrikaId 
      ? parseInt(settings.yandexMetrikaId, 10) 
      : (process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID 
          ? parseInt(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID, 10) 
          : undefined);

    if (!googleAnalyticsId && !yandexMetrikaId) {
      console.warn('[Analytics] No analytics IDs configured');
      return;
    }

    initAnalytics({
      googleAnalyticsId,
      yandexMetrikaId,
      enabled: true,
    });
  }, [settings]);

  // Track page views on route change
  useEffect(() => {
    if (!settings) return;

    const featureFlags = settings.featureFlags as any;
    const analyticsEnabled = featureFlags?.integrations?.analytics === true;

    if (!analyticsEnabled) return;

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(fullPath);
  }, [pathname, searchParams, settings]);

  return <>{children}</>;
}

