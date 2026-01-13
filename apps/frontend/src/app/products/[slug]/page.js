"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = void 0;
exports.generateMetadata = generateMetadata;
exports.default = ProductPage;
const image_1 = __importDefault(require("next/image"));
const script_1 = __importDefault(require("next/script"));
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const api_server_1 = require("@/lib/api-server");
const product_tabs_1 = __importDefault(require("@/components/product-tabs"));
const appointment_form_1 = __importDefault(require("@/components/appointment-form"));
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const sidebar_1 = __importDefault(require("@/components/sidebar"));
const image_utils_1 = require("@/lib/image-utils");
// ISR: Revalidate every hour
exports.revalidate = 3600;
const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;
const availabilityMap = {
    'in-stock': {
        uz: 'Sotuvda',
        ru: 'В наличии',
        schema: 'https://schema.org/InStock',
        color: 'text-green-600 bg-green-50 border border-green-200',
    },
    preorder: {
        uz: 'Buyurtmaga',
        ru: 'Под заказ',
        schema: 'https://schema.org/PreOrder',
        color: 'text-amber-600 bg-amber-50',
    },
    'out-of-stock': {
        uz: 'Tugagan',
        ru: 'Нет в наличии',
        schema: 'https://schema.org/OutOfStock',
        color: 'text-rose-600 bg-rose-50',
    },
};
function formatPrice(price) {
    if (!price)
        return null;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice))
        return null;
    return new Intl.NumberFormat('uz-UZ', {
        style: 'currency',
        currency: 'UZS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
}
function combineBilingual(text1, text2) {
    if (!text1 && !text2)
        return '';
    if (!text1)
        return text2 || '';
    if (!text2)
        return text1;
    return `${text1}\n${text2}`;
}
async function getProductMetadata(slug) {
    try {
        const locale = (0, locale_server_1.detectLocale)();
        const product = await (0, api_server_1.getProductBySlug)(slug, locale);
        if (!product) {
            return {
                title: 'Mahsulot topilmadi — Acoustic.uz',
                description: 'Mahsulot haqida ma\'lumotni hozircha yuklay olmaymiz.',
            };
        }
        const title = (0, locale_1.getBilingualText)(product.name_uz, product.name_ru, locale);
        const description = (0, locale_1.getBilingualText)(product.description_uz ?? product.intro_uz, product.description_ru ?? product.intro_ru, locale);
        return {
            title: `${title} — Acoustic.uz`,
            description: description || undefined,
        };
    }
    catch (error) {
        return {
            title: 'Mahsulot topilmadi — Acoustic.uz',
        };
    }
}
async function generateMetadata({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    const { title, description } = await getProductMetadata(params.slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const productUrl = `${baseUrl}/products/${params.slug}`;
    // Get product for image
    const product = await (0, api_server_1.getProductBySlug)(params.slug, locale);
    const mainImage = product?.galleryUrls?.[0] || product?.brand?.logo?.url || '';
    const imageUrl = mainImage && mainImage.startsWith('http')
        ? mainImage
        : mainImage && mainImage.startsWith('/')
            ? `${baseUrl}${mainImage}`
            : mainImage
                ? `${baseUrl}${mainImage}`
                : `${baseUrl}/logo.png`;
    return {
        title,
        description,
        alternates: {
            canonical: productUrl,
            languages: {
                uz: productUrl,
                ru: productUrl,
                'x-default': productUrl,
            },
        },
        openGraph: {
            title,
            description: description || undefined,
            url: productUrl,
            siteName: 'Acoustic.uz',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: description || undefined,
            images: [imageUrl],
        },
    };
}
function buildJsonLd(product, mainImage, locale) {
    const baseUrl = 'https://acoustic.uz';
    const offers = product.price
        ? {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'UZS',
            availability: product.availabilityStatus
                ? `https://schema.org/${product.availabilityStatus === 'in-stock' ? 'InStock' : product.availabilityStatus === 'preorder' ? 'PreOrder' : 'OutOfStock'}`
                : 'https://schema.org/InStock',
        }
        : undefined;
    const productName = locale === 'ru' ? product.name_ru : product.name_uz;
    const categoryName = locale === 'ru'
        ? product.category?.name_ru
        : product.category?.name_uz;
    return [
        {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productName,
            description: locale === 'ru'
                ? (product.description_ru || product.intro_ru)
                : (product.description_uz || product.intro_uz),
            image: product.galleryUrls?.length ? product.galleryUrls : [mainImage],
            brand: {
                '@type': 'Brand',
                name: product.brand?.name ?? 'Acoustic',
            },
            offers,
            category: categoryName,
            url: `${baseUrl}/products/${product.slug}`,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: locale === 'ru' ? 'Главная' : 'Bosh sahifa',
                    item: baseUrl,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: locale === 'ru' ? 'Каталог' : 'Katalog',
                    item: `${baseUrl}/catalog`,
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: productName,
                    item: `${baseUrl}/products/${product.slug}`,
                },
            ],
        },
    ];
}
function UsefulArticles({ articles, locale }) {
    if (!articles || articles.length === 0)
        return null;
    const isRu = locale === 'ru';
    return (<div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {isRu ? 'Полезные статьи' : 'Foydali maqolalar'}
      </h3>
      <div className="space-y-3">
        {articles.slice(0, 3).map((article) => (<link_1.default key={article.id} href={`/posts/${article.slug}`} className="group flex items-start gap-3 rounded-lg border border-border/60 bg-white p-3 transition hover:border-brand-primary/50 hover:bg-muted/20">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
              {/* Placeholder for article image - can be replaced with actual cover image if available */}
              <div className="flex h-full w-full items-center justify-center">
                <lucide_react_1.ArrowRight className="h-6 w-6 text-muted-foreground"/>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-brand-primary">
                {isRu ? article.title_ru : article.title_uz}
              </p>
              {article.excerpt_uz || article.excerpt_ru ? (<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {isRu ? article.excerpt_ru : article.excerpt_uz}
                </p>) : null}
            </div>
          </link_1.default>))}
      </div>
    </div>);
}
async function ProductPage({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    // Handle errors gracefully - getProductBySlug returns null if backend is down or product not found
    // The api-server wrapper ensures this never throws, so we can safely await it
    const [product, categories, brands, settings] = await Promise.all([
        (0, api_server_1.getProductBySlug)(params.slug, locale),
        (0, api_server_1.getProductCategories)(locale),
        (0, api_server_1.getBrands)(locale),
        (0, api_server_1.getSettings)(locale),
    ]);
    // If product is null, show fallback UI (backend down or product not found)
    // Never crash - always show UI structure
    if (!product) {
        return (<main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Продукт не найден' : 'Mahsulot topilmadi'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ru'
                ? 'К сожалению, мы не можем загрузить информацию о продукте в данный момент.'
                : 'Afsuski, mahsulot haqida ma\'lumotni hozircha yuklay olmaymiz.'}
            </p>
            <link_1.default href="/catalog" className="mt-6 inline-block text-brand-primary hover:underline">
              {locale === 'ru' ? '← Вернуться в каталог' : '← Katalogga qaytish'}
            </link_1.default>
          </div>
        </div>
      </main>);
    }
    const priceFormatted = formatPrice(product.price);
    const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
    // Helper function to normalize image URL with placeholder fallback
    const normalizeImageUrlWithPlaceholder = (url) => {
        const normalized = (0, image_utils_1.normalizeImageUrl)(url);
        return normalized || placeholderImage;
    };
    const mainImage = normalizeImageUrlWithPlaceholder(product.galleryUrls?.[0] ?? product.brand?.logo?.url);
    const gallery = product.galleryUrls?.length
        ? product.galleryUrls.map(normalizeImageUrlWithPlaceholder)
        : product.brand?.logo?.url
            ? [normalizeImageUrlWithPlaceholder(product.brand.logo.url)]
            : [];
    const features = product.features_uz?.length || product.features_ru?.length
        ? [...(product.features_uz || []), ...(product.features_ru || [])].join('\n')
        : '';
    const benefits = product.benefits_uz?.length || product.benefits_ru?.length
        ? [...(product.benefits_uz || []), ...(product.benefits_ru || [])].join('\n')
        : '';
    const isRu = locale === 'ru';
    const tabTitles = {
        description: isRu ? 'Описание' : 'Tavsif',
        tech: isRu ? 'Технологии' : 'Texnologiyalar',
        fitting: isRu ? 'Диапазон настройки' : 'Sozlash diapazoni',
    };
    // Helper function to clean specsText - remove JSON strings
    const cleanSpecsText = (text) => {
        if (!text)
            return null;
        const trimmed = text.trim();
        // Check if it's a JSON string (starts with { or [)
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                JSON.parse(trimmed);
                // If it's valid JSON, return null (don't show it)
                return null;
            }
            catch {
                // If it's not valid JSON, return as is
                return trimmed;
            }
        }
        return trimmed;
    };
    // Helper function to extract tables from HTML and return text without tables
    const extractTablesAndText = (html) => {
        if (!html)
            return { text: null, tables: null };
        const trimmed = html.trim();
        if (!trimmed)
            return { text: null, tables: null };
        // Extract all table elements
        const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
        const tables = [];
        let text = trimmed;
        let match;
        while ((match = tableRegex.exec(trimmed)) !== null) {
            tables.push(match[0]);
            text = text.replace(match[0], '');
        }
        // Also remove other HTML tags and clean up
        text = text
            .replace(/<[^>]+>/g, '') // Remove all HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x2122;/g, '™') // Replace trademark symbol
            .replace(/\s+/g, ' ')
            .trim();
        // Check if text looks like just a list of technical terms (no sentences, just words separated by spaces)
        // This pattern matches the repetitive content the user mentioned
        const isTechnicalWordList = !text.includes('.') && !text.includes('!') && !text.includes('?') &&
            text.split(' ').length > 15 &&
            /(Chastota|Kanallarni|Transient|Feedback|Sozlamalar|Adaptation|Formulalarni|konfiguratsiya|variant|Neyron|shovqinni|dB|kHz|baholovchi|Tinnitus|SoundSupport|OWN|Configurations|MoreSound|Amplifier|Optimizer|Speech|Rescue|VAC|NAL|DSL|Intelligence|Spatial|Sound)/i.test(text);
        // If text is empty, very short, or looks like just a list of words (no sentences), return null
        // Check if it looks like a meaningful description (has periods, or is longer than 100 chars with proper sentences)
        const hasSentences = text.includes('.') || text.includes('!') || text.includes('?');
        const isLongEnough = text.length > 100;
        // Also check if it's just a list of words separated by spaces (no punctuation, no proper sentences)
        const isJustWordList = !hasSentences && text.split(' ').length > 10 && text.length < 200;
        // If text is too short (less than 30 chars) and has no sentences, it's probably not meaningful
        const isTooShort = text.length < 30 && !hasSentences;
        // If it's a technical word list (like the repetitive content), return null for text (only return tables)
        const finalText = (!text || (!hasSentences && !isLongEnough) || isJustWordList || isTooShort || isTechnicalWordList) ? null : text;
        // Combine all tables
        const combinedTables = tables.length > 0 ? tables.join('\n\n') : null;
        return { text: finalText, tables: combinedTables };
    };
    // Description tab - use full HTML content (including tables)
    // This will be shown in the "Tavsif" tab
    const descriptionPrimary = isRu
        ? product.description_ru ?? product.description_uz ?? null
        : product.description_uz ?? product.description_ru ?? null;
    const descriptionSecondary = isRu
        ? product.description_uz ?? null
        : product.description_ru ?? null;
    const hasDescription = Boolean(descriptionPrimary || descriptionSecondary);
    // For tech tab, combine specsText with tech fields (but NOT description tables)
    // Description tables should only appear in "Tavsif" tab
    const techTablesParts = [
        cleanSpecsText(product.specsText),
        product.tech_ru,
        product.tech_uz,
    ].filter((part) => Boolean(part));
    const techTables = techTablesParts.length > 0 ? techTablesParts.join('\n\n') : null;
    // Tabs - description, tech, and fitting range
    const productTabs = [
        // Description tab (first, if available)
        ...(hasDescription ? [{
                key: 'description',
                title: tabTitles.description,
                primary: descriptionPrimary,
                secondary: descriptionSecondary,
            }] : []),
        // Technologies tab
        {
            key: 'tech',
            title: tabTitles.tech,
            primary: isRu
                ? product.tech_ru ?? techTables ?? null
                : product.tech_uz ?? techTables ?? null,
            secondary: isRu ? product.tech_uz ?? null : product.tech_ru ?? null,
        },
        // Fitting range tab
        {
            key: 'fitting',
            title: tabTitles.fitting,
            primary: isRu ? product.fittingRange_ru ?? null : product.fittingRange_uz ?? null,
            secondary: isRu ? product.fittingRange_uz ?? null : product.fittingRange_ru ?? null,
        },
    ];
    const jsonLd = buildJsonLd(product, mainImage, locale);
    return (<main className="min-h-screen bg-background">
      {Array.isArray(jsonLd) ? (jsonLd.map((schema, index) => (<script_1.default key={index} id={`product-jsonld-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>))) : (<script_1.default id="product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>)}
      
      {/* Breadcrumbs */}
      <section className="bg-[hsl(var(--secondary))]">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 text-xs font-semibold uppercase tracking-wide text-white sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2">
            <link_1.default href="/" className="hover:text-white/80 text-white/70" suppressHydrationWarning>
              {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
            </link_1.default>
            <span className="mx-1 sm:mx-2">›</span>
            <link_1.default href="/catalog" className="hover:text-white/80 text-white/70" suppressHydrationWarning>
              {locale === 'ru' ? 'Каталог' : 'Katalog'}
            </link_1.default>
            <span className="mx-1 sm:mx-2">›</span>
            <span className="text-white" suppressHydrationWarning>{(0, locale_1.getBilingualText)(product.name_uz, product.name_ru, locale)}</span>
          </div>
        </div>
      </section>

      {/* Main Content - Compact layout */}
      <section className="bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {/* 2-Column Layout: Main Content | Sidebar */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            {/* Left Column: Main Content (Title + Image + Info + Tabs) */}
            <div className="space-y-6">
              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words" suppressHydrationWarning>
                {(0, locale_1.getBilingualText)(product.name_uz, product.name_ru, locale)}
              </h1>

              {/* Product Header: Image + Product Info */}
              <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                {/* Column 1: Image */}
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white border border-border/40">
                    <image_1.default src={mainImage} alt={(0, locale_1.getBilingualText)(product.name_uz, product.name_ru, locale)} fill sizes="280px" className="object-contain p-4" priority unoptimized/>
                  </div>

                  {/* Gallery - Compact */}
                  {gallery.length > 1 && (<div className="grid grid-cols-4 gap-1.5">
                      {gallery.slice(1, 5).map((image, index) => (<div key={index} className="relative aspect-square w-full overflow-hidden rounded bg-white border border-border/40">
                          <image_1.default src={image} alt={`${(0, locale_1.getBilingualText)(product.name_uz, product.name_ru, locale)} ${index + 2}`} fill sizes="(max-width: 1024px) 25vw, 60px" className="object-contain p-1" unoptimized/>
                        </div>))}
                    </div>)}
                </div>

                {/* Column 2: Product Info */}
                <div className="space-y-2">
                  {product.brand && (<p className="text-sm text-muted-foreground">
                      <span className="font-bold">{isRu ? 'Производитель' : 'Ishlab chiqaruvchi'}:</span> {product.brand.name}
                    </p>)}
                  {availability && (<p className="text-sm text-muted-foreground">
                      <span className="font-bold">{isRu ? 'Наличие' : 'Mavjudlik'}:</span>{' '}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${availability.color}`}>
                        {isRu ? availability.ru : availability.uz}
                      </span>
                    </p>)}
                  {priceFormatted && (<p className="text-base font-semibold text-foreground">
                      <span className="font-bold">{isRu ? 'Цена' : 'Narx'}:</span> {priceFormatted}
                    </p>)}
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold">{isRu ? 'Способ оплаты' : 'To\'lov turi'}:</span>{' '}
                    {isRu ? 'Наличными, картой Visa/MasterCard' : 'Naqd pul, Visa/MasterCard kartasi'}
                  </p>
                  <appointment_form_1.default locale={locale} doctorId={null} source={`product-${product.slug}`}/>
                </div>
              </div>

              {/* Tabs - Below image and product info */}
              <div>
                <product_tabs_1.default tabs={productTabs}/>
              </div>
            </div>

            {/* Right Column: Sidebar (Sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <sidebar_1.default locale={locale} settingsData={settings} brandsData={brands} pageType="products"/>
              </div>
            </div>
          </div>

          {/* Sidebar - Mobile (after product info and tabs) */}
          <div className="mt-6 lg:hidden">
            <sidebar_1.default locale={locale} settingsData={settings} brandsData={brands} pageType="products"/>
          </div>

          {/* Product Categories - Mobile (always shown, independent of sidebar) */}
          <div className="mt-6 space-y-6 xl:hidden">
            {/* Product Categories */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {isRu ? 'Каталог слуховых аппаратов' : 'Eshitish apparatlari katalogi'}
                </h3>
                <div className="space-y-2">
                  {categories.slice(0, 1).map((category) => (<link_1.default key={category.id} href={`/catalog/${category.slug}`} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white">
                      {category.image?.url ? (<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                          <image_1.default src={category.image.url} alt={(0, locale_1.getBilingualText)(category.name_uz, category.name_ru, locale)} fill sizes="40px" className="object-contain p-1"/>
                        </div>) : (<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                          <lucide_react_1.ArrowRight className="h-5 w-5 text-muted-foreground"/>
                        </div>)}
                      <span className="text-sm text-foreground">
                        {(0, locale_1.getBilingualText)(category.name_uz, category.name_ru, locale)}
                      </span>
                    </link_1.default>))}
                  
                  {/* Additional Category Links */}
                  <link_1.default href="/catalog?categoryId=batteries" className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                      <div className="h-6 w-4 rounded-sm border-2 border-foreground/30"></div>
                    </div>
                    <span className="text-sm text-foreground">
                      {isRu ? 'Батарейки для слуховых аппаратов' : 'Eshitish apparatlari uchun batareyalar'}
                    </span>
                  </link_1.default>
                  
                  <link_1.default href="/catalog?categoryId=care" className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                      <div className="h-5 w-5 rounded border border-foreground/30"></div>
                    </div>
                    <span className="text-sm text-foreground">
                      {isRu ? 'Средства по уходу' : 'Parvarish vositalari'}
                    </span>
                  </link_1.default>
                  
                  <link_1.default href="/catalog?categoryId=accessories" className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                      <div className="h-6 w-4 rounded border border-foreground/30"></div>
                    </div>
                    <span className="text-sm text-foreground">
                      {isRu ? 'Беспроводные аксессуары' : 'Simsiz aksessuarlar'}
                    </span>
                  </link_1.default>
                </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (<div className="space-y-3">
                  <div className="space-y-2">
                    {brands.slice(0, 3).map((brand) => (<link_1.default key={brand.id} href={`/catalog?brandId=${brand.id}`} className="block rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white">
                        {brand.logo?.url ? (<div className="relative h-10 w-full">
                            <image_1.default src={brand.logo.url} alt={brand.name} fill sizes="200px" className="object-contain"/>
                          </div>) : (<span className="text-sm font-medium text-foreground">{brand.name}</span>)}
                      </link_1.default>))}
                  </div>
              </div>)}

            {/* Useful Articles */}
            {product.usefulArticles && product.usefulArticles.length > 0 && (<div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-2">
                    {isRu ? 'Полезные статьи' : 'Foydali maqolalar'}
                  </h3>
                  <div className="space-y-3">
                    {product.usefulArticles.slice(0, 2).map((article) => (<link_1.default key={article.id} href={`/posts/${article.slug}`} className="group flex items-start gap-3 rounded-lg transition hover:opacity-80">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                          {/* Placeholder for article image */}
                          <div className="flex h-full w-full items-center justify-center">
                            <lucide_react_1.ArrowRight className="h-6 w-6 text-muted-foreground"/>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-brand-primary group-hover:underline">
                            {isRu ? article.title_ru : article.title_uz}
                          </p>
                        </div>
                      </link_1.default>))}
                  </div>
              </div>)}
          </div>
        </div>
      </section>

    </main>);
}
//# sourceMappingURL=page.js.map