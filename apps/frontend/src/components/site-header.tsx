'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
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
import { getProductCategories, getMenu, type MenuItemResponse, type ProductCategoryResponse } from '@/lib/api';
import { DEFAULT_MENUS } from '@acoustic/shared';
import LanguageSwitcher, { LanguageSwitcherMobile } from '@/components/language-switcher';
import { getBilingualText, DEFAULT_LOCALE, type Locale } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';

type CatalogMenuEntry = Pick<ProductCategoryResponse, 'id' | 'slug' | 'name_uz' | 'name_ru'>;

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

const fallbackCatalogMenu: CatalogMenuEntry[] = [
  {
    id: 'fallback-category-bte',
    slug: 'category-bte',
    name_uz: 'BTE (Quloq orqasida)',
    name_ru: 'BTE (За ухом)',
  },
  {
    id: 'fallback-category-ite',
    slug: 'category-ite',
    name_uz: 'ITE (Quloq ichida)',
    name_ru: 'ITE (В ухе)',
  },
  {
    id: 'fallback-category-ric',
    slug: 'category-ric',
    name_uz: 'RIC (Kanal ichida)',
    name_ru: 'RIC (В канале)',
  },
  {
    id: 'fallback-category-children',
    slug: 'category-mini-bte',
    name_uz: 'Bolalar uchun apparatlar',
    name_ru: 'Аппараты для детей',
  },
  {
    id: 'fallback-category-accessories',
    slug: 'category-other',
    name_uz: 'Aksessuarlar va parvarish',
    name_ru: 'Аксессуары и уход',
  },
  {
    id: 'fallback-category-power',
    slug: 'category-power-bte',
    name_uz: 'Kuchli BTE yechimlari',
    name_ru: 'Мощные BTE решения',
  },
];

// Helper to get locale from DOM (available on client)
function getLocaleFromDOM(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Read from HTML data attribute first (set by server) - most reliable
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  // Fallback to window.__NEXT_LOCALE__ (set by script before React loads)
  if (typeof window !== 'undefined' && (window as any).__NEXT_LOCALE__) {
    const locale = (window as any).__NEXT_LOCALE__;
    if (locale === 'ru' || locale === 'uz') {
      return locale as Locale;
    }
  }
  
  // Fallback to cookie (least reliable, but works as last resort)
  return getLocaleFromCookie();
}

export default function SiteHeader() {
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

  // Watch for locale changes AFTER initial render (e.g., after language switch)
  // Note: Initial locale is set correctly in useState above to match server render
  useEffect(() => {
    const checkLocaleChange = () => {
      if (typeof document === 'undefined') return;
      
      const domLocale = getLocaleFromDOM();
      if (domLocale !== displayLocale) {
        console.log('[SiteHeader] 🔄 Locale changed from', displayLocale, 'to', domLocale, '- updating menu');
        setDisplayLocale(domLocale);
        // Invalidate ALL queries with old locale and refetch with new locale
        queryClient.removeQueries({ queryKey: ['menu', 'header'] });
        queryClient.removeQueries({ queryKey: ['product-categories'] });
        // Force fresh fetch with new locale
        queryClient.refetchQueries({ queryKey: ['menu', 'header', domLocale] });
        queryClient.refetchQueries({ queryKey: ['product-categories', domLocale] });
      }
    };
    
    // Check once after mount (in case DOM changed after initial render)
    const timeoutId = setTimeout(checkLocaleChange, 0);
    
    // Watch for changes to data-locale attribute
    const observer = new MutationObserver(checkLocaleChange);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-locale'],
      });
    }
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [displayLocale, queryClient]);

  const { data: catalogCategoriesData } = useQuery<ProductCategoryResponse[]>({
    queryKey: ['product-categories', displayLocale],
    queryFn: () => getProductCategories(displayLocale),
    staleTime: 10 * 60 * 1000,
  });

  const catalogMenuItems = useMemo(
    () =>
      (catalogCategoriesData?.length ? catalogCategoriesData : fallbackCatalogMenu)
        .slice(0, 8)
        .map((category) => ({
          href: `/catalog#category-${category.slug}`,
          label: getBilingualText(category.name_uz, category.name_ru, displayLocale),
        })),
    [catalogCategoriesData, displayLocale],
  );

  const { data: headerMenu, refetch: refetchMenu } = useQuery({
    queryKey: ['menu', 'header', displayLocale],
    queryFn: () => {
      console.log('[SiteHeader] Fetching menu with locale:', displayLocale);
      return getMenu('header', displayLocale);
    },
    staleTime: 0, // Always refetch when locale changes
    gcTime: 0, // Don't cache - always fetch fresh
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
  });
  
  // Log menu data when it changes
  useEffect(() => {
    if (headerMenu) {
      console.log('[SiteHeader] Menu data received:', headerMenu);
    }
  }, [headerMenu]);
  
  // Force menu refetch when displayLocale changes
  // This ensures menu updates immediately when locale changes
  useEffect(() => {
    console.log('[SiteHeader] 🔄 displayLocale changed to:', displayLocale, '- refetching menu and categories');
    // Invalidate and refetch with new locale
    queryClient.invalidateQueries({ queryKey: ['menu', 'header'] });
    queryClient.invalidateQueries({ queryKey: ['product-categories'] });
    // Force immediate refetch
    refetchMenu();
    queryClient.refetchQueries({ queryKey: ['product-categories', displayLocale] });
  }, [displayLocale, refetchMenu, queryClient]);

  const headerMenuItems = useMemo<MenuItemResponse[]>(() => {
    if (headerMenu?.items?.length) {
      return [...headerMenu.items].sort((a, b) => a.order - b.order);
    }

    // Deep copy to convert readonly arrays to mutable arrays
    return JSON.parse(JSON.stringify(DEFAULT_MENUS.header)) as MenuItemResponse[];
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
      const sortedChildren = item.children ? [...item.children].sort((a, b) => a.order - b.order) : [];
      const dropdownChildren =
        sortedChildren.length > 0
          ? sortedChildren.map((child) => ({
              href: child.href,
              label: getBilingualText(child.title_uz, child.title_ru, displayLocale),
            }))
          : item.href === '/catalog'
            ? catalogMenuItems
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

  return (
    <header className="border-b shadow-sm">
      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-3xl font-semibold tracking-tight text-brand-primary">
              Acoustic
            </Link>
            <span className="text-xs font-medium text-muted-foreground" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Центр слуха с 2008 года' : '2008 yildan beri eshitish markazi'}
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 md:max-w-xl">
            <div className="relative">
              <input
                type="search"
                placeholder={displayLocale === 'ru' ? 'Поиск' : 'Qidiruv'}
                className="w-full rounded-full border border-border/60 bg-white px-10 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                suppressHydrationWarning
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="tel:+998712021441"
              className="hidden items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-primary/90 md:inline-flex"
            >
              <Phone size={16} /> 1385
            </Link>
            <LanguageSwitcher />
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
      </div>

      <div className="bg-brand-primary">
        <div className="mx-auto hidden max-w-6xl items-center px-4 md:px-6 lg:flex">
          <nav key={`nav-${displayLocale}`} className="flex w-full items-stretch">
            {navItems.map((item, index) => {
              const borderClass = index === 0 ? '' : 'border-l border-white/20';
              // Use locale in key to force remount when locale changes

              if (item.type === 'dropdown') {
                return (
                  <div key={`${item.href}-${displayLocale}`} className={`group relative flex-1 ${borderClass}`}>
                    <Link
                      href={item.href}
                      className="flex h-full w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      {item.icon}
                      <span suppressHydrationWarning>{item.label}</span>
                      <ChevronDown className="h-3 w-3 transition group-hover:rotate-180" />
                    </Link>
                    <div className="pointer-events-none absolute left-0 top-full z-30 hidden min-w-[220px] translate-y-2 flex-col gap-1 rounded-b-3xl border border-brand-primary/30 bg-white/95 p-3 text-brand-accent shadow-lg group-hover:pointer-events-auto group-hover:flex">
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
            })}
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
            {navItems.map((item) => {
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
            })}
            <LanguageSwitcherMobile />
          </nav>
        )}
      </div>
    </header>
  );
}
