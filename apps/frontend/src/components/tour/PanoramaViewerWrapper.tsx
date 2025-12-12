'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { TourConfig } from '@/types/tour';

// Dynamically import PanoramaViewer with ssr: false
const PanoramaViewer = dynamic(() => import('./PanoramaViewer'), {
  ssr: false,
  loading: () => {
    // Loading placeholder - MUST match exactly
    return (
      <div className="relative w-full" style={{ aspectRatio: '16 / 9', minHeight: '400px' }} suppressHydrationWarning>
        <div className="flex h-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent mx-auto"></div>
            <p className="text-lg text-gray-600" suppressHydrationWarning>
              3D Tour yuklanmoqda... / Загрузка 3D тура...
            </p>
          </div>
        </div>
      </div>
    );
  },
});

interface PanoramaViewerWrapperProps {
  config: TourConfig;
  locale?: 'uz' | 'ru';
}

/**
 * Wrapper component to ensure PanoramaViewer only renders on client-side
 * This prevents hydration mismatch by ensuring consistent render between SSR and client
 */
export default function PanoramaViewerWrapper({ config, locale = 'uz' }: PanoramaViewerWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render PanoramaViewer until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative w-full" style={{ aspectRatio: '16 / 9', minHeight: '400px' }} suppressHydrationWarning>
        <div className="flex h-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent mx-auto"></div>
            <p className="text-lg text-gray-600" suppressHydrationWarning>
              3D Tour yuklanmoqda... / Загрузка 3D тура...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PanoramaViewer config={config} locale={locale} />;
}

