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
  let faviconUrl = '/favicon.ico';
  try {
    const settings = await getSettings(locale);
    if (settings?.favicon?.url) {
      faviconUrl = normalizeImageUrl(settings.favicon.url) || '/favicon.ico';
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
      icon: faviconUrl,
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
      </head>
      <body className="font-sans" suppressHydrationWarning>
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
          <div className="flex min-h-screen flex-col bg-muted/20" suppressHydrationWarning>
            <DebugHydration />
            <SiteHeader initialSettings={settings} />
            <main className="flex-1" suppressHydrationWarning>{children}</main>
            <SiteFooter />
            <TelegramButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}

