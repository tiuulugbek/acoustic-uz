'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Menu,
  Phone,
  Stethoscope,
  MenuSquare,
  ChevronDown,
  ShoppingBag,
  Search,
  UserRound,
  HeartPulse,
  Baby,
  Info,
  MapPin,
} from 'lucide-react';
import { getCatalogs, getMenu, getSettings, type MenuItemResponse, type CatalogResponse, type SettingsResponse } from '@/lib/api';
// Removed DEFAULT_MENUS fallback - frontend fully depends on backend
import LanguageSwitcher, { LanguageSwitcherMobile } from '@/components/language-switcher';
import { getBilingualText, DEFAULT_LOCALE, type Locale } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';

// Removed CatalogMenuEntry - not currently used

type NavItem =
  | {
      type: 'link';
      href: string;
      label: string;
      icon: React.ReactNode;
    }
  | {
      type: 'dropdown';
      href: string;
      label: string;
      icon: React.ReactNode;
      children: { href: string; label: string }[];
    };

// Removed fallback catalog menu - frontend fully depends on backend

// Helper to get locale from DOM (available on client)
// ALWAYS prioritizes DOM attributes over cookies to prevent reverting to stale values
function getLocaleFromDOM(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Priority 1: Read from HTML data attribute (set by server) - MOST RELIABLE
  // This is set in layout.tsx and reflects the actual server-detected locale
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  // Priority 2: Read from window.__NEXT_LOCALE__ (set by inline script before React)
  // This is set by the server and matches the data-locale attribute
  if (typeof window !== 'undefined' && (window as any).__NEXT_LOCALE__) {
    const locale = (window as any).__NEXT_LOCALE__;
    if (locale === 'ru' || locale === 'uz') {
      return locale as Locale;
    }
  }
  
  // Priority 3: Read from cookie ONLY as last resort
  // We don't trust cookies if DOM attributes are missing, as they might be stale
  // But we need a fallback for the initial render before server sets DOM attributes
  const cookieLocale = getLocaleFromCookie();
  if (cookieLocale && cookieLocale !== DEFAULT_LOCALE) {
    console.warn('[SiteHeader] ⚠️ Using cookie locale (DOM attribute missing):', cookieLocale);
    return cookieLocale;
  }
  
  return DEFAULT_LOCALE;
}

interface SiteHeaderProps {
  initialSettings?: SettingsResponse | null;
}

// Helper function to normalize image URLs
function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return `${baseUrl}${url}`;
  }
  return url;
}

export default function SiteHeader({ initialSettings = null }: SiteHeaderProps = {}) {
  const queryClient = useQueryClient();
  
  // CRITICAL: Read initial locale from DOM synchronously - this must match server render
  // The server sets data-locale="ru" on <html>, which is available BEFORE React hydrates
  // We MUST read it synchronously here to avoid hydration mismatch
  const getInitialLocale = (): Locale => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return DEFAULT_LOCALE; // SSR fallback
    }
    
    // Read from data-locale attribute (set by server) - this is the source of truth
    // It's set in layout.tsx before React loads, so it's always available
    const htmlLocale = document.documentElement.getAttribute('data-locale');
    if (htmlLocale === 'ru' || htmlLocale === 'uz') {
      console.log('[SiteHeader] ✅ Initial locale from data-locale:', htmlLocale);
      return htmlLocale as Locale;
    }
    
    // Fallback to window.__NEXT_LOCALE__ (set by inline script)
    if ((window as any).__NEXT_LOCALE__) {
      const windowLocale = (window as any).__NEXT_LOCALE__;
      if (windowLocale === 'ru' || windowLocale === 'uz') {
        console.log('[SiteHeader] ✅ Initial locale from window.__NEXT_LOCALE__:', windowLocale);
        return windowLocale as Locale;
      }
    }
    
    // Last resort: cookie (but this should rarely be needed)
    const cookieLocale = getLocaleFromCookie();
    console.log('[SiteHeader] ⚠️ Using fallback locale from cookie:', cookieLocale);
    return cookieLocale;
  };
  
  const [displayLocale, setDisplayLocale] = useState<Locale>(getInitialLocale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Track if we've successfully switched locale to prevent reverting
  const [localeChangeInProgress, setLocaleChangeInProgress] = useState(false);
  const consecutiveChecksRef = useRef<{ locale: Locale | null; count: number }>({ locale: null, count: 0 });
  
  // Watch for locale changes AFTER initial render (e.g., after language switch)
  // Note: Initial locale is set correctly in useState above to match server render
  useEffect(() => {
    const LOCALE_STABLE_CHECKS = 2; // Require 2 consecutive checks to confirm locale change
    
    const checkLocaleChange = () => {
      if (typeof document === 'undefined') return;
      
      const domLocale = getLocaleFromDOM();
      
      // Only update if locale is actually different AND stable
      // This prevents reverting back due to race conditions or stale cookie reads
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
        // OR if we're already in the middle of a locale change (to complete it)
        if (consecutiveChecksRef.current.count >= LOCALE_STABLE_CHECKS || localeChangeInProgress) {
          console.log('[SiteHeader] 🔄 Locale changed from', displayLocale, 'to', domLocale, '- updating menu');
          setLocaleChangeInProgress(true);
          setDisplayLocale(domLocale);
          // Force menu refresh with new locale
          setMenuRefreshKey(prev => prev + 1);
          // Remove ALL menu and catalog queries (including old locale caches)
          queryClient.removeQueries({ queryKey: ['menu'] });
          queryClient.removeQueries({ queryKey: ['catalogs'] });
          // Small delay to ensure state update completes before refetch
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: ['menu', 'header', domLocale] });
            queryClient.refetchQueries({ queryKey: ['catalogs', domLocale] });
            setLocaleChangeInProgress(false);
          }, 50);
          // Reset counter after successful change
          consecutiveChecksRef.current.locale = null;
          consecutiveChecksRef.current.count = 0;
        } else {
          console.log('[SiteHeader] 🔍 Locale change detected but waiting for confirmation:', domLocale, `(${consecutiveChecksRef.current.count}/${LOCALE_STABLE_CHECKS})`);
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
      // Only react to actual attribute changes, not just any check
      const hasLocaleChange = mutations.some(m => 
        m.type === 'attributes' && 
        m.attributeName === 'data-locale' &&
        (m.target as HTMLElement).getAttribute('data-locale') !== displayLocale
      );
      
      if (hasLocaleChange) {
        const newLocale = getLocaleFromDOM();
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
    
    // Check periodically but less frequently (every 1 second instead of 500ms)
    // This reduces unnecessary checks and prevents reverting due to stale values
    const intervalId = setInterval(checkLocaleChange, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [displayLocale, queryClient, localeChangeInProgress]);

  const { data: settings, isLoading: isLoadingSettings } = useQuery<SettingsResponse>({
    queryKey: ['settings', displayLocale],
    queryFn: () => getSettings(displayLocale),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    throwOnError: false,
    refetchOnMount: 'always', // Always refetch on mount to ensure logo is loaded
    placeholderData: (previousData) => previousData || initialSettings, // Use initialSettings as placeholder
    initialData: initialSettings, // Use server-side fetched settings as initial data
  });

  const { data: catalogsData, isLoading: isLoadingCatalogs } = useQuery<CatalogResponse[]>({
    queryKey: ['catalogs', displayLocale, menuRefreshKey],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      const currentLocale = displayLocale || getLocaleFromDOM(); // Ensure we always have a locale
      console.log(`[SiteHeader] 🔄 [${timestamp}] Fetching catalogs with locale: ${currentLocale} (displayLocale: ${displayLocale})`);
      const result = await getCatalogs(currentLocale);
      console.log(`[SiteHeader] ✅ [${timestamp}] Received catalogs:`, result?.length || 0);
      return result;
    },
    enabled: !!displayLocale, // Don't run query until locale is set
    staleTime: 0, // Always refetch when locale changes
    gcTime: 300000, // Keep cache for 5 minutes to preserve data during refetch
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus (avoid unnecessary requests)
    retry: false,
    throwOnError: false, // Don't throw errors - handle gracefully to prevent menu from disappearing
    networkMode: 'online',
    placeholderData: (previousData) => previousData, // Keep previous data while loading to prevent menu from disappearing
  });

  const catalogMenuItems = useMemo(() => {
    const mainSections = [
      {
        href: '/catalog?productType=hearing-aids',
        label: displayLocale === 'ru' ? 'Слуховые аппараты' : 'Eshitish moslamalari',
      },
      {
        href: '/catalog?productType=hearing-aids&filter=children',
        label: displayLocale === 'ru' ? 'Детские' : 'Bolalar uchun',
      },
      {
        href: '/catalog?productType=accessories&filter=wireless',
        label: displayLocale === 'ru' ? 'Беспроводные аксессуары' : 'Simsiz aksessuarlar',
      },
      {
        href: '/catalog?productType=interacoustics',
        label: 'Interacoustics',
      },
    ];

    const otherSections = [
      {
        href: '/catalog?productType=accessories',
        label: displayLocale === 'ru' ? 'Аксессуары' : 'Aksessuarlar',
      },
      {
        href: '/catalog/earmolds',
        label: displayLocale === 'ru' ? 'Ушные вкладыши' : "Quloq qo'shimchalari",
      },
      {
        href: '/catalog/batteries',
        label: displayLocale === 'ru' ? 'Батарейки' : 'Batareyalar',
      },
      {
        href: '/catalog/care',
        label: displayLocale === 'ru' ? 'Средства ухода' : 'Parvarish vositalari',
      },
    ];

    return [...mainSections, ...otherSections];
  }, [displayLocale]);

  const { data: headerMenu, refetch: refetchMenu, isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menu', 'header', displayLocale, menuRefreshKey],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      const currentLocale = displayLocale || getLocaleFromDOM(); // Ensure we always have a locale
      console.log(`[SiteHeader] 🔄 [${timestamp}] Fetching menu with locale: ${currentLocale} (displayLocale: ${displayLocale})`);
      const result = await getMenu('header', currentLocale);
      console.log(`[SiteHeader] ✅ [${timestamp}] Received menu:`, result ? `${result.items?.length || 0} items` : 'null');
      if (result?.items) {
        result.items.forEach((item, i) => {
          console.log(`[SiteHeader]   Menu item ${i + 1}: ${item.title_uz} / ${item.title_ru} (locale: ${currentLocale})`);
        });
      }
      return result;
    },
    enabled: !!displayLocale, // Don't run query until locale is set
    staleTime: 0, // Always refetch when locale changes
    gcTime: 300000, // Keep cache for 5 minutes to preserve data during refetch
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus (avoid unnecessary requests)
    retry: false,
    throwOnError: false, // Don't throw errors - handle gracefully to prevent menu from disappearing
    networkMode: 'online',
    placeholderData: (previousData) => previousData, // Keep previous data while loading to prevent menu from disappearing
  });
  
  // Log menu data when it changes
  useEffect(() => {
    if (headerMenu) {
      console.log('[SiteHeader] Menu data received:', headerMenu);
    }
  }, [headerMenu]);
  
  // Force menu refetch when displayLocale changes
  // This ensures menu updates immediately when locale changes
  // Use a ref to prevent multiple simultaneous refetches
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (displayLocale && !localeChangeInProgress) {
      console.log('[SiteHeader] 🔄 displayLocale changed to:', displayLocale, '- invalidating and refetching menu and categories');
      
      // Clear any pending refetch
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      
      // Force menu refresh key increment to trigger refetch
      setMenuRefreshKey(prev => prev + 1);
      // Remove ALL old cached queries for ALL locales
      queryClient.removeQueries({ queryKey: ['menu'] });
      queryClient.removeQueries({ queryKey: ['product-categories'] });
      
      // Force immediate refetch with new locale after a brief delay
      // This ensures the query key has updated with the new menuRefreshKey
      refetchTimeoutRef.current = setTimeout(() => {
        const currentLocale = displayLocale;
        console.log('[SiteHeader] ✅ Refetching menu with locale:', currentLocale);
        refetchMenu();
        queryClient.refetchQueries({ queryKey: ['catalogs', currentLocale] });
        refetchTimeoutRef.current = null;
      }, 100);
    }
    
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
        refetchTimeoutRef.current = null;
      }
    };
  }, [displayLocale, refetchMenu, queryClient, localeChangeInProgress]);

  const headerMenuItems = useMemo<MenuItemResponse[]>(() => {
    if (headerMenu?.items?.length) {
      return [...headerMenu.items].sort((a, b) => a.order - b.order);
    }

    // No fallback - return empty array if backend is unavailable
    return [];
  }, [headerMenu, displayLocale]); // Add displayLocale to dependencies to ensure recalculation

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '/services': Stethoscope,
    '/catalog': MenuSquare,
    '/doctors': UserRound,
    '/patients': HeartPulse,
    '/children-hearing': Baby,
    '/about': Info,
    '/branches': MapPin,
  };

  const getIconForHref = (href: string) => {
    const IconComponent = iconMap[href];
    if (!IconComponent) {
      return <MenuSquare className="h-4 w-4" />;
    }

    return <IconComponent className="h-4 w-4" />;
  };

  const navItems: NavItem[] = useMemo(() => {
    console.log('[SiteHeader] Building navItems with locale:', displayLocale);
    const items = headerMenuItems.map((item) => {
      const label = getBilingualText(item.title_uz, item.title_ru, displayLocale);
      console.log('[SiteHeader] Menu item:', { title_uz: item.title_uz, title_ru: item.title_ru, locale: displayLocale, label });
      
      // For /catalog, always use catalogs instead of menu children (categories are only for filters)
      const dropdownChildren =
        item.href === '/catalog'
          ? catalogMenuItems
          : item.children && item.children.length > 0
            ? item.children
                .sort((a, b) => a.order - b.order)
                .map((child) => ({
                  href: child.href,
                  label: getBilingualText(child.title_uz, child.title_ru, displayLocale),
                }))
            : [];

      if (dropdownChildren.length > 0) {
        return {
          type: 'dropdown' as const,
          href: item.href,
          label,
          icon: getIconForHref(item.href),
          children: dropdownChildren,
        };
      }

      return {
        type: 'link' as const,
        href: item.href,
        label,
        icon: getIconForHref(item.href),
      };
    });
    console.log('[SiteHeader] navItems built with locale:', displayLocale, 'Items count:', items.length);
    return items;
  }, [headerMenuItems, catalogMenuItems, displayLocale]);

  // Log current state for debugging
  useEffect(() => {
    console.log('[SiteHeader] Current state:', {
      displayLocale,
      menuRefreshKey,
      hasMenuData: !!headerMenu,
      menuItemsCount: headerMenu?.items?.length || 0,
      navItemsCount: navItems.length,
    });
  }, [displayLocale, menuRefreshKey, headerMenu, navItems.length]);

  return (
    <header className="border-b shadow-sm" key={`header-${displayLocale}-${menuRefreshKey}`}>
      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {settings?.logo?.url ? (
                <Image
                  src={normalizeImageUrl(settings.logo.url)}
                  alt={settings.logo.alt_uz || settings.logo.alt_ru || 'Acoustic'}
                  width={120}
                  height={40}
                  className="h-auto w-auto object-contain"
                  style={{ maxHeight: '40px' }}
                  priority
                  unoptimized
                />
              ) : (
                <span className="text-xl font-semibold tracking-tight text-brand-primary md:text-3xl">
                  Acoustic
                </span>
              )}
            </Link>
          </div>

          {/* Search Bar - Center (desktop only) */}
          <div className="hidden flex-1 md:block">
            <form 
              action="/search" 
              method="get"
              className="relative max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('q') as string;
                if (query && query.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}
            >
              <input
                type="search"
                name="q"
                placeholder={displayLocale === 'ru' ? 'Поиск' : 'Qidiruv'}
                className="w-full rounded-full border border-border/60 bg-white px-10 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                suppressHydrationWarning
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </form>
          </div>

          {/* Right side - Phone, Language, Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Phone - Mobile only */}
            <Link
              href={`tel:${settings?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}`}
              className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-brand-primary/90 md:hidden"
            >
              <Phone size={14} /> {settings?.phonePrimary || '1385'}
            </Link>
            
            {/* Phone - Desktop */}
            <Link
              href={`tel:${settings?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}`}
              className="hidden items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-primary/90 md:inline-flex"
            >
              <Phone size={16} /> {settings?.phonePrimary || '1385'}
            </Link>
            
            <LanguageSwitcher />
            
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-border p-2 text-muted-foreground lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        
        {/* Search Bar - Mobile only (below header) */}
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <form 
            action="/search" 
            method="get"
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get('q') as string;
              if (query && query.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
              }
            }}
          >
            <input
              type="search"
              name="q"
              placeholder={displayLocale === 'ru' ? 'Поиск' : 'Qidiruv'}
              className="w-full rounded-full border border-border/60 bg-white px-10 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              suppressHydrationWarning
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </form>
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="mx-auto hidden max-w-6xl items-center px-4 md:px-6 lg:flex">
          <nav key={`nav-${displayLocale}`} className="flex w-full items-stretch min-h-[52px]">
            {navItems.length === 0 && (isLoadingMenu || isLoadingCatalogs) && !headerMenu ? (
              // Show skeleton menu items while loading to maintain layout (only if no cached data)
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className={`flex-1 animate-pulse ${index > 0 ? 'border-l border-white/20' : ''}`}
                >
                  <div className="flex h-full w-full items-center justify-center gap-2 px-4 py-3">
                    <div className="h-4 w-20 rounded bg-white/20"></div>
                  </div>
                </div>
              ))
            ) : (
              navItems.map((item, index) => {
              const borderClass = index === 0 ? '' : 'border-l border-white/20';
              // Use locale in key to force remount when locale changes

              if (item.type === 'dropdown') {
                const isOpen = openDropdown === item.href;
                return (
                  <div 
                    key={`${item.href}-${displayLocale}`} 
                    className={`group relative flex-1 ${borderClass}`}
                    onMouseEnter={() => setOpenDropdown(item.href)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className="flex h-full w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      {item.icon}
                      <span suppressHydrationWarning>{item.label}</span>
                      <ChevronDown className={`h-3 w-3 transition ${isOpen ? 'rotate-180' : ''}`} />
                    </Link>
                    <div className={`absolute left-0 top-full z-30 min-w-[220px] flex-col gap-1 rounded-b-3xl border border-brand-primary/30 bg-white/95 p-3 text-brand-accent shadow-lg ${isOpen ? 'flex' : 'hidden'}`} style={{ marginTop: '-1px' }}>
                      {item.children.length > 0 ? (
                        item.children.map((child) => (
                          <Link
                            key={`${child.href}-${displayLocale}`}
                            href={child.href}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand-accent transition hover:bg-brand-primary/10 hover:text-brand-primary"
                          >
                            <ShoppingBag className="h-4 w-4 text-brand-primary/70" />
                            <span suppressHydrationWarning>{child.label}</span>
                          </Link>
                        ))
                      ) : (
                        <span className="px-3 py-2 text-xs text-muted-foreground" suppressHydrationWarning>
                          {displayLocale === 'ru' ? 'Разделы скоро будут добавлены.' : "Bo'limlar tez orada qo'shiladi."}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={`${item.href}-${displayLocale}`}
                  href={item.href}
                  className={`${borderClass} flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10`}
                >
                  {item.icon}
                  <span suppressHydrationWarning>{item.label}</span>
                </Link>
              );
            })
            )}
          </nav>
        </div>

        {mobileOpen && (
          <nav key={`mobile-nav-${displayLocale}`} className="space-y-2 border-t border-white/20 bg-brand-primary px-4 py-4 md:px-6 lg:hidden">
            <Link
              href="tel:+998712021441"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={() => setMobileOpen(false)}
            >
              <Phone size={16} /> 1385
            </Link>
            {navItems.length === 0 && (isLoadingMenu || isLoadingCatalogs) && !headerMenu ? (
              // Show skeleton menu items while loading for mobile (only if no cached data)
              Array.from({ length: 5 }).map((_, index) => (
                <div key={`mobile-skeleton-${index}`} className="space-y-2 rounded-lg border border-white/20 p-3 animate-pulse">
                  <div className="h-5 w-32 rounded bg-white/20"></div>
                </div>
              ))
            ) : (
              navItems.map((item) => {
              // Use locale in key to force remount when locale changes
              return item.type === 'dropdown' ? (
                <div key={`${item.href}-${displayLocale}`} className="space-y-2 rounded-lg border border-white/20 p-3">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between gap-2 text-sm font-semibold text-white"
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span suppressHydrationWarning>{item.label}</span>
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Link>
                  <div className="space-y-1 pl-6">
                    {item.children.length > 0 ? (
                      item.children.map((child) => (
                        <Link
                          key={`${child.href}-${displayLocale}`}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-md px-2 py-1 text-xs text-white/80 transition hover:bg-white/10"
                        >
                          <span suppressHydrationWarning>{child.label}</span>
                        </Link>
                      ))
                    ) : (
                      <span className="block text-xs text-white/60" suppressHydrationWarning>
                        {displayLocale === 'ru' ? 'Разделы скоро будут добавлены.' : "Bo'limlar tez orada qo'shiladi."}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  key={`${item.href}-${displayLocale}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  {item.icon}
                  <span suppressHydrationWarning>{item.label}</span>
                </Link>
              );
            })
            )}
            <LanguageSwitcherMobile />
          </nav>
        )}
      </div>
    </header>
  );
}
