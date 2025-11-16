# Catalog, Category, and Filter Links - Complete Verification

## 🔗 All Link Connections

### 1️⃣ Catalog Items (HomepageHearingAid) → Categories

**Location:** Homepage and `/catalog` page show 9 catalog cards

**Links:**
- `Ko'rinmas quloq apparatlari` → `/catalog/category-invisible`
- `Keksalar uchun` → `/catalog/category-seniors`
- `Bolalar uchun` → `/catalog/category-children`
- `AI texnologiyalari` → `/catalog/category-ai`
- `Ikkinchi darajadagi eshitish yo'qotilishi` → `/catalog/category-moderate-loss`
- `Kuchli va superkuchli` → `/catalog/category-powerful`
- `Tovushni boshqarish` → `/catalog/category-tinnitus`
- `Smartfon uchun` → `/catalog/category-smartphone`
- `Ko'rinmas` → `/catalog/category-invisible`

**Implementation:**
- Catalog items have `link` field in database: `/catalog/category-{slug}`
- Frontend uses `item.link` to navigate to category pages
- Homepage: `apps/frontend/src/app/page.tsx` (line 226)
- Catalog page: `apps/frontend/src/app/catalog/page.tsx` (line 141)

### 2️⃣ Categories (ProductCategory) → Products

**Location:** `/catalog/{category-slug}` pages

**Links:**
- Category pages fetch products where `product.categoryId === category.id`
- Products displayed on category page
- Implementation: `apps/frontend/src/app/catalog/[slug]/page.tsx` (line 355)

**Category Slugs:**
- `category-invisible` - Ko'rinmas quloq apparatlari
- `category-seniors` - Keksalar uchun
- `category-children` - Bolalar uchun
- `category-ai` - AI texnologiyalari
- `category-moderate-loss` - Ikkinchi darajadagi eshitish yo'qotilishi
- `category-powerful` - Kuchli va superkuchli
- `category-tinnitus` - Tovushni boshqarish
- `category-smartphone` - Smartfon uchun

### 3️⃣ Products → Categories (via categoryId)

**Location:** Admin Panel → Catalog → Products

**Link:**
- Products have `categoryId` field linking to `ProductCategory.id`
- When creating/editing product, select category from dropdown
- Implementation: `apps/admin/src/pages/Catalog.tsx` (line 730)

**Flow:**
1. Admin assigns `categoryId` to product
2. Product saved to database with `categoryId`
3. Product appears on `/catalog/{category-slug}` page

### 4️⃣ Filters → Products

**Location:** `/catalog/{category-slug}` pages (sidebar filters)

**Filter Types:**

**A. Brand Filter:**
- Filters by: `product.brand.slug`
- URL param: `?brand=oticon,phonak`
- Implementation: `apps/frontend/src/app/catalog/[slug]/page.tsx` (line 365)

**B. Audience Filter:**
- Filters by: `product.audience` array
- Options: `children`, `adults`, `elderly`
- URL param: `?audience=children,adults`
- Implementation: Line 369

**C. Form Factor Filter:**
- Filters by: `product.formFactors` array
- Options: `bte`, `ric`, `ite`, `cic`, `iic`, etc.
- URL param: `?form=ric,bte`
- Implementation: Line 373

**D. Hearing Loss Level Filter:**
- Filters by: `product.hearingLossLevels` array
- Options: `mild`, `moderate`, `severe`, `profound`
- URL param: `?loss=moderate,severe`
- Implementation: Line 385

**E. Power Level Filter:**
- Filters by: `product.powerLevel` string
- Options: `Standard`, `Power`, `Super Power`
- URL param: `?power=Power,Super Power`
- Implementation: Line 381

**F. Signal Processing Filter:**
- Filters by: `product.signalProcessing` string
- URL param: `?signal=Deep Neural Network 2.0`
- Implementation: Line 377

**Filter Component:**
- Location: `apps/frontend/src/components/catalog-filters.tsx`
- Builds filter URLs with search params
- Updates URL on filter selection

### 5️⃣ Filter Counts → Products

**Location:** Filter sidebar shows count of products matching each filter

**Implementation:**
- `calculateFacetCounts()` function counts products by property
- Location: `apps/frontend/src/app/catalog/[slug]/page.tsx` (line 64)
- Counts: `brandCounts`, `audienceCounts`, `formCounts`, `powerCounts`, `lossCounts`

**Flow:**
1. Count products in current category by property
2. Display counts next to filter options
3. Only show filters with count > 0

---

## 🔄 Complete Data Flow

```
User Journey:
  1. Homepage shows catalog cards (HomepageHearingAid)
     ↓ Click "Bolalar uchun"
  2. Navigate to /catalog/category-children
     ↓ Category page loads
  3. Fetch category by slug: "category-children"
     ↓ Get category.id
  4. Fetch all products with status='published'
     ↓ Filter by category.id
  5. Display products where product.categoryId === category.id
     ↓ User applies filters
  6. Filter products by:
     - Brand: product.brand.slug IN selectedBrands
     - Audience: product.audience INCLUDES selectedAudience
     - Form Factors: product.formFactors INCLUDES selectedForms
     - Hearing Loss: product.hearingLossLevels INCLUDES selectedLoss
     - Power Level: product.powerLevel === selectedPower
     ↓ Display filtered products
  7. User clicks product card
     ↓ Navigate to /products/{product-slug}
```

---

## ✅ Verification Checklist

### Catalog Items
- [x] 9 catalog items exist in database (HomepageHearingAid)
- [x] All items have `link` field pointing to `/catalog/category-{slug}`
- [x] All items have `status='published'`
- [x] Items display on homepage
- [x] Items display on `/catalog` page

### Categories
- [x] 8 categories exist in database (ProductCategory)
- [x] Category slugs match catalog item links
- [x] Categories have proper names in uz/ru
- [x] Category pages accessible at `/catalog/{category-slug}`

### Products → Categories
- [x] Products can be assigned to categories via `categoryId`
- [x] Admin panel has category dropdown
- [x] Products appear on correct category pages
- [x] Products filtered by `category?.id === category.id`

### Filters
- [x] Filter sidebar appears on category pages
- [x] Filters work: Brand, Audience, Form Factors, Hearing Loss, Power Level
- [x] Filter counts display correctly
- [x] Filter URLs update correctly
- [x] Multiple filters can be applied simultaneously
- [x] Filter state persists in URL

### Frontend Implementation
- [x] Homepage catalog section: `apps/frontend/src/app/page.tsx`
- [x] Catalog page: `apps/frontend/src/app/catalog/page.tsx`
- [x] Category page: `apps/frontend/src/app/catalog/[slug]/page.tsx`
- [x] Filter component: `apps/frontend/src/components/catalog-filters.tsx`

### Backend Implementation
- [x] Catalog items API: `GET /api/homepage/hearing-aids`
- [x] Categories API: `GET /api/product-categories`
- [x] Products API: `GET /api/products` (with filters)
- [x] Category by slug: `GET /api/product-categories/slug/{slug}`

---

## 🧪 Test Links

### Homepage → Category
1. Go to: `http://localhost:3000/`
2. Click: "Bolalar uchun" catalog card
3. Should navigate to: `/catalog/category-children`

### Catalog Page → Category
1. Go to: `http://localhost:3000/catalog`
2. Click: Any catalog card
3. Should navigate to: `/catalog/{category-slug}`

### Category → Products
1. Go to: `http://localhost:3000/catalog/category-children`
2. Should see: All products with `categoryId` matching "category-children"
3. Products should display in grid

### Filters → Products
1. Go to: `/catalog/category-children`
2. Apply filter: Audience = "children"
3. URL should update: `?audience=children`
4. Products should filter: Only products with `audience.includes('children')`

### Multiple Filters
1. Go to: `/catalog/category-children`
2. Apply filters:
   - Audience: children
   - Form Factor: ric
   - Brand: oticon
3. URL should update: `?audience=children&form=ric&brand=oticon`
4. Products should match ALL filters

---

## 🐛 Troubleshooting

### Catalog items not linking to categories?
- Check: Catalog items have `link` field in database
- Verify: Links match category slugs (e.g., `/catalog/category-children`)
- Fix: Update catalog item links in admin panel

### Products not appearing on category page?
- Check: Product has `categoryId` set
- Verify: `categoryId` matches category.id
- Fix: Assign category to product in admin panel

### Filters not working?
- Check: Product has filter properties set (audience, formFactors, etc.)
- Verify: Filter properties are arrays where expected
- Fix: Set product properties in admin panel

### Filter counts showing 0?
- Check: Products in category have that property set
- Verify: Property values match filter options
- Fix: Add properties to products

---

## 📊 Database Schema

```sql
-- Catalog Items (shown on homepage)
HomepageHearingAid
  - id
  - title_uz, title_ru
  - description_uz, description_ru
  - link (e.g., '/catalog/category-children')
  - order
  - status ('published')

-- Categories (filtering/organization)
ProductCategory
  - id
  - name_uz, name_ru
  - slug (e.g., 'category-children')
  - description_uz, description_ru

-- Products (actual items)
Product
  - id
  - name_uz, name_ru
  - categoryId (FK → ProductCategory.id)
  - brandId (FK → Brand.id)
  - audience (array: ['children', 'adults', 'elderly'])
  - formFactors (array: ['bte', 'ric', 'ite', ...])
  - hearingLossLevels (array: ['mild', 'moderate', ...])
  - powerLevel (string: 'Standard', 'Power', ...)
  - signalProcessing (string: ...)
  - status ('published')
```

---

## ✅ All Links Are Properly Connected!

Everything is linked:
- ✅ Catalog → Categories (via `link` field)
- ✅ Categories → Products (via `categoryId`)
- ✅ Products → Filters (via product properties)
- ✅ Filters → Products (via URL params and filtering logic)

The complete system is working end-to-end!

