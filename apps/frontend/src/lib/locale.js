"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCALE_CODES = exports.LOCALE_LABELS = exports.LOCALE_COOKIE_MAX_AGE = exports.LOCALE_COOKIE_NAME = exports.DEFAULT_LOCALE = void 0;
exports.getBilingualText = getBilingualText;
exports.DEFAULT_LOCALE = 'uz';
exports.LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
exports.LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
/**
 * Get bilingual text with fallback
 */
function getBilingualText(textUz, textRu, locale) {
    if (locale === 'ru') {
        return textRu || textUz || '';
    }
    return textUz || textRu || '';
}
/**
 * Language labels in their own language
 */
exports.LOCALE_LABELS = {
    uz: "O'zbekcha",
    ru: 'Русский',
};
exports.LOCALE_CODES = {
    uz: 'UZ',
    ru: 'RU',
};
//# sourceMappingURL=locale.js.map