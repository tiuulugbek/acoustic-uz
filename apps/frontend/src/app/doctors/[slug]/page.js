"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = DoctorSlugPage;
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const api_server_1 = require("@/lib/api-server");
const page_header_1 = __importDefault(require("@/components/page-header"));
// Force dynamic rendering
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    const doctor = await (0, api_server_1.getDoctorBySlug)(params.slug, locale);
    const name = doctor ? (0, locale_1.getBilingualText)(doctor.name_uz, doctor.name_ru, locale) : '';
    return {
        title: name ? `${name} — Acoustic.uz` : (locale === 'ru' ? 'Специалист — Acoustic.uz' : 'Mutaxassis — Acoustic.uz'),
    };
}
async function DoctorSlugPage({ params }) {
    const locale = (0, locale_server_1.detectLocale)();
    const specialist = await (0, api_server_1.getDoctorBySlug)(params.slug, locale);
    if (!specialist) {
        return (<main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Специалист не найден' : 'Mutaxassis topilmadi'}
            </h1>
            <link_1.default href="/doctors" className="text-brand-primary hover:underline">
              {locale === 'ru' ? '← Вернуться к списку специалистов' : '← Mutaxassislar ro\'yxatiga qaytish'}
            </link_1.default>
          </div>
        </div>
      </main>);
    }
    const name = (0, locale_1.getBilingualText)(specialist.name_uz, specialist.name_ru, locale);
    const position = (0, locale_1.getBilingualText)(specialist.position_uz, specialist.position_ru, locale);
    const experience = (0, locale_1.getBilingualText)(specialist.experience_uz, specialist.experience_ru, locale);
    const description = (0, locale_1.getBilingualText)(specialist.description_uz, specialist.description_ru, locale);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    let imageUrl = specialist.image?.url || '';
    if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
        const baseUrl = API_BASE_URL.replace('/api', '');
        imageUrl = `${baseUrl}${imageUrl}`;
    }
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: locale === 'ru' ? 'Специалисты' : 'Mutaxassislar', href: '/doctors' },
            { label: name },
        ]} title={name} description={position}/>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar - Photo */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted/40 shadow-lg">
              {imageUrl ? (<image_1.default src={imageUrl} alt={name} fill className="object-cover" sizes="300px"/>) : (<div className="flex h-full items-center justify-center bg-brand-primary">
                  <span className="text-white text-6xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>)}
            </div>
          </aside>

          {/* Main Content */}
          <article className="min-w-0">
            <div className="mb-6 space-y-4">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl" suppressHydrationWarning>
                {name}
              </h1>
              {position && (<p className="text-xl font-medium text-brand-primary" suppressHydrationWarning>
                  {position}
                </p>)}
              {experience && (<p className="text-lg text-muted-foreground" suppressHydrationWarning>
                  {experience}
                </p>)}
            </div>

            {description && (<div className="prose prose-lg max-w-none">
                <p className="mb-4 leading-relaxed text-foreground/90 whitespace-pre-line" suppressHydrationWarning>
                  {description}
                </p>
              </div>)}
          </article>
        </div>
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map