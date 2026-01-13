"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = ContactsPage;
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
        title: locale === 'ru' ? 'Контакты — Acoustic.uz' : 'Bog\'lanish — Acoustic.uz',
        description: locale === 'ru'
            ? 'Контактная информация центра слуха Acoustic'
            : 'Acoustic eshitish markazi kontakt ma\'lumotlari',
    };
}
async function ContactsPage() {
    const locale = (0, locale_server_1.detectLocale)();
    const [page, settings] = await Promise.all([
        (0, api_server_1.getPageBySlug)('contacts', locale),
        (0, api_server_1.getSettings)(locale),
    ]);
    const title = page && page.status === 'published'
        ? (0, locale_1.getBilingualText)(page.title_uz, page.title_ru, locale)
        : (locale === 'ru' ? 'Контакты' : 'Bog\'lanish');
    const body = page && page.status === 'published'
        ? (0, locale_1.getBilingualText)(page.body_uz, page.body_ru, locale) || ''
        : '';
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: title },
        ]} title={title}/>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {body ? (<section className="bg-white rounded-lg p-6">
                <service_content_1.default content={body} locale={locale}/>
              </section>) : (<section className="bg-white rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru'
                ? 'Контактная информация будет добавлена в ближайшее время.'
                : 'Kontakt ma\'lumotlari tez orada qo\'shiladi.'}
                  </p>
                </div>
              </section>)}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact Information */}
            {settings && (<div className="bg-white rounded-lg p-6">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'Контактная информация' : 'Kontakt ma\'lumotlari'}
                </h3>
                <div className="space-y-4">
                  {settings.phone && (<div className="flex items-start gap-3">
                      <lucide_react_1.Phone className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Телефон' : 'Telefon'}
                        </p>
                        <a href={`tel:${settings.phone}`} className="text-sm text-brand-primary hover:underline">
                          {settings.phone}
                        </a>
                      </div>
                    </div>)}
                  {settings.email && (<div className="flex items-start gap-3">
                      <lucide_react_1.Mail className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Email' : 'Email'}
                        </p>
                        <a href={`mailto:${settings.email}`} className="text-sm text-brand-primary hover:underline break-all">
                          {settings.email}
                        </a>
                      </div>
                    </div>)}
                  {settings.address_uz || settings.address_ru ? (<div className="flex items-start gap-3">
                      <lucide_react_1.MapPin className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Адрес' : 'Manzil'}
                        </p>
                        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                          {(0, locale_1.getBilingualText)(settings.address_uz, settings.address_ru, locale)}
                        </p>
                      </div>
                    </div>) : null}
                  {settings.workingHours_uz || settings.workingHours_ru ? (<div className="flex items-start gap-3">
                      <lucide_react_1.Clock className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0"/>
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line" suppressHydrationWarning>
                          {(0, locale_1.getBilingualText)(settings.workingHours_uz, settings.workingHours_ru, locale)}
                        </p>
                      </div>
                    </div>) : null}
                </div>
              </div>)}
          </aside>
        </div>
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map