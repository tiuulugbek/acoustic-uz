import { type Locale } from './locale';
/**
 * Server-side locale detection from cookies only (no Accept-Language fallback)
 * This ensures consistent behavior: users must explicitly choose their language
 * The middleware sets a default cookie if none exists, so this will always have a value
 * This function must be called from a server component or API route
 */
export declare function detectLocale(): Locale;
//# sourceMappingURL=locale-server.d.ts.map