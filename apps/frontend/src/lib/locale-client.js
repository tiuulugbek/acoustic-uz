"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocaleFromCookie = getLocaleFromCookie;
exports.getLocaleFromDOM = getLocaleFromDOM;
exports.setLocaleCookie = setLocaleCookie;
const locale_1 = require("./locale");
/**
 * Get locale from window (injected by server) or cookie (client-side)
 * This function prioritizes the server-set value for consistency
 */
function getLocaleFromCookie() {
    // First, try to read from window (set by server during SSR)
    // This is the most reliable source as it matches server render
    if (typeof window !== 'undefined' && window.__NEXT_LOCALE__) {
        const locale = window.__NEXT_LOCALE__;
        if (locale === 'ru' || locale === 'uz') {
            return locale;
        }
    }
    // Fallback to reading from cookie
    if (typeof document === 'undefined')
        return locale_1.DEFAULT_LOCALE;
    try {
        const cookies = document.cookie.split(';');
        const localeCookie = cookies.find((cookie) => cookie.trim().startsWith(`${locale_1.LOCALE_COOKIE_NAME}=`));
        if (localeCookie) {
            const value = localeCookie.split('=')[1]?.trim().toLowerCase();
            if (value === 'ru' || value === 'uz') {
                return value;
            }
        }
    }
    catch (error) {
        // If cookie reading fails, fall back to default
        console.error('Error reading locale cookie:', error);
    }
    return locale_1.DEFAULT_LOCALE;
}
/**
 * Get locale from DOM (available on client)
 * ALWAYS prioritizes DOM attributes over cookies to prevent reverting to stale values
 */
function getLocaleFromDOM() {
    if (typeof document === 'undefined')
        return locale_1.DEFAULT_LOCALE;
    // Priority 1: Read from HTML data attribute (set by server) - MOST RELIABLE
    // This is set in layout.tsx and reflects the actual server-detected locale
    const htmlLocale = document.documentElement.getAttribute('data-locale');
    if (htmlLocale === 'ru' || htmlLocale === 'uz') {
        return htmlLocale;
    }
    // Priority 2: Read from window.__NEXT_LOCALE__ (set by inline script before React)
    // This is set by the server and matches the data-locale attribute
    if (typeof window !== 'undefined' && window.__NEXT_LOCALE__) {
        const locale = window.__NEXT_LOCALE__;
        if (locale === 'ru' || locale === 'uz') {
            return locale;
        }
    }
    // Priority 3: Read from cookie ONLY as last resort
    // We don't trust cookies if DOM attributes are missing, as they might be stale
    // But we need a fallback for the initial render before server sets DOM attributes
    const cookieLocale = getLocaleFromCookie();
    if (cookieLocale && cookieLocale !== locale_1.DEFAULT_LOCALE) {
        return cookieLocale;
    }
    return locale_1.DEFAULT_LOCALE;
}
/**
 * Set locale cookie (client-side)
 */
function setLocaleCookie(locale) {
    if (typeof document === 'undefined')
        return;
    // Use maxAge (in seconds) for better compatibility
    // 1 year = 365 * 24 * 60 * 60 seconds
    const maxAge = 365 * 24 * 60 * 60;
    // Set cookie with path, maxAge, and SameSite
    document.cookie = `${locale_1.LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
    // Also set it in localStorage as backup (for client-side reading)
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(locale_1.LOCALE_COOKIE_NAME, locale);
        }
        catch (e) {
            // Ignore localStorage errors (e.g., in private browsing)
        }
    }
}
//# sourceMappingURL=locale-client.js.map