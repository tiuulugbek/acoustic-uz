import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from '@/lib/locale';

export async function GET(request: NextRequest) {
  // Redirect to homepage
  const url = new URL('/', request.url);
  const response = NextResponse.redirect(url);
  
  // Set locale cookie to 'ru'
  response.cookies.set(LOCALE_COOKIE_NAME, 'ru', {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    httpOnly: false, // Allow client-side reading
  });
  
  return response;
}

