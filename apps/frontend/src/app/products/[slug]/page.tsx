import Image from 'next/image';
import Script from 'next/script';
// Removed notFound import - we never crash, always show UI
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import {
  type ProductResponse,
  type UsefulArticleSummary,
} from '@/lib/api';
import { getProductBySlug } from '@/lib/api-server';
import ProductTabs from '@/components/product-tabs';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';

// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the page with a stale locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

const availabilityMap: Record<string, { uz: string; ru: string; schema: string; color: string }> = {
  'in-stock': {
    uz: 'Sotuvda',
    ru: 'В наличии',
    schema: 'https://schema.org/InStock',
    color: 'text-emerald-600 bg-emerald-50',
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
  const { title, description } = await getProductMetadata(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const productUrl = `${baseUrl}/products/${params.slug}`;
  
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
  };
}

function buildJsonLd(product: ProductResponse, mainImage: string) {
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

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_uz || product.name_ru,
    description: product.description_uz || product.description_ru || product.intro_uz || product.intro_ru,
    image: product.galleryUrls?.length ? product.galleryUrls : [mainImage],
    brand: {
      '@type': 'Brand',
      name: product.brand?.name ?? 'Acoustic',
    },
    offers,
    category: product.category?.name_uz ?? undefined,
    url: `https://acoustic.uz/products/${product.slug}`,
  };
}

function UsefulArticles({ articles }: { articles: UsefulArticleSummary[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-brand-accent">Foydali maqolalar</h3>
      <ul className="space-y-2">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/posts/${article.slug}`} className="group block">
              <span className="font-medium text-brand-primary group-hover:underline">
                {article.title_uz}
              </span>
              {article.title_ru ? (
                <p className="text-xs text-muted-foreground">{article.title_ru}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const locale = detectLocale();
  
  // Handle errors gracefully - getProductBySlug returns null if backend is down or product not found
  // The api-server wrapper ensures this never throws, so we can safely await it
  const product = await getProductBySlug(params.slug, locale);

  // If product is null, show fallback UI (backend down or product not found)
  // Never crash - always show UI structure
  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
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
  const mainImage = product.galleryUrls?.[0] ?? product.brand?.logo?.url ?? placeholderImage;
  const gallery = product.galleryUrls?.length ? product.galleryUrls : product.brand?.logo?.url ? [product.brand.logo.url] : [];
  const features = combineBilingual(product.features_uz, product.features_ru);
  const benefits = combineBilingual(product.benefits_uz, product.benefits_ru);
  const isRu = locale === 'ru';

  const tabTitles = {
    description: isRu ? 'Описание' : 'Tavsif',
    tech: isRu ? 'Технологии' : 'Texnologiyalar',
    fitting: isRu ? 'Диапазон настройки' : 'Sozlash diapazoni',
  };

  const productTabs = [
    {
      key: 'description',
      title: tabTitles.description,
      primary: isRu
        ? product.description_ru ?? product.description_uz ?? null
        : product.description_uz ?? product.description_ru ?? null,
      secondary: isRu ? product.description_uz ?? null : product.description_ru ?? null,
    },
    {
      key: 'tech',
      title: tabTitles.tech,
      primary: isRu
        ? product.tech_ru ?? product.specsText ?? null
        : product.tech_uz ?? product.specsText ?? null,
      secondary: isRu ? product.tech_uz ?? null : product.tech_ru ?? null,
    },
    {
      key: 'fitting',
      title: tabTitles.fitting,
      primary: isRu ? product.fittingRange_ru ?? null : product.fittingRange_uz ?? null,
      secondary: isRu ? product.fittingRange_uz ?? null : product.fittingRange_ru ?? null,
    },
  ];

  const jsonLd = buildJsonLd(product, mainImage);

  return (
    <main className="min-h-screen bg-background">
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumbs */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          <Link href="/" className="hover:text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
          </Link>
          <span className="mx-2">›</span>
          <Link href="/catalog" className="hover:text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? 'Каталог' : 'Katalog'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-brand-primary" suppressHydrationWarning>{getBilingualText(product.name_uz, product.name_ru, locale)}</span>
        </div>
      </section>

      {/* Header */}
      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-6">
          <div className="flex items-center gap-2">
            {product.brand && (
              <>
                <span className="text-sm font-medium text-white/70">{product.brand.name}</span>
                <span className="text-white/50">/</span>
              </>
            )}
            <h1 className="text-3xl font-bold md:text-4xl" suppressHydrationWarning>
              {getBilingualText(product.name_uz, product.name_ru, locale)}
            </h1>
          </div>
          {product.intro_uz || product.intro_ru ? (
            <p className="max-w-4xl text-base leading-relaxed text-white/90" suppressHydrationWarning>
              {getBilingualText(product.intro_uz, product.intro_ru, locale)}
            </p>
          ) : null}
          {priceFormatted && (
            <p className="text-2xl font-bold text-white">{priceFormatted}</p>
          )}
          {availability && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${availability.color}`}>
              {isRu ? availability.ru : availability.uz}
            </span>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Left Column - Image Gallery & Tabs */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-primary/5">
                <Image
                  src={mainImage}
                  alt={getBilingualText(product.name_uz, product.name_ru, locale)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-contain p-8"
                  priority
                />
              </div>

              {/* Gallery */}
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {gallery.slice(1, 5).map((image, index) => (
                    <div key={index} className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/5">
                      <Image
                        src={image}
                        alt={`${getBilingualText(product.name_uz, product.name_ru, locale)} ${index + 2}`}
                        fill
                        sizes="(max-width: 1024px) 25vw, 16vw"
                        className="object-contain p-2"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Product Tabs */}
              {productTabs.some((tab) => tab.primary || tab.secondary) && (
                <ProductTabs tabs={productTabs} />
              )}

              {/* Features & Benefits */}
              {(features || benefits) && (
                <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6">
                  {features && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-brand-accent">
                        {isRu ? 'Особенности' : 'Xususiyatlar'}
                      </h3>
                      <div className="whitespace-pre-line text-muted-foreground">{features}</div>
                    </div>
                  )}
                  {benefits && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-brand-accent">
                        {isRu ? 'Преимущества' : 'Afzalliklar'}
                      </h3>
                      <div className="whitespace-pre-line text-muted-foreground">{benefits}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Contact CTA */}
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent">
                  {isRu ? 'Связаться с нами' : 'Biz bilan bog\'laning'}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {isRu
                    ? 'Хотите узнать больше об этом продукте? Свяжитесь с нами для консультации.'
                    : 'Bu mahsulot haqida ko\'proq bilmoqchimisiz? Konsultatsiya uchun biz bilan bog\'laning.'}
                </p>
                <Link
                  href="/contacts"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
                >
                  <Phone className="h-4 w-4" />
                  {isRu ? 'Связаться' : 'Bog\'lanish'}
                </Link>
              </div>

              {/* Related Products */}
              {product.relatedProducts && product.relatedProducts.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-brand-accent">
                    {isRu ? 'Похожие товары' : 'O\'xshash mahsulotlar'}
                  </h3>
                  <ul className="space-y-3">
                    {product.relatedProducts.slice(0, 3).map((related) => (
                      <li key={related.id}>
                        <Link
                          href={`/products/${related.slug}`}
                          className="group flex items-center gap-3 rounded-lg border border-border/60 p-3 transition hover:border-brand-primary/50 hover:bg-muted/20"
                        >
                          {related.image && (
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-primary/5">
                              <Image
                                src={related.image}
                                alt={getBilingualText(related.name_uz, related.name_ru, locale)}
                                fill
                                sizes="64px"
                                className="object-contain p-2"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground group-hover:text-brand-primary">
                              {getBilingualText(related.name_uz, related.name_ru, locale)}
                            </p>
                            {related.price && (
                              <p className="text-xs text-muted-foreground">{formatPrice(related.price)}</p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand-primary" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Useful Articles */}
              {product.usefulArticles && product.usefulArticles.length > 0 && (
                <UsefulArticles articles={product.usefulArticles} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
