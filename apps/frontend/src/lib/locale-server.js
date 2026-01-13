"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLocale = detectLocale;
const headers_1 = require("next/headers");
const locale_1 = require("./locale");
/**
 * Server-side locale detection from cookies only (no Accept-Language fallback)
 * This ensures consistent behavior: users must explicitly choose their language
 * The middleware sets a default cookie if none exists, so this will always have a value
 * This function must be called from a server component or API route
 */
function detectLocale() {
    try {
        // Only read from cookie - don't use Accept-Language header
        // This ensures consistent behavior: users must explicitly choose their language
        // The middleware sets a default cookie if none exists, so this should always work
        const cookieStore = (0, headers_1.cookies)();
        const localeCookie = cookieStore.get(locale_1.LOCALE_COOKIE_NAME);
        // Always log in development for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Locale] Cookie detection:`, {
                exists: !!localeCookie,
                rawValue: localeCookie?.value,
                cookieName: locale_1.LOCALE_COOKIE_NAME,
            });
        }
        if (localeCookie?.value) {
            // Normalize the cookie value (trim and lowercase)
            const value = localeCookie.value.trim().toLowerCase();
            if (value === 'ru' || value === 'uz') {
                // Log detected locale for debugging (only in development)
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Locale] ✅ Detected locale from cookie: ${value} (raw: "${localeCookie.value}")`);
                }
                return value;
            }
            // Log unexpected cookie values for debugging (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[Locale] ⚠️ Invalid cookie value: "${localeCookie.value}" (normalized: "${value}")`);
            }
        }
        else {
            // Log missing cookie for debugging (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.warn(`[Locale] ⚠️ No locale cookie found, using default: ${locale_1.DEFAULT_LOCALE}`);
            }
        }
        // Always default to Uzbek if no valid cookie is set
        // This ensures consistent behavior: users see Uzbek by default and must explicitly switch to Russian
        // The middleware should set a default cookie, but if it doesn't, we default here
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Locale] Returning default locale: ${locale_1.DEFAULT_LOCALE}`);
        }
        return locale_1.DEFAULT_LOCALE;
    }
    catch (error) {
        // If anything fails, return default locale
        // In development, log the error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('[Locale] ❌ Error detecting locale:', error);
            if (error instanceof Error) {
                console.error('[Locale] Error details:', error.message, error.stack);
            }
        }
        return locale_1.DEFAULT_LOCALE;
    }
}
//# sourceMappingURL=locale-server.js.map