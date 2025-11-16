import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from '@/lib/locale';

export async function GET(request: NextRequest) {
  // Get redirect path from query param or default to homepage
  const redirectPath = request.nextUrl.searchParams.get('redirect') || '/';
  let redirectUrl: URL;
  
  try {
    // Parse redirect path - handle both relative and absolute URLs
    if (redirectPath.startsWith('http://') || redirectPath.startsWith('https://')) {
      redirectUrl = new URL(redirectPath);
      // Ensure it's from the same origin for security
      if (redirectUrl.origin !== request.nextUrl.origin) {
        redirectUrl = new URL('/', request.nextUrl.origin);
      }
    } else {
      // For relative URLs, create a new URL with the origin
      redirectUrl = new URL(redirectPath, request.nextUrl.origin);
    }
  } catch (error) {
    // If URL parsing fails, default to homepage
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Locale Route /uz] Failed to parse redirect path: ${redirectPath}`, error);
    }
    redirectUrl = new URL('/', request.nextUrl.origin);
  }
  
  // Calculate expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + LOCALE_COOKIE_MAX_AGE * 1000);
  
  // Create redirect response (use 307 to preserve method)
  const response = NextResponse.redirect(redirectUrl, { status: 307 });
  
  // Set locale cookie to 'uz' BEFORE redirect
  // This ensures the cookie is available on the next request
  response.cookies.set(LOCALE_COOKIE_NAME, 'uz', {
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
    console.log(`[Locale Route /uz] ✅ Setting cookie ${LOCALE_COOKIE_NAME}=uz`);
    console.log(`[Locale Route /uz] Redirecting to: ${redirectUrl.toString()}`);
  }
  
  return response;
}

