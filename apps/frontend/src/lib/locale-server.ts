import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale } from './locale';

/**
 * Server-side locale detection from cookies only (no Accept-Language fallback)
 * This ensures consistent behavior: users must explicitly choose their language
 * The middleware sets a default cookie if none exists, so this will always have a value
 * This function must be called from a server component or API route
 */
export function detectLocale(): Locale {
  try {
    // Only read from cookie - don't use Accept-Language header
    // This ensures consistent behavior: users must explicitly choose their language
    // The middleware sets a default cookie if none exists, so this should always work
    const cookieStore = cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME);

    if (localeCookie?.value) {
      // Normalize the cookie value (trim and lowercase)
      const value = localeCookie.value.trim().toLowerCase();
      if (value === 'ru' || value === 'uz') {
        // Log detected locale for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Locale] Detected locale from cookie: ${value} (raw: "${localeCookie.value}")`);
        }
        return value as Locale;
      }
      // Log unexpected cookie values for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Locale] Invalid cookie value: "${localeCookie.value}" (normalized: "${value}")`);
      }
    } else {
      // Log missing cookie for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Locale] No locale cookie found, using default: ${DEFAULT_LOCALE}`);
      }
    }

    // Always default to Uzbek if no valid cookie is set
    // This ensures consistent behavior: users see Uzbek by default and must explicitly switch to Russian
    // The middleware should set a default cookie, but if it doesn't, we default here
    return DEFAULT_LOCALE;
  } catch (error) {
    // If anything fails, return default locale
    // In development, log the error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[Locale] Error detecting locale:', error);
      if (error instanceof Error) {
        console.error('[Locale] Error details:', error.message, error.stack);
      }
    }
    return DEFAULT_LOCALE;
  }
}

