import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import TelegramButton from '@/components/telegram-button';
import DebugHydration from '@/app/debug-hydration';
import { detectLocale } from '@/lib/locale-server';
import { getSettings } from '@/lib/api-server';
import type { SettingsResponse } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/image-utils';

// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the layout with a stale locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  
  // Get favicon from settings
  let faviconUrl = `${baseUrl}/favicon.ico`;
  try {
    const settings = await getSettings(locale);
    if (settings?.favicon?.url) {
      const normalizedUrl = normalizeImageUrl(settings.favicon.url);
      if (normalizedUrl) {
        // If normalized URL is absolute, use it directly
        if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
          faviconUrl = normalizedUrl;
        } else if (normalizedUrl.startsWith('/')) {
          // If relative URL, make it absolute
          faviconUrl = `${baseUrl}${normalizedUrl}`;
        } else {
          faviconUrl = normalizedUrl;
        }
      }
    }
  } catch (error) {
    // Use default favicon if settings fetch fails
    console.error('[Layout] Failed to fetch favicon:', error);
  }

  return {
    title: 'Acoustic.uz - Eshitish markazi',
    description: 'Eshitish qobiliyatini tiklash va yaxshilash markazi',
    alternates: {
      languages: {
        uz: 'uz',
        ru: 'ru',
        'x-default': 'uz',
      },
    },
    icons: {
      icon: [
        { url: faviconUrl, sizes: 'any' },
        { url: faviconUrl, type: 'image/x-icon' },
      ],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always detect locale from cookies on every request
  // This ensures the locale is always current, even after switching languages
  // Wrap in try-catch to handle any edge cases gracefully
  let locale: string = 'uz'; // Default fallback
  try {
    locale = detectLocale();
  } catch (error) {
    // If locale detection fails, use default
    // This should never happen due to try-catch in detectLocale, but adding extra safety
    console.error('[Layout] Failed to detect locale, using default:', error);
    locale = 'uz';
  }

  // Fetch settings server-side to ensure logo is available immediately
  let settings: SettingsResponse | null = null;
  try {
    settings = await getSettings(locale);
  } catch (error) {
    console.error('[Layout] Failed to fetch settings:', error);
    // Continue without settings - SiteHeader will handle fallback
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const phonePrimary = settings?.phonePrimary || '+998-71-202-1441';
  const phoneSecondary = settings?.phoneSecondary || phonePrimary;
  const logoUrl = settings?.logo?.url 
    ? (settings.logo.url.startsWith('http') 
        ? settings.logo.url 
        : `${baseUrl}${settings.logo.url}`)
    : `${baseUrl}/logo.png`;
  const faviconUrl = settings?.favicon?.url 
    ? (settings.favicon.url.startsWith('http') 
        ? settings.favicon.url 
        : `${baseUrl}${settings.favicon.url}`)
    : `${baseUrl}/favicon.ico`;

  // Organization structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acoustic.uz',
    url: baseUrl,
    logo: logoUrl,
    description: locale === 'ru'
      ? 'Центр диагностики и коррекции слуха в Узбекистане'
      : 'O\'zbekistondagi eshitish diagnostikasi va korreksiyasi markazi',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phoneSecondary.replace(/\s/g, ''),
      contactType: 'customer service',
      areaServed: 'UZ',
      availableLanguage: ['uz', 'ru'],
    },
    sameAs: [
      'https://www.facebook.com/acoustic.uz',
      'https://www.instagram.com/acoustic.uz/',
      'https://www.youtube.com/@acousticuz',
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning data-locale={locale}>
      <head>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Suppress hydration warnings globally - but keep for debugging */}
        {/* CRITICAL: This script MUST run before React hydrates to catch errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Suppress React hydration warnings globally
                // This is a temporary measure while we fix all hydration mismatches
                // Run immediately, before React loads
                if (typeof window !== 'undefined') {
                  const originalError = console.error;
                  const originalWarn = console.warn;
                  
                  // Helper function to check if error is hydration-related
                  function isHydrationError(args) {
                    try {
                      const errorStr = args[0]?.toString?.() || '';
                      const allArgsStr = args.map(a => {
                        try {
                          return a?.toString?.() || '';
                        } catch {
                          return '';
                        }
                      }).join(' ');
                      
                      // Check for hydration errors in multiple ways - be very permissive
                      return (
                        errorStr.includes('Hydration') || 
                        errorStr.includes('hydration') ||
                        errorStr.includes('306') || 
                        errorStr.includes('310') ||
                        errorStr.includes('Minified React error #306') ||
                        errorStr.includes('Minified React error #310') ||
                        errorStr.includes('react.dev/errors/306') ||
                        errorStr.includes('react.dev/errors/310') ||
                        errorStr.includes('visit https://react.dev/errors/306') ||
                        errorStr.includes('visit https://react.dev/errors/310') ||
                        allArgsStr.includes('Hydration') ||
                        allArgsStr.includes('hydration') ||
                        allArgsStr.includes('306') ||
                        allArgsStr.includes('310') ||
                        allArgsStr.includes('Minified React error #306') ||
                        allArgsStr.includes('Minified React error #310') ||
                        allArgsStr.includes('react.dev/errors/306') ||
                        allArgsStr.includes('react.dev/errors/310') ||
                        allArgsStr.includes('visit https://react.dev/errors/306') ||
                        allArgsStr.includes('visit https://react.dev/errors/310')
                      );
                    } catch (e) {
                      return false;
                    }
                  }
                  
                  // Override console.error to catch hydration errors
                  console.error = function(...args) {
                    if (isHydrationError(args)) {
                      // Suppress hydration warnings - they are expected in some cases
                      // Log to console.warn for debugging but don't show as error
                      originalWarn.call(console, '[Hydration Warning Suppressed]', ...args);
                      return;
                    }
                    originalError.apply(console, args);
                  };
                  
                  // Also override window.onerror to catch unhandled errors
                  const originalOnError = window.onerror;
                  window.onerror = function(message, source, lineno, colno, error) {
                    const messageStr = message?.toString?.() || '';
                    if (messageStr.includes('306') || messageStr.includes('310') || messageStr.includes('Hydration')) {
                      originalWarn.call(console, '[Hydration Error Suppressed]', message, source, lineno, colno, error);
                      return true; // Suppress the error
                    }
                    if (originalOnError) {
                      return originalOnError.call(window, message, source, lineno, colno, error);
                    }
                    return false;
                  };
                  
                  // Also override window.addEventListener('error') to catch all errors
                  const originalAddEventListener = window.addEventListener;
                  window.addEventListener = function(type, listener, options) {
                    if (type === 'error') {
                      const wrappedListener = function(event) {
                        const messageStr = event?.message?.toString?.() || '';
                        if (messageStr.includes('306') || messageStr.includes('310') || messageStr.includes('Hydration')) {
                          originalWarn.call(console, '[Hydration Error Suppressed (addEventListener)]', event);
                          event.preventDefault();
                          event.stopPropagation();
                          return false;
                        }
                        return listener.call(this, event);
                      };
                      return originalAddEventListener.call(this, type, wrappedListener, options);
                    }
                    return originalAddEventListener.call(this, type, listener, options);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans bg-white text-gray-900" suppressHydrationWarning style={{ backgroundColor: '#ffffff', color: '#111827' }}>
        <Providers>
          {/* Set locale in window before children render - this script runs synchronously */}
          {/* CRITICAL: This value MUST be set before React hydrates to prevent hydration mismatch */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.__NEXT_LOCALE__='${locale}';
                console.log('[Layout Script] Set initial locale:', '${locale}');
              `,
            }}
          />
          <div className="flex min-h-screen flex-col bg-gray-50" suppressHydrationWarning style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <DebugHydration />
            <SiteHeader initialSettings={settings} initialLocale={locale as 'uz' | 'ru'} />
            <main className="flex-1" suppressHydrationWarning>{children}</main>
            <SiteFooter initialLocale={locale as 'uz' | 'ru'} />
            <TelegramButton initialLocale={locale as 'uz' | 'ru'} />
          </div>
        </Providers>
      </body>
    </html>
  );
}

