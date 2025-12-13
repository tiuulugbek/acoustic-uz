import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { getBranchBySlug, getDoctors, getServices, getSettings } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';
import type { TourConfig } from '@/types/tour';
import PageHeader from '@/components/page-header';
import WorkingHoursDisplay from '@/components/working-hours-display';
import BranchTOC from '@/components/branch-toc';
import BranchViewTracker from '@/components/branch-view-tracker';
import PanoramaViewerWrapper from '@/components/tour/PanoramaViewerWrapper';
import { normalizeImageUrl } from '@/lib/image-utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface BranchPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BranchPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const branch = await getBranchBySlug(params.slug, locale);
  
  if (!branch) {
    return {
      title: locale === 'ru' ? 'Филиал — Acoustic.uz' : 'Filial — Acoustic.uz',
      description: locale === 'ru' 
        ? 'Адрес филиала и контактная информация'
        : 'Filial manzili va kontakt ma\'lumotlari',
    };
  }

  const name = getBilingualText(branch.name_uz, branch.name_ru, locale);
  const address = getBilingualText(branch.address_uz, branch.address_ru, locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const branchUrl = `${baseUrl}/branches/${params.slug}`;

  return {
    title: `${name} — Acoustic.uz`,
    description: address,
    alternates: {
      canonical: branchUrl,
      languages: {
        uz: branchUrl,
        ru: branchUrl, // Same URL since we use cookie-based locale detection
        'x-default': branchUrl,
      },
    },
  };
}

export default async function BranchPage({ params }: BranchPageProps) {
  const locale = detectLocale();
  // Try to get branch by slug first
  let branch = await getBranchBySlug(params.slug, locale);
  
  // If not found by slug, try to get by id (fallback for old links)
  if (!branch) {
    const { getBranches } = await import('@/lib/api-server');
    const branches = await getBranches(locale);
    branch = branches.find(b => b.id === params.slug) || null;
  }
  
  const [doctors, allServices, settings] = await Promise.all([
    getDoctors(locale),
    getServices(locale),
    getSettings(locale),
  ]);

  if (!branch) {
    return (
      <main className="min-h-screen bg-background">
        <section className="bg-muted/40 py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold text-foreground" suppressHydrationWarning>
                {locale === 'ru' ? 'Филиал не найден' : 'Filial topilmadi'}
              </h1>
              <Link href="/branches" className="text-brand-primary hover:underline">
                {locale === 'ru' ? 'Вернуться к списку филиалов' : 'Filiallar ro\'yxatiga qaytish'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const name = getBilingualText(branch.name_uz, branch.name_ru, locale);
  const address = getBilingualText(branch.address_uz, branch.address_ru, locale);

  // Debug: Log branch data to check if new fields are present
  console.log('🔍 [BRANCH] Branch data:', {
    id: branch.id,
    name_uz: branch.name_uz,
    workingHours_uz: branch.workingHours_uz,
    workingHours_ru: branch.workingHours_ru,
    serviceIds: branch.serviceIds,
    hasWorkingHours: !!(branch.workingHours_uz || branch.workingHours_ru),
    hasServiceIds: !!branch.serviceIds && Array.isArray(branch.serviceIds) && branch.serviceIds.length > 0,
  });

  // Build image URL
  let imageUrl = branch.image?.url || '';
  if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    imageUrl = `${baseUrl}${imageUrl}`;
  }

  // Build navigation links
  const yandexNavUrl = branch.latitude && branch.longitude
    ? `https://yandex.com/maps/?pt=${branch.longitude},${branch.latitude}&z=16&l=map`
    : `https://yandex.com/maps/?text=${encodeURIComponent(address)}`;
  
  const googleNavUrl = branch.latitude && branch.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Check if branch has 3D tour (for TOC component)
  const hasTour3d = !!(branch.tour3d_config || branch.tour3d_iframe);

  // Services list - fetch from branch.serviceIds if available, otherwise show all services
  const branchServiceIds = (branch.serviceIds && Array.isArray(branch.serviceIds)) ? branch.serviceIds : [];
  console.log('🔍 [BRANCH] Services:', {
    branchServiceIds,
    allServicesCount: allServices.length,
    filteredServicesCount: branchServiceIds.length > 0 ? allServices.filter(service => branchServiceIds.includes(service.id)).length : 0,
  });
  const services = branchServiceIds.length > 0
    ? allServices.filter(service => branchServiceIds.includes(service.id))
    : allServices.slice(0, 6); // Fallback: show first 6 services if no specific services assigned

  // Build LocalBusiness Structured Data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const branchUrl = `${baseUrl}/branches/${branch.slug}`;
  const branchImageUrl = branch.image?.url 
    ? normalizeImageUrl(branch.image.url)
    : settings?.logo?.url 
      ? normalizeImageUrl(settings.logo.url)
      : `${baseUrl}/logo.png`;
  
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': branchUrl,
    name: name,
    image: branchImageUrl.startsWith('http') ? branchImageUrl : `${baseUrl}${branchImageUrl}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: branch.city || 'Tashkent',
      addressCountry: 'UZ',
    },
    geo: branch.latitude && branch.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: branch.latitude,
      longitude: branch.longitude,
    } : undefined,
    telephone: branch.phone || settings?.phonePrimary || settings?.phoneSecondary || undefined,
    url: branchUrl,
    openingHoursSpecification: branch.workingHours_uz || branch.workingHours_ru ? {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    } : undefined,
    priceRange: '$$',
    servesCuisine: undefined,
    areaServed: {
      '@type': 'City',
      name: branch.city || 'Tashkent',
    },
  };

  return (
    <>
      <BranchViewTracker slug={branch.slug || branch.id} name={name} />
      <main className="min-h-screen bg-background" suppressHydrationWarning>
        {/* LocalBusiness Structured Data */}
      <Script
        id="localbusiness-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* Breadcrumbs */}
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Наши адреса' : 'Bizning manzillarimiz', href: '/branches' },
          { label: name },
        ]}
        title=""
        description=""
      />

            {/* Main Content */}
            <section className="bg-white py-4 sm:py-8" suppressHydrationWarning>
              <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full" suppressHydrationWarning>
                <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[2fr_1fr] lg:items-start" suppressHydrationWarning>
            {/* Left Column - Main Content */}
            <div className="space-y-6 sm:space-y-8 min-w-0 w-full" suppressHydrationWarning>
              {/* Title and Description */}
              <div>
                <h1 className="mb-3 text-2xl sm:text-3xl font-bold text-foreground" suppressHydrationWarning>
                  {name}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed" suppressHydrationWarning>
                  {address}
                </p>
              </div>

              {/* Services Section */}
              {services.length > 0 && (
                <section id="services" className="scroll-mt-20" suppressHydrationWarning>
                  <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
                  </h2>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2" suppressHydrationWarning>
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        className="flex items-start gap-2 group hover:text-brand-primary transition-colors"
                        suppressHydrationWarning
                      >
                        <span className="mt-1 text-brand-primary flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base text-foreground group-hover:text-brand-primary break-words" suppressHydrationWarning>
                          {getBilingualText(service.title_uz, service.title_ru, locale)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Doctors Section */}
              {doctors && doctors.length > 0 && (
                <section id="doctors" className="scroll-mt-20" suppressHydrationWarning>
                  <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Врачи' : 'Shifokorlar'}
                  </h2>
                  <div className="grid gap-4 sm:gap-6 sm:grid-cols-2" suppressHydrationWarning>
                    {doctors.slice(0, 4).map((doctor) => {
                      const doctorName = getBilingualText(doctor.name_uz, doctor.name_ru, locale);
                      const position = getBilingualText(doctor.position_uz, doctor.position_ru, locale);
                      const experience = getBilingualText(doctor.experience_uz, doctor.experience_ru, locale);
                      
                      let doctorImageUrl = doctor.image?.url || '';
                      if (doctorImageUrl && doctorImageUrl.startsWith('/') && !doctorImageUrl.startsWith('//')) {
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        doctorImageUrl = `${baseUrl}${doctorImageUrl}`;
                      }

                      return (
                        <Link
                          key={doctor.id}
                          href={`/doctors/${doctor.slug}`}
                          className="group block rounded-lg border border-border bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md"
                          suppressHydrationWarning
                        >
                          <div className="flex gap-3 sm:gap-4" suppressHydrationWarning>
                            {doctorImageUrl ? (
                              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20" suppressHydrationWarning>
                                <Image
                                  src={doctorImageUrl}
                                  alt={doctorName}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="(max-width: 640px) 64px, 80px"
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center" suppressHydrationWarning>
                                <span className="text-xl sm:text-2xl font-bold text-white" suppressHydrationWarning>
                                  {doctorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0" suppressHydrationWarning>
                              <h3 className="mb-1 text-sm sm:text-base font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                                {doctorName}
                              </h3>
                              {position && (
                                <p className="text-xs sm:text-sm text-muted-foreground" suppressHydrationWarning>
                                  {position}
                                </p>
                              )}
                              {experience && (
                                <p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>
                                  {experience}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 3D Tour Section */}
              {hasTour3d && (
                <section id="tour3d" className="scroll-mt-20 w-full overflow-x-hidden" suppressHydrationWarning>
                  <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? '3D Тур' : '3D Tour'}
                  </h2>
                  <div className="rounded-lg overflow-hidden border border-border bg-muted/20 w-full max-w-full" suppressHydrationWarning>
                    {branch.tour3d_config ? (
                      <div className="w-full max-w-full" style={{ aspectRatio: '16 / 9', minHeight: '250px', maxHeight: '500px' }} suppressHydrationWarning>
                        <PanoramaViewerWrapper config={branch.tour3d_config as TourConfig} locale={locale} />
                      </div>
                    ) : branch.tour3d_iframe ? (
                      <div
                        className="w-full max-w-full"
                        style={{ aspectRatio: '16 / 9', minHeight: '250px', maxHeight: '500px', position: 'relative', overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{
                          __html: branch.tour3d_iframe
                            ?.replace(/width="[^"]*"/gi, 'width="100%"')
                            .replace(/height="[^"]*"/gi, 'height="100%"')
                            .replace(/style="[^"]*"/gi, 'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; max-width: 100%;"') || '',
                        }}
                        suppressHydrationWarning
                      />
                    ) : null}
                  </div>
                </section>
              )}

              {/* Location Section */}
              <section id="location" className="scroll-mt-20 w-full overflow-x-hidden" suppressHydrationWarning>
                <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Как добраться' : 'Qanday yetib borish'}
                </h2>
                {branch.map_iframe ? (
                  // Use custom iframe if available (highest priority)
                  <div className="mb-4 rounded-lg overflow-hidden border border-border bg-gray-100 w-full max-w-full" suppressHydrationWarning>
                    <div
                      className="w-full max-w-full"
                      style={{ 
                        position: 'relative',
                        paddingBottom: '56.25%', // 16:9 aspect ratio
                        height: 0,
                        overflow: 'hidden',
                        minHeight: '250px',
                        maxHeight: '500px'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: branch.map_iframe
                          .replace(/width="[^"]*"/gi, 'width="100%"')
                          .replace(/height="[^"]*"/gi, 'height="100%"')
                          .replace(/style="[^"]*"/gi, 'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; max-width: 100%;"')
                          .replace(/<iframe/gi, '<iframe loading="lazy" allowfullscreen')
                          .replace(/sandbox="[^"]*"/gi, '') // Remove sandbox if present
                          .replace(/maps\.google\.com\/maps\?q=([^&"']+)/gi, (match, coords) => {
                            // Fix Google Maps URLs to use embed format
                            return `maps.google.com/maps?q=${coords}&output=embed`;
                          })
                      }}
                      suppressHydrationWarning
                    />
                  </div>
                ) : branch.latitude && branch.longitude ? (
                  // If coordinates are available, use Yandex Maps embed (more reliable than Google Maps)
                  // Note: Yandex Maps doesn't support uz_UZ locale, so we use ru_RU for both locales
                  <div className="mb-4 rounded-lg overflow-hidden border border-border bg-gray-100 relative w-full max-w-full" style={{ paddingBottom: '56.25%', height: 0, minHeight: '250px', maxHeight: '500px' }} suppressHydrationWarning>
                    <iframe
                      src={`https://yandex.com/map-widget/v1/?ll=${branch.longitude},${branch.latitude}&z=16&pt=${branch.longitude},${branch.latitude}&lang=ru_RU`}
                      width="100%"
                      height="100%"
                      className="absolute top-0 left-0 w-full h-full max-w-full"
                      style={{ border: 0, maxWidth: '100%' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={locale === 'ru' ? 'Карта' : 'Xarita'}
                      suppressHydrationWarning
                    />
                  </div>
                ) : null}
              </section>
            </div>

            {/* Right Sidebar */}
            <aside className="order-first lg:order-last lg:sticky lg:top-20 lg:self-start lg:h-fit" suppressHydrationWarning>
              <div className="rounded-lg border border-border bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6" suppressHydrationWarning>
                {/* Table of Contents */}
                <BranchTOC locale={locale} hasTour3d={hasTour3d} />

                {/* Address */}
                <div>
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Адрес' : 'Manzil'}
                  </h3>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-brand-primary" />
                    <span className="break-words" suppressHydrationWarning>{address}</span>
                  </div>
                </div>

                {/* Phones */}
                <div>
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Телефоны' : 'Telefonlar'}
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={`tel:${branch.phone}`}
                      className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary hover:underline break-all"
                    >
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{branch.phone}</span>
                    </a>
                    {branch.phones && branch.phones.length > 0 && (
                      <div className="ml-5 sm:ml-6 space-y-1">
                        {branch.phones.map((phone, idx) => (
                          <a
                            key={idx}
                            href={`tel:${phone}`}
                            className="block text-xs sm:text-sm text-brand-primary hover:underline break-all"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Links */}
                <div suppressHydrationWarning>
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Навигация' : 'Navigatsiya'}
                  </h3>
                  <div className="space-y-2" suppressHydrationWarning>
                    <a
                      href={yandexNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary hover:underline"
                      suppressHydrationWarning
                    >
                      <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-words" suppressHydrationWarning>
                        {locale === 'ru' ? 'Яндекс Навигатор' : 'Yandex Navigator'}
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <a
                      href={googleNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary hover:underline"
                      suppressHydrationWarning
                    >
                      <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-words" suppressHydrationWarning>
                        {locale === 'ru' ? 'Google Навигатор' : 'Google Navigator'}
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                {(branch.workingHours_uz || branch.workingHours_ru) ? (
                  <div suppressHydrationWarning>
                    <WorkingHoursDisplay 
                      workingHours_uz={branch.workingHours_uz} 
                      workingHours_ru={branch.workingHours_ru} 
                      locale={locale} 
                    />
                  </div>
                ) : (
                  // Fallback: Show default working hours if not set
                  <div>
                    <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                      {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                    </h3>
                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span className="break-words" suppressHydrationWarning>
                          {locale === 'ru' ? 'Понедельник - Пятница' : 'Dushanba - Juma'}: 09:00-20:00
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-primary flex-shrink-0 mt-0.5" />
                        <span className="break-words" suppressHydrationWarning>
                          {locale === 'ru' ? 'Суббота - Воскресенье' : 'Shanba - Yakshanba'}: 09:00-18:00
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

