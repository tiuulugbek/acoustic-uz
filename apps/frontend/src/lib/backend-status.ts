/**
 * Backend status detection utilities
 * Used to determine if the backend is available and show appropriate UI
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

/**
 * Check if backend is available (client-side)
 * Returns a promise that resolves to true if backend responds, false otherwise
 */
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(`${API_BASE}/banners?public=true&_t=${Date.now()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Network error, timeout, or abort - backend is down
    return false;
  }
}

/**
 * Check if backend is available (server-side)
 * Used in server components to conditionally render UI
 * This check MUST be fresh - no caching allowed
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    // Add cache-busting timestamp to ensure fresh check
    const url = `${API_BASE}/banners?public=true&_t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
      cache: 'no-store', // Absolutely no caching
      signal: AbortSignal.timeout(3000), // 3 second timeout (more generous for server)
      next: { revalidate: 0 }, // Next.js specific - no revalidation
    });
    
    const isOk = response.ok;
    console.log(`[isBackendAvailable] Server check: ${response.status} ${response.statusText} - Backend is ${isOk ? 'available' : 'unavailable'}`);
    return isOk;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[isBackendAvailable] Server check failed: ${errorMsg} - Backend is unavailable`);
    return false;
  }
}

