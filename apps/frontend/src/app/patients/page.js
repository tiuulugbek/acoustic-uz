"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = PatientsPage;
const script_1 = __importDefault(require("next/script"));
const api_server_1 = require("@/lib/api-server");
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const page_header_1 = __importDefault(require("@/components/page-header"));
const posts_list_paginated_1 = __importDefault(require("@/components/posts-list-paginated"));
const category_grid_1 = __importDefault(require("@/components/category-grid"));
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const image_utils_1 = require("@/lib/image-utils");
const image_1 = __importDefault(require("next/image"));
// Force dynamic rendering to always fetch fresh data from admin
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata() {
    const locale = (0, locale_server_1.detectLocale)();
    const page = await (0, api_server_1.getPageBySlug)('patients', locale);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const pageUrl = `${baseUrl}/patients`;
    if (!page || page.status !== 'published') {
        const title = locale === 'ru' ? 'Пациентам' : 'Bemorlar';
        const description = locale === 'ru'
            ? 'Информация для пациентов'
            : 'Bemorlar uchun ma\'lumot';
        return {
            title: `${title} — Acoustic.uz`,
            description,
            alternates: {
                canonical: pageUrl,
                languages: {
                    uz: pageUrl,
                    ru: pageUrl,
                    'x-default': pageUrl,
                },
            },
            openGraph: {
                title: `${title} — Acoustic.uz`,
                description,
                url: pageUrl,
                siteName: 'Acoustic.uz',
                locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${title} — Acoustic.uz`,
                description,
            },
        };
    }
    const title = (0, locale_1.getBilingualText)(page.metaTitle_uz, page.metaTitle_ru, locale) ||
        (0, locale_1.getBilingualText)(page.title_uz, page.title_ru, locale);
    const description = (0, locale_1.getBilingualText)(page.metaDescription_uz, page.metaDescription_ru, locale) ||
        (locale === 'ru' ? 'Информация для пациентов' : 'Bemorlar uchun ma\'lumot');
    const imageUrl = page.image?.url
        ? (page.image.url.startsWith('http')
            ? page.image.url
            : `${baseUrl}${page.image.url}`)
        : `${baseUrl}/logo.png`;
    return {
        title: `${title} — Acoustic.uz`,
        description: description || undefined,
        alternates: {
            canonical: pageUrl,
            languages: {
                uz: pageUrl,
                ru: pageUrl,
                'x-default': pageUrl,
            },
        },
        openGraph: {
            title: `${title} — Acoustic.uz`,
            description: description || undefined,
            url: pageUrl,
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
            description: description || undefined,
            images: [imageUrl],
        },
    };
}
async function PatientsPage() {
    const locale = (0, locale_server_1.detectLocale)();
    const [page, categories, branches, settings] = await Promise.all([
        (0, api_server_1.getPageBySlug)('patients', locale),
        (0, api_server_1.getPostCategories)(locale, 'patients'),
        (0, api_server_1.getBranches)(locale),
        (0, api_server_1.getSettings)(locale),
    ]);
    // Get posts ONLY from categories in this section
    // Each section shows only posts that belong to its own categories
    const categoryIds = categories?.map(cat => cat.id) || [];
    let posts = [];
    if (categoryIds.length > 0) {
        // Get posts from categories in this section only
        const allPosts = await Promise.all(categoryIds.map(categoryId => (0, api_server_1.getPosts)(locale, true, categoryId, 'article')));
        posts = allPosts.flat().filter((post, index, self) => index === self.findIndex(p => p.id === post.id));
        // Ensure posts belong to this section's categories
        posts = posts.filter(post => {
            // Only include posts that have a category AND belong to this section
            return post.categoryId && categoryIds.includes(post.categoryId);
        });
    }
    // Posts without category are NOT shown in section pages
    // Each section is isolated - only shows its own category posts
    // Use fallback if page doesn't exist or is not published
    const title = page && page.status === 'published'
        ? (0, locale_1.getBilingualText)(page.title_uz, page.title_ru, locale)
        : locale === 'ru' ? 'Пациентам' : 'Bemorlar';
    // Build BreadcrumbList Structured Data
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const pageUrl = `${baseUrl}/patients`;
    const breadcrumbJsonLd = {
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
                name: title,
                item: pageUrl,
            },
        ],
    };
    return (<main className="min-h-screen bg-background">
      {/* BreadcrumbList Structured Data */}
      <script_1.default id="breadcrumb-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}/>
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: title },
        ]} title={title}/>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Main Content */}
            <div className="min-w-0">
              {/* Categories Grid */}
              {categories && categories.length > 0 && (<div className="mb-8">
                  <category_grid_1.default categories={categories} locale={locale}/>
                </div>)}
              
              {/* Posts List with Pagination */}
              {posts && posts.length > 0 && (<div>
                  <h2 className="mb-6 text-2xl font-bold text-foreground">
                    {locale === 'ru' ? 'Статьи' : 'Maqolalar'}
                  </h2>
                  <posts_list_paginated_1.default posts={posts} locale={locale} postsPerPage={6}/>
                </div>)}
            </div>

            {/* Sidebar */}
            <aside className="sticky top-6 h-fit space-y-6">
              {/* Branches Card */}
              {branches && branches.length > 0 && (<div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    {locale === 'ru' ? 'Наши филиалы' : 'Bizning filiallarimiz'}
                  </h3>
                  <div className="space-y-4">
                    {branches.slice(0, 3).map((branch) => {
                const branchName = (0, locale_1.getBilingualText)(branch.name_uz, branch.name_ru, locale);
                const branchAddress = (0, locale_1.getBilingualText)(branch.address_uz, branch.address_ru, locale);
                const imageUrl = branch.image?.url ? (0, image_utils_1.normalizeImageUrl)(branch.image.url) : null;
                return (<link_1.default key={branch.id} href={`/branches/${branch.slug}`} className="group block rounded-lg border border-border bg-white p-3 transition-shadow hover:shadow-md">
                          {imageUrl && (<div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md bg-muted">
                              <image_1.default src={imageUrl} alt={branchName} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 320px"/>
                            </div>)}
                          <h4 className="mb-1 text-sm font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                            {branchName}
                          </h4>
                          {branchAddress && (<div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <lucide_react_1.MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-brand-primary"/>
                              <span className="line-clamp-2">{branchAddress}</span>
                            </div>)}
                          {branch.phone && (<div className="mt-2 flex items-center gap-2 text-xs text-brand-primary">
                              <lucide_react_1.Phone className="h-3 w-3"/>
                              <span>{branch.phone}</span>
                            </div>)}
                        </link_1.default>);
            })}
                  </div>
                  <link_1.default href="/branches" className="mt-4 block text-center text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors">
                    {locale === 'ru' ? 'Все филиалы →' : 'Barcha filiallar →'}
                  </link_1.default>
                </div>)}

              {/* Contact Card */}
              <div className="rounded-lg border border-border bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 p-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {locale === 'ru' ? 'Связаться с нами' : 'Biz bilan bog\'laning'}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {locale === 'ru'
            ? 'Наши специалисты готовы ответить на все ваши вопросы.'
            : 'Bizning mutaxassislarimiz barcha savollaringizga javob berishga tayyor.'}
                </p>
                <link_1.default href="/contact" className="block w-full rounded-md bg-brand-primary px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-accent">
                  {locale === 'ru' ? 'Связаться' : 'Bog\'lanish'}
                </link_1.default>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>);
}
//# sourceMappingURL=page.js.map