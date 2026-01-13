"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SiteFooter;
const link_1 = __importDefault(require("next/link"));
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const react_2 = require("react");
const react_query_1 = require("@tanstack/react-query");
const api_1 = require("@/lib/api");
const locale_client_1 = require("@/lib/locale-client");
const locale_1 = require("@/lib/locale");
// Helper to get locale from DOM (available on client)
function getLocaleFromDOMHelper() {
    if (typeof document === 'undefined')
        return locale_1.DEFAULT_LOCALE;
    // Priority 1: Read from HTML data attribute (set by server) - MOST RELIABLE
    const htmlLocale = document.documentElement.getAttribute('data-locale');
    if (htmlLocale === 'ru' || htmlLocale === 'uz') {
        return htmlLocale;
    }
    // Priority 2: Read from window.__NEXT_LOCALE__ (set by inline script before React)
    if (typeof window !== 'undefined' && window.__NEXT_LOCALE__) {
        const locale = window.__NEXT_LOCALE__;
        if (locale === 'ru' || locale === 'uz') {
            return locale;
        }
    }
    // Priority 3: Read from cookie ONLY as last resort
    const cookieLocale = (0, locale_client_1.getLocaleFromCookie)();
    if (cookieLocale && cookieLocale !== locale_1.DEFAULT_LOCALE) {
        return cookieLocale;
    }
    return locale_1.DEFAULT_LOCALE;
}
function SiteFooter() {
    const queryClient = (0, react_query_1.useQueryClient)();
    // Get initial locale from DOM synchronously - this must match server render
    const getInitialLocale = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return locale_1.DEFAULT_LOCALE; // SSR fallback
        }
        // Read from data-locale attribute (set by server) - this is the source of truth
        const htmlLocale = document.documentElement.getAttribute('data-locale');
        if (htmlLocale === 'ru' || htmlLocale === 'uz') {
            return htmlLocale;
        }
        // Fallback to window.__NEXT_LOCALE__ (set by inline script)
        if (window.__NEXT_LOCALE__) {
            const windowLocale = window.__NEXT_LOCALE__;
            if (windowLocale === 'ru' || windowLocale === 'uz') {
                return windowLocale;
            }
        }
        // Last resort: cookie
        return (0, locale_client_1.getLocaleFromCookie)();
    };
    const [displayLocale, setDisplayLocale] = (0, react_2.useState)(getInitialLocale);
    const [menuRefreshKey, setMenuRefreshKey] = (0, react_2.useState)(0);
    // Track if we've successfully switched locale to prevent reverting
    const [localeChangeInProgress, setLocaleChangeInProgress] = (0, react_2.useState)(false);
    const consecutiveChecksRef = (0, react_2.useRef)({ locale: null, count: 0 });
    // Watch for locale changes AFTER initial render (e.g., after language switch)
    (0, react_2.useEffect)(() => {
        const LOCALE_STABLE_CHECKS = 2; // Require 2 consecutive checks to confirm locale change
        const checkLocaleChange = () => {
            if (typeof document === 'undefined')
                return;
            const domLocale = getLocaleFromDOMHelper();
            // Only update if locale is actually different AND stable
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
            const hasLocaleChange = mutations.some(m => m.type === 'attributes' &&
                m.attributeName === 'data-locale' &&
                m.target.getAttribute('data-locale') !== displayLocale);
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
    const { data: footerMenu, isLoading: isLoadingFooterMenu } = (0, react_query_1.useQuery)({
        queryKey: ['menu', 'footer', displayLocale, menuRefreshKey],
        queryFn: async () => {
            const timestamp = new Date().toISOString();
            const currentLocale = displayLocale || getLocaleFromDOMHelper();
            console.log(`[SiteFooter] 🔄 [${timestamp}] Fetching footer menu with locale: ${currentLocale}`);
            const result = await (0, api_1.getMenu)('footer', currentLocale);
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
    // Fetch settings for social media links
    const { data: settings } = (0, react_query_1.useQuery)({
        queryKey: ['settings'],
        queryFn: api_1.getSettings,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        gcTime: 10 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
        throwOnError: false,
    });
    // Optimized: Only refetch when locale actually changes
    // Since locale is in queryKey, React Query will automatically use different cache entries
    const refetchTimeoutRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
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
    const footerMenuItems = (0, react_2.useMemo)(() => {
        if (footerMenu?.items?.length) {
            return [...footerMenu.items].sort((a, b) => a.order - b.order);
        }
        return [];
    }, [footerMenu, displayLocale]);
    // Split footer items into sections (center links, catalog links, social links)
    // Center links: first 6 items (or all if less than 6)
    // Catalog links: items with href containing '/catalog'
    // Social links: items with external URLs or specific social media links
    const centerLinksList = (0, react_2.useMemo)(() => {
        return footerMenuItems
            .filter(item => !item.href.includes('/catalog') && !item.href.startsWith('http'))
            .slice(0, 6)
            .map(item => ({
            href: item.href,
            label: (0, locale_1.getBilingualText)(item.title_uz, item.title_ru, displayLocale),
        }));
    }, [footerMenuItems, displayLocale]);
    const catalogLinksList = (0, react_2.useMemo)(() => {
        const catalogItems = footerMenuItems
            .filter(item => item.href.includes('/catalog'))
            .map(item => ({
            href: item.href,
            label: (0, locale_1.getBilingualText)(item.title_uz, item.title_ru, displayLocale),
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
    const socialRowLinksList = (0, react_2.useMemo)(() => {
        // First, try to get social links from Settings
        const socialLinksFromSettings = settings?.socialLinks;
        if (socialLinksFromSettings && typeof socialLinksFromSettings === 'object') {
            const links = [];
            // Add "Biz bilan bog'laning" first
            links.push({
                href: '/contact',
                label: displayLocale === 'ru' ? 'Связаться с нами' : "Biz bilan bog'laning"
            });
            // Add social media links from settings in order
            if (socialLinksFromSettings.tiktok) {
                links.push({ href: socialLinksFromSettings.tiktok, label: 'TikTok' });
            }
            if (socialLinksFromSettings.instagram) {
                links.push({ href: socialLinksFromSettings.instagram, label: 'Instagram' });
            }
            if (socialLinksFromSettings.facebook) {
                links.push({ href: socialLinksFromSettings.facebook, label: 'Facebook' });
            }
            if (socialLinksFromSettings.youtube) {
                links.push({ href: socialLinksFromSettings.youtube, label: 'YouTube' });
            }
            if (socialLinksFromSettings.telegram) {
                links.push({ href: socialLinksFromSettings.telegram, label: 'Telegram' });
            }
            // Only return if we have at least one social link
            if (links.length > 1) {
                return links;
            }
        }
        // Fallback: try to get from footer menu
        const socialItems = footerMenuItems.filter(item => item.href.startsWith('http') ||
            item.href.includes('tiktok') ||
            item.href.includes('instagram') ||
            item.href.includes('facebook') ||
            item.href.includes('youtube') ||
            item.href.includes('telegram'));
        if (socialItems.length > 0) {
            return [
                { href: '/contact', label: displayLocale === 'ru' ? 'Связаться с нами' : "Biz bilan bog'laning" },
                ...socialItems.map(item => ({
                    href: item.href,
                    label: (0, locale_1.getBilingualText)(item.title_uz, item.title_ru, displayLocale),
                }))
            ];
        }
        // Final fallback: use default links
        return [
            { href: '/contact', label: displayLocale === 'ru' ? 'Связаться с нами' : "Biz bilan bog'laning" },
            { href: 'https://tiktok.com/@acoustic', label: 'TikTok' },
            { href: 'https://instagram.com/acoustic', label: 'Instagram' },
            { href: 'https://facebook.com/acoustic', label: 'Facebook' },
            { href: 'https://youtube.com/acoustic', label: 'YouTube' },
            { href: 'https://t.me/acoustic', label: 'Telegram' },
        ];
    }, [footerMenuItems, displayLocale, settings]);
    return (<footer className="border-t bg-white" key={`footer-${displayLocale}-${menuRefreshKey}`}>
      {/* Mobile Layout - Two Columns */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:hidden">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Center Info */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Центр хорошего слуха' : 'Acoustic markazi'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {centerLinksList.slice(0, 6).map((item, index) => (<li key={`${item.href}-${index}`}>
                  <link_1.default href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </link_1.default>
                </li>))}
            </ul>
          </div>

          {/* Right Column - Catalog */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Каталог' : 'Katalog'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catalogLinksList.slice(0, 6).map((item, index) => (<li key={`${item.href}-${index}`}>
                  <link_1.default href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </link_1.default>
                </li>))}
            </ul>
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
              {centerLinksList.map((item, index) => (<li key={`${item.href}-${index}`}>
                  <link_1.default href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </link_1.default>
                </li>))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Каталог' : 'Katalog'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catalogLinksList.map((item, index) => (<li key={`${item.href}-${index}`}>
                  <link_1.default href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </link_1.default>
                </li>))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {displayLocale === 'ru' ? 'Контактная информация' : "Aloqa ma'lumotlari"}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <lucide_react_1.Phone size={16} className="text-brand-primary"/>
                <link_1.default href="tel:+998712021441" className="hover:text-brand-primary">
                  +998 71 202 14 41
                </link_1.default>
              </div>
              <div className="flex items-center gap-2">
                <lucide_react_1.Mail size={16} className="text-brand-primary"/>
                <link_1.default href="mailto:info@acoustic.uz" className="hover:text-brand-primary">
                  info@acoustic.uz
                </link_1.default>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links Row */}
      <div className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 text-xs font-semibold text-brand-accent/80 md:px-6">
          {socialRowLinksList.map((item, index) => (<react_1.default.Fragment key={`${item.href}-${index}`}>
              {index > 0 && <span className="text-border/60">|</span>}
              <link_1.default href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                {item.label}
              </link_1.default>
            </react_1.default.Fragment>))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/60 bg-white py-4 text-center text-xs text-muted-foreground" suppressHydrationWarning>
        © {new Date().getFullYear()} Acoustic. {displayLocale === 'ru' ? 'Все права защищены.' : 'Barcha huquqlar himoyalangan.'}
      </div>
    </footer>);
}
//# sourceMappingURL=site-footer.js.map