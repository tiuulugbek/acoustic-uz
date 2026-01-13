# Express Backend API

Bu Express.js asosida yaratilgan backend API Soundz.uz loyihasi uchun.

## Features

- ✅ Products API (GET/POST/PUT/DELETE) - multilingual support bilan
- ✅ Inquiries API (POST + authenticated GET)
- ✅ Language middleware (?lang=uz/ru/en)
- ✅ JWT Authentication
- ✅ Prisma ORM integration
- ✅ Error handling
- ✅ CORS support

## Installation

```bash
# Dependencies o'rnatish
npm install

# Environment variables sozlash
cp .env.example .env
# .env faylni tahrirlash

# Database migration (agar kerak bo'lsa)
npx prisma migrate dev

# Server ishga tushirish
npm run dev
```

## API Endpoints

### Products

- `GET /api/products` - Barcha product'larni olish
  - Query params: `?lang=uz&status=published&categoryId=xxx&limit=10&offset=0`
- `GET /api/products/:id` - Bitta product'ni olish
  - Query params: `?lang=uz`
- `POST /api/products` - Yangi product yaratish (authenticated)
- `PUT /api/products/:id` - Product'ni yangilash (authenticated)
- `DELETE /api/products/:id` - Product'ni o'chirish (authenticated)

### Inquiries

- `POST /api/inquiries` - Yangi inquiry yaratish (public)
- `GET /api/inquiries` - Barcha inquiry'larni olish (authenticated)
- `GET /api/inquiries/:id` - Bitta inquiry'ni olish (authenticated)

## Language Support

Til parametri quyidagi usullar bilan yuborilishi mumkin:
1. Query parameter: `?lang=uz`
2. Header: `X-Locale: uz`
3. Cookie: `locale=uz`
4. Default: `uz`

Qo'llab-quvvatlanadigan tillar: `uz`, `ru`, `en`

## Authentication

Protected endpoint'lar uchun JWT token kerak:
- Header: `Authorization: Bearer <token>`
- Cookie: `access_token=<token>`






