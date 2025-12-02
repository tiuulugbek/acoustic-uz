'use client';

import Link from 'next/link';
import { Mail, Phone, Send } from 'lucide-react';
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes - improves performance
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh (locale in queryKey handles this)
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    networkMode: 'online',
    placeholderData: (previousData) => previousData,
  });

  // Optimized: Only refetch when locale actually changes
  // Since locale is in queryKey, React Query will automatically use different cache entries
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (displayLocale && !localeChangeInProgress) {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      
      // Only invalidate queries for the OLD locale, not all queries
      const oldLocale = displayLocale === 'uz' ? 'ru' : 'uz';
      queryClient.invalidateQueries({ queryKey: ['menu', 'footer', oldLocale] });
      
      setMenuRefreshKey(prev => prev + 1);
      
      // Refetch with new locale (queryKey includes displayLocale, so it will fetch fresh data)
      refetchTimeoutRef.current = setTimeout(() => {
        console.log('[SiteFooter] ✅ Refetching footer menu with locale:', displayLocale);
        queryClient.refetchQueries({ queryKey: ['menu', 'footer', displayLocale] });
        refetchTimeoutRef.current = null;
      }, 50); // Reduced delay for faster response
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
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email subscription
    console.log('Email subscription:', email);
    setEmail('');
  };

  return (
    <footer className="border-t bg-white" key={`footer-${displayLocale}-${menuRefreshKey}`}>
      {/* Mobile Layout - Two Columns */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:hidden">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Left Column - Center Info */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Центр хорошего слуха' : 'Acoustic markazi'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {centerLinksList.slice(0, 6).map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Catalog */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Каталог' : 'Katalog'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catalogLinksList.slice(0, 6).map((item, index) => (
                <li key={`${item.href}-${index}`}>
                  <Link href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle Section - Email Subscription & Contact */}
        <div className="space-y-6 py-6 border-t border-border/60">
          {/* Email Subscription */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Подпишитесь на новости' : 'Yangiliklardan xabardor bo\'ling'}
            </h4>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={displayLocale === 'ru' ? 'Ваш E-mail' : 'Sizning E-mail'}
                className="flex-1 px-4 py-2 border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Contact Section */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Мы на связи' : 'Biz bilan bog\'laning'}
            </h4>
            <div className="flex items-center gap-4">
              {/* Viber */}
              <a
                href="viber://chat?number=998712021441"
                className="w-10 h-10 rounded-lg bg-[#665CAC] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Viber"
              >
                <span className="text-white font-bold text-xs">V</span>
              </a>
              {/* Telegram */}
              <a
                href="https://t.me/acoustic"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#0088cc] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Telegram"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.17 1.896-.896 6.503-1.268 8.625-.15.9-.444 1.202-.73 1.23-.61.062-1.074-.404-1.666-.79-.92-.61-1.44-.99-2.333-1.585-1.037-.64-.365-.992.226-1.566.155-.15 2.82-2.59 2.87-2.81.007-.03.014-.14-.053-.198-.067-.057-.166-.037-.238-.022-.101.02-1.71 1.09-4.83 3.2-.457.32-.87.475-1.24.468-.41-.008-1.2-.232-1.787-.424-.72-.236-1.29-.362-1.24-.765.025-.2.37-.405 1.016-.614 3.93-1.35 6.55-2.24 7.87-2.67 3.84-1.28 4.64-1.5 5.16-1.51.12 0 .38.028.55.16.14.1.18.23.2.32-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/998712021441"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#25D366] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="WhatsApp"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
              {/* Email */}
              <a
                href="mailto:info@acoustic.uz"
                className="text-sm text-muted-foreground hover:text-brand-primary transition-colors"
              >
                info@acoustic.uz
              </a>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-2 pt-4 border-t border-border/60">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-brand-primary transition-colors block" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Политика обработки персональных данных' : 'Shaxsiy ma\'lumotlarni qayta ishlash siyosati'}
            </Link>
            <Link href="/video-surveillance" className="text-xs text-muted-foreground hover:text-brand-primary transition-colors block" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Положение о системе видеонаблюдения' : 'Video kuzatuv tizimi to\'g\'risidagi nizom'}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Three Columns */}
      <div className="hidden md:block mx-auto max-w-6xl px-4 py-12 md:px-6">
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

      {/* Social Media Links Row */}
      <div className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 text-xs font-semibold text-brand-accent/80 md:px-6">
          {socialRowLinksList.map((item, index) => (
            <>
              {index > 0 && <span className="text-border/60">|</span>}
              <Link key={`${item.href}-${index}`} href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                {item.label}
              </Link>
            </>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/60 bg-white py-4 text-center text-xs text-muted-foreground" suppressHydrationWarning>
        © {new Date().getFullYear()} Acoustic. {displayLocale === 'ru' ? 'Все права защищены.' : 'Barcha huquqlar himoyalangan.'}
      </div>
    </footer>
  );
}
