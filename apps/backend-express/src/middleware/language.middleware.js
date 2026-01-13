/**
 * Language Middleware
 * 
 * Bu middleware har bir request'da til parametrini (?lang=uz/ru/en) aniqlaydi
 * va req.lang property'sini o'rnatadi.
 * 
 * Til parametri quyidagi usullar bilan aniqlanadi:
 * 1. Query parameter: ?lang=uz
 * 2. Header: X-Locale: uz
 * 3. Cookie: locale=uz
 * 4. Default: uz
 */

const config = require('../config/env');

/**
 * Language middleware function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function languageMiddleware(req, res, next) {
  // 1. Query parameter'dan tilni olish (?lang=uz)
  let lang = req.query.lang;
  
  // 2. Agar query parameter bo'lmasa, header'dan olish (X-Locale)
  if (!lang) {
    lang = req.headers['x-locale'];
  }
  
  // 3. Agar header ham bo'lmasa, cookie'dan olish
  if (!lang) {
    lang = req.cookies?.locale;
  }
  
  // 4. Til kodini tozalash va validate qilish
  if (lang) {
    lang = lang.toLowerCase().trim();
    
    // Faqat qo'llab-quvvatlanadigan tillarni qabul qilish
    if (config.SUPPORTED_LANGUAGES.includes(lang)) {
      req.lang = lang;
    } else {
      // Noto'g'ri til kodi bo'lsa, default tilga o'tkazish
      req.lang = config.DEFAULT_LANGUAGE;
    }
  } else {
    // Hech qanday til topilmasa, default tilni ishlatish
    req.lang = config.DEFAULT_LANGUAGE;
  }
  
  // Response header'ga tilni qo'shish (frontend uchun)
  res.setHeader('Content-Language', req.lang);
  
  // Keyingi middleware'ga o'tish
  next();
}

module.exports = languageMiddleware;






