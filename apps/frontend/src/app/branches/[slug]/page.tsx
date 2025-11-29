import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import { getBranchBySlug, getDoctors, getServices } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import { MapPin, Phone, Clock, Navigation, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/page-header';
import type { TourConfig } from '@/types/tour';

// Dynamically import PanoramaViewer for client-side rendering
const PanoramaViewer = dynamicImport(() => import('@/components/tour/PanoramaViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center bg-gray-100 text-lg text-gray-500">
      3D Tour yuklanmoqda...
    </div>
  ),
});

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

  return {
    title: `${name} — Acoustic.uz`,
    description: address,
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
  
  const doctors = await getDoctors(locale);
  const allServices = await getServices(locale);

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

  // Table of contents sections
  const tocSections = [
    { id: 'services', label: locale === 'ru' ? 'Услуги' : 'Xizmatlar' },
    { id: 'doctors', label: locale === 'ru' ? 'Врачи' : 'Shifokorlar' },
    // Conditionally add 3D Tour to TOC
    ...(branch.tour3d_config || branch.tour3d_iframe ? [{ id: 'tour3d', label: locale === 'ru' ? '3D Тур' : '3D Tour' }] : []),
    { id: 'location', label: locale === 'ru' ? 'Как добраться' : 'Qanday yetib borish' },
  ];

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

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Наши адреса' : 'Bizning manzillarimiz', href: '/branches' },
          { label: name },
        ]}
        title={name}
        description={address}
        icon={<MapPin className="h-8 w-8 text-white" />}
      />

      {/* Main Content */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Title and Description */}
              <div>
                <h1 className="mb-4 text-3xl font-bold text-foreground" suppressHydrationWarning>
                  {name}
                </h1>
                <p className="text-muted-foreground leading-relaxed" suppressHydrationWarning>
                  {address}
                </p>
              </div>

              {/* Services Section */}
              {services.length > 0 && (
                <section id="services" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services/${service.slug}`}
                        className="flex items-start gap-2 group hover:text-brand-primary transition-colors"
                      >
                        <span className="mt-1 text-brand-primary">•</span>
                        <span className="text-foreground group-hover:text-brand-primary" suppressHydrationWarning>
                          {getBilingualText(service.title_uz, service.title_ru, locale)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Doctors Section */}
              {doctors && doctors.length > 0 && (
                <section id="doctors" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Врачи' : 'Shifokorlar'}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
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
                          className="group block rounded-lg border border-border bg-white p-4 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex gap-4">
                            {doctorImageUrl ? (
                              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
                                <Image
                                  src={doctorImageUrl}
                                  alt={doctorName}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="80px"
                                />
                              </div>
                            ) : (
                              <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                  {doctorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="mb-1 font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                                {doctorName}
                              </h3>
                              {position && (
                                <p className="text-sm text-muted-foreground" suppressHydrationWarning>
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
              {(branch.tour3d_config || branch.tour3d_iframe) && (
                <section id="tour3d" className="scroll-mt-20">
                  <h2 className="mb-4 text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? '3D Тур' : '3D Tour'}
                  </h2>
                  <div className="rounded-lg overflow-hidden border border-border bg-muted/20">
                    {branch.tour3d_config ? (
                      <div className="w-full" style={{ aspectRatio: '16 / 9', minHeight: '400px' }}>
                        <PanoramaViewer config={branch.tour3d_config as TourConfig} locale={locale} />
                      </div>
                    ) : (
                      <div
                        className="w-full aspect-video"
                        dangerouslySetInnerHTML={{
                          __html: branch.tour3d_iframe?.replace(/width="[^"]*"/gi, 'width="100%"') || '',
                        }}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Location Section */}
              <section id="location" className="scroll-mt-20">
                <h2 className="mb-4 text-2xl font-bold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Как добраться' : 'Qanday yetib borish'}
                </h2>
                {branch.latitude && branch.longitude ? (
                  // If coordinates are available, use Google Maps embed with marker
                  <div className="mb-4 rounded-lg overflow-hidden border border-border relative">
                    <iframe
                      src={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}&hl=${locale === 'ru' ? 'ru' : 'uz'}&z=16&output=embed`}
                      width="100%"
                      height="480"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : branch.map_iframe ? (
                  // Fallback to custom iframe if no coordinates
                  <div className="mb-4 rounded-lg overflow-hidden border border-border">
                    <div
                      className="w-full aspect-video"
                      dangerouslySetInnerHTML={{ 
                        __html: branch.map_iframe.replace(/width="[^"]*"/gi, 'width="100%"')
                      }}
                    />
                  </div>
                ) : null}
              </section>
            </div>

            {/* Right Sidebar */}
            <aside className="lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-lg border border-border bg-white p-6 shadow-sm space-y-6">
                {/* Table of Contents */}
                <div>
                  <h3 className="mb-3 text-lg font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'В этой статье' : 'Bu maqolada'}
                  </h3>
                  <nav className="space-y-2">
                    {tocSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block text-sm text-brand-primary hover:underline"
                        suppressHydrationWarning
                      >
                        {section.label}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Address */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Адрес' : 'Manzil'}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary" />
                    <span suppressHydrationWarning>{address}</span>
                  </div>
                </div>

                {/* Phones */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Телефоны' : 'Telefonlar'}
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={`tel:${branch.phone}`}
                      className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {branch.phone}
                    </a>
                    {branch.phones && branch.phones.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {branch.phones.map((phone, idx) => (
                          <a
                            key={idx}
                            href={`tel:${phone}`}
                            className="block text-sm text-brand-primary hover:underline"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Links */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Навигация' : 'Navigatsiya'}
                  </h3>
                  <div className="space-y-2">
                    <a
                      href={yandexNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
                    >
                      <Navigation className="h-4 w-4" />
                      <span suppressHydrationWarning>
                        {locale === 'ru' ? 'Яндекс Навигатор' : 'Yandex Navigator'}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href={googleNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
                    >
                      <Navigation className="h-4 w-4" />
                      <span suppressHydrationWarning>
                        {locale === 'ru' ? 'Google Навигатор' : 'Google Navigator'}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                {(branch.workingHours_uz || branch.workingHours_ru) ? (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                      {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {getBilingualText(branch.workingHours_uz, branch.workingHours_ru, locale)
                        ?.split('\n')
                        .filter(line => line.trim())
                        .map((line, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-brand-primary flex-shrink-0" />
                            <span suppressHydrationWarning>{line.trim()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  // Fallback: Show default working hours if not set
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                      {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                    </h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-primary" />
                        <span suppressHydrationWarning>
                          {locale === 'ru' ? 'Понедельник - Пятница' : 'Dushanba - Juma'}: 09:00-20:00
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand-primary" />
                        <span suppressHydrationWarning>
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

