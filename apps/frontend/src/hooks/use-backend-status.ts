'use client';

import { useState, useEffect } from 'react';
import { checkBackendStatus } from '@/lib/backend-status';

/**
 * React hook to check backend status on client
 * Returns the current backend status and loading state
 */
export function useBackendStatus() {
  // Initialize with server-set state if available
  const [isAvailable, setIsAvailable] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined' && (window as any).__BACKEND_AVAILABLE__ !== undefined) {
      return (window as any).__BACKEND_AVAILABLE__;
    }
    return null;
  });
  
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      if (!mounted) return;
      
      setIsChecking(true);
      try {
        const available = await checkBackendStatus();
        
        if (mounted) {
          setIsAvailable(available);
          setIsChecking(false);
        }
      } catch (error) {
        // Silently handle errors - backend is down
        if (mounted) {
          setIsAvailable(false);
          setIsChecking(false);
        }
      }
    }

    // Only verify if initial state suggests backend might be available
    // If initial state is false, don't check (backend is confirmed down)
    const initialState = typeof window !== 'undefined' && (window as any).__BACKEND_AVAILABLE__;
    
    if (initialState === true || initialState === undefined) {
      // Server said backend is up OR state is unknown - verify with API call
      checkStatus();

      // Check periodically (every 30 seconds) to detect when backend goes down or comes back online
      const interval = setInterval(checkStatus, 30000);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    } else {
      // Server confirmed backend is down - don't check again
      setIsChecking(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  return { isAvailable, isChecking };
}

