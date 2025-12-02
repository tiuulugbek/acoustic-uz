import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { detectLocale } from '@/lib/locale-server';
import {
  getPublicBanners,
  getHomepageServices,
  getShowcase,
  getCatalogs,
  getPosts,
  getPublicFaq,
  getHomepageJourney,
  getHomepageHearingAidItems,
  getSettings,
} from '@/lib/api-server';
import type {
  BannerResponse,
  ServiceResponse,
  ShowcaseResponse,
  CatalogResponse,
  PostResponse,
  FaqResponse,
  HomepageJourneyStepResponse,
} from '@/lib/api';
import HeroSlider from '@/components/homepage/hero-slider';
import FAQAccordion from '@/components/homepage/faq-accordion';
import Script from 'next/script';
import type { Metadata } from 'next';
import { normalizeImageUrl } from '@/lib/image-utils';

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  
  const title = locale === 'ru' 
    ? 'Acoustic.uz — Центр слуха' 
    : 'Acoustic.uz — Eshitish markazi';
  const description = locale === 'ru'
    ? 'Центр диагностики и коррекции слуха. Современные слуховые аппараты, диагностика слуха, индивидуальные решения.'
    : 'Eshitish diagnostikasi va korreksiyasi markazi. Zamonaviy eshitish apparatlari, eshitish diagnostikasi, individual yechimlar.';
  
  return {
    title,
    description,
    alternates: {
      canonical: baseUrl,
      languages: {
        uz: baseUrl,
        ru: baseUrl,
        'x-default': baseUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: 'Acoustic.uz',
      images: [
        {
          url: `${baseUrl}/logo.png`,
          width: 1200,
          height: 630,
          alt: 'Acoustic.uz',
        },
      ],
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/logo.png`],
    },
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default async function HomePage() {
  // Detect locale server-side from cookies
  const locale = detectLocale();

  // Fetch all data in parallel server-side
  // All functions return empty arrays/null on error, so page always renders
  const [
    bannerData,
    serviceData,
    interacousticsData,
    catalogsData,
    journeyData,
    newsItemsData,
    faqData,
    hearingAidItemsData,
    settingsData,
  ] = await Promise.all([
    getPublicBanners(locale),
    getHomepageServices(locale),
    getShowcase('interacoustics', locale),
    getCatalogs(locale),
    getHomepageJourney(locale),
    getPosts(locale, true),
    getPublicFaq(locale),
    getHomepageHearingAidItems(locale),
    getSettings(locale),
  ]);

  // Transform data for rendering
  const services = (serviceData || []).slice(0, 4).map((service, index) => {
    const title = locale === 'ru' ? (service.title_ru || '') : (service.title_uz || '');
    const description = locale === 'ru' ? (service.excerpt_ru || '') : (service.excerpt_uz || '');
    let image = (service as any)?.image?.url ?? (service as any)?.cover?.url ?? '';
    image = normalizeImageUrl(image);
    // Generate link: use slug as-is, if it starts with / use it directly, otherwise prepend /
    const serviceSlug = service.slug || service.id || `service-${index}`;
    const serviceLink = serviceSlug.startsWith('/') ? serviceSlug : `/${serviceSlug}`;
    return {
      id: service.id ?? `service-${index}`,
      title: title || '',
      description: description || '',
      slug: serviceSlug,
      link: serviceLink,
      image: image || '',
    };
  });

  // Use HomepageHearingAid items if available and have images, otherwise fallback to catalogs
  const hearingAidItemsWithImages = hearingAidItemsData?.filter((item) => item.image?.url) || [];
  const hearingItems = (hearingAidItemsWithImages.length > 0)
    ? hearingAidItemsWithImages.slice(0, 9).map((item) => {
        const title = locale === 'ru' ? (item.title_ru || '') : (item.title_uz || '');
        const description = locale === 'ru' ? (item.description_ru || '') : (item.description_uz || '');
        let image = item.image?.url || '';
        image = normalizeImageUrl(image);
        const link = item.link || '/catalog';
        return {
          id: item.id,
          title: title || '',
          description: description || '',
          image: image || '',
          link: link,
          hasImage: !!item.image?.url,
        };
      })
    : (catalogsData || [])
        .filter((catalog) => catalog.showOnHomepage === true)
        .slice(0, 9)
        .map((catalog) => {
          const title = locale === 'ru' ? (catalog.name_ru || '') : (catalog.name_uz || '');
          const description = locale === 'ru' ? (catalog.description_ru || '') : (catalog.description_uz || '');
          let image = catalog.image?.url || '';
          image = normalizeImageUrl(image);
          const link = catalog.slug ? `/catalog/${catalog.slug}` : '/catalog';
          return {
            id: catalog.id,
            title: title || '',
            description: description || '',
            image: image || '',
            link: link,
            hasImage: !!catalog.image?.url,
          };
        });

  const interacousticsProducts = (interacousticsData?.products || []).slice(0, 4).map((product, index) => {
    const title = locale === 'ru' ? (product.name_ru || '') : (product.name_uz || '');
    // Use homepageDescription if available, otherwise fallback to product description
    const description = locale === 'ru' 
      ? ((product as any).homepageDescription_ru || product.description_ru || '')
      : ((product as any).homepageDescription_uz || product.description_uz || '');
    // Use homepageImage if available, otherwise fallback to brand logo
    let image = '';
    if ((product as any).homepageImage?.url) {
      image = (product as any).homepageImage.url;
    } else {
      image = product.brand?.logo?.url || '';
    }
    image = normalizeImageUrl(image);
    return {
      id: product.slug ?? product.id ?? `interacoustics-${index}`,
      title: title || '',
      description: description || '',
      image: image || '',
      brand: product.brand?.name || '',
      slug: product.slug,
    };
  });

  const journeySteps = (journeyData || []).slice(0, 4).map((step, index) => ({
    id: step.id ?? `journey-${index}`,
    title: locale === 'ru' ? (step.title_ru || '') : (step.title_uz || ''),
    description: locale === 'ru' ? (step.description_ru || '') : (step.description_uz || ''),
    order: step.order ?? index + 1,
  }));

  const newsItems = (newsItemsData || []).slice(0, 6).map((item, index) => ({
    id: item.id ?? `news-${index}`,
    title: locale === 'ru' ? (item.title_ru || '') : (item.title_uz || ''),
    excerpt: locale === 'ru' ? (item.excerpt_ru || '') : (item.excerpt_uz || ''),
    slug: item.slug || '#',
    publishedAt: item.publishAt,
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Slider Section */}
      <HeroSlider 
        banners={bannerData} 
        locale={locale} 
        apiBaseUrl={API_BASE_URL}
        phoneNumber={settingsData?.phonePrimary || '1385'}
        phoneLink={settingsData?.phoneSecondary?.replace(/\s/g, '') || '+998712021441'}
      />

      {/* 2. Services Section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
              {locale === 'ru' ? 'Наши услуги' : 'Bizning xizmatlar'}
            </h2>
          </div>
          {services.length > 0 ? (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={service.link || `/services/${service.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-primary rounded-lg">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ minWidth: '100%', minHeight: '100%' }}
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-primary">
                        <span className="text-white text-lg font-bold">Acoustic</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary" suppressHydrationWarning>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground" suppressHydrationWarning>
                        {service.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2" suppressHydrationWarning>
                      {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru' ? 'Услуги будут добавлены в ближайшее время.' : 'Xizmatlar tez orada qo\'shiladi.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Product Catalog Section (Eshitish aparatlari) - ALWAYS SHOW */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
              {locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish apparatlari'}
            </p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
              {locale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
            </h2>
            {locale === 'ru' ? (
              <p className="text-base text-muted-foreground" suppressHydrationWarning>
                Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету.
              </p>
            ) : (
              <p className="text-base text-muted-foreground" suppressHydrationWarning>
                Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.
              </p>
            )}
          </div>
          {hearingItems.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {hearingItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-primary/50 hover:shadow-md"
                >
                  {/* Rasm - chapda */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-primary/10">
                    {item.hasImage && item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        sizes="96px" 
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                        <span className="text-white text-xs font-bold">Acoustic</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Matn - o'ngda */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Katalog nomi */}
                    <h3 className="text-base font-semibold text-brand-accent leading-tight group-hover:text-brand-primary transition-colors line-clamp-2" suppressHydrationWarning>
                      {item.title}
                    </h3>
                    
                    {/* Tavsif */}
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3" suppressHydrationWarning>
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru' 
                  ? 'Каталог продуктов пуст.' 
                  : 'Mahsulotlar katalogi bo\'sh.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Interacoustics Section */}
      {interacousticsProducts.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                  Interacoustics
                </p>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                  {locale === 'ru' ? 'Диагностическое оборудование' : 'Eng so\'nggi diagnostika uskunalari'}
                </h2>
                <p className="text-base text-muted-foreground" suppressHydrationWarning>
                  {locale === 'ru' 
                    ? 'Выбор инновационных решений и устройств для специалистов по аудиологии.'
                    : 'Audiologiya mutaxassislari uchun innovatsion yechimlar va qurilmalar tanlovi.'}
                </p>
              </div>
              {/* To'liq katalog link - Desktop only, header qismida */}
              <div className="hidden md:block">
                <Link 
                  href="/catalog" 
                  className="inline-flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-brand-primary transition-colors whitespace-nowrap"
                  suppressHydrationWarning
                >
                  {locale === 'ru' ? 'Полный каталог' : 'To\'liq katalog'}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="grid gap-2.5 grid-cols-2 md:grid-cols-4">
              {interacousticsProducts.map((product) => {
                const productLink = product.slug ? `/products/${product.slug}` : '#';
                const hasImage = product.image && product.image.length > 0;
                return (
                  <Link
                    key={product.id}
                    href={productLink}
                    className="group flex gap-2.5 md:flex-col md:gap-2 rounded border border-gray-200 bg-white p-2.5 md:p-4 transition hover:border-brand-primary/50 hover:shadow-sm"
                  >
                    {/* Rasm - mobil: chapda, desktop: yuqorida */}
                    <div className="relative h-16 w-16 md:h-auto md:w-full md:aspect-[4/3] shrink-0 overflow-hidden rounded bg-brand-primary/10">
                      {hasImage ? (
                        <Image 
                          src={product.image} 
                          alt={product.title} 
                          fill 
                          sizes="(max-width: 768px) 64px, (max-width: 1024px) 50vw, 25vw" 
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          suppressHydrationWarning
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                          <span className="text-white text-[10px] md:text-sm font-bold">Acoustic</span>
                        </div>
                      )}
                    </div>
                    {/* Nom va tavsif - mobil: o'ngda, desktop: pastda */}
                    <div className="flex flex-col flex-1 min-w-0 gap-1">
                      <h3 className="text-xs md:text-base font-semibold text-brand-accent leading-tight group-hover:text-brand-primary transition-colors line-clamp-2" suppressHydrationWarning>
                        {product.title}
                      </h3>
                      {/* Tavsif */}
                      {product.description && (
                        <p className="text-[10px] md:text-sm text-muted-foreground leading-snug line-clamp-3" suppressHydrationWarning>
                          {product.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* To'liq katalog link - Mobile only, pastda */}
            <div className="flex justify-center pt-4 md:hidden">
              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-brand-primary transition-colors"
                suppressHydrationWarning
              >
                {locale === 'ru' ? 'Полный каталог' : 'To\'liq katalog'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. Journey Section */}
      {journeySteps.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {locale === 'ru' ? 'Путь к лучшему слуху' : 'Yaxshi eshitishga yo\'l'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {locale === 'ru' ? 'Как мы помогаем' : 'Biz qanday yordam beramiz'}
              </h2>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {journeySteps.map((step) => (
                <div key={step.id} className="relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-2xl font-bold text-brand-primary">
                    {step.order}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. News Section - ALWAYS SHOW */}
      <section className="bg-white py-8 md:py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="space-y-1 text-center">
            <h2 className="text-3xl font-bold text-brand-primary md:text-4xl" suppressHydrationWarning>
              {locale === 'ru' ? 'Новости' : 'Yangiliklar'}
            </h2>
          </div>
          {newsItems.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {newsItems.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href={item.slug && item.slug !== '#' ? `/posts/${item.slug}` : '#'}
                  className="group flex flex-col gap-3 transition hover:opacity-80"
                >
                  <h3 className="text-base font-semibold text-brand-primary group-hover:text-brand-accent leading-snug" suppressHydrationWarning>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3" suppressHydrationWarning>
                    {item.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru' 
                  ? 'Новостей пока нет.' 
                  : 'Hozircha yangiliklar yo\'q.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 7. FAQ Section */}
      {faqData && faqData.length > 0 && (
        <>
          <Script
            id="faq-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqData.slice(0, 10).map((faq) => ({
                  '@type': 'Question',
                  name: locale === 'ru' ? faq.question_ru : faq.question_uz,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: locale === 'ru' ? faq.answer_ru : faq.answer_uz,
                  },
                })),
              }),
            }}
          />
          <FAQAccordion faqs={faqData} locale={locale} />
        </>
      )}
    </main>
  );
}

