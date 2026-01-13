"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = FeedbackPage;
const api_server_1 = require("@/lib/api-server");
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const page_header_1 = __importDefault(require("@/components/page-header"));
const service_content_1 = __importDefault(require("@/components/service-content"));
const lucide_react_1 = require("lucide-react");
// Force dynamic rendering
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata() {
    const locale = (0, locale_server_1.detectLocale)();
    return {
        title: locale === 'ru' ? 'Обратная связь — Acoustic.uz' : 'Fikr bildirish — Acoustic.uz',
        description: locale === 'ru'
            ? 'Оставьте свой отзыв или задайте вопрос'
            : 'O\'z fikringizni qoldiring yoki savol bering',
    };
}
async function FeedbackPage() {
    const locale = (0, locale_server_1.detectLocale)();
    const page = await (0, api_server_1.getPageBySlug)('feedback', locale);
    const title = page && page.status === 'published'
        ? (0, locale_1.getBilingualText)(page.title_uz, page.title_ru, locale)
        : (locale === 'ru' ? 'Обратная связь' : 'Fikr bildirish');
    const body = page && page.status === 'published'
        ? (0, locale_1.getBilingualText)(page.body_uz, page.body_ru, locale) || ''
        : '';
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: title },
        ]} title={title} icon={<lucide_react_1.MessageSquare className="h-8 w-8 text-white"/>}/>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        {body ? (<section className="bg-white rounded-lg p-6">
            <service_content_1.default content={body} locale={locale}/>
          </section>) : (<section className="bg-white rounded-lg p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru'
                ? 'Форма обратной связи будет добавлена в ближайшее время.'
                : 'Fikr bildirish formasi tez orada qo\'shiladi.'}
              </p>
            </div>
          </section>)}
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map