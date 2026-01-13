import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from '@/lib/locale';

export async function GET(request: NextRequest) {
  // Get the actual hostname from Host header (not from nextUrl.origin which might be 0.0.0.0:3000)
  const hostHeader = request.headers.get('host') || request.headers.get('x-forwarded-host');
  const protocol = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol === 'https:' ? 'https' : 'http');
  const baseUrl = `${protocol}://${hostHeader || 'localhost:3000'}`;
  
  // Get redirect path from query param or default to homepage
  const redirectPath = request.nextUrl.searchParams.get('redirect') || '/';
  let redirectUrl: URL;
  
  try {
    // Parse redirect path - handle both relative and absolute URLs
    if (redirectPath.startsWith('http://') || redirectPath.startsWith('https://')) {
      redirectUrl = new URL(redirectPath);
      // Ensure it's from the same origin for security
      const redirectOrigin = redirectUrl.origin;
      const baseOrigin = new URL(baseUrl).origin;
      if (redirectOrigin !== baseOrigin) {
        redirectUrl = new URL('/', baseUrl);
      }
    } else {
      // For relative URLs, create a new URL with the baseUrl (not nextUrl.origin)
      redirectUrl = new URL(redirectPath, baseUrl);
    }
  } catch (error) {
    // If URL parsing fails, default to homepage
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Locale Route /ru] Failed to parse redirect path: ${redirectPath}`, error);
    }
    redirectUrl = new URL('/', baseUrl);
  }
  
  // Calculate expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + LOCALE_COOKIE_MAX_AGE * 1000);
  
  // Create redirect response (use 307 to preserve method)
  const response = NextResponse.redirect(redirectUrl, { status: 307 });
  
  // Set locale cookie to 'ru' BEFORE redirect
  // This ensures the cookie is available on the next request
  response.cookies.set(LOCALE_COOKIE_NAME, 'ru', {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    expires: expires,
    sameSite: 'lax',
    httpOnly: false, // Allow client-side reading
    secure: process.env.NODE_ENV === 'production', // Secure in production (HTTPS only)
  });
  
  // Set cache-control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Locale Route /ru] ✅ Setting cookie ${LOCALE_COOKIE_NAME}=ru`);
    console.log(`[Locale Route /ru] Base URL: ${baseUrl}`);
    console.log(`[Locale Route /ru] Redirecting to: ${redirectUrl.toString()}`);
  }
  
  return response;
}

