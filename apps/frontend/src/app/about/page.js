"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = AboutPage;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const api_server_1 = require("@/lib/api-server");
const api_server_2 = require("@/lib/api-server");
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const page_header_1 = __importDefault(require("@/components/page-header"));
const service_content_1 = __importDefault(require("@/components/service-content"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
// Force dynamic rendering to always fetch fresh data from admin
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Helper to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    if (!url)
        return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}
// Helper to build full media URL
function buildMediaUrl(url) {
    if (!url)
        return '';
    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // If URL starts with /, it's relative to the backend base URL
    const baseUrl = API_BASE_URL.replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}
async function generateMetadata() {
    const locale = (0, locale_server_1.detectLocale)();
    const page = await (0, api_server_1.getPageBySlug)('about', locale);
    if (!page || page.status !== 'published') {
        return {
            title: locale === 'ru' ? 'О нас — Acoustic.uz' : 'Biz haqimizda — Acoustic.uz',
            description: locale === 'ru'
                ? 'Информация о центре Acoustic'
                : 'Acoustic markazi haqida ma\'lumot',
        };
    }
    const title = (0, locale_1.getBilingualText)(page.metaTitle_uz, page.metaTitle_ru, locale) ||
        (0, locale_1.getBilingualText)(page.title_uz, page.title_ru, locale);
    const description = (0, locale_1.getBilingualText)(page.metaDescription_uz, page.metaDescription_ru, locale);
    return {
        title: `${title} — Acoustic.uz`,
        description: description || undefined,
    };
}
async function AboutPage() {
    const locale = (0, locale_server_1.detectLocale)();
    const page = await (0, api_server_1.getPageBySlug)('about', locale);
    if (!page || page.status !== 'published') {
        (0, navigation_1.notFound)();
    }
    const title = (0, locale_1.getBilingualText)(page.title_uz, page.title_ru, locale);
    const body = (0, locale_1.getBilingualText)(page.body_uz, page.body_ru, locale) || '';
    // Get gallery images from page response
    const galleryImages = page.gallery || [];
    // Fetch useful articles
    const allPosts = await (0, api_server_2.getPosts)(locale, true, undefined, 'article');
    const usefulArticles = page.usefulArticleSlugs
        ? allPosts.filter((post) => page.usefulArticleSlugs?.includes(post.slug))
        : [];
    // Extract YouTube video ID
    const videoId = getYouTubeVideoId(page.videoUrl);
    // Extract headings from body for anchor links
    const headings = [];
    if (body) {
        const headingRegex = /<(h[23])[^>]*>(.*?)<\/h[23]>/gi;
        let match;
        let index = 0;
        while ((match = headingRegex.exec(body)) !== null) {
            const text = match[2].replace(/<[^>]*>/g, ''); // Remove HTML tags
            headings.push({ id: `section-${index}`, text });
            index++;
        }
    }
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: title },
        ]} title={title}/>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary/10 via-brand-accent/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground" suppressHydrationWarning>
                {locale === 'ru'
            ? 'Acoustic — это сеть современных центров слуха, специализирующихся на улучшении слухового здоровья в Узбекистане.'
            : 'Acoustic — bu O\'zbekistonda eshitish salomatligini yaxshilashga ixtisoslashgan zamonaviy eshitish markazlari tarmog\'i.'}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" suppressHydrationWarning>
                {locale === 'ru'
            ? 'Мы помогаем улучшить качество жизни детей и взрослых через глубокую диагностику слуховых способностей, правильный выбор решений и постоянную поддержку.'
            : 'Biz bolalar va kattalarning eshitish qobiliyatini chuqur diagnostika qilish, to\'g\'ri yechim tanlash va doimiy qo\'llab-quvvatlash orqali hayot sifatini oshirishga xizmat qilamiz.'}
              </p>
            </div>
            {galleryImages.length > 0 && (<div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/40 shadow-lg">
                <image_1.default src={buildMediaUrl(galleryImages[0].url)} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority/>
              </div>)}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Section */}
            {videoId && (<section className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                  <iframe src={`https://www.youtube.com/embed/${videoId}`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full"/>
                </div>
              </section>)}

            {/* Image Gallery */}
            {galleryImages.length > 1 && (<section className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="mb-4 text-xl font-semibold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Галерея' : 'Galereya'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.slice(1, 7).map((media) => {
                const mediaUrl = buildMediaUrl(media.url);
                const altText = (0, locale_1.getBilingualText)(media.alt_uz, media.alt_ru, locale) || `Gallery image`;
                return (<div key={media.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted/40 group cursor-pointer">
                        <image_1.default src={mediaUrl} alt={altText} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="(max-width: 768px) 50vw, 33vw"/>
                      </div>);
            })}
                </div>
              </section>)}

            {/* Content Section */}
            <section className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <service_content_1.default content={body} locale={locale}/>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-xl p-6 md:p-8 border border-brand-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <lucide_react_1.Award className="h-6 w-6 text-brand-primary"/>
                <h3 className="text-2xl font-bold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Почему именно Acoustic?' : 'Nega aynan Acoustic?'}
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <lucide_react_1.CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? '10+ лет опыта' : '10+ yillik tajriba'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Многолетний опыт работы в области слухопротезирования' : 'Eshitish protezlash sohasida ko\'p yillik tajriba'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <lucide_react_1.MapPin className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Множество филиалов' : 'Ko\'plab filiallar'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Удобное расположение по всему Узбекистану' : 'O\'zbekiston bo\'ylab qulay joylashuv'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <lucide_react_1.Users className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Тысячи пациентов' : 'Minglab bemorlar'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Доверие тысяч довольных пациентов' : 'Minglab mamnun bemorlarning ishonchi'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <lucide_react_1.Shield className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Оригинальное оборудование' : 'Asl jihozlar'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Сертифицированное оригинальное оборудование' : 'Sertifikatlangan asl jihozlar'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl p-6 text-white shadow-lg">
              <h3 className="mb-4 text-lg font-semibold" suppressHydrationWarning>
                {locale === 'ru' ? 'Свяжитесь с нами' : 'Biz bilan bog\'laning'}
              </h3>
              <div className="space-y-3">
                <a href="tel:+998712021441" className="flex items-center gap-3 hover:opacity-80 transition">
                  <lucide_react_1.Phone className="h-5 w-5"/>
                  <span className="text-sm">+998 71 202 14 41</span>
                </a>
                <a href="mailto:info@acoustic.uz" className="flex items-center gap-3 hover:opacity-80 transition">
                  <lucide_react_1.Mail className="h-5 w-5"/>
                  <span className="text-sm">info@acoustic.uz</span>
                </a>
              </div>
            </div>

            {/* Table of Contents */}
            {headings.length > 0 && (<div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'В этой статье' : 'Ushbu maqolada'}
                </h3>
                <nav className="space-y-2">
                  {headings.map((heading) => (<link_1.default key={heading.id} href={`#${heading.id}`} className="block text-sm text-brand-primary hover:text-brand-accent transition" suppressHydrationWarning>
                      {heading.text}
                    </link_1.default>))}
                </nav>
              </div>)}

            {/* Useful Articles */}
            {usefulArticles.length > 0 && (<div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
                </h3>
                <div className="space-y-4">
                  {usefulArticles.map((article) => {
                const articleTitle = (0, locale_1.getBilingualText)(article.title_uz, article.title_ru, locale);
                const articleExcerpt = (0, locale_1.getBilingualText)(article.excerpt_uz, article.excerpt_ru, locale);
                const coverUrl = article.cover?.url
                    ? buildMediaUrl(article.cover.url)
                    : null;
                return (<link_1.default key={article.id} href={`/posts/${article.slug}`} className="group flex gap-3 transition hover:opacity-80">
                        {coverUrl && (<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted/40">
                            <image_1.default src={coverUrl} alt={articleTitle} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="64px"/>
                          </div>)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-brand-primary group-hover:text-brand-accent line-clamp-2" suppressHydrationWarning>
                            {articleTitle}
                          </h4>
                          {articleExcerpt && (<p className="mt-1 text-xs text-muted-foreground line-clamp-2" suppressHydrationWarning>
                              {articleExcerpt}
                            </p>)}
                        </div>
                      </link_1.default>);
            })}
                </div>
              </div>)}
          </aside>
        </div>
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map