"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.dynamic = void 0;
exports.generateMetadata = generateMetadata;
exports.default = HearingTestPage;
const locale_server_1 = require("@/lib/locale-server");
const hearing_test_1 = __importDefault(require("@/components/hearing-test/hearing-test"));
exports.dynamic = 'force-dynamic';
exports.revalidate = 0;
async function generateMetadata() {
    const locale = (0, locale_server_1.detectLocale)();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const testUrl = `${baseUrl}/services/hearing-test`;
    return {
        title: locale === 'ru' ? 'Онлайн тест слуха — Acoustic.uz' : 'Online eshitish testi — Acoustic.uz',
        description: locale === 'ru'
            ? 'Бесплатный онлайн тест слуха. Проверьте свой слух за 3 минуты. Результаты не являются медицинским диагнозом.'
            : 'Bepul online eshitish testi. Eshitishingizni 3 daqiqada tekshiring. Natijalar tibbiy tashxis emas.',
        alternates: {
            canonical: testUrl,
            languages: {
                uz: testUrl,
                ru: testUrl,
                'x-default': testUrl,
            },
        },
    };
}
function HearingTestPage() {
    return (<main className="min-h-screen bg-white">
      <hearing_test_1.default />
    </main>);
}
//# sourceMappingURL=page.js.map