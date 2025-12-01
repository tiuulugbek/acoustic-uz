import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE, type Locale } from '@/lib/locale';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const locale = body.locale as Locale;

    // Validate locale
    if (locale !== 'uz' && locale !== 'ru') {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Locale API] Invalid locale in POST: ${locale}`);
      }
      return NextResponse.json({ error: 'Invalid locale. Must be "uz" or "ru".' }, { status: 400 });
    }

    // Get the actual hostname from Host header (not from nextUrl.origin which might be 0.0.0.0:3000)
    const hostHeader = request.headers.get('host') || request.headers.get('x-forwarded-host');
    const protocol = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol === 'https:' ? 'https' : 'http');
    const baseUrl = `${protocol}://${hostHeader || 'localhost:3000'}`;

    // Get the referer or origin to redirect back to the same page
    const referer = request.headers.get('referer');
    let redirectUrl: URL;
    
    if (referer) {
      try {
        redirectUrl = new URL(referer);
        // Ensure referer is from the same origin for security
        const refererOrigin = redirectUrl.origin;
        const baseOrigin = new URL(baseUrl).origin;
        if (refererOrigin !== baseOrigin) {
          redirectUrl = new URL('/', baseUrl);
        }
      } catch {
        redirectUrl = new URL('/', baseUrl);
      }
    } else {
      redirectUrl = new URL('/', baseUrl);
    }

    // Calculate expiration date
    const expires = new Date();
    expires.setTime(expires.getTime() + LOCALE_COOKIE_MAX_AGE * 1000);

    // Create response with redirect (use 307 to preserve method)
    const response = NextResponse.redirect(redirectUrl, { status: 307 });

    // Set locale cookie with proper attributes
    // Use both maxAge and expires for maximum compatibility
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
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
    
    // Log cookie setting for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Locale API] ✅ Setting cookie ${LOCALE_COOKIE_NAME}=${locale} (POST)`);
      console.log(`[Locale API] Redirecting to: ${redirectUrl.toString()}`);
    }

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Locale API] Error in POST handler:', error);
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  // Support GET requests with ?locale=uz or ?locale=ru&redirect=/path
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') as Locale;
  const redirectTo = searchParams.get('redirect');

  // Validate locale
  if (locale !== 'uz' && locale !== 'ru') {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Locale API] Invalid locale: ${locale}`);
    }
    return NextResponse.json({ error: 'Invalid locale. Must be "uz" or "ru".' }, { status: 400 });
  }

  // Get the actual hostname from Host header (not from nextUrl.origin which might be 0.0.0.0:3000)
  const hostHeader = request.headers.get('host') || request.headers.get('x-forwarded-host');
  const protocol = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol === 'https:' ? 'https' : 'http');
  const baseUrl = `${protocol}://${hostHeader || 'localhost:3000'}`;

  // Get redirect URL from query param, referer, or default to homepage
  let redirectUrl: URL;
  if (redirectTo) {
    try {
      // Decode the redirect URL (it's encoded when passed as query param)
      const decodedRedirect = decodeURIComponent(redirectTo);
      
      // If redirectTo is a full URL, use it directly; otherwise, make it relative to baseUrl
      if (decodedRedirect.startsWith('http://') || decodedRedirect.startsWith('https://')) {
        redirectUrl = new URL(decodedRedirect);
        // Ensure it's from the same origin for security
        const redirectOrigin = redirectUrl.origin;
        const baseOrigin = new URL(baseUrl).origin;
        if (redirectOrigin !== baseOrigin) {
          redirectUrl = new URL('/', baseUrl);
        }
      } else {
        // For relative URLs, create a new URL with the baseUrl
        // This handles paths with query parameters correctly
        redirectUrl = new URL(decodedRedirect, baseUrl);
      }
    } catch (error) {
      // If URL parsing fails, default to homepage
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Locale API] Failed to parse redirect URL: ${redirectTo}`, error);
      }
      redirectUrl = new URL('/', baseUrl);
    }
  } else {
    // Fallback to referer if no redirect parameter
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        redirectUrl = new URL(referer);
        // Ensure referer is from the same origin for security
        const refererOrigin = redirectUrl.origin;
        const baseOrigin = new URL(baseUrl).origin;
        if (refererOrigin !== baseOrigin) {
          redirectUrl = new URL('/', baseUrl);
        }
      } catch {
        redirectUrl = new URL('/', baseUrl);
      }
    } else {
      redirectUrl = new URL('/', baseUrl);
    }
  }

  // Calculate expiration date
  const expires = new Date();
  expires.setTime(expires.getTime() + LOCALE_COOKIE_MAX_AGE * 1000);

  // Create response with redirect (use 307 to preserve method)
  // IMPORTANT: Create response first, then set cookie on it
  const response = NextResponse.redirect(redirectUrl, { status: 307 });

  // Set locale cookie with proper attributes
  // Use both maxAge and expires for maximum compatibility
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    expires: expires,
    sameSite: 'lax',
    httpOnly: false, // Allow client-side reading
    secure: process.env.NODE_ENV === 'production', // Secure in production (HTTPS only)
  });

  // Set cache-control headers to prevent caching of the redirect
  // This ensures the redirect is always fresh and the cookie is properly set
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  // Log cookie setting for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Locale API] ✅ Setting cookie ${LOCALE_COOKIE_NAME}=${locale}`);
    console.log(`[Locale API] Redirecting to: ${redirectUrl.toString()}`);
    console.log(`[Locale API] Cookie will expire at: ${expires.toISOString()}`);
  }

  return response;
}

