import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
/**
 * Next.js middleware to prevent caching for locale-dependent pages
 * This runs on every request before the page is rendered
 *
 * Note: The API route handles setting cookies when locale changes.
 * This middleware ensures:
 * 1. Caching is disabled so pages are always fresh
 * 2. A default locale cookie is set if none exists (to ensure consistent behavior)
 */
export declare function middleware(request: NextRequest): NextResponse<unknown>;
export declare const config: {
    matcher: string[];
};
//# sourceMappingURL=middleware.d.ts.map