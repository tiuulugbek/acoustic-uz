'use client';

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale } from './locale';

/**
 * Get locale from window (injected by server) or cookie (client-side)
 * This function prioritizes the server-set value for consistency
 */
export function getLocaleFromCookie(): Locale {
  // First, try to read from window (set by server during SSR)
  // This is the most reliable source as it matches server render
  if (typeof window !== 'undefined' && (window as any).__NEXT_LOCALE__) {
    const locale = (window as any).__NEXT_LOCALE__;
    if (locale === 'ru' || locale === 'uz') {
      return locale as Locale;
    }
  }

  // Fallback to reading from cookie
  if (typeof document === 'undefined') return DEFAULT_LOCALE;

  try {
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find((cookie) => 
      cookie.trim().startsWith(`${LOCALE_COOKIE_NAME}=`)
    );

    if (localeCookie) {
      const value = localeCookie.split('=')[1]?.trim().toLowerCase();
      if (value === 'ru' || value === 'uz') {
        return value as Locale;
      }
    }
  } catch (error) {
    // If cookie reading fails, fall back to default
    console.error('Error reading locale cookie:', error);
  }

  return DEFAULT_LOCALE;
}

/**
 * Set locale cookie (client-side)
 */
export function setLocaleCookie(locale: Locale) {
  if (typeof document === 'undefined') return;

  // Use maxAge (in seconds) for better compatibility
  // 1 year = 365 * 24 * 60 * 60 seconds
  const maxAge = 365 * 24 * 60 * 60;
  
  // Set cookie with path, maxAge, and SameSite
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
  
  // Also set it in localStorage as backup (for client-side reading)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCALE_COOKIE_NAME, locale);
    } catch (e) {
      // Ignore localStorage errors (e.g., in private browsing)
    }
  }
}

