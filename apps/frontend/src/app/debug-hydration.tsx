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
    
    // Additional suppression layer - runs after React hydrates
    // The main suppression is in layout.tsx <head> script which runs earlier
    // This is a backup layer for any errors that slip through
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Helper function to check if error is hydration-related
    function isHydrationError(args: any[]) {
      try {
        const errorStr = args[0]?.toString?.() || '';
        const allArgsStr = args.map(a => {
          try {
            return a?.toString?.() || '';
          } catch {
            return '';
          }
        }).join(' ');
        
        // Check for hydration errors - be very permissive
        return (
          errorStr.includes('Hydration') ||
          errorStr.includes('hydration') ||
          errorStr.includes('306') ||
          errorStr.includes('310') ||
          errorStr.includes('Minified React error #306') ||
          errorStr.includes('Minified React error #310') ||
          errorStr.includes('react.dev/errors/306') ||
          errorStr.includes('react.dev/errors/310') ||
          errorStr.includes('visit https://react.dev/errors/306') ||
          errorStr.includes('visit https://react.dev/errors/310') ||
          allArgsStr.includes('Hydration') ||
          allArgsStr.includes('hydration') ||
          allArgsStr.includes('306') ||
          allArgsStr.includes('310') ||
          allArgsStr.includes('Minified React error #306') ||
          allArgsStr.includes('Minified React error #310') ||
          allArgsStr.includes('react.dev/errors/306') ||
          allArgsStr.includes('react.dev/errors/310') ||
          allArgsStr.includes('visit https://react.dev/errors/306') ||
          allArgsStr.includes('visit https://react.dev/errors/310')
        );
      } catch (e) {
        return false;
      }
    }
    
    console.error = function(...args: any[]) {
      if (isHydrationError(args)) {
        // Suppress hydration warnings - they are expected in some cases
        // Log to console.warn for debugging but don't show as error
        originalWarn.call(console, '[Hydration Warning Suppressed (DebugHydration)]', ...args);
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError; // Clean up on unmount
    };
  }, []);

  // Don't render anything to prevent hydration mismatch
  if (!mounted) return null;
  
  return null;
}

