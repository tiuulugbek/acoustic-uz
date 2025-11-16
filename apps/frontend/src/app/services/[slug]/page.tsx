import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getServiceBySlug, getServiceCategoryBySlug } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import ServiceContent from '@/components/service-content';

// Force dynamic rendering to always fetch fresh data from admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const locale = detectLocale();
  
  // Try to get category first
  const category = await getServiceCategoryBySlug(params.slug, locale);
  if (category) {
    const title = getBilingualText(category.name_uz, category.name_ru, locale);
    return {
      title: `${title} — Acoustic.uz`,
      description: getBilingualText(category.description_uz, category.description_ru, locale) || undefined,
    };
  }
  
  // Try to get service
  const service = await getServiceBySlug(params.slug, locale);
  if (!service) {
    return {
      title: locale === 'ru' ? 'Услуга — Acoustic.uz' : 'Xizmat — Acoustic.uz',
      description: locale === 'ru' 
        ? 'Услуги по диагностике и подбору слуховых аппаратов'
        : 'Eshitish diagnostikasi va apparatlarni tanlash xizmatlari',
    };
  }

  const title = getBilingualText(service.title_uz, service.title_ru, locale);
  const description = getBilingualText(service.excerpt_uz, service.excerpt_ru, locale) || undefined;

  return {
    title: `${title} — Acoustic.uz`,
    description,
  };
}

export default async function ServiceSlugPage({ params }: ServicePageProps) {
  const locale = detectLocale();
  
  // First, try to get category by slug
  const category = await getServiceCategoryBySlug(params.slug, locale);
  
  if (category) {
    // This is a category - show services within this category
    const categoryTitle = getBilingualText(category.name_uz, category.name_ru, locale);
    const categoryDescription = getBilingualText(category.description_uz, category.description_ru, locale);
    
    // Get services for this category (they should be included in the category response)
    const services = (category.services || []).filter(service => 
      service.status === 'published'
    );
    
    // Build category image URL
    let categoryImage = category.image?.url || '';
    if (categoryImage && categoryImage.startsWith('/') && !categoryImage.startsWith('//')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      categoryImage = `${baseUrl}${categoryImage}`;
    }
    
    return (
      <main className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
            <Link href="/" className="hover:text-brand-primary" suppressHydrationWarning>
              {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
            </Link>
            <span className="mx-2">›</span>
            <Link href="/services" className="hover:text-brand-primary" suppressHydrationWarning>
              {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-brand-primary" suppressHydrationWarning>{categoryTitle}</span>
          </div>
        </section>

        {/* Category Header */}
        <section className="bg-brand-accent text-white">
          <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-6">
            {categoryImage && (
              <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg bg-white/10">
                <Image
                  src={categoryImage}
                  alt={categoryTitle}
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  suppressHydrationWarning
                />
              </div>
            )}
            <h1 className="text-3xl font-bold md:text-4xl" suppressHydrationWarning>
              {categoryTitle}
            </h1>
            {categoryDescription && (
              <p className="max-w-4xl text-base leading-relaxed text-white/90" suppressHydrationWarning>
                {categoryDescription}
              </p>
            )}
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            {services.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {services.map((service) => {
                  const serviceTitle = getBilingualText(service.title_uz, service.title_ru, locale);
                  const serviceExcerpt = getBilingualText(service.excerpt_uz, service.excerpt_ru, locale);
                  
                  // Build service image URL
                  let serviceImage = service.cover?.url || '';
                  if (serviceImage && serviceImage.startsWith('/') && !serviceImage.startsWith('//')) {
                    const baseUrl = API_BASE_URL.replace('/api', '');
                    serviceImage = `${baseUrl}${serviceImage}`;
                  }
                  
                  return (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                        {serviceImage ? (
                          <Image
                            src={serviceImage}
                            alt={serviceTitle}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            suppressHydrationWarning
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-brand-primary">
                            <span className="text-white text-lg font-bold">Acoustic</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                          {serviceTitle}
                        </h3>
                        {serviceExcerpt && (
                          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3" suppressHydrationWarning>
                            {serviceExcerpt}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all" suppressHydrationWarning>
                          {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {locale === 'ru'
                    ? 'В этой категории пока нет услуг.'
                    : 'Ushbu kategoriyada hozircha xizmatlar yo\'q.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }
  
  // This is a service slug - show service detail
  const service = await getServiceBySlug(params.slug, locale);

  // If service is null, show fallback UI (backend down or service not found)
  if (!service) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          <Link href="/services" className="text-sm font-semibold text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? '← Вернуться к услугам' : '← Xizmatlarga qaytish'}
          </Link>
          <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Услуга не найдена' : 'Xizmat topilmadi'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ru' 
                ? 'К сожалению, мы не можем загрузить информацию об услуге в данный момент.'
                : 'Afsuski, xizmat haqida ma\'lumotni hozircha yuklay olmaymiz.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const title = getBilingualText(service.title_uz, service.title_ru, locale);
  const description = getBilingualText(service.excerpt_uz, service.excerpt_ru, locale);
  const body = getBilingualText(service.body_uz, service.body_ru, locale);
  const coverAlt = getBilingualText(service.cover?.alt_uz, service.cover?.alt_ru, locale) || title;

  // Build breadcrumbs
  const breadcrumbItems = [
    { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
    { label: locale === 'ru' ? 'Услуги' : 'Xizmatlar', href: '/services' },
  ];
  
  if (service.category) {
    const categoryTitle = getBilingualText(service.category.name_uz, service.category.name_ru, locale);
    breadcrumbItems.push({ 
      label: categoryTitle, 
      href: `/services/${service.category.slug}` 
    });
  }
  
  breadcrumbItems.push({ label: title, href: `/services/${service.slug}` });

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-4xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          {breadcrumbItems.map((item, index) => (
            <span key={item.href}>
              {index > 0 && <span className="mx-2">›</span>}
              {index < breadcrumbItems.length - 1 ? (
                <Link href={item.href} className="hover:text-brand-primary" suppressHydrationWarning>
                  {item.label}
                </Link>
              ) : (
                <span className="text-brand-primary" suppressHydrationWarning>{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="mt-6 space-y-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        {service.cover?.url && (
          <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden rounded-3xl bg-muted/40">
            <Image src={service.cover.url} alt={coverAlt} fill className="object-cover" priority />
          </div>
        )}

        <div className="mt-10">
          <ServiceContent content={body || ''} locale={locale} />
        </div>
      </div>
    </main>
  );
}
