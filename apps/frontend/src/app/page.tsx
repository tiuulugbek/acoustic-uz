import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { detectLocale } from '@/lib/locale-server';
import {
  getPublicBanners,
  getHomepageServices,
  getShowcase,
  getHomepageHearingAidItems,
  getHomepageNews,
  getPublicFaq,
  getHomepageJourney,
} from '@/lib/api-server';
import type {
  BannerResponse,
  ServiceResponse,
  ShowcaseResponse,
  HearingAidItemResponse,
  HomepageNewsItemResponse,
  FaqResponse,
  HomepageJourneyStepResponse,
} from '@/lib/api';
import HeroSlider from '@/components/homepage/hero-slider';
import FAQAccordion from '@/components/homepage/faq-accordion';

// Force dynamic rendering - no caching, always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    hearingItemsData,
    journeyData,
    newsItemsData,
    faqData,
  ] = await Promise.all([
    getPublicBanners(locale),
    getHomepageServices(locale),
    getShowcase('interacoustics', locale),
    getHomepageHearingAidItems(locale),
    getHomepageJourney(locale),
    getHomepageNews(locale),
    getPublicFaq(locale),
  ]);

  // Transform data for rendering
  const services = (serviceData || []).slice(0, 4).map((service, index) => {
    const title = locale === 'ru' ? (service.title_ru || '') : (service.title_uz || '');
    const description = locale === 'ru' ? (service.excerpt_ru || '') : (service.excerpt_uz || '');
    let image = (service as any)?.image?.url ?? (service as any)?.cover?.url ?? '';
    if (image && image.startsWith('/') && !image.startsWith('//')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      image = `${baseUrl}${image}`;
    }
    return {
      id: service.id ?? `service-${index}`,
      title: title || '',
      description: description || '',
      slug: service.slug || service.id || `service-${index}`,
      image: image || '',
    };
  });

  const hearingItems = (hearingItemsData || []).slice(0, 9).map((item, index) => {
    const title = locale === 'ru' ? (item.title_ru || '') : (item.title_uz || '');
    const description = locale === 'ru' ? (item.description_ru || '') : (item.description_uz || '');
    let image = item.image?.url || '';
    if (image && image.startsWith('/') && !image.startsWith('//')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      image = `${baseUrl}${image}`;
    }
    return {
      id: item.id ?? `hearing-${index}`,
      title: title || '',
      description: description || '',
      image: image || '',
      link: item.link || '/catalog',
      hasImage: !!item.image?.url,
    };
  });

  const interacousticsProducts = (interacousticsData?.products || []).slice(0, 4).map((product, index) => {
    const title = locale === 'ru' ? (product.name_ru || '') : (product.name_uz || '');
    const description = locale === 'ru' ? (product.description_ru || '') : (product.description_uz || '');
    let image = product.brand?.logo?.url || '';
    if (image && image.startsWith('/') && !image.startsWith('//')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      image = `${baseUrl}${image}`;
    }
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
    publishedAt: item.publishedAt,
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Slider Section */}
      <HeroSlider banners={bannerData} locale={locale} apiBaseUrl={API_BASE_URL} />

      {/* 2. Services Section */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
              {locale === 'ru' ? 'Наши услуги' : 'Bizning xizmatlar'}
            </h2>
          </div>
          {services.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
      <section className="border-t bg-white py-12">
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
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {hearingItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group flex flex-row items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-primary/50 hover:shadow-sm"
                >
                  <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-brand-primary flex items-center justify-center flex-shrink-0">
                    {item.hasImage && item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        sizes="80px" 
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        suppressHydrationWarning
                      />
                    ) : (
                      <span className="text-white text-base font-bold">Acoustic</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 space-y-2 min-w-0">
                    <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                        {item.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
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
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
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
              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-1 text-base font-medium text-muted-foreground hover:text-brand-primary transition-colors whitespace-nowrap"
                suppressHydrationWarning
              >
                {locale === 'ru' ? 'Полный каталог' : 'To\'liq katalog'}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {interacousticsProducts.map((product) => {
                const productLink = product.slug ? `/products/${product.slug}` : '#';
                const hasImage = product.image && product.image.length > 0;
                return (
                  <Link
                    key={product.id}
                    href={productLink}
                    className="group flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden transition hover:border-brand-primary/50 hover:shadow-sm"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-primary flex items-center justify-center">
                      {hasImage ? (
                        <Image 
                          src={product.image} 
                          alt={product.title} 
                          fill 
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          suppressHydrationWarning
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">Acoustic</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-4 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground leading-tight group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1" suppressHydrationWarning>
                          {product.description}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
                        {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Journey Section */}
      {journeySteps.length > 0 && (
        <section className="border-t bg-white py-12">
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
      <section className="border-t bg-muted/20 py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="space-y-1 text-center">
            <h2 className="text-3xl font-bold text-brand-primary md:text-4xl" suppressHydrationWarning>
              {locale === 'ru' ? 'Новости' : 'Yangiliklar'}
            </h2>
          </div>
          {newsItems.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {newsItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.slug && item.slug !== '#' ? `/posts/${item.slug}` : '#'}
                  className="group flex flex-col gap-3 transition hover:opacity-80"
                >
                  <h3 className="text-lg font-semibold text-brand-primary group-hover:text-brand-accent" suppressHydrationWarning>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
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
      <FAQAccordion faqs={faqData} locale={locale} />
    </main>
  );
}

