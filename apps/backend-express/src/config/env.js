/**
 * Environment Variables Configuration
 * 
 * Bu fayl environment variable'larni validate qiladi va default qiymatlar beradi.
 * .env fayldan o'qiladi yoki process.env'dan.
 */

require('dotenv').config();

/**
 * Environment variable'larni validate qilish va export qilish
 */
const config = {
  // Server port
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // Database connection string
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // JWT secret key - Authentication uchun
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS origin - Frontend URL'lari
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Default language
  DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'uz',
  
  // Supported languages
  SUPPORTED_LANGUAGES: ['uz', 'ru', 'en'],
};

// Validation - Muhim variable'lar borligini tekshirish
if (!config.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL topilmadi. Database connection ishlamaydi.');
}

if (config.NODE_ENV === 'production' && config.JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  WARNING: Production uchun JWT_SECRET o\'zgartirilishi kerak!');
}

module.exports = config;






