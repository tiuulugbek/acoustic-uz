import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { detectLocale } from '@/lib/locale-server';

// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the layout with a stale locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Acoustic.uz - Eshitish markazi',
  description: 'Eshitish qobiliyatini tiklash va yaxshilash markazi',
  alternates: {
    languages: {
      uz: 'uz',
      ru: 'ru',
      'x-default': 'uz',
    },
  },
};

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

  return (
    <html lang={locale} suppressHydrationWarning data-locale={locale}>
      <body className="font-sans">
        <Providers>
          {/* Set locale in window before children render - this script runs synchronously */}
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__NEXT_LOCALE__='${locale}';`,
            }}
          />
          <div className="flex min-h-screen flex-col bg-muted/20">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

