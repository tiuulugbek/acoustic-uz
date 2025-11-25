# Products API - To'liq hujjat

## Umumiy ma'lumot

Products API mahsulotlarni boshqarish uchun to'liq REST API ni ta'minlaydi.

**Base URL:** `http://localhost:3001/api/products`

## Public Endpoints (Autentifikatsiya talab qilmaydi)

### 1. Barcha mahsulotlarni olish

**GET** `/products`

**Query parametrlar:**
- `status` (string, optional) - Mahsulot holati (public endpoint faqat `published` ni qaytaradi)
- `brandId` (string, optional) - Brend ID bo'yicha filtrlash
- `categoryId` (string, optional) - Kategoriya ID bo'yicha filtrlash
- `catalogId` (string, optional) - Katalog ID bo'yicha filtrlash
- `productType` (string, optional) - Mahsulot turi (`hearing-aids`, `accessories`, `interacoustics`)
- `search` (string, optional) - Qidiruv so'rovi (nom, tavsif, xususiyatlar bo'yicha)
- `audience` (string, optional) - Auditoriya bo'yicha filtrlash
- `formFactor` (string, optional) - Korpus turi bo'yicha filtrlash
- `signalProcessing` (string, optional) - Signal qayta ishlash bo'yicha filtrlash
- `powerLevel` (string, optional) - Quvvat darajasi bo'yicha filtrlash
- `hearingLossLevel` (string, optional) - Eshitish yo'qotish darajasi bo'yicha filtrlash
- `smartphoneCompatibility` (string, optional) - Smartfon mosligi bo'yicha filtrlash
- `paymentOption` (string, optional) - To'lov usuli bo'yicha filtrlash
- `availabilityStatus` (string, optional) - Mavjudlik holati bo'yicha filtrlash
- `limit` (number, optional, default: 12) - Sahifadagi mahsulotlar soni
- `offset` (number, optional, default: 0) - O'tkazib yuborilgan mahsulotlar soni
- `sort` (string, optional, default: `newest`) - Tartiblash (`newest`, `price_asc`, `price_desc`)

**Javob:**
```json
{
  "items": [
    {
      "id": "string",
      "name_uz": "string",
      "name_ru": "string",
      "slug": "string",
      "description_uz": "string | null",
      "description_ru": "string | null",
      "price": "number | null",
      "stock": "number | null",
      "brand": {
        "id": "string",
        "name": "string",
        "slug": "string"
      },
      "category": {
        "id": "string",
        "name_uz": "string",
        "name_ru": "string",
        "slug": "string"
      },
      "catalogs": [...],
      "galleryUrls": ["string"],
      "status": "published",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "total": 69,
  "page": 1,
  "pageSize": 12
}
```

**Namuna:**
```bash
# Barcha mahsulotlar
GET /api/products

# Brend bo'yicha filtrlash
GET /api/products?brandId=cmxxx&limit=10

# Qidiruv
GET /api/products?search=Oticon&limit=20

# Narx bo'yicha tartiblash
GET /api/products?sort=price_asc&limit=12

# Pagination
GET /api/products?limit=12&offset=12
```

### 2. Slug bo'yicha mahsulotni olish

**GET** `/products/slug/:slug`

**Parametrlar:**
- `slug` (string, required) - Mahsulot slug

**Javob:**
```json
{
  "id": "string",
  "name_uz": "string",
  "name_ru": "string",
  "slug": "string",
  "description_uz": "string | null",
  "description_ru": "string | null",
  "price": "number | null",
  "stock": "number | null",
  "brand": {...},
  "category": {...},
  "catalogs": [...],
  "galleryUrls": ["string"],
  "relatedProducts": [...],
  "usefulArticles": [...],
  "status": "published",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Namuna:**
```bash
GET /api/products/slug/oticon-xceed-bte-sp
```

## Admin Endpoints (Autentifikatsiya talab qiladi)

Barcha admin endpointlar uchun `Authorization: Bearer <token>` header kerak.

### 3. Barcha mahsulotlarni olish (Admin)

**GET** `/products/admin`

**Query parametrlar:** Public endpoint bilan bir xil, lekin `status` filtri ishlaydi (draft, archived ham ko'rinadi)

**Namuna:**
```bash
GET /api/products/admin?status=draft
GET /api/products/admin?search=test
```

### 4. Bitta mahsulotni olish (Admin)

**GET** `/products/admin/:id`

**Parametrlar:**
- `id` (string, required) - Mahsulot ID

**Namuna:**
```bash
GET /api/products/admin/cmxxx
```

### 5. Yangi mahsulot yaratish

**POST** `/products`

**Body:**
```json
{
  "name_uz": "string (required)",
  "name_ru": "string (required)",
  "slug": "string (required)",
  "description_uz": "string (optional)",
  "description_ru": "string (optional)",
  "price": "number (optional)",
  "stock": "number (optional)",
  "brandId": "string (optional)",
  "categoryId": "string (optional)",
  "catalogIds": ["string"] (optional),
  "galleryIds": ["string"] (optional),
  "galleryUrls": ["string"] (optional),
  "status": "published | draft | archived (default: published)",
  "productType": "hearing-aids | accessories | interacoustics (optional)",
  "audience": ["string"] (optional),
  "formFactors": ["string"] (optional),
  "signalProcessing": "string (optional)",
  "powerLevel": "string (optional)",
  "hearingLossLevels": ["string"] (optional),
  "smartphoneCompatibility": ["string"] (optional),
  "tinnitusSupport": "boolean (optional)",
  "paymentOptions": ["string"] (optional),
  "availabilityStatus": "string (optional)",
  "specsText": "string (optional)",
  "intro_uz": "string (optional)",
  "intro_ru": "string (optional)",
  "features_uz": ["string"] (optional),
  "features_ru": ["string"] (optional),
  "benefits_uz": ["string"] (optional),
  "benefits_ru": ["string"] (optional),
  "tech_uz": "string (optional)",
  "tech_ru": "string (optional)",
  "fittingRange_uz": "string (optional)",
  "fittingRange_ru": "string (optional)",
  "regulatoryNote_uz": "string (optional)",
  "regulatoryNote_ru": "string (optional)",
  "relatedProductIds": ["string"] (optional),
  "usefulArticleSlugs": ["string"] (optional)
}
```

**Namuna:**
```bash
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name_uz": "Oticon More 1",
  "name_ru": "Oticon More 1",
  "slug": "oticon-more-1",
  "price": 15000000,
  "stock": 5,
  "brandId": "cmxxx",
  "categoryId": "cmyyy",
  "status": "published"
}
```

### 6. Mahsulotni yangilash

**PATCH** `/products/:id`

**Parametrlar:**
- `id` (string, required) - Mahsulot ID

**Body:** Create endpoint bilan bir xil, lekin barcha maydonlar optional

**Namuna:**
```bash
PATCH /api/products/cmxxx
Content-Type: application/json
Authorization: Bearer <token>

{
  "price": 16000000,
  "stock": 10
}
```

### 7. Mahsulotni o'chirish

**DELETE** `/products/:id`

**Parametrlar:**
- `id` (string, required) - Mahsulot ID

**Namuna:**
```bash
DELETE /api/products/cmxxx
Authorization: Bearer <token>
```

### 8. Excel dan import qilish

**POST** `/products/import/excel`

**Content-Type:** `multipart/form-data`

**Body:**
- `file` (file, required) - Excel fayl (.xlsx, .xls)

**Javob:**
```json
{
  "success": 10,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Mahsulot nomi (o'zbek va rus tillarida) majburiy"
    }
  ]
}
```

**Namuna:**
```bash
POST /api/products/import/excel
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <excel-file>
```

### 9. Excel template yuklab olish

**GET** `/products/import/excel-template`

**Javob:** Excel fayl (.xlsx)

**Namuna:**
```bash
GET /api/products/import/excel-template
Authorization: Bearer <token>
```

## Xatoliklar

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found"
}
```

## Eslatmalar

1. **Pagination:** `limit` va `offset` parametrlari bilan pagination qo'llab-quvvatlanadi
2. **Filtering:** Ko'p maydonlar bo'yicha filtrlash mumkin
3. **Search:** `search` parametri nom, tavsif va xususiyatlar bo'yicha qidiruvni amalga oshiradi
4. **Sorting:** `sort` parametri bilan tartiblash mumkin (`newest`, `price_asc`, `price_desc`)
5. **Relations:** Mahsulotlar brand, category va catalogs bilan bog'langan
6. **Gallery:** Rasmlar `galleryIds` (Media ID lar) yoki `galleryUrls` (URL lar) orqali saqlanadi
7. **Related Products:** `relatedProductIds` orqali bog'liq mahsulotlar ko'rsatiladi
8. **Useful Articles:** `usefulArticleSlugs` orqali foydali maqolalar ko'rsatiladi




