"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = BranchPage;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const dynamic_1 = __importDefault(require("next/dynamic"));
const api_server_1 = require("@/lib/api-server");
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const lucide_react_1 = require("lucide-react");
const page_header_1 = __importDefault(require("@/components/page-header"));
// Dynamically import PanoramaViewer for client-side rendering
const PanoramaViewer = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require('@/components/tour/PanoramaViewer'))), {
    ssr: false,
    loading: () => {
        // We can't access locale here in loading component, so use bilingual text
        return (<div className="flex h-[500px] w-full items-center justify-center bg-gray-100 text-lg text-gray-500">
        <span suppressHydrationWarning>3D Tour yuklanmoqda... / Загрузка 3D тура...</span>
      </div>);
    },
});
// Force dynamic rendering
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Helper function to parse working hours and highlight current day
function parseWorkingHours(workingHours, locale) {
    if (!workingHours)
        return { lines: [], currentDayLine: null };
    const lines = workingHours.split('\n').filter(line => line.trim());
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Day names mapping (including variations)
    const dayNames = {
        uz: {
            'yakshanba': 0,
            'dushanba': 1,
            'seshanba': 2,
            'chorshanba': 3,
            'payshanba': 4,
            'juma': 5,
            'shanba': 6,
        },
        ru: {
            'воскресенье': 0,
            'понедельник': 1,
            'вторник': 2,
            'среда': 3,
            'четверг': 4,
            'пятница': 5,
            'суббота': 6,
        },
    };
    const dayMap = dayNames[locale];
    let currentDayLine = null;
    // Find current day line
    lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        // Check if line contains current day name
        for (const [dayName, dayNumber] of Object.entries(dayMap)) {
            if (dayNumber === today && lowerLine.includes(dayName)) {
                currentDayLine = index;
                break;
            }
        }
        // Also check for day ranges (e.g., "Понедельник - Пятница" when today is Wednesday)
        if (currentDayLine === null) {
            // Check if line contains a range that includes today
            const rangePatterns = {
                uz: [
                    [1, 5], // Dushanba - Juma
                    [5, 6], // Juma - Shanba
                    [6, 0], // Shanba - Yakshanba
                ],
                ru: [
                    [1, 5], // Понедельник - Пятница
                    [5, 6], // Пятница - Суббота
                    [6, 0], // Суббота - Воскресенье
                ],
            };
            const ranges = rangePatterns[locale];
            for (const [startDay, endDay] of ranges) {
                const startDayName = Object.entries(dayMap).find(([_, num]) => num === startDay)?.[0];
                const endDayName = Object.entries(dayMap).find(([_, num]) => num === endDay)?.[0];
                if (startDayName && endDayName && lowerLine.includes(startDayName) && lowerLine.includes(endDayName)) {
                    // Check if today is within the range
                    if (startDay <= endDay) {
                        // Normal range (e.g., Monday to Friday)
                        if (today >= startDay && today <= endDay) {
                            currentDayLine = index;
                            break;
                        }
                    }
                    else {
                        // Wrapping range (e.g., Saturday to Sunday)
                        if (today >= startDay || today <= endDay) {
                            currentDayLine = index;
                            break;
                        }
                    }
                }
            }
        }
    });
    return { lines, currentDayLine };
}
async function generateMetadata({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    const branch = await (0, api_server_1.getBranchBySlug)(params.slug, locale);
    if (!branch) {
        return {
            title: locale === 'ru' ? 'Филиал — Acoustic.uz' : 'Filial — Acoustic.uz',
            description: locale === 'ru'
                ? 'Адрес филиала и контактная информация'
                : 'Filial manzili va kontakt ma\'lumotlari',
        };
    }
    const name = (0, locale_1.getBilingualText)(branch.name_uz, branch.name_ru, locale);
    const address = (0, locale_1.getBilingualText)(branch.address_uz, branch.address_ru, locale);
    return {
        title: `${name} — Acoustic.uz`,
        description: address,
    };
}
async function BranchPage({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    // Try to get branch by slug first
    let branch = await (0, api_server_1.getBranchBySlug)(params.slug, locale);
    // If not found by slug, try to get by id (fallback for old links)
    if (!branch) {
        const { getBranches } = await Promise.resolve().then(() => __importStar(require('@/lib/api-server')));
        const branches = await getBranches(locale);
        branch = branches.find(b => b.id === params.slug) || null;
    }
    const doctors = await (0, api_server_1.getDoctors)(locale);
    const allServices = await (0, api_server_1.getServices)(locale);
    if (!branch) {
        return (<main className="min-h-screen bg-background">
        <section className="bg-muted/40 py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold text-foreground" suppressHydrationWarning>
                {locale === 'ru' ? 'Филиал не найден' : 'Filial topilmadi'}
              </h1>
              <link_1.default href="/branches" className="text-brand-primary hover:underline">
                {locale === 'ru' ? 'Вернуться к списку филиалов' : 'Filiallar ro\'yxatiga qaytish'}
              </link_1.default>
            </div>
          </div>
        </section>
      </main>);
    }
    const name = (0, locale_1.getBilingualText)(branch.name_uz, branch.name_ru, locale);
    const address = (0, locale_1.getBilingualText)(branch.address_uz, branch.address_ru, locale);
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
    return (<main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: locale === 'ru' ? 'Наши адреса' : 'Bizning manzillarimiz', href: '/branches' },
            { label: name },
        ]} title="" description=""/>

      {/* Main Content */}
      <section className="bg-white py-4 sm:py-8 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[2fr_1fr]">
            {/* Left Column - Main Content */}
            <div className="space-y-6 sm:space-y-8 min-w-0 w-full">
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
              {services.length > 0 && (<section id="services" className="scroll-mt-20">
                  <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
                  </h2>
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                    {services.map((service) => (<link_1.default key={service.id} href={`/services/${service.slug}`} className="flex items-start gap-2 group hover:text-brand-primary transition-colors">
                        <span className="mt-1 text-brand-primary flex-shrink-0">•</span>
                        <span className="text-sm sm:text-base text-foreground group-hover:text-brand-primary break-words" suppressHydrationWarning>
                          {(0, locale_1.getBilingualText)(service.title_uz, service.title_ru, locale)}
                        </span>
                      </link_1.default>))}
                  </div>
                </section>)}

              {/* Doctors Section */}
              {doctors && doctors.length > 0 && (<section id="doctors" className="scroll-mt-20">
                  <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Врачи' : 'Shifokorlar'}
                  </h2>
                  <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                    {doctors.slice(0, 4).map((doctor) => {
                const doctorName = (0, locale_1.getBilingualText)(doctor.name_uz, doctor.name_ru, locale);
                const position = (0, locale_1.getBilingualText)(doctor.position_uz, doctor.position_ru, locale);
                const experience = (0, locale_1.getBilingualText)(doctor.experience_uz, doctor.experience_ru, locale);
                let doctorImageUrl = doctor.image?.url || '';
                if (doctorImageUrl && doctorImageUrl.startsWith('/') && !doctorImageUrl.startsWith('//')) {
                    const baseUrl = API_BASE_URL.replace('/api', '');
                    doctorImageUrl = `${baseUrl}${doctorImageUrl}`;
                }
                return (<link_1.default key={doctor.id} href={`/doctors/${doctor.slug}`} className="group block rounded-lg border border-border bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md">
                          <div className="flex gap-3 sm:gap-4">
                            {doctorImageUrl ? (<div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
                                <image_1.default src={doctorImageUrl} alt={doctorName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 64px, 80px"/>
                              </div>) : (<div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center">
                                <span className="text-xl sm:text-2xl font-bold text-white">
                                  {doctorName.charAt(0).toUpperCase()}
                                </span>
                              </div>)}
                            <div className="flex-1 min-w-0">
                              <h3 className="mb-1 text-sm sm:text-base font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                                {doctorName}
                              </h3>
                              {position && (<p className="text-xs sm:text-sm text-muted-foreground" suppressHydrationWarning>
                                  {position}
                                </p>)}
                              {experience && (<p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>
                                  {experience}
                                </p>)}
                            </div>
                          </div>
                        </link_1.default>);
            })}
                  </div>
                </section>)}

              {/* 3D Tour Section */}
              {(branch.tour3d_config || branch.tour3d_iframe) && (<section id="tour3d" className="scroll-mt-20 w-full overflow-x-hidden">
                  <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? '3D Тур' : '3D Tour'}
                  </h2>
                  <div className="rounded-lg overflow-hidden border border-border bg-muted/20 w-full max-w-full">
                    {branch.tour3d_config ? (<div className="w-full max-w-full" style={{ aspectRatio: '16 / 9', minHeight: '250px', maxHeight: '500px' }}>
                        <PanoramaViewer config={branch.tour3d_config} locale={locale}/>
                      </div>) : (<div className="w-full max-w-full" style={{ aspectRatio: '16 / 9', minHeight: '250px', maxHeight: '500px', position: 'relative', overflow: 'hidden' }} dangerouslySetInnerHTML={{
                    __html: branch.tour3d_iframe
                        ?.replace(/width="[^"]*"/gi, 'width="100%"')
                        .replace(/height="[^"]*"/gi, 'height="100%"')
                        .replace(/style="[^"]*"/gi, 'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; max-width: 100%;"') || '',
                }}/>)}
                  </div>
                </section>)}

              {/* Location Section */}
              <section id="location" className="scroll-mt-20 w-full overflow-x-hidden">
                <h2 className="mb-3 text-xl sm:text-2xl font-bold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Как добраться' : 'Qanday yetib borish'}
                </h2>
                {branch.map_iframe ? (
        // Use custom iframe if available (highest priority)
        <div className="mb-4 rounded-lg overflow-hidden border border-border bg-gray-100 w-full max-w-full">
                    <div className="w-full max-w-full" style={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden',
                minHeight: '250px',
                maxHeight: '500px'
            }} dangerouslySetInnerHTML={{
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
            }}/>
                  </div>) : branch.latitude && branch.longitude ? (
        // If coordinates are available, use Yandex Maps embed (more reliable than Google Maps)
        <div className="mb-4 rounded-lg overflow-hidden border border-border bg-gray-100 relative w-full max-w-full" style={{ paddingBottom: '56.25%', height: 0, minHeight: '250px', maxHeight: '500px' }}>
                    <iframe src={`https://yandex.com/map-widget/v1/?ll=${branch.longitude},${branch.latitude}&z=16&pt=${branch.longitude},${branch.latitude}&lang=${locale === 'ru' ? 'ru_RU' : 'uz_UZ'}`} width="100%" height="100%" className="absolute top-0 left-0 w-full h-full max-w-full" style={{ border: 0, maxWidth: '100%' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={locale === 'ru' ? 'Карта' : 'Xarita'}/>
                  </div>) : null}
              </section>
            </div>

            {/* Right Sidebar */}
            <aside className="lg:sticky lg:top-4 lg:self-start order-first lg:order-last">
              <div className="rounded-lg border border-border bg-white p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
                {/* Table of Contents */}
                <div>
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-bold text-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'В этой статье' : 'Bu maqolada'}
                  </h3>
                  <nav className="space-y-1.5 sm:space-y-2">
                    {tocSections.map((section) => (<a key={section.id} href={`#${section.id}`} className="block text-xs sm:text-sm text-brand-primary hover:underline break-words" suppressHydrationWarning>
                        {section.label}
                      </a>))}
                  </nav>
                </div>

                {/* Address */}
                <div>
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Адрес' : 'Manzil'}
                  </h3>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                    <lucide_react_1.MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-brand-primary"/>
                    <span className="break-words" suppressHydrationWarning>{address}</span>
                  </div>
                </div>

                {/* Phones */}
                <div>
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Телефоны' : 'Telefonlar'}
                  </h3>
                  <div className="space-y-2">
                    <a href={`tel:${branch.phone}`} className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary hover:underline break-all">
                      <lucide_react_1.Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"/>
                      <span>{branch.phone}</span>
                    </a>
                    {branch.phones && branch.phones.length > 0 && (<div className="ml-5 sm:ml-6 space-y-1">
                        {branch.phones.map((phone, idx) => (<a key={idx} href={`tel:${phone}`} className="block text-xs sm:text-sm text-brand-primary hover:underline break-all">
                            {phone}
                          </a>))}
                      </div>)}
                  </div>
                </div>

                {/* Navigation Links */}
                <div>
                  <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                    {locale === 'ru' ? 'Навигация' : 'Navigatsiya'}
                  </h3>
                  <div className="space-y-2">
                    <a href={yandexNavUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary hover:underline">
                      <lucide_react_1.Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"/>
                      <span className="break-words" suppressHydrationWarning>
                        {locale === 'ru' ? 'Яндекс Навигатор' : 'Yandex Navigator'}
                      </span>
                      <lucide_react_1.ExternalLink className="h-3 w-3 flex-shrink-0"/>
                    </a>
                    <a href={googleNavUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs sm:text-sm text-brand-primary hover:underline">
                      <lucide_react_1.Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"/>
                      <span className="break-words" suppressHydrationWarning>
                        {locale === 'ru' ? 'Google Навигатор' : 'Google Navigator'}
                      </span>
                      <lucide_react_1.ExternalLink className="h-3 w-3 flex-shrink-0"/>
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                {(branch.workingHours_uz || branch.workingHours_ru) ? (() => {
            const workingHours = (0, locale_1.getBilingualText)(branch.workingHours_uz, branch.workingHours_ru, locale) || '';
            const { lines, currentDayLine } = parseWorkingHours(workingHours, locale);
            return (<div>
                      <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                        {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                      </h3>
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        {lines.map((line, idx) => {
                    const isCurrentDay = idx === currentDayLine;
                    return (<div key={idx} className={`flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors ${isCurrentDay
                            ? 'bg-brand-primary text-white shadow-sm'
                            : 'text-muted-foreground hover:bg-gray-50'}`}>
                              <lucide_react_1.Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 ${isCurrentDay ? 'text-white' : 'text-brand-primary'}`}/>
                              <span className={`break-words ${isCurrentDay ? 'font-semibold text-white' : ''}`} suppressHydrationWarning>
                                {line.trim()}
                              </span>
                            </div>);
                })}
                      </div>
                    </div>);
        })() : (
        // Fallback: Show default working hours if not set
        <div>
                    <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
                      {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                    </h3>
                    <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <lucide_react_1.Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-primary flex-shrink-0 mt-0.5"/>
                        <span className="break-words" suppressHydrationWarning>
                          {locale === 'ru' ? 'Понедельник - Пятница' : 'Dushanba - Juma'}: 09:00-20:00
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <lucide_react_1.Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-primary flex-shrink-0 mt-0.5"/>
                        <span className="break-words" suppressHydrationWarning>
                          {locale === 'ru' ? 'Суббота - Воскресенье' : 'Shanba - Yakshanba'}: 09:00-18:00
                        </span>
                      </div>
                    </div>
                  </div>)}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>);
}
//# sourceMappingURL=page.js.map