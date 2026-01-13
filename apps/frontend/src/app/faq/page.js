"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = FAQPage;
const api_server_1 = require("@/lib/api-server");
const locale_server_1 = require("@/lib/locale-server");
const locale_1 = require("@/lib/locale");
const page_header_1 = __importDefault(require("@/components/page-header"));
const lucide_react_1 = require("lucide-react");
// Force dynamic rendering
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata() {
    const locale = (0, locale_server_1.detectLocale)();
    return {
        title: locale === 'ru' ? 'Часто задаваемые вопросы — Acoustic.uz' : 'Savollar — Acoustic.uz',
        description: locale === 'ru'
            ? 'Ответы на часто задаваемые вопросы о слухе и слуховых аппаратах'
            : 'Eshitish va eshitish apparatlari haqida tez-tez beriladigan savollarga javoblar',
    };
}
async function FAQPage() {
    const locale = (0, locale_server_1.detectLocale)();
    const faqs = await (0, api_server_1.getPublicFaq)(locale);
    const title = locale === 'ru' ? 'Часто задаваемые вопросы' : 'Tez-tez beriladigan savollar';
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: title },
        ]} title={title} icon={<lucide_react_1.HelpCircle className="h-8 w-8 text-white"/>}/>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        {faqs.length > 0 ? (<div className="space-y-4">
            {faqs.map((faq, index) => {
                const question = (0, locale_1.getBilingualText)(faq.question_uz, faq.question_ru, locale);
                const answer = (0, locale_1.getBilingualText)(faq.answer_uz, faq.answer_ru, locale);
                return (<div key={faq.id} id={`faq-${index}`} className="bg-white rounded-lg p-6 shadow-sm border border-border">
                  <h3 className="mb-3 text-lg font-semibold text-foreground" suppressHydrationWarning>
                    {question}
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line" suppressHydrationWarning>
                      {answer}
                    </p>
                  </div>
                </div>);
            })}
          </div>) : (<div className="bg-white rounded-lg p-12 text-center">
            <lucide_react_1.HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
            <p className="text-muted-foreground" suppressHydrationWarning>
              {locale === 'ru'
                ? 'Вопросы пока не добавлены.'
                : 'Savollar hali qo\'shilmagan.'}
            </p>
          </div>)}
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map