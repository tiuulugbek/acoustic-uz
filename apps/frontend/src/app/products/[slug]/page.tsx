import Image from 'next/image';
import Script from 'next/script';
// Removed notFound import - we never crash, always show UI
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import {
  type ProductResponse,
  type UsefulArticleSummary,
  type ProductCategoryResponse,
  type BrandResponse,
} from '@/lib/api';
import { getProductBySlug, getProductCategories, getBrands, getSettings } from '@/lib/api-server';
import ProductTabs from '@/components/product-tabs';
import ProductSpecsTable from '@/components/product-specs-table';
import ProductFeaturesList from '@/components/product-features-list';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import Sidebar from '@/components/sidebar';
import { normalizeImageUrl } from '@/lib/image-utils';

// ISR: Revalidate every hour
export const revalidate = 3600;

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

const availabilityMap: Record<string, { uz: string; ru: string; schema: string; color: string }> = {
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

function formatPrice(price: string | number | null | undefined): string | null {
  if (!price) return null;
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return null;
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

function combineBilingual(text1?: string | null, text2?: string | null): string {
  if (!text1 && !text2) return '';
  if (!text1) return text2 || '';
  if (!text2) return text1;
  return `${text1}\n${text2}`;
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProductMetadata(slug: string): Promise<{ title: string; description?: string }> {
  try {
    const locale = detectLocale();
    const product = await getProductBySlug(slug, locale);
    
    if (!product) {
      return {
        title: 'Mahsulot topilmadi — Acoustic.uz',
        description: 'Mahsulot haqida ma\'lumotni hozircha yuklay olmaymiz.',
      };
    }
    
    const title = getBilingualText(product.name_uz, product.name_ru, locale);
    const description = getBilingualText(product.description_uz ?? product.intro_uz, product.description_ru ?? product.intro_ru, locale);
    
    return {
      title: `${title} — Acoustic.uz`,
      description: description || undefined,
    };
  } catch (error) {
    return {
      title: 'Mahsulot topilmadi — Acoustic.uz',
    };
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const { title, description } = await getProductMetadata(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const productUrl = `${baseUrl}/products/${params.slug}`;
  
  // Get product for image
  const product = await getProductBySlug(params.slug, locale);
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

function buildJsonLd(product: ProductResponse, mainImage: string, locale: 'uz' | 'ru') {
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

function UsefulArticles({ articles, locale }: { articles: UsefulArticleSummary[]; locale: 'uz' | 'ru' }) {
  if (!articles || articles.length === 0) return null;
  const isRu = locale === 'ru';

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {isRu ? 'Полезные статьи' : 'Foydali maqolalar'}
      </h3>
      <div className="space-y-3">
        {articles.slice(0, 3).map((article) => (
          <Link
            key={article.id}
            href={`/posts/${article.slug}`}
            className="group flex items-start gap-3 rounded-lg border border-border/60 bg-white p-3 transition hover:border-brand-primary/50 hover:bg-muted/20"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
              {/* Placeholder for article image - can be replaced with actual cover image if available */}
              <div className="flex h-full w-full items-center justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground group-hover:text-brand-primary">
                {isRu ? article.title_ru : article.title_uz}
              </p>
              {article.excerpt_uz || article.excerpt_ru ? (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {isRu ? article.excerpt_ru : article.excerpt_uz}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const locale = detectLocale();
  
  // Handle errors gracefully - getProductBySlug returns null if backend is down or product not found
  // The api-server wrapper ensures this never throws, so we can safely await it
  const [product, categories, brands, settings] = await Promise.all([
    getProductBySlug(params.slug, locale),
    getProductCategories(locale),
    getBrands(locale),
    getSettings(locale),
  ]);

  // If product is null, show fallback UI (backend down or product not found)
  // Never crash - always show UI structure
  if (!product) {
    return (
      <main className="min-h-screen bg-background">
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
            <Link href="/catalog" className="mt-6 inline-block text-brand-primary hover:underline">
              {locale === 'ru' ? '← Вернуться в каталог' : '← Katalogga qaytish'}
            </Link>
          </div>
        </div>
      </main>
    );
  }
  const priceFormatted = formatPrice(product.price);
  const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
  
  // Helper function to normalize image URL with placeholder fallback
  const normalizeImageUrlWithPlaceholder = (url: string | null | undefined): string => {
    const normalized = normalizeImageUrl(url);
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
  const cleanSpecsText = (text?: string | null): string | null => {
    if (!text) return null;
    const trimmed = text.trim();
    // Check if it's a JSON string (starts with { or [)
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        // If it's valid JSON, return null (don't show it)
        return null;
      } catch {
        // If it's not valid JSON, return as is
        return trimmed;
      }
    }
    return trimmed;
  };

  // Helper function to extract tables from HTML and return text without tables
  const extractTablesAndText = (html?: string | null): { text: string | null; tables: string | null } => {
    if (!html) return { text: null, tables: null };
    
    const trimmed = html.trim();
    if (!trimmed) return { text: null, tables: null };
    
    // Extract all table elements
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    const tables: string[] = [];
    let text: string = trimmed;
    
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
    const finalText: string | null = (!text || (!hasSentences && !isLongEnough) || isJustWordList || isTooShort || isTechnicalWordList) ? null : text;
    
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
  ].filter((part): part is string => Boolean(part));
  
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

  return (
    <main className="min-h-screen bg-background">
      {Array.isArray(jsonLd) ? (
        jsonLd.map((schema, index) => (
          <Script
            key={index}
            id={`product-jsonld-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))
      ) : (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      
      {/* Breadcrumbs */}
      <section className="bg-[hsl(var(--secondary))]">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 text-xs font-semibold uppercase tracking-wide text-white sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link href="/" className="hover:text-white/80 text-white/70" suppressHydrationWarning>
              {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
            </Link>
            <span className="mx-1 sm:mx-2">›</span>
            <Link href="/catalog" className="hover:text-white/80 text-white/70" suppressHydrationWarning>
              {locale === 'ru' ? 'Каталог' : 'Katalog'}
            </Link>
            <span className="mx-1 sm:mx-2">›</span>
            <span className="text-white" suppressHydrationWarning>{getBilingualText(product.name_uz, product.name_ru, locale)}</span>
          </div>
        </div>
      </section>

      {/* Header - Compact like services page */}
      <section className="bg-[hsl(var(--secondary))] border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 sm:px-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 break-words" suppressHydrationWarning>
            {getBilingualText(product.name_uz, product.name_ru, locale)}
          </h1>
        </div>
      </section>

      {/* Main Content - Compact layout */}
      <section className="bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {/* Grid Layout: 3 columns - Image | Product Info | Sidebar */}
          <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
            {/* Column 1: Image (Left) */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white border border-border/40">
                <Image
                  src={mainImage}
                  alt={getBilingualText(product.name_uz, product.name_ru, locale)}
                  fill
                  sizes="280px"
                  className="object-contain p-4"
                  priority
                  unoptimized
                />
              </div>

              {/* Gallery - Compact */}
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-1.5">
                  {gallery.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative aspect-square w-full overflow-hidden rounded bg-white border border-border/40">
                      <Image
                        src={image}
                        alt={`${getBilingualText(product.name_uz, product.name_ru, locale)} ${index + 2}`}
                        fill
                        sizes="(max-width: 1024px) 25vw, 60px"
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Product Info + Tabs (Center) */}
            <div className="space-y-6">
              {/* Product Details */}
              <div className="space-y-2">
                {product.brand && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold">{isRu ? 'Производитель' : 'Ishlab chiqaruvchi'}:</span> {product.brand.name}
                  </p>
                )}
                {availability && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold">{isRu ? 'Наличие' : 'Mavjudlik'}:</span>{' '}
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${availability.color}`}>
                      {isRu ? availability.ru : availability.uz}
                    </span>
                  </p>
                )}
                {priceFormatted && (
                  <p className="text-base font-semibold text-foreground">
                    <span className="font-bold">{isRu ? 'Цена' : 'Narx'}:</span> {priceFormatted}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold">{isRu ? 'Способ оплаты' : 'To\'lov turi'}:</span>{' '}
                  {isRu ? 'Наличными, картой Visa/MasterCard' : 'Naqd pul, Visa/MasterCard kartasi'}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-accent"
                >
                  <Phone className="h-4 w-4" />
                  {isRu ? 'Записаться на подбор' : 'Tanlash uchun yozilish'}
                </Link>
              </div>

              {/* Product Tabs - Below Product Info */}
              <div>
                <ProductTabs tabs={productTabs} />
              </div>
            </div>

            {/* Column 3: Sidebar (Right) */}
            <div className="hidden lg:block">
              <Sidebar locale={locale} settingsData={settings} brandsData={brands} pageType="products" />
            </div>
          </div>

          {/* Sidebar - Mobile (after product info and tabs) */}
          <div className="mt-6 lg:hidden">
            <Sidebar locale={locale} settingsData={settings} brandsData={brands} pageType="products" />
          </div>

          {/* Product Categories - Mobile (always shown, independent of sidebar) */}
          <div className="mt-6 space-y-6 xl:hidden">
            {/* Product Categories */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {isRu ? 'Каталог слуховых аппаратов' : 'Eshitish apparatlari katalogi'}
                </h3>
                <div className="space-y-2">
                  {categories.slice(0, 1).map((category) => (
                    <Link
                      key={category.id}
                      href={`/catalog/${category.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                    >
                      {category.image?.url ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                          <Image
                            src={category.image.url}
                            alt={getBilingualText(category.name_uz, category.name_ru, locale)}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm text-foreground">
                        {getBilingualText(category.name_uz, category.name_ru, locale)}
                      </span>
                    </Link>
                  ))}
                  
                  {/* Additional Category Links */}
                  <Link
                    href="/catalog?categoryId=batteries"
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                      <div className="h-6 w-4 rounded-sm border-2 border-foreground/30"></div>
                    </div>
                    <span className="text-sm text-foreground">
                      {isRu ? 'Батарейки для слуховых аппаратов' : 'Eshitish apparatlari uchun batareyalar'}
                    </span>
                  </Link>
                  
                  <Link
                    href="/catalog?categoryId=care"
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                      <div className="h-5 w-5 rounded border border-foreground/30"></div>
                    </div>
                    <span className="text-sm text-foreground">
                      {isRu ? 'Средства по уходу' : 'Parvarish vositalari'}
                    </span>
                  </Link>
                  
                  <Link
                    href="/catalog?categoryId=accessories"
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                      <div className="h-6 w-4 rounded border border-foreground/30"></div>
                    </div>
                    <span className="text-sm text-foreground">
                      {isRu ? 'Беспроводные аксессуары' : 'Simsiz aksessuarlar'}
                    </span>
                  </Link>
                </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="space-y-3">
                  <div className="space-y-2">
                    {brands.slice(0, 3).map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/catalog?brandId=${brand.id}`}
                        className="block rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                      >
                        {brand.logo?.url ? (
                          <div className="relative h-10 w-full">
                            <Image
                              src={brand.logo.url}
                              alt={brand.name}
                              fill
                              sizes="200px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-foreground">{brand.name}</span>
                        )}
                      </Link>
                    ))}
                  </div>
              </div>
            )}

            {/* Useful Articles */}
            {product.usefulArticles && product.usefulArticles.length > 0 && (
              <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-2">
                    {isRu ? 'Полезные статьи' : 'Foydali maqolalar'}
                  </h3>
                  <div className="space-y-3">
                    {product.usefulArticles.slice(0, 2).map((article) => (
                      <Link
                        key={article.id}
                        href={`/posts/${article.slug}`}
                        className="group flex items-start gap-3 rounded-lg transition hover:opacity-80"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                          {/* Placeholder for article image */}
                          <div className="flex h-full w-full items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-brand-primary group-hover:underline">
                            {isRu ? article.title_ru : article.title_uz}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
