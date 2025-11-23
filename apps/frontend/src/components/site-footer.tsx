'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMenu, type MenuItemResponse, type MenuResponse } from '@/lib/api';
import { getLocaleFromDOM, getLocaleFromCookie, type Locale } from '@/lib/locale-client';
import { getBilingualText, DEFAULT_LOCALE } from '@/lib/locale';

// Helper to get locale from DOM (available on client)
function getLocaleFromDOMHelper(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Priority 1: Read from HTML data attribute (set by server) - MOST RELIABLE
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
  
  // Priority 3: Read from cookie ONLY as last resort
  const cookieLocale = getLocaleFromCookie();
  if (cookieLocale && cookieLocale !== DEFAULT_LOCALE) {
    return cookieLocale;
  }
  
  return DEFAULT_LOCALE;
}

export default function SiteFooter() {
  const queryClient = useQueryClient();
  
  // Get initial locale from DOM synchronously - this must match server render
  const getInitialLocale = (): Locale => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return DEFAULT_LOCALE; // SSR fallback
    }
    
    // Read from data-locale attribute (set by server) - this is the source of truth
    const htmlLocale = document.documentElement.getAttribute('data-locale');
    if (htmlLocale === 'ru' || htmlLocale === 'uz') {
      return htmlLocale as Locale;
    }
    
    // Fallback to window.__NEXT_LOCALE__ (set by inline script)
    if ((window as any).__NEXT_LOCALE__) {
      const windowLocale = (window as any).__NEXT_LOCALE__;
      if (windowLocale === 'ru' || windowLocale === 'uz') {
        return windowLocale as Locale;
      }
    }
    
    // Last resort: cookie
    return getLocaleFromCookie();
  };
  
  const [displayLocale, setDisplayLocale] = useState<Locale>(getInitialLocale);
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);
  
  // Track if we've successfully switched locale to prevent reverting
  const [localeChangeInProgress, setLocaleChangeInProgress] = useState(false);
  const consecutiveChecksRef = useRef<{ locale: Locale | null; count: number }>({ locale: null, count: 0 });
  
  // Watch for locale changes AFTER initial render (e.g., after language switch)
  useEffect(() => {
    const LOCALE_STABLE_CHECKS = 2; // Require 2 consecutive checks to confirm locale change
    
    const checkLocaleChange = () => {
      if (typeof document === 'undefined') return;
      
      const domLocale = getLocaleFromDOMHelper();
      
      // Only update if locale is actually different AND stable
      if (domLocale !== displayLocale) {
        // Track consecutive checks for the same new locale
        if (consecutiveChecksRef.current.locale === domLocale) {
          consecutiveChecksRef.current.count++;
        } else {
          // New locale detected, reset counter
          consecutiveChecksRef.current.locale = domLocale;
          consecutiveChecksRef.current.count = 1;
        }
        
        // Only update if we've seen the same new locale in multiple consecutive checks
        if (consecutiveChecksRef.current.count >= LOCALE_STABLE_CHECKS || localeChangeInProgress) {
          console.log('[SiteFooter] 🔄 Locale changed from', displayLocale, 'to', domLocale, '- updating footer');
          setLocaleChangeInProgress(true);
          setDisplayLocale(domLocale);
          // Force menu refresh with new locale
          setMenuRefreshKey(prev => prev + 1);
          // Remove ALL footer menu queries (including old locale caches)
          queryClient.removeQueries({ queryKey: ['menu', 'footer'] });
          // Small delay to ensure state update completes before refetch
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: ['menu', 'footer', domLocale] });
            setLocaleChangeInProgress(false);
          }, 50);
          // Reset counter after successful change
          consecutiveChecksRef.current.locale = null;
          consecutiveChecksRef.current.count = 0;
        }
      } else {
        // Locale matches, reset counter
        consecutiveChecksRef.current.locale = null;
        consecutiveChecksRef.current.count = 0;
      }
    };
    
    // Check immediately on mount to catch any locale changes
    checkLocaleChange();
    
    // Check again after a brief delay to catch any DOM updates
    const timeoutId = setTimeout(checkLocaleChange, 100);
    
    // Watch for changes to data-locale attribute (most reliable)
    const observer = new MutationObserver((mutations) => {
      const hasLocaleChange = mutations.some(m => 
        m.type === 'attributes' && 
        m.attributeName === 'data-locale' &&
        (m.target as HTMLElement).getAttribute('data-locale') !== displayLocale
      );
      
      if (hasLocaleChange) {
        const newLocale = getLocaleFromDOMHelper();
        consecutiveChecksRef.current.locale = newLocale;
        consecutiveChecksRef.current.count = LOCALE_STABLE_CHECKS; // Trust DOM mutations immediately
        checkLocaleChange();
      }
    });
    
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-locale'],
      });
    }
    
    // Check periodically but less frequently
    const intervalId = setInterval(checkLocaleChange, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [displayLocale, queryClient, localeChangeInProgress]);

  // Fetch footer menu from backend
  const { data: footerMenu, isLoading: isLoadingFooterMenu } = useQuery<MenuResponse>({
    queryKey: ['menu', 'footer', displayLocale, menuRefreshKey],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      const currentLocale = displayLocale || getLocaleFromDOMHelper();
      console.log(`[SiteFooter] 🔄 [${timestamp}] Fetching footer menu with locale: ${currentLocale}`);
      const result = await getMenu('footer', currentLocale);
      console.log(`[SiteFooter] ✅ [${timestamp}] Received footer menu:`, result ? `${result.items?.length || 0} items` : 'null');
      return result;
    },
    enabled: !!displayLocale,
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    networkMode: 'online',
    placeholderData: (previousData) => previousData,
  });

  // Force menu refetch when displayLocale changes
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (displayLocale && !localeChangeInProgress) {
      console.log('[SiteFooter] 🔄 displayLocale changed to:', displayLocale, '- invalidating and refetching footer menu');
      
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      
      setMenuRefreshKey(prev => prev + 1);
      queryClient.removeQueries({ queryKey: ['menu', 'footer'] });
      
      refetchTimeoutRef.current = setTimeout(() => {
        const currentLocale = displayLocale;
        console.log('[SiteFooter] ✅ Refetching footer menu with locale:', currentLocale);
        queryClient.refetchQueries({ queryKey: ['menu', 'footer', currentLocale] });
        refetchTimeoutRef.current = null;
      }, 100);
    }
    
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
    };
  }, [displayLocale, queryClient, localeChangeInProgress]);

  // Process footer menu items
  const footerMenuItems = useMemo<MenuItemResponse[]>(() => {
    if (footerMenu?.items?.length) {
      return [...footerMenu.items].sort((a, b) => a.order - b.order);
    }
    return [];
  }, [footerMenu, displayLocale]);

  // Split footer items into sections (center links, catalog links, social links)
  // Center links: first 6 items (or all if less than 6)
  // Catalog links: items with href containing '/catalog'
  // Social links: items with external URLs or specific social media links
  const centerLinksList = useMemo(() => {
    return footerMenuItems
      .filter(item => !item.href.includes('/catalog') && !item.href.startsWith('http'))
      .slice(0, 6)
      .map(item => ({
        href: item.href,
        label: getBilingualText(item.title_uz, item.title_ru, displayLocale),
      }));
  }, [footerMenuItems, displayLocale]);

  const catalogLinksList = useMemo(() => {
    const catalogItems = footerMenuItems
      .filter(item => item.href.includes('/catalog'))
      .map(item => ({
        href: item.href,
        label: getBilingualText(item.title_uz, item.title_ru, displayLocale),
      }));
    
    // If no catalog items in footer menu, use default catalog links
    if (catalogItems.length === 0) {
      return [
        { href: '/catalog?productType=hearing-aids', label: displayLocale === 'ru' ? 'Аппараты для взрослых' : 'Kattalar uchun apparatlar' },
        { href: '/catalog?productType=hearing-aids&filter=children', label: displayLocale === 'ru' ? 'Аппараты для детей' : 'Bolalar uchun apparatlar' },
        { href: '/catalog?productType=accessories&filter=wireless', label: displayLocale === 'ru' ? 'Беспроводные аксессуары' : 'Simsiz aksessuarlar' },
        { href: '/catalog/batteries', label: displayLocale === 'ru' ? 'Батареи' : 'Batareyalar' },
        { href: '/catalog/earmolds', label: displayLocale === 'ru' ? 'Ушные вкладыши' : 'Quloq vkladishlari' },
        { href: '/catalog/care', label: displayLocale === 'ru' ? 'Средства по уходу' : 'Parvarish vositalari' },
      ];
    }
    
    return catalogItems;
  }, [footerMenuItems, displayLocale]);

  const socialRowLinksList = useMemo(() => {
    // Social links: items with external URLs or specific social media links
    const socialItems = footerMenuItems.filter(item => 
      item.href.startsWith('http') || 
      item.href.includes('tiktok') || 
      item.href.includes('instagram') || 
      item.href.includes('facebook') || 
      item.href.includes('youtube') || 
      item.href.includes('telegram')
    );
    
    // If no social items in menu, use default
    if (socialItems.length === 0) {
      return [
        { href: '/contacts', label: displayLocale === 'ru' ? 'Связаться с нами' : "Biz bilan bog'laning" },
        { href: 'https://tiktok.com/@acoustic', label: 'TikTok' },
        { href: 'https://instagram.com/acoustic', label: 'Instagram' },
        { href: 'https://facebook.com/acoustic', label: 'Facebook' },
        { href: 'https://youtube.com/acoustic', label: 'YouTube' },
        { href: 'https://t.me/acoustic', label: 'Telegram' },
      ];
    }
    
    return socialItems.map(item => ({
      href: item.href,
      label: getBilingualText(item.title_uz, item.title_ru, displayLocale),
    }));
  }, [footerMenuItems, displayLocale]);
  return (
    <footer className="border-t bg-white" key={`footer-${displayLocale}-${menuRefreshKey}`}>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Центр Acoustic' : 'Acoustic markazi'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {centerLinksList.map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Каталог' : 'Katalog'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catalogLinksList.map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Контактная информация' : "Aloqa ma'lumotlari"}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-brand-primary" />
                <Link href="tel:+998712021441" className="hover:text-brand-primary">
                  +998 71 202 14 41
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brand-primary" />
                <Link href="mailto:info@acoustic.uz" className="hover:text-brand-primary">
                  info@acoustic.uz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 text-xs font-semibold text-brand-accent/80 md:px-6">
          {socialRowLinksList.map((item, index) => (
            <Link key={`${item.href}-${index}`} href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 bg-white py-4 text-center text-xs text-muted-foreground" suppressHydrationWarning>
        © {new Date().getFullYear()} Acoustic. {displayLocale === 'ru' ? 'Все права защищены.' : 'Barcha huquqlar himoyalangan.'}
      </div>
    </footer>
  );
}
