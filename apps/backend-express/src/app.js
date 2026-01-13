/**
 * Express Application Setup
 * 
 * Bu fayl Express app konfiguratsiyasini o'rnatadi:
 * - Middleware'lar (CORS, body parser, helmet, etc.)
 * - Error handling
 * - API routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Middleware'lar
const languageMiddleware = require('./middleware/language.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// Routes
const productsRoutes = require('./routes/api/products.routes');
const inquiriesRoutes = require('./routes/api/inquiries.routes');

// Express app yaratish
const app = express();

// Security middleware - Helmet
// Helmet HTTP header'larni xavfsizlik uchun sozlaydi
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS (Cross-Origin Resource Sharing) konfiguratsiyasi
// Frontend'dan kelgan so'rovlarni qabul qilish uchun
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Locale'],
  exposedHeaders: ['Vary', 'Cache-Control'],
};
app.use(cors(corsOptions));

// Body parser middleware - JSON va URL-encoded body'larni parse qilish
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware - Cookie'larni parse qilish
app.use(cookieParser());

// Logging middleware - Request'larni log qilish
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // Development uchun detailed logging
} else {
  app.use(morgan('combined')); // Production uchun standard logging
}

// Language middleware - Har bir request'da tilni aniqlash
// Bu middleware req.lang property'sini o'rnatadi (?lang=uz/ru/en)
app.use(languageMiddleware);

// Health check endpoint - Server ishlamoqda-yu yo'qligini tekshirish uchun
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes - Barcha API endpoint'lari /api prefix bilan
app.use('/api/products', productsRoutes);
app.use('/api/inquiries', inquiriesRoutes);

// 404 handler - Topilmagan route'lar uchun
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint topilmadi',
    path: req.path
  });
});

// Error handling middleware - Barcha xatolarni handle qilish
// Bu middleware barcha route'lardan keyin bo'lishi kerak
app.use(errorMiddleware);

module.exports = app;






