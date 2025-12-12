'use client';

import { useEffect } from 'react';

/**
 * Debug component to help identify hydration mismatches
 * Add this temporarily to pages to see detailed hydration errors
 */
export default function DebugHydration() {
  useEffect(() => {
    // Log hydration warnings
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        args[0]?.includes?.('Hydration') ||
        args[0]?.includes?.('hydration') ||
        args[0]?.includes?.('306') ||
        args[0]?.includes?.('310')
      ) {
        console.group('🔴 Hydration Error Detected');
        console.error(...args);
        console.trace('Stack trace:');
        console.groupEnd();
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}

