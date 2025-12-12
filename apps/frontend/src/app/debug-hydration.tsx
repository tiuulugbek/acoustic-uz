'use client';

import { useEffect, useState } from 'react';

/**
 * Debug component to help identify hydration mismatches
 * Suppresses hydration warnings in production, logs them in development
 */
export default function DebugHydration() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Suppress hydration warnings in production - they are expected in some cases
    // In development, we still want to see them for debugging
    if (process.env.NODE_ENV === 'production') {
      const originalError = console.error;
      console.error = function(...args: any[]) {
        // Suppress hydration warnings in production
        const errorStr = args[0]?.toString?.() || '';
        if (
          errorStr.includes('Hydration') ||
          errorStr.includes('hydration') ||
          errorStr.includes('306') ||
          errorStr.includes('310') ||
          errorStr.includes('Minified React error #306') ||
          errorStr.includes('Minified React error #310')
        ) {
          // Silently suppress - these warnings are expected in some cases
          // Log as warning for debugging
          console.warn('[Hydration Warning Suppressed]', ...args);
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
        const errorStr = args[0]?.toString?.() || '';
        if (
          errorStr.includes('Hydration') ||
          errorStr.includes('hydration') ||
          errorStr.includes('306') ||
          errorStr.includes('310') ||
          errorStr.includes('Minified React error #306') ||
          errorStr.includes('Minified React error #310')
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

  // Don't render anything to prevent hydration mismatch
  if (!mounted) return null;
  
  return null;
}

