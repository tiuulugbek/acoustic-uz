"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SiteHeader;
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const lucide_react_1 = require("lucide-react");
const api_1 = require("@/lib/api");
// Removed DEFAULT_MENUS fallback - frontend fully depends on backend
const language_switcher_1 = __importStar(require("@/components/language-switcher"));
const locale_1 = require("@/lib/locale");
const locale_client_1 = require("@/lib/locale-client");
const image_utils_1 = require("@/lib/image-utils");
// Removed fallback catalog menu - frontend fully depends on backend
// Helper to get locale from DOM (available on client)
// ALWAYS prioritizes DOM attributes over cookies to prevent reverting to stale values
function getLocaleFromDOM() {
    if (typeof document === 'undefined')
        return locale_1.DEFAULT_LOCALE;
    // Priority 1: Read from HTML data attribute (set by server) - MOST RELIABLE
    // This is set in layout.tsx and reflects the actual server-detected locale
    const htmlLocale = document.documentElement.getAttribute('data-locale');
    if (htmlLocale === 'ru' || htmlLocale === 'uz') {
        return htmlLocale;
    }
    // Priority 2: Read from window.__NEXT_LOCALE__ (set by inline script before React)
    // This is set by the server and matches the data-locale attribute
    if (typeof window !== 'undefined' && window.__NEXT_LOCALE__) {
        const locale = window.__NEXT_LOCALE__;
        if (locale === 'ru' || locale === 'uz') {
            return locale;
        }
    }
    // Priority 3: Read from cookie ONLY as last resort
    // We don't trust cookies if DOM attributes are missing, as they might be stale
    // But we need a fallback for the initial render before server sets DOM attributes
    const cookieLocale = (0, locale_client_1.getLocaleFromCookie)();
    if (cookieLocale && cookieLocale !== locale_1.DEFAULT_LOCALE) {
        console.warn('[SiteHeader] ⚠️ Using cookie locale (DOM attribute missing):', cookieLocale);
        return cookieLocale;
    }
    return locale_1.DEFAULT_LOCALE;
}
function SiteHeader({ initialSettings = null } = {}) {
    const queryClient = (0, react_query_1.useQueryClient)();
    // CRITICAL: Read initial locale from DOM synchronously - this must match server render
    // The server sets data-locale="ru" on <html>, which is available BEFORE React hydrates
    // We MUST read it synchronously here to avoid hydration mismatch
    const getInitialLocale = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return locale_1.DEFAULT_LOCALE; // SSR fallback
        }
        // Read from data-locale attribute (set by server) - this is the source of truth
        // It's set in layout.tsx before React loads, so it's always available
        const htmlLocale = document.documentElement.getAttribute('data-locale');
        if (htmlLocale === 'ru' || htmlLocale === 'uz') {
            console.log('[SiteHeader] ✅ Initial locale from data-locale:', htmlLocale);
            return htmlLocale;
        }
        // Fallback to window.__NEXT_LOCALE__ (set by inline script)
        if (window.__NEXT_LOCALE__) {
            const windowLocale = window.__NEXT_LOCALE__;
            if (windowLocale === 'ru' || windowLocale === 'uz') {
                console.log('[SiteHeader] ✅ Initial locale from window.__NEXT_LOCALE__:', windowLocale);
                return windowLocale;
            }
        }
        // Last resort: cookie (but this should rarely be needed)
        const cookieLocale = (0, locale_client_1.getLocaleFromCookie)();
        console.log('[SiteHeader] ⚠️ Using fallback locale from cookie:', cookieLocale);
        return cookieLocale;
    };
    const [displayLocale, setDisplayLocale] = (0, react_1.useState)(getInitialLocale);
    const [mobileOpen, setMobileOpen] = (0, react_1.useState)(false);
    const [menuRefreshKey, setMenuRefreshKey] = (0, react_1.useState)(0);
    const [openDropdown, setOpenDropdown] = (0, react_1.useState)(null);
    const [mobileOpenDropdown, setMobileOpenDropdown] = (0, react_1.useState)(null);
    // Track if we've successfully switched locale to prevent reverting
    const [localeChangeInProgress, setLocaleChangeInProgress] = (0, react_1.useState)(false);
    const consecutiveChecksRef = (0, react_1.useRef)({ locale: null, count: 0 });
    // Watch for locale changes AFTER initial render (e.g., after language switch)
    // Note: Initial locale is set correctly in useState above to match server render
    (0, react_1.useEffect)(() => {
        const LOCALE_STABLE_CHECKS = 2; // Require 2 consecutive checks to confirm locale change
        const checkLocaleChange = () => {
            if (typeof document === 'undefined')
                return;
            const domLocale = getLocaleFromDOM();
            // Only update if locale is actually different AND stable
            // This prevents reverting back due to race conditions or stale cookie reads
            if (domLocale !== displayLocale) {
                // Track consecutive checks for the same new locale
                if (consecutiveChecksRef.current.locale === domLocale) {
                    consecutiveChecksRef.current.count++;
                }
                else {
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
                }
                else {
                    console.log('[SiteHeader] 🔍 Locale change detected but waiting for confirmation:', domLocale, `(${consecutiveChecksRef.current.count}/${LOCALE_STABLE_CHECKS})`);
                }
            }
            else {
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
            const hasLocaleChange = mutations.some(m => m.type === 'attributes' &&
                m.attributeName === 'data-locale' &&
                m.target.getAttribute('data-locale') !== displayLocale);
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
    const { data: settings, isLoading: isLoadingSettings } = (0, react_query_1.useQuery)({
        queryKey: ['settings', displayLocale],
        queryFn: () => (0, api_1.getSettings)(displayLocale),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false,
        throwOnError: false,
        refetchOnMount: 'always', // Always refetch on mount to ensure logo is loaded
        placeholderData: (previousData) => previousData || initialSettings, // Use initialSettings as placeholder
        initialData: initialSettings, // Use server-side fetched settings as initial data
    });
    const { data: catalogsData, isLoading: isLoadingCatalogs } = (0, react_query_1.useQuery)({
        queryKey: ['catalogs', displayLocale, menuRefreshKey],
        queryFn: async () => {
            const timestamp = new Date().toISOString();
            const currentLocale = displayLocale || getLocaleFromDOM(); // Ensure we always have a locale
            console.log(`[SiteHeader] 🔄 [${timestamp}] Fetching catalogs with locale: ${currentLocale} (displayLocale: ${displayLocale})`);
            const result = await (0, api_1.getCatalogs)(currentLocale);
            console.log(`[SiteHeader] ✅ [${timestamp}] Received catalogs:`, result?.length || 0);
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
    const catalogMenuItems = (0, react_1.useMemo)(() => {
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
    const { data: headerMenu, refetch: refetchMenu, isLoading: isLoadingMenu } = (0, react_query_1.useQuery)({
        queryKey: ['menu', 'header', displayLocale, menuRefreshKey],
        queryFn: async () => {
            const timestamp = new Date().toISOString();
            const currentLocale = displayLocale || getLocaleFromDOM(); // Ensure we always have a locale
            console.log(`[SiteHeader] 🔄 [${timestamp}] Fetching menu with locale: ${currentLocale} (displayLocale: ${displayLocale})`);
            const result = await (0, api_1.getMenu)('header', currentLocale);
            console.log(`[SiteHeader] ✅ [${timestamp}] Received menu:`, result ? `${result.items?.length || 0} items` : 'null');
            if (result?.items) {
                result.items.forEach((item, i) => {
                    console.log(`[SiteHeader]   Menu item ${i + 1}: ${item.title_uz} / ${item.title_ru} (locale: ${currentLocale})`);
                });
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
    // Log menu data when it changes
    (0, react_1.useEffect)(() => {
        if (headerMenu) {
            console.log('[SiteHeader] Menu data received:', headerMenu);
        }
    }, [headerMenu]);
    // Optimized: Only refetch when locale actually changes
    // Since locale is in queryKey, React Query will automatically use different cache entries
    const refetchTimeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (displayLocale && !localeChangeInProgress) {
            // Clear any pending refetch
            if (refetchTimeoutRef.current) {
                clearTimeout(refetchTimeoutRef.current);
            }
            // Only invalidate queries for the OLD locale, not all queries
            // This preserves cache for other locales and improves performance
            const oldLocale = displayLocale === 'uz' ? 'ru' : 'uz';
            queryClient.invalidateQueries({ queryKey: ['menu', 'header', oldLocale] });
            queryClient.invalidateQueries({ queryKey: ['catalogs', oldLocale] });
            // Increment refresh key to trigger refetch with new locale
            setMenuRefreshKey(prev => prev + 1);
            // Refetch with new locale (queryKey includes displayLocale, so it will fetch fresh data)
            refetchTimeoutRef.current = setTimeout(() => {
                console.log('[SiteHeader] ✅ Refetching menu with locale:', displayLocale);
                refetchMenu();
                queryClient.refetchQueries({ queryKey: ['catalogs', displayLocale] });
                refetchTimeoutRef.current = null;
            }, 50); // Reduced delay for faster response
        }
        return () => {
            if (refetchTimeoutRef.current) {
                clearTimeout(refetchTimeoutRef.current);
                refetchTimeoutRef.current = null;
            }
        };
    }, [displayLocale, refetchMenu, queryClient, localeChangeInProgress]);
    const headerMenuItems = (0, react_1.useMemo)(() => {
        if (headerMenu?.items?.length) {
            return [...headerMenu.items].sort((a, b) => a.order - b.order);
        }
        // No fallback - return empty array if backend is unavailable
        return [];
    }, [headerMenu, displayLocale]); // Add displayLocale to dependencies to ensure recalculation
    const iconMap = {
        '/services': lucide_react_1.Stethoscope,
        '/catalog': lucide_react_1.MenuSquare,
        '/doctors': lucide_react_1.UserRound,
        '/patients': lucide_react_1.HeartPulse,
        '/children-hearing': lucide_react_1.Baby,
        '/about': lucide_react_1.Info,
        '/branches': lucide_react_1.MapPin,
    };
    const getIconForHref = (href) => {
        const IconComponent = iconMap[href];
        if (!IconComponent) {
            return <lucide_react_1.MenuSquare className="h-4 w-4"/>;
        }
        return <IconComponent className="h-4 w-4"/>;
    };
    const navItems = (0, react_1.useMemo)(() => {
        console.log('[SiteHeader] Building navItems with locale:', displayLocale);
        const items = headerMenuItems.map((item) => {
            const label = (0, locale_1.getBilingualText)(item.title_uz, item.title_ru, displayLocale);
            console.log('[SiteHeader] Menu item:', { title_uz: item.title_uz, title_ru: item.title_ru, locale: displayLocale, label });
            // For /catalog, always use catalogs instead of menu children (categories are only for filters)
            const dropdownChildren = item.href === '/catalog'
                ? catalogMenuItems
                : item.children && item.children.length > 0
                    ? item.children
                        .sort((a, b) => a.order - b.order)
                        .map((child) => ({
                        href: child.href,
                        label: (0, locale_1.getBilingualText)(child.title_uz, child.title_ru, displayLocale),
                    }))
                    : [];
            if (dropdownChildren.length > 0) {
                return {
                    type: 'dropdown',
                    href: item.href,
                    label,
                    icon: getIconForHref(item.href),
                    children: dropdownChildren,
                };
            }
            return {
                type: 'link',
                href: item.href,
                label,
                icon: getIconForHref(item.href),
            };
        });
        console.log('[SiteHeader] navItems built with locale:', displayLocale, 'Items count:', items.length);
        return items;
    }, [headerMenuItems, catalogMenuItems, displayLocale]);
    // Log current state for debugging
    (0, react_1.useEffect)(() => {
        console.log('[SiteHeader] Current state:', {
            displayLocale,
            menuRefreshKey,
            hasMenuData: !!headerMenu,
            menuItemsCount: headerMenu?.items?.length || 0,
            navItemsCount: navItems.length,
        });
    }, [displayLocale, menuRefreshKey, headerMenu, navItems.length]);
    return (<header className="border-b shadow-sm" key={`header-${displayLocale}-${menuRefreshKey}`}>
      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          {/* Logo - Left */}
          <div className="flex items-center">
            <link_1.default href="/" className="flex items-center">
              {settings?.logo?.url ? (<image_1.default src={(0, image_utils_1.normalizeImageUrl)(settings.logo.url)} alt={settings.logo.alt_uz || settings.logo.alt_ru || 'Acoustic'} width={120} height={40} className="h-auto w-auto object-contain" style={{ maxHeight: '40px' }} priority unoptimized/>) : (<span className="text-xl font-semibold tracking-tight text-brand-primary md:text-3xl">
                  Acoustic
                </span>)}
            </link_1.default>
          </div>

          {/* Search Bar - Center (desktop only) */}
          <div className="hidden flex-1 md:block">
            <form action="/search" method="get" className="relative max-w-md mx-auto" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const query = formData.get('q');
            if (query && query.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            }
        }}>
              <input type="search" name="q" placeholder={displayLocale === 'ru' ? 'Поиск' : 'Qidiruv'} className="w-full rounded-full border border-border/60 bg-white px-10 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40" suppressHydrationWarning/>
              <lucide_react_1.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
            </form>
          </div>

          {/* Right side - Phone, Language, Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Phone - Mobile only */}
            <link_1.default href={`tel:${settings?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}`} className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-brand-primary/90 md:hidden">
              <lucide_react_1.Phone size={14}/> {settings?.phonePrimary || '1385'}
            </link_1.default>
            
            {/* Phone - Desktop */}
            <link_1.default href={`tel:${settings?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}`} className="hidden items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-primary/90 md:inline-flex">
              <lucide_react_1.Phone size={16}/> {settings?.phonePrimary || '1385'}
            </link_1.default>
            
            <language_switcher_1.default />
            
            {/* Mobile Menu Button */}
            <button type="button" className="inline-flex items-center rounded-full border border-border p-2 text-muted-foreground lg:hidden" onClick={() => {
            const newValue = !mobileOpen;
            setMobileOpen(newValue);
            if (!newValue) {
                // Close dropdown when closing mobile menu
                setMobileOpenDropdown(null);
            }
        }} aria-label="Toggle navigation">
              <lucide_react_1.Menu size={20}/>
            </button>
          </div>
        </div>
        
        {/* Search Bar - Mobile only (below header) */}
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <form action="/search" method="get" className="relative" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const query = formData.get('q');
            if (query && query.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            }
        }}>
            <input type="search" name="q" placeholder={displayLocale === 'ru' ? 'Поиск' : 'Qidiruv'} className="w-full rounded-full border border-border/60 bg-white px-10 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40" suppressHydrationWarning/>
            <lucide_react_1.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          </form>
        </div>
      </div>

      <div className="bg-brand-primary">
        <div className="mx-auto hidden max-w-6xl items-center px-4 md:px-6 lg:flex">
          <nav key={`nav-${displayLocale}`} className="flex w-full items-stretch min-h-[52px]">
            {navItems.length === 0 && (isLoadingMenu || isLoadingCatalogs) && !headerMenu ? (
        // Show skeleton menu items while loading to maintain layout (only if no cached data)
        Array.from({ length: 6 }).map((_, index) => (<div key={`skeleton-${index}`} className={`flex-1 animate-pulse ${index > 0 ? 'border-l border-white/20' : ''}`}>
                  <div className="flex h-full w-full items-center justify-center gap-2 px-4 py-3">
                    <div className="h-4 w-20 rounded bg-white/20"></div>
                  </div>
                </div>))) : (navItems.map((item, index) => {
            const borderClass = index === 0 ? '' : 'border-l border-white/20';
            // Use locale in key to force remount when locale changes
            if (item.type === 'dropdown') {
                const isOpen = openDropdown === item.href;
                return (<div key={`${item.href}-${displayLocale}`} className={`group relative flex-1 ${borderClass}`} onMouseEnter={() => setOpenDropdown(item.href)} onMouseLeave={() => setOpenDropdown(null)}>
                    <link_1.default href={item.href} className="flex h-full w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                      {item.icon}
                      <span suppressHydrationWarning>{item.label}</span>
                      <lucide_react_1.ChevronDown className={`h-3 w-3 transition ${isOpen ? 'rotate-180' : ''}`}/>
                    </link_1.default>
                    <div className={`absolute left-0 top-full z-30 min-w-[220px] flex-col gap-1 rounded-b-3xl border border-brand-primary/30 bg-white/95 p-3 text-brand-accent shadow-lg ${isOpen ? 'flex' : 'hidden'}`} style={{ marginTop: '-1px' }}>
                      {item.children.length > 0 ? (item.children.map((child) => (<link_1.default key={`${child.href}-${displayLocale}`} href={child.href} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand-accent transition hover:bg-brand-primary/10 hover:text-brand-primary">
                            <lucide_react_1.ShoppingBag className="h-4 w-4 text-brand-primary/70"/>
                            <span suppressHydrationWarning>{child.label}</span>
                          </link_1.default>))) : (<span className="px-3 py-2 text-xs text-muted-foreground" suppressHydrationWarning>
                          {displayLocale === 'ru' ? 'Разделы скоро будут добавлены.' : "Bo'limlar tez orada qo'shiladi."}
                        </span>)}
                    </div>
                  </div>);
            }
            return (<link_1.default key={`${item.href}-${displayLocale}`} href={item.href} className={`${borderClass} flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10`}>
                  {item.icon}
                  <span suppressHydrationWarning>{item.label}</span>
                </link_1.default>);
        }))}
          </nav>
        </div>

        {mobileOpen && (<nav key={`mobile-nav-${displayLocale}`} className="space-y-2 border-t border-white/20 bg-brand-primary px-4 py-4 md:px-6 lg:hidden">
            <link_1.default href="tel:+998712021441" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20" onClick={() => setMobileOpen(false)}>
              <lucide_react_1.Phone size={16}/> 1385
            </link_1.default>
            {navItems.length === 0 && (isLoadingMenu || isLoadingCatalogs) && !headerMenu ? (
            // Show skeleton menu items while loading for mobile (only if no cached data)
            Array.from({ length: 5 }).map((_, index) => (<div key={`mobile-skeleton-${index}`} className="space-y-2 rounded-lg border border-white/20 p-3 animate-pulse">
                  <div className="h-5 w-32 rounded bg-white/20"></div>
                </div>))) : (navItems.map((item) => {
                // Use locale in key to force remount when locale changes
                return item.type === 'dropdown' ? (<div key={`${item.href}-${displayLocale}`} className="space-y-2 rounded-lg border border-white/20 p-3">
                  <button type="button" onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item.href ? null : item.href)} className="flex w-full items-center justify-between gap-2 text-sm font-semibold text-white">
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span suppressHydrationWarning>{item.label}</span>
                    </span>
                    <lucide_react_1.ChevronDown className={`h-3 w-3 transition-transform ${mobileOpenDropdown === item.href ? 'rotate-180' : ''}`}/>
                  </button>
                  {mobileOpenDropdown === item.href && (<div className="space-y-1 pl-6">
                      {item.children.length > 0 ? (item.children.map((child) => (<link_1.default key={`${child.href}-${displayLocale}`} href={child.href} onClick={() => {
                                setMobileOpen(false);
                                setMobileOpenDropdown(null);
                            }} className="block rounded-md px-2 py-1 text-xs text-white/80 transition hover:bg-white/10">
                            <span suppressHydrationWarning>{child.label}</span>
                          </link_1.default>))) : (<span className="block text-xs text-white/60" suppressHydrationWarning>
                          {displayLocale === 'ru' ? 'Разделы скоро будут добавлены.' : "Bo'limlar tez orada qo'shiladi."}
                        </span>)}
                    </div>)}
                </div>) : (<link_1.default key={`${item.href}-${displayLocale}`} href={item.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                  {item.icon}
                  <span suppressHydrationWarning>{item.label}</span>
                </link_1.default>);
            }))}
            <language_switcher_1.LanguageSwitcherMobile />
          </nav>)}
      </div>
    </header>);
}
//# sourceMappingURL=site-header.js.map