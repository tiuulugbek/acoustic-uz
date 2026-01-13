"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = RootLayout;
const script_1 = __importDefault(require("next/script"));
require("./globals.css");
const providers_1 = require("./providers");
const site_header_1 = __importDefault(require("@/components/site-header"));
const site_footer_1 = __importDefault(require("@/components/site-footer"));
const telegram_button_1 = __importDefault(require("@/components/telegram-button"));
const locale_server_1 = require("@/lib/locale-server");
const api_server_1 = require("@/lib/api-server");
const image_utils_1 = require("@/lib/image-utils");
// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the layout with a stale locale
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata() {
    const locale = (0, locale_server_1.detectLocale)();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    // Get favicon from settings
    let faviconUrl = '/favicon.ico';
    try {
        const settings = await (0, api_server_1.getSettings)(locale);
        if (settings?.favicon?.url) {
            faviconUrl = (0, image_utils_1.normalizeImageUrl)(settings.favicon.url) || '/favicon.ico';
        }
    }
    catch (error) {
        // Use default favicon if settings fetch fails
        console.error('[Layout] Failed to fetch favicon:', error);
    }
    return {
        title: 'Acoustic.uz - Eshitish markazi',
        description: 'Eshitish qobiliyatini tiklash va yaxshilash markazi',
        alternates: {
            languages: {
                uz: 'uz',
                ru: 'ru',
                'x-default': 'uz',
            },
        },
        icons: {
            icon: faviconUrl,
            shortcut: faviconUrl,
            apple: faviconUrl,
        },
    };
}
async function RootLayout({ children, }) {
    // Always detect locale from cookies on every request
    // This ensures the locale is always current, even after switching languages
    // Wrap in try-catch to handle any edge cases gracefully
    let locale = 'uz'; // Default fallback
    try {
        locale = (0, locale_server_1.detectLocale)();
    }
    catch (error) {
        // If locale detection fails, use default
        // This should never happen due to try-catch in detectLocale, but adding extra safety
        console.error('[Layout] Failed to detect locale, using default:', error);
        locale = 'uz';
    }
    // Fetch settings server-side to ensure logo is available immediately
    let settings = null;
    try {
        settings = await (0, api_server_1.getSettings)(locale);
    }
    catch (error) {
        console.error('[Layout] Failed to fetch settings:', error);
        // Continue without settings - SiteHeader will handle fallback
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const phonePrimary = settings?.phonePrimary || '+998-71-202-1441';
    const phoneSecondary = settings?.phoneSecondary || phonePrimary;
    const logoUrl = settings?.logo?.url
        ? (settings.logo.url.startsWith('http')
            ? settings.logo.url
            : `${baseUrl}${settings.logo.url}`)
        : `${baseUrl}/logo.png`;
    const faviconUrl = settings?.favicon?.url
        ? (settings.favicon.url.startsWith('http')
            ? settings.favicon.url
            : `${baseUrl}${settings.favicon.url}`)
        : `${baseUrl}/favicon.ico`;
    // Organization structured data
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Acoustic.uz',
        url: baseUrl,
        logo: logoUrl,
        description: locale === 'ru'
            ? 'Центр диагностики и коррекции слуха в Узбекистане'
            : 'O\'zbekistondagi eshitish diagnostikasi va korreksiyasi markazi',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: phoneSecondary.replace(/\s/g, ''),
            contactType: 'customer service',
            areaServed: 'UZ',
            availableLanguage: ['uz', 'ru'],
        },
        sameAs: [
            'https://www.facebook.com/acoustic.uz',
            'https://www.instagram.com/acoustic.uz/',
            'https://www.youtube.com/@acousticuz',
        ],
    };
    return (<html lang={locale} suppressHydrationWarning data-locale={locale}>
      <head>
        <script_1.default id="organization-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}/>
      </head>
      <body className="font-sans">
        <providers_1.Providers>
          {/* Set locale in window before children render - this script runs synchronously */}
          {/* CRITICAL: This value MUST be set before React hydrates to prevent hydration mismatch */}
          <script dangerouslySetInnerHTML={{
            __html: `
                window.__NEXT_LOCALE__='${locale}';
                console.log('[Layout Script] Set initial locale:', '${locale}');
              `,
        }}/>
          <div className="flex min-h-screen flex-col bg-muted/20">
            <site_header_1.default initialSettings={settings}/>
            <main className="flex-1">{children}</main>
            <site_footer_1.default />
            <telegram_button_1.default />
          </div>
        </providers_1.Providers>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map