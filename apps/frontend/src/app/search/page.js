"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = SearchPage;
const react_1 = require("react");
const locale_server_1 = require("@/lib/locale-server");
const search_results_1 = __importDefault(require("@/components/search-results"));
const page_header_1 = __importDefault(require("@/components/page-header"));
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata({ searchParams }) {
    const locale = (0, locale_server_1.detectLocale)();
    const query = searchParams.q || '';
    return {
        title: query
            ? (locale === 'ru' ? `Поиск: ${query} — Acoustic.uz` : `Qidiruv: ${query} — Acoustic.uz`)
            : (locale === 'ru' ? 'Поиск — Acoustic.uz' : 'Qidiruv — Acoustic.uz'),
        description: locale === 'ru'
            ? 'Поиск по сайту Acoustic.uz'
            : 'Acoustic.uz saytida qidiruv',
    };
}
async function SearchPage({ searchParams }) {
    const locale = (0, locale_server_1.detectLocale)();
    const query = searchParams.q || '';
    return (<main className="min-h-screen bg-background">
      <page_header_1.default locale={locale} breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: locale === 'ru' ? 'Поиск' : 'Qidiruv' },
        ]} title={locale === 'ru' ? 'Поиск' : 'Qidiruv'}/>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <react_1.Suspense fallback={<div className="text-center py-12">Yuklanmoqda...</div>}>
          <search_results_1.default query={query} locale={locale}/>
        </react_1.Suspense>
      </div>
    </main>);
}
//# sourceMappingURL=page.js.map