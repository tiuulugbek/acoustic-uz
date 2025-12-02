'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { type Locale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';

// Helper to get locale from DOM (available on client)
// This should match exactly with server-side detection
function getLocaleFromDOM(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Priority 1: Read from HTML data-locale attribute (set by server, most reliable)
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  // Priority 2: Read from window.__NEXT_LOCALE__ (set by inline script before React)
  if (typeof window !== 'undefined' && (window as any).__NEXT_LOCALE__) {
    const locale = (window as any).__NEXT_LOCALE__;
    if (locale === 'ru' || locale === 'uz') {
      return locale as Locale;
    }
  }
  
  // Priority 3: Read from cookie (fallback)
  return getLocaleFromCookie();
}

// Function to change language
// Uses API route to set cookie server-side, then redirects to ensure page content updates
function changeLanguage(
  newLocale: Locale,
  currentPath: string,
  queryString: string,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>
) {
  // Set cookie client-side immediately for instant UI feedback (header/footer)
  if (typeof document !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    
    // Update data-locale attribute immediately for instant UI feedback
    document.documentElement.setAttribute('data-locale', newLocale);
  }
  
  // Only invalidate locale-specific queries, not all caches
  // This preserves non-locale-dependent data and improves performance
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey;
      // Invalidate queries that depend on locale
      return Array.isArray(key) && (
        key.includes('menu') ||
        key.includes('catalogs') ||
        key.includes('services') ||
        key.includes('products') ||
        key.includes('branches') ||
        key.includes('doctors') ||
        key.includes('settings') ||
        key.includes('faq')
      );
    }
  });
  
  // Use API route to set cookie server-side and redirect
  // This ensures page content (server-side rendered) updates correctly
  // Build the current URL with query params
  const currentUrl = `${currentPath}${queryString ? `?${queryString}` : ''}`;
  const apiUrl = `/api/locale?locale=${newLocale}&redirect=${encodeURIComponent(currentUrl)}`;
  
  // Navigate to API route - it will set cookie server-side and redirect back
  // This ensures both client-side (header/footer) and server-side (page content) update
  if (typeof window !== 'undefined') {
    window.location.href = apiUrl;
  }
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // CRITICAL: Read initial locale synchronously from DOM to match server render
  // This prevents hydration mismatches
  const getInitialLocale = (): Locale => {
    if (typeof document === 'undefined') return DEFAULT_LOCALE;
    return getLocaleFromDOM();
  };
  
  const [currentLocale, setCurrentLocale] = useState<Locale>(getInitialLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // After mount, read actual locale from DOM and update if changed
  useEffect(() => {
    setIsHydrated(true);
    const locale = getLocaleFromDOM();
    if (locale !== currentLocale) {
      setCurrentLocale(locale);
    }
  }, [currentLocale]);

  // Watch for locale changes in DOM (e.g., after page reload with new locale)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const checkLocale = () => {
      const domLocale = getLocaleFromDOM();
      if (domLocale !== currentLocale) {
        console.log('[LanguageSwitcher] 🔄 Locale changed in DOM:', currentLocale, '->', domLocale);
        setCurrentLocale(domLocale);
      }
    };
    
    // Check immediately
    checkLocale();
    
    // Watch for changes to data-locale attribute
    const observer = new MutationObserver(checkLocale);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-locale'],
    });
    
    // Also check periodically as fallback
    const interval = setInterval(checkLocale, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [currentLocale]);

  const handleLocaleChange = useCallback((newLocale: Locale) => {
    if (newLocale === currentLocale) {
      console.log('[LanguageSwitcher] Already on locale:', newLocale);
      return;
    }
    
    console.log('[LanguageSwitcher] 🚀 Changing locale from', currentLocale, 'to', newLocale);
    
    // Preserve current path and query params
    const currentPath = pathname || '/';
    const queryString = searchParams?.toString() || '';
    
    // Change language (optimized: uses client-side cookie and router.refresh())
    changeLanguage(newLocale, currentPath, queryString, queryClient, router);
  }, [currentLocale, pathname, searchParams, queryClient, router]);

  // During SSR and initial client render, use initial locale from DOM
  // After hydration, use currentLocale state
  const displayLocale = isHydrated ? currentLocale : getInitialLocale();

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
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // CRITICAL: Read initial locale synchronously from DOM to match server render
  const getInitialLocale = (): Locale => {
    if (typeof document === 'undefined') return DEFAULT_LOCALE;
    return getLocaleFromDOM();
  };
  
  const [currentLocale, setCurrentLocale] = useState<Locale>(getInitialLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // After mount, read actual locale from DOM and update if changed
  useEffect(() => {
    setIsHydrated(true);
    const locale = getLocaleFromDOM();
    if (locale !== currentLocale) {
      setCurrentLocale(locale);
    }
  }, [currentLocale]);

  // Watch for locale changes in DOM (e.g., after page reload with new locale)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const checkLocale = () => {
      const domLocale = getLocaleFromDOM();
      if (domLocale !== currentLocale) {
        setCurrentLocale(domLocale);
      }
    };
    
    // Check immediately
    checkLocale();
    
    // Watch for changes to data-locale attribute
    const observer = new MutationObserver(checkLocale);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-locale'],
    });
    
    // Also check periodically as fallback
    const interval = setInterval(checkLocale, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [currentLocale]);

  const handleLocaleChange = useCallback((newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    // Preserve current path and query params
    const currentPath = pathname || '/';
    const queryString = searchParams?.toString() || '';
    
    // Change language (optimized: uses client-side cookie and router.refresh())
    changeLanguage(newLocale, currentPath, queryString, queryClient, router);
  }, [currentLocale, pathname, searchParams, queryClient, router]);

  // During SSR and initial client render, use initial locale from DOM
  // After hydration, use currentLocale state
  const displayLocale = isHydrated ? currentLocale : getInitialLocale();

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
