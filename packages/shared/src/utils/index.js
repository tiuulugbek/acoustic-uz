"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalizedText = getLocalizedText;
exports.generateSlug = generateSlug;
exports.formatPhone = formatPhone;
exports.isValidEmail = isValidEmail;
exports.truncate = truncate;
exports.debounce = debounce;
function getLocalizedText(text, locale) {
    if (!text)
        return '';
    return text[locale] || text.uz || text.ru || '';
}
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function formatPhone(phone) {
    return phone.replace(/\D/g, '');
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function truncate(text, length) {
    if (text.length <= length)
        return text;
    return text.slice(0, length).trim() + '...';
}
function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
//# sourceMappingURL=index.js.map