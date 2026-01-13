import { type Locale } from './locale';
/**
 * Get locale from window (injected by server) or cookie (client-side)
 * This function prioritizes the server-set value for consistency
 */
export declare function getLocaleFromCookie(): Locale;
/**
 * Get locale from DOM (available on client)
 * ALWAYS prioritizes DOM attributes over cookies to prevent reverting to stale values
 */
export declare function getLocaleFromDOM(): Locale;
/**
 * Set locale cookie (client-side)
 */
export declare function setLocaleCookie(locale: Locale): void;
//# sourceMappingURL=locale-client.d.ts.map