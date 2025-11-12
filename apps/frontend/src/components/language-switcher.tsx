'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type Locale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from '@/lib/locale';

// Helper to get locale from DOM (available on client)
function getLocaleFromDOM(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Read from HTML data attribute first (set by server)
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  // Fallback to window.__NEXT_LOCALE__ (set by script)
  if (typeof window !== 'undefined' && (window as any).__NEXT_LOCALE__) {
    const locale = (window as any).__NEXT_LOCALE__;
    if (locale === 'ru' || locale === 'uz') {
      return locale as Locale;
    }
  }
  
  // Fallback to cookie
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find((cookie) => cookie.trim().startsWith(`${LOCALE_COOKIE_NAME}=`));
    if (localeCookie) {
      const value = localeCookie.split('=')[1]?.trim();
      if (value === 'ru' || value === 'uz') {
        return value as Locale;
      }
    }
  }
  
  return DEFAULT_LOCALE;
}

// Simple function to change language using API route
function changeLanguage(newLocale: Locale, currentPath: string, queryString: string) {
  // Build the current URL with query params
  const currentUrl = `${currentPath}${queryString ? `?${queryString}` : ''}`;
  
  // Use API route to set cookie server-side and redirect
  // This is the most reliable method as the cookie is set on the server
  const apiUrl = `/api/locale?locale=${newLocale}&redirect=${encodeURIComponent(currentUrl)}`;
  
  // Navigate to API route - it will set cookie and redirect back
  window.location.href = apiUrl;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize with DEFAULT_LOCALE to match server render during SSR
  const [currentLocale, setCurrentLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // After mount, read actual locale from DOM
  useEffect(() => {
    setIsHydrated(true);
    const locale = getLocaleFromDOM();
    setCurrentLocale(locale);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    // Preserve current path and query params
    const currentPath = pathname || '/';
    const queryString = searchParams?.toString() || '';
    
    // Change language (sets cookie and reloads)
    changeLanguage(newLocale, currentPath, queryString);
  };

  // During SSR and initial client render, use DEFAULT_LOCALE
  // After hydration, use currentLocale from DOM
  const displayLocale = isHydrated ? currentLocale : DEFAULT_LOCALE;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleLocaleChange('uz')}
        className={`px-2 py-1 text-sm font-semibold transition ${
          displayLocale === 'uz'
            ? 'text-brand-primary underline'
            : 'text-muted-foreground hover:text-brand-primary'
        }`}
        suppressHydrationWarning
      >
        uz
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        type="button"
        onClick={() => handleLocaleChange('ru')}
        className={`px-2 py-1 text-sm font-semibold transition ${
          displayLocale === 'ru'
            ? 'text-brand-primary underline'
            : 'text-muted-foreground hover:text-brand-primary'
        }`}
        suppressHydrationWarning
      >
        ru
      </button>
    </div>
  );
}

// Mobile version for header - same simple design
export function LanguageSwitcherMobile() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize with DEFAULT_LOCALE to match server render during SSR
  const [currentLocale, setCurrentLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // After mount, read actual locale from DOM
  useEffect(() => {
    setIsHydrated(true);
    const locale = getLocaleFromDOM();
    setCurrentLocale(locale);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    // Preserve current path and query params
    const currentPath = pathname || '/';
    const queryString = searchParams?.toString() || '';
    
    // Change language (sets cookie and reloads)
    changeLanguage(newLocale, currentPath, queryString);
  };

  // During SSR and initial client render, use DEFAULT_LOCALE
  // After hydration, use currentLocale from DOM
  const displayLocale = isHydrated ? currentLocale : DEFAULT_LOCALE;

  return (
    <div className="flex items-center gap-1 text-white">
      <button
        type="button"
        onClick={() => handleLocaleChange('uz')}
        className={`px-2 py-1 text-sm font-semibold transition ${
          displayLocale === 'uz'
            ? 'text-white underline'
            : 'text-white/70 hover:text-white'
        }`}
        suppressHydrationWarning
      >
        uz
      </button>
      <span className="text-white/50">|</span>
      <button
        type="button"
        onClick={() => handleLocaleChange('ru')}
        className={`px-2 py-1 text-sm font-semibold transition ${
          displayLocale === 'ru'
            ? 'text-white underline'
            : 'text-white/70 hover:text-white'
        }`}
        suppressHydrationWarning
      >
        ru
      </button>
    </div>
  );
}
