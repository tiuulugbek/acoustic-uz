"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = void 0;
exports.generateMetadata = generateMetadata;
exports.default = ServiceSlugPage;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const api_server_1 = require("@/lib/api-server");
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const image_utils_1 = require("@/lib/image-utils");
const service_content_1 = __importDefault(require("@/components/service-content"));
const service_table_of_contents_1 = __importDefault(require("@/components/service-table-of-contents"));
const page_header_1 = __importDefault(require("@/components/page-header"));
const appointment_form_1 = __importDefault(require("@/components/appointment-form"));
const sidebar_1 = __importDefault(require("@/components/sidebar"));
// ISR: Revalidate every 5 minutes to ensure category and description updates are reflected quickly
exports.revalidate = 300;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
async function generateMetadata({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    // Try to get category first
    const category = await (0, api_server_1.getServiceCategoryBySlug)(params.slug, locale);
    if (category) {
        const title = (0, locale_1.getBilingualText)(category.name_uz, category.name_ru, locale);
        return {
            title: `${title} — Acoustic.uz`,
            description: (0, locale_1.getBilingualText)(category.description_uz, category.description_ru, locale) || undefined,
        };
    }
    // Try to get service
    const service = await (0, api_server_1.getServiceBySlug)(params.slug, locale);
    if (!service) {
        return {
            title: locale === 'ru' ? 'Услуга — Acoustic.uz' : 'Xizmat — Acoustic.uz',
            description: locale === 'ru'
                ? 'Услуги по диагностике и подбору слуховых аппаратов'
                : 'Eshitish diagnostikasi va apparatlarni tanlash xizmatlari',
        };
    }
    const title = (0, locale_1.getBilingualText)(service.title_uz, service.title_ru, locale);
    const description = (0, locale_1.getBilingualText)(service.excerpt_uz, service.excerpt_ru, locale) || undefined;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const serviceUrl = `${baseUrl}/services/${params.slug}`;
    const imageUrl = service.cover?.url
        ? (0, image_utils_1.normalizeImageUrl)(service.cover.url)
        : `${baseUrl}/logo.png`;
    return {
        title: `${title} — Acoustic.uz`,
        description,
        alternates: {
            canonical: serviceUrl,
            languages: {
                uz: serviceUrl,
                ru: serviceUrl,
                'x-default': serviceUrl,
            },
        },
        openGraph: {
            title: `${title} — Acoustic.uz`,
            description,
            url: serviceUrl,
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
            title: `${title} — Acoustic.uz`,
            description,
            images: [imageUrl],
        },
    };
}
async function ServiceSlugPage({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    // First, try to get category by slug
    const category = await (0, api_server_1.getServiceCategoryBySlug)(params.slug, locale);
    if (category) {
        // This is a category - show services within this category
        const categoryTitle = (0, locale_1.getBilingualText)(category.name_uz, category.name_ru, locale);
        const categoryDescription = (0, locale_1.getBilingualText)(category.description_uz, category.description_ru, locale);
        // Get services for this category (they should be included in the category response)
        const services = (category.services || []).filter(service => service.status === 'published');
        // Build category image URL (normalize it)
        const categoryImage = (0, image_utils_1.normalizeImageUrl)(category.image?.url || '');
        return (<main className="min-h-screen bg-background">
        <page_header_1.default locale={locale} breadcrumbs={[
                { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
                { label: locale === 'ru' ? 'Услуги' : 'Xizmatlar', href: '/services' },
                { label: categoryTitle },
            ]} title={categoryTitle} description={categoryDescription}/>
        
        {categoryImage && (<section className="bg-white py-8">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
              <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg bg-muted/40">
                <image_1.default src={categoryImage} alt={categoryTitle} fill className="object-cover" sizes="(max-width: 768px) 100vw, 1200px" suppressHydrationWarning/>
              </div>
            </div>
          </section>)}

        {/* Services Grid */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            {services.length > 0 ? (<div className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {services.map((service) => {
                    const serviceTitle = (0, locale_1.getBilingualText)(service.title_uz, service.title_ru, locale);
                    const serviceExcerpt = (0, locale_1.getBilingualText)(service.excerpt_uz, service.excerpt_ru, locale);
                    // Build service image URL (normalize it)
                    const serviceImage = (0, image_utils_1.normalizeImageUrl)(service.cover?.url || '');
                    return (<link_1.default key={service.id} href={`/services/${service.slug}`} className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                        {serviceImage ? (<image_1.default src={serviceImage} alt={serviceTitle} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" suppressHydrationWarning/>) : (<div className="flex h-full items-center justify-center bg-brand-primary">
                            <span className="text-white text-sm sm:text-lg font-bold">Acoustic</span>
                          </div>)}
                      </div>
                      <div className="flex flex-1 flex-col p-3 sm:p-5">
                        <h3 className="mb-1 sm:mb-2 text-sm sm:text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors line-clamp-2" suppressHydrationWarning>
                          {serviceTitle}
                        </h3>
                        {serviceExcerpt && (<p className="flex-1 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2 sm:line-clamp-3" suppressHydrationWarning>
                            {serviceExcerpt}
                          </p>)}
                      </div>
                    </link_1.default>);
                })}
              </div>) : (<div className="text-center py-12">
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {locale === 'ru'
                    ? 'В этой категории пока нет услуг.'
                    : 'Ushbu kategoriyada hozircha xizmatlar yo\'q.'}
                </p>
              </div>)}
          </div>
        </section>
      </main>);
    }
    // This is a service slug - show service detail
    const [service, brands, settings] = await Promise.all([
        (0, api_server_1.getServiceBySlug)(params.slug, locale),
        (0, api_server_1.getBrands)(locale),
        (0, api_server_1.getSettings)(locale),
    ]);
    // If service is null, show fallback UI (backend down or service not found)
    if (!service) {
        return (<main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <link_1.default href="/services" className="text-sm font-semibold text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? '← Вернуться к услугам' : '← Xizmatlarga qaytish'}
          </link_1.default>
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
      </main>);
    }
    const title = (0, locale_1.getBilingualText)(service.title_uz, service.title_ru, locale);
    const description = (0, locale_1.getBilingualText)(service.excerpt_uz, service.excerpt_ru, locale);
    const body = (0, locale_1.getBilingualText)(service.body_uz, service.body_ru, locale);
    const coverAlt = (0, locale_1.getBilingualText)(service.cover?.alt_uz, service.cover?.alt_ru, locale) || title;
    // Build breadcrumbs
    const breadcrumbItems = [
        { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
        { label: locale === 'ru' ? 'Услуги' : 'Xizmatlar', href: '/services' },
    ];
    if (service.category) {
        const categoryTitle = (0, locale_1.getBilingualText)(service.category.name_uz, service.category.name_ru, locale);
        breadcrumbItems.push({
            label: categoryTitle,
            href: `/services/${service.category.slug}`
        });
    }
    breadcrumbItems.push({ label: title, href: `/services/${service.slug}` });
    // Extract table of contents from body content (headings)
    const extractTableOfContents = (content) => {
        if (!content)
            return [];
        // Check if content is HTML
        const isHTML = /<[a-z][\s\S]*>/i.test(content);
        if (isHTML) {
            // Extract headings from HTML (same order as ServiceContent component)
            const toc = [];
            let headingIndex = 0;
            // Extract all headings in order (H2 first, then H3)
            const allHeadingsRegex = /<(h[23])[^>]*>(.*?)<\/h[23]>/gi;
            let match;
            while ((match = allHeadingsRegex.exec(content)) !== null) {
                const tag = match[1]; // h2 or h3
                const title = match[2].replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
                if (title) {
                    const level = tag === 'h2' ? 2 : 3;
                    const id = `section-${headingIndex++}`;
                    toc.push({ id, title, level });
                }
            }
            return toc;
        }
        // Otherwise, process as markdown
        const lines = content.split('\n');
        const toc = [];
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('## ')) {
                const title = trimmed.substring(3);
                const id = `section-${index}`;
                toc.push({ id, title, level: 2 });
            }
            else if (trimmed.startsWith('### ')) {
                const title = trimmed.substring(4);
                const id = `section-${index}`;
                toc.push({ id, title, level: 3 });
            }
        });
        return toc;
    };
    const tableOfContents = extractTableOfContents(body || '');
    // Get related services from the same category
    let relatedServices = [];
    if (service.category) {
        const category = await (0, api_server_1.getServiceCategoryBySlug)(service.category.slug, locale);
        if (category?.services) {
            relatedServices = category.services
                .filter(s => s.id !== service.id && s.status === 'published')
                .slice(0, 6)
                .map(s => ({
                id: s.id,
                title_uz: s.title_uz,
                title_ru: s.title_ru,
                slug: s.slug,
                cover: s.cover,
            }));
        }
    }
    // Build cover image URL (normalize it)
    const coverImageUrl = (0, image_utils_1.normalizeImageUrl)(service.cover?.url || '');
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={breadcrumbItems.map(item => ({
            label: item.label,
            href: item.href !== '#' ? item.href : undefined,
        }))} title={title} description={description}/>

      {/* Main Content with Sidebar */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-10 md:px-6">
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <article className="min-w-0">
            <div className="mb-6 space-y-4">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">{title}</h1>
              {description && (<p className="text-lg leading-relaxed text-muted-foreground">{description}</p>)}
            </div>

            {coverImageUrl && (<div className="relative mb-10 w-full overflow-hidden rounded-xl bg-muted/40 shadow-lg">
                <div className="relative aspect-[21/9] w-full">
                  <image_1.default src={coverImageUrl} alt={coverAlt} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"/>
                </div>
              </div>)}

            <service_content_1.default content={body || ''} locale={locale}/>

            {/* Appointment Form - Below content, same grid layout */}
            <div className="mt-8 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-lg p-6">
              <div className="mb-4">
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  {locale === 'ru' ? 'Записаться на консультацию' : 'Maslahat uchun yozilish'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {locale === 'ru'
            ? 'Наши специалисты готовы ответить на все ваши вопросы и помочь подобрать оптимальное решение для вашего слуха.'
            : 'Bizning mutaxassislarimiz barcha savollaringizga javob berishga va eshitishingiz uchun eng yaxshi yechimni topishga tayyor.'}
                </p>
              </div>
              <appointment_form_1.default locale={locale} doctorId={null} source={`service-${service.slug}`}/>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="sticky top-6 h-fit space-y-4 sm:space-y-6">
            {/* Sidebar Component */}
            <sidebar_1.default locale={locale} settingsData={settings} brandsData={brands} pageType="services"/>
            
            {/* Table of Contents */}
            <service_table_of_contents_1.default items={tableOfContents} locale={locale}/>

            {/* Related Services */}
            {relatedServices.length > 0 && (<div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
                </h3>
                <ul className="space-y-4">
                  {relatedServices.map((relatedService) => {
                const relatedTitle = (0, locale_1.getBilingualText)(relatedService.title_uz, relatedService.title_ru, locale);
                const relatedImageUrl = (0, image_utils_1.normalizeImageUrl)(relatedService.cover?.url || '');
                return (<li key={relatedService.id}>
                        <link_1.default href={`/services/${relatedService.slug}`} className="group flex gap-3 transition-opacity hover:opacity-80">
                          {relatedImageUrl && (<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted/20">
                              <image_1.default src={relatedImageUrl} alt={relatedTitle} fill className="object-cover" sizes="64px"/>
                            </div>)}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium leading-snug text-foreground group-hover:text-brand-primary transition-colors">
                              {relatedTitle}
                            </h4>
                          </div>
                        </link_1.default>
                      </li>);
            })}
                </ul>
              </div>)}
          </aside>
        </div>
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map