'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { getCatalogs, getSettings, search, type MenuItemResponse, type CatalogResponse, type SettingsResponse, type SearchResponse } from '@/lib/api';
import { getHeaderMenuFromJSON, getCatalogMenuFromJSON, hasMenuData, type MenuItem } from '@/lib/menu-data';
import LanguageSwitcher, { LanguageSwitcherMobile } from '@/components/language-switcher';
import { getBilingualText, DEFAULT_LOCALE, type Locale } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';
import { normalizeImageUrl } from '@/lib/image-utils';

// Removed CatalogMenuEntry - not currently used

// Search Autocomplete Component
function SearchAutocomplete({ locale, isMobile = false }: { locale: Locale; isMobile?: boolean }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults, isLoading } = useQuery<SearchResponse>({
    queryKey: ['search-autocomplete', query],
    queryFn: () => search(query, locale),
    enabled: query.length >= 3, // Start searching after 3 characters
    staleTime: 30000, // Cache for 30 seconds
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when query is 3+ characters and has results
  useEffect(() => {
    setIsOpen(query.length >= 3 && !!searchResults && !isLoading);
  }, [query, searchResults, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleSelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setIsOpen(false);
    window.location.href = `/search?q=${encodeURIComponent(selectedQuery.trim())}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !searchResults) return;

    const results = [
      ...(searchResults.products || []).slice(0, 5),
      ...(searchResults.posts || []).slice(0, 3),
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        const selectedQuery = 'name' in selected ? selected.name : selected.title_uz || selected.title_ru || '';
        handleSelect(selectedQuery);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const results = searchResults
    ? [
        ...(searchResults.products || []).slice(0, 5),
        ...(searchResults.posts || []).slice(0, 3),
      ]
    : [];

  return (
    <div className={isMobile ? "w-full" : "hidden flex-1 md:block"}>
      <div ref={searchRef} className={`relative ${isMobile ? 'w-full' : 'max-w-md mx-auto'}`}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 3 && setIsOpen(true)}
            placeholder={locale === 'ru' ? 'Поиск' : 'Qidiruv'}
            className="w-full rounded-full border border-border/60 bg-white px-10 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
            suppressHydrationWarning
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </form>

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-lg border border-border/60 bg-white shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              {searchResults.products && searchResults.products.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {locale === 'ru' ? 'Товары' : 'Mahsulotlar'}
                  </div>
                  {searchResults.products.slice(0, 5).map((product, index) => {
                    const globalIndex = index;
                    const isSelected = selectedIndex === globalIndex;
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className={`block rounded-md px-3 py-2 text-sm transition hover:bg-muted/50 ${
                          isSelected ? 'bg-muted/50' : ''
                        }`}
                        onClick={() => handleSelect(product.name_uz || product.name_ru || '')}
                      >
                        <div className="font-medium text-foreground">
                          {locale === 'ru' ? product.name_ru : product.name_uz}
                        </div>
                        {product.description_uz || product.description_ru ? (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {locale === 'ru' ? product.description_ru : product.description_uz}
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}
                </>
              )}
              {searchResults.posts && searchResults.posts.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase mt-2">
                    {locale === 'ru' ? 'Статьи' : 'Maqolalar'}
                  </div>
                  {searchResults.posts.slice(0, 3).map((post, index) => {
                    const globalIndex = (searchResults.products?.length || 0) + index;
                    const isSelected = selectedIndex === globalIndex;
                    return (
                      <Link
                        key={post.id}
                        href={`/posts/${post.slug}`}
                        className={`block rounded-md px-3 py-2 text-sm transition hover:bg-muted/50 ${
                          isSelected ? 'bg-muted/50' : ''
                        }`}
                        onClick={() => handleSelect(post.title_uz || post.title_ru || '')}
                      >
                        <div className="font-medium text-foreground">
                          {locale === 'ru' ? post.title_ru : post.title_uz}
                        </div>
                        {post.excerpt_uz || post.excerpt_ru ? (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {locale === 'ru' ? post.excerpt_ru : post.excerpt_uz}
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
        {isOpen && query.length >= 3 && isLoading && (
          <div className="absolute z-50 mt-2 w-full rounded-lg border border-border/60 bg-white shadow-lg p-4">
            <div className="text-sm text-muted-foreground text-center">
              {locale === 'ru' ? 'Поиск...' : 'Qidirilmoqda...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  initialLocale?: Locale;
}

export default function SiteHeader({ initialSettings = null, initialLocale }: SiteHeaderProps = {}) {
  const queryClient = useQueryClient();
  
  // Use initialLocale from props (server-provided) to match SSR, then update from DOM if needed
  const [displayLocale, setDisplayLocale] = useState<Locale>(initialLocale || DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  
  // Update locale from DOM after mount if it differs from server-provided locale
  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      const htmlLocale = document.documentElement.getAttribute('data-locale');
      if ((htmlLocale === 'ru' || htmlLocale === 'uz') && htmlLocale !== displayLocale) {
        setDisplayLocale(htmlLocale as Locale);
      }
    }
  }, []); // Only run once on mount

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
          if (process.env.NODE_ENV === 'development') {
            console.log('[SiteHeader] 🔄 Locale changed from', displayLocale, 'to', domLocale, '- updating menu');
          }
          setLocaleChangeInProgress(true);
          setDisplayLocale(domLocale);
          // Menu is from JSON, so no need to refetch - it will update automatically
          // Only refetch catalogs if needed
          queryClient.refetchQueries({ queryKey: ['catalogs', domLocale] });
          setLocaleChangeInProgress(false);
          // Reset counter after successful change
          consecutiveChecksRef.current.locale = null;
          consecutiveChecksRef.current.count = 0;
        } else if (process.env.NODE_ENV === 'development') {
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
    queryKey: ['catalogs', displayLocale],
    queryFn: async () => {
      const currentLocale = displayLocale || getLocaleFromDOM(); // Ensure we always have a locale
      if (process.env.NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        console.log(`[SiteHeader] 🔄 [${timestamp}] Fetching catalogs with locale: ${currentLocale}`);
      }
      const result = await getCatalogs(currentLocale);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SiteHeader] ✅ Received catalogs:`, result?.length || 0);
      }
      return result;
    },
    enabled: !!displayLocale, // Don't run query until locale is set
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes - improves performance
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh (locale in queryKey handles this)
    refetchOnWindowFocus: false, // Don't refetch on window focus (avoid unnecessary requests)
    retry: false,
    throwOnError: false, // Don't throw errors - handle gracefully to prevent menu from disappearing
    networkMode: 'online',
    placeholderData: (previousData) => previousData, // Keep previous data while loading to prevent menu from disappearing
  });

  // Optimized: Get catalog menu items from JSON (faster and more reliable)
  // Don't wait for mounted - JSON is available immediately
  const catalogMenuItems = useMemo<Array<{ href: string; label: string }>>(() => {
    // Try to get from JSON first (faster and more reliable)
    const jsonItems = getCatalogMenuFromJSON(displayLocale);
    if (jsonItems.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SiteHeader] Using catalog menu from JSON:', jsonItems.length, 'items');
      }
      return jsonItems;
    }
    
    // Fallback to hardcoded items if JSON is not available
    if (process.env.NODE_ENV === 'development') {
      console.log('[SiteHeader] Using fallback catalog menu items');
    }
    
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

  // Menu is now ONLY from JSON - no API calls needed
  // This improves performance and ensures menu is always available
  // Admin panel will update JSON file directly when menu changes
  const isLoadingMenu = false; // No API call, so always false
  
  // Menu is from JSON only - no API calls needed
  // Menu will automatically update when JSON file changes and frontend is rebuilt
  // Admin panel will update JSON file directly when menu changes

  // Menu ONLY from JSON (no API fallback for better performance and reliability)
  // Don't wait for mounted - JSON is available immediately
  const headerMenuItems = useMemo<MenuItemResponse[]>(() => {
    // Get menu from JSON only (works on both server and client)
    const jsonMenuItems = getHeaderMenuFromJSON(displayLocale);
    if (jsonMenuItems.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SiteHeader] Using menu from JSON:', jsonMenuItems.length, 'items for locale:', displayLocale);
      }
      // Convert MenuItem to MenuItemResponse format
      return jsonMenuItems.map((item: MenuItem) => ({
        id: item.id,
        title_uz: item.title_uz,
        title_ru: item.title_ru,
        href: item.href,
        order: item.order,
        children: item.children || [],
      }));
    }
    
    // If JSON is empty, return empty array (menu will not show)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SiteHeader] No menu items found in JSON for locale:', displayLocale);
    }
    return [];
  }, [displayLocale]);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    '/services': Stethoscope,
    '/catalog': MenuSquare,
    '/doctors': UserRound,
    '/patients': HeartPulse,
    '/children-hearing': Baby,
    '/about': Info,
    '/branches': MapPin,
  };

  // Optimized: Use useCallback to memoize icon getter
  const getIconForHref = useCallback((href: string) => {
    const IconComponent = iconMap[href];
    if (!IconComponent) {
      return <MenuSquare className="h-4 w-4" />;
    }

    return <IconComponent className="h-4 w-4" />;
  }, []);

  // Optimized: Use useMemo instead of useState + useEffect for better performance
  const navItems = useMemo<NavItem[]>(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SiteHeader] Building navItems with locale:', displayLocale, 'headerMenuItems:', headerMenuItems.length);
    }
    
    const items = headerMenuItems.map((item) => {
      const label = getBilingualText(item.title_uz, item.title_ru, displayLocale);
      
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[SiteHeader] navItems built with locale:', displayLocale, 'Items count:', items.length);
    }
    
    return items;
  }, [headerMenuItems, catalogMenuItems, displayLocale, getIconForHref]);

  // Log current state for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SiteHeader] Current state:', {
        displayLocale,
        menuItemsCount: headerMenuItems.length,
        navItemsCount: navItems.length,
        catalogMenuItemsCount: catalogMenuItems.length,
      });
    }
  }, [displayLocale, headerMenuItems.length, navItems.length, catalogMenuItems.length]);

  return (
    <header className="border-b shadow-sm" key={`header-${displayLocale}`} suppressHydrationWarning>
      <div className="bg-white" suppressHydrationWarning>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6" suppressHydrationWarning>
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
          <SearchAutocomplete locale={displayLocale} />

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
            
            <LanguageSwitcher initialLocale={displayLocale} />
            
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-border p-2 text-muted-foreground lg:hidden"
              onClick={() => {
                const newValue = !mobileOpen;
                setMobileOpen(newValue);
                if (!newValue) {
                  // Close dropdown when closing mobile menu
                  setMobileOpenDropdown(null);
                }
              }}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
        
        {/* Search Bar - Mobile only (below header) */}
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <SearchAutocomplete locale={displayLocale} isMobile={true} />
        </div>
      </div>

      <div className="bg-brand-primary" suppressHydrationWarning>
        <div className="mx-auto hidden max-w-6xl items-center px-4 md:px-6 lg:flex" suppressHydrationWarning>
          <nav key={`nav-${displayLocale}`} className="flex w-full items-stretch min-h-[52px]" suppressHydrationWarning>
            {navItems.length === 0 && isLoadingCatalogs ? (
              // Show skeleton menu items while loading to maintain layout (only if no cached data and no fallback)
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className={`flex-1 animate-pulse ${index > 0 ? 'border-l border-white/20' : ''}`}
                  suppressHydrationWarning
                >
                  <div className="flex h-full w-full items-center justify-center gap-2 px-4 py-3">
                    <div className="h-4 w-20 rounded bg-white/20"></div>
                  </div>
                </div>
              ))
            ) : navItems.length > 0 ? (
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
            ) : null}
          </nav>
        </div>

        {mobileOpen && (
          <nav key={`mobile-nav-${displayLocale}`} className="space-y-2 border-t border-white/20 bg-brand-primary px-4 py-4 md:px-6 lg:hidden" suppressHydrationWarning>
            <Link
              href="tel:+998712021441"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={() => setMobileOpen(false)}
              suppressHydrationWarning
            >
              <Phone size={16} /> 1385
            </Link>
            {navItems.length === 0 && isLoadingCatalogs ? (
              // Show skeleton menu items while loading for mobile (only if no cached data and no fallback)
              Array.from({ length: 5 }).map((_, index) => (
                <div key={`mobile-skeleton-${index}`} className="space-y-2 rounded-lg border border-white/20 p-3 animate-pulse" suppressHydrationWarning>
                  <div className="h-5 w-32 rounded bg-white/20"></div>
                </div>
              ))
            ) : navItems.length > 0 ? (
              navItems.map((item) => {
              // Use locale in key to force remount when locale changes
              return item.type === 'dropdown' ? (
                <div key={`${item.href}-${displayLocale}`} className="space-y-2 rounded-lg border border-white/20 p-3">
                  <button
                    type="button"
                    onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.href ? null : item.href)}
                    className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-white"
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span suppressHydrationWarning>{item.label}</span>
                    </span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${mobileOpenDropdown === item.href ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileOpenDropdown === item.href && (
                    <div className="space-y-1 pl-6">
                      {item.children.length > 0 ? (
                        item.children.map((child) => (
                          <Link
                            key={`${child.href}-${displayLocale}`}
                            href={child.href}
                            onClick={() => {
                              setMobileOpen(false);
                              setMobileOpenDropdown(null);
                            }}
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
                  )}
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
            ) : null}
            <LanguageSwitcherMobile initialLocale={displayLocale} />
          </nav>
        )}
      </div>
    </header>
  );
}
