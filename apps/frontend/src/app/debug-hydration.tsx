'use client';

import { useEffect } from 'react';

/**
 * Debug component to help identify hydration mismatches
 * Suppresses hydration warnings in production, logs them in development
 */
export default function DebugHydration() {
  useEffect(() => {
    // Suppress hydration warnings in production - they are expected in some cases
    // In development, we still want to see them for debugging
    if (process.env.NODE_ENV === 'production') {
      const originalError = console.error;
      console.error = function(...args: any[]) {
        // Suppress hydration warnings in production
        if (
          args[0]?.includes?.('Hydration') ||
          args[0]?.includes?.('hydration') ||
          args[0]?.includes?.('306') ||
          args[0]?.includes?.('310')
        ) {
          // Silently suppress - these warnings are expected in some cases
          return;
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError; // Clean up on unmount
      };
    } else {
      // In development, log hydration errors for debugging
      const originalError = console.error;
      console.error = function(...args: any[]) {
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
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError; // Clean up on unmount
      };
    }
  }, []);

  return null;
}

