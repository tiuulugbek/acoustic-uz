import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE } from './lib/locale';

/**
 * Next.js middleware to prevent caching for locale-dependent pages
 * This runs on every request before the page is rendered
 * 
 * Note: The API route handles setting cookies when locale changes.
 * This middleware ensures:
 * 1. Caching is disabled so pages are always fresh
 * 2. A default locale cookie is set if none exists (to ensure consistent behavior)
 */
export function middleware(request: NextRequest) {
  // Skip API routes - they handle their own caching and cookie setting
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Create response
  const response = NextResponse.next();

  // Always prevent caching for locale-dependent pages to ensure fresh content
  // This is critical: when locale changes via API route, we need a fresh render
  // to ensure the server reads the new cookie and renders with the correct locale
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // If no locale cookie exists, set a default one to ensure consistent behavior
  // This prevents the locale from changing based on browser settings or other factors
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME);
  if (!localeCookie || !localeCookie.value) {
    // Set default locale cookie (Uzbek) if none exists
    // This ensures users always see a consistent default language
    response.cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LOCALE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // Allow client-side reading
      secure: process.env.NODE_ENV === 'production', // Secure in production
    });
  } else {
    // Validate and normalize existing cookie value
    const value = localeCookie.value.trim().toLowerCase();
    if (value !== 'ru' && value !== 'uz') {
      // Invalid cookie value - set to default
      response.cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LOCALE, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
    }
  }

  return response;
}

// Configure which routes this middleware should run on
export const config = {
  // Run middleware on all routes except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handle their own caching)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
