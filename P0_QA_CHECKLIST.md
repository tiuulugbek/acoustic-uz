# P0 QA Checklist: Backend Pagination

## Test Environment
- **Branch:** `feat/p0-backend-pagination`
- **Backend:** Running on `http://localhost:3001`
- **Frontend:** Running on `http://localhost:3000`
- **Database:** PostgreSQL with test products

---

## ✅ Backend API Tests

### Test 1: Basic Pagination
- [ ] **Request:** `GET /products?limit=12&offset=0&lang=uz`
- [ ] **Expected:** Returns exactly 12 products
- [ ] **Response format:** `{ items: [...], total: N, page: 1, pageSize: 12 }`
- [ ] **Verify:** `total` matches actual count of published products

### Test 2: Page Navigation
- [ ] **Request:** `GET /products?limit=12&offset=0&lang=uz` (page 1)
- [ ] **Request:** `GET /products?limit=12&offset=12&lang=uz` (page 2)
- [ ] **Expected:** Page 2 returns different 12 products
- [ ] **Verify:** No duplicates between page 1 and page 2
- [ ] **Verify:** `page` field in response: page 1 = 1, page 2 = 2

### Test 3: Category Filter
- [ ] **Request:** `GET /products?categoryId=<id>&limit=12&offset=0&lang=uz`
- [ ] **Expected:** Returns only products with matching `categoryId`
- [ ] **Verify:** All returned products have `category.id === categoryId`
- [ ] **Verify:** `total` reflects count for that category only

### Test 4: Sorting - Newest (Default)
- [ ] **Request:** `GET /products?sort=newest&limit=12&offset=0&lang=uz`
- [ ] **Expected:** Products sorted by `createdAt desc` (newest first)
- [ ] **Verify:** First product has latest `createdAt`

### Test 5: Sorting - Price Ascending
- [ ] **Request:** `GET /products?sort=price_asc&limit=12&offset=0&lang=uz`
- [ ] **Expected:** Products sorted by `price asc` (lowest first)
- [ ] **Verify:** First product has lowest price
- [ ] **Verify:** Prices increase from first to last

### Test 6: Sorting - Price Descending
- [ ] **Request:** `GET /products?sort=price_desc&limit=12&offset=0&lang=uz`
- [ ] **Expected:** Products sorted by `price desc` (highest first)
- [ ] **Verify:** First product has highest price
- [ ] **Verify:** Prices decrease from first to last

### Test 7: Locale Support
- [ ] **Request:** `GET /products?limit=12&offset=0&lang=uz`
- [ ] **Request:** `GET /products?limit=12&offset=0&lang=ru`
- [ ] **Expected:** Both return same products but localized fields differ
- [ ] **Verify:** UZ request returns `name_uz`, RU request returns `name_ru`
- [ ] **Verify:** Both requests include `X-Locale` header

### Test 8: Published Only
- [ ] **Request:** `GET /products?limit=100&offset=0&lang=uz`
- [ ] **Expected:** Only products with `status: 'published'` returned
- [ ] **Verify:** No draft or archived products in response

### Test 9: Edge Cases
- [ ] **Request:** `GET /products?limit=0&offset=0&lang=uz`
  - **Expected:** Returns empty `items: []`, `total: N`
- [ ] **Request:** `GET /products?limit=10000&offset=0&lang=uz`
  - **Expected:** Returns all products up to limit
- [ ] **Request:** `GET /products?offset=999999&lang=uz`
  - **Expected:** Returns empty `items: []`, `page: N`, `total: N`
- [ ] **Request:** `GET /products?sort=invalid&lang=uz`
  - **Expected:** Defaults to `newest` sort

---

## ✅ Frontend Catalog Page Tests

### Test 10: Initial Page Load
- [ ] **Navigate to:** `/catalog/category-bte` (or any category with >12 products)
- [ ] **Expected:** Page loads with exactly 12 product cards
- [ ] **Network Tab:** Verify request: `GET /products?categoryId=<id>&limit=12&offset=0&sort=newest&lang=uz`
- [ ] **Verify:** Pagination shows "1 / N" where N = total pages
- [ ] **Verify:** "Найдено товаров: X" or "Topilgan mahsulotlar: X" shows correct total

### Test 11: Page Navigation
- [ ] **Click:** Page 2 in pagination
- [ ] **Expected:** URL updates to `/catalog/category-bte?page=2`
- [ ] **Expected:** Page shows different 12 products
- [ ] **Network Tab:** Verify request: `GET /products?categoryId=<id>&limit=12&offset=12&sort=newest&lang=uz`
- [ ] **Verify:** Pagination highlights page 2 as active

### Test 12: Sorting - Reset to Page 1
- [ ] **Navigate to:** `/catalog/category-bte?page=2`
- [ ] **Change sort:** Select "Цена: по возрастанию" or "Narx: pastdan yuqoriga"
- [ ] **Expected:** URL updates to `/catalog/category-bte?sort=price_asc` (page removed)
- [ ] **Expected:** Page shows page 1 of sorted results
- [ ] **Network Tab:** Verify request: `GET /products?categoryId=<id>&limit=12&offset=0&sort=price_asc&lang=uz`

### Test 13: Sorting - All Options Work
- [ ] **Test "Сначала новые" / "Yangilar bo'yicha":**
  - **Expected:** Products sorted by newest (createdAt desc)
  - **Verify:** Most recent products appear first
- [ ] **Test "Цена: по возрастанию" / "Narx: pastdan yuqoriga":**
  - **Expected:** Products sorted by price ascending
  - **Verify:** Lowest price first, highest last
- [ ] **Test "Цена: по убыванию" / "Narx: yuqoridan pastga":**
  - **Expected:** Products sorted by price descending
  - **Verify:** Highest price first, lowest last

### Test 14: Property-Based Categories (Client-Side for P0)
- [ ] **Navigate to:** `/catalog/category-children`
- [ ] **Expected:** Page loads (may use client-side filtering)
- [ ] **Verify:** Products shown match `audience.includes('children')`
- [ ] **Note:** For P0, this still uses client-side filtering (P1 scope)

### Test 15: Empty Category
- [ ] **Navigate to:** `/catalog/<category-with-no-products>`
- [ ] **Expected:** Shows empty state: "Товары не найдены" or "Mahsulotlar topilmadi"
- [ ] **Verify:** No errors in console
- [ ] **Network Tab:** Verify request returns `{ items: [], total: 0, page: 1, pageSize: 12 }`

### Test 16: Invalid Category Slug
- [ ] **Navigate to:** `/catalog/non-existent-category`
- [ ] **Expected:** Shows fallback "all products" page
- [ ] **Verify:** Page still renders, no crashes

---

## ✅ Locale Integrity Tests

### Test 17: UZ Locale - Homepage → Catalog
- [ ] **Set locale to UZ:** Cookie `acoustic-locale=uz`
- [ ] **Navigate:** Homepage → Click catalog link
- [ ] **Expected:** Catalog page renders in Uzbek
- [ ] **Verify:** Headers, labels, product names in Uzbek
- [ ] **Network Tab:** Verify all requests include `?lang=uz`

### Test 18: RU Locale - Homepage → Catalog
- [ ] **Set locale to RU:** Cookie `acoustic-locale=ru`
- [ ] **Navigate:** Homepage → Click catalog link
- [ ] **Expected:** Catalog page renders in Russian
- [ ] **Verify:** Headers, labels, product names in Russian
- [ ] **Network Tab:** Verify all requests include `?lang=ru`

### Test 19: Locale Switch - No Flip
- [ ] **Navigate:** Homepage (UZ) → Catalog (UZ) → Homepage (UZ)
- [ ] **Expected:** Language stays Uzbek throughout
- [ ] **Verify:** No language "flip" when returning to homepage
- [ ] **Verify:** Cookie persists: `acoustic-locale=uz`

### Test 20: Locale Switch - Catalog → Homepage
- [ ] **Navigate:** Catalog (RU) → Homepage (RU)
- [ ] **Expected:** Homepage renders in Russian
- [ ] **Verify:** All sections show Russian text
- [ ] **Verify:** No language "flip" or flash

---

## ✅ Performance Tests

### Test 21: Network Payload Size
- [ ] **Navigate to:** `/catalog/category-bte`
- [ ] **Network Tab:** Inspect products request
- [ ] **Expected:** Response size < 100KB (for 12 products)
- [ ] **Verify:** Only 12 products returned, not all products

### Test 22: Page Load Time
- [ ] **Navigate to:** `/catalog/category-bte` (first visit)
- [ ] **Expected:** Page loads in < 1 second (including API call)
- [ ] **Verify:** No client-side "fetch all products" happening
- [ ] **Verify:** Only one products API request

---

## ✅ Error Handling Tests

### Test 23: Backend Down
- [ ] **Stop backend server**
- [ ] **Navigate to:** `/catalog/category-bte`
- [ ] **Expected:** Page still renders (empty state)
- [ ] **Verify:** Shows "Товары не найдены" or "Mahsulotlar topilmadi"
- [ ] **Verify:** No crashes, no 500 errors
- [ ] **Console:** Check for error logs (expected for debugging)

### Test 24: Invalid Page Number
- [ ] **Navigate to:** `/catalog/category-bte?page=999`
- [ ] **Expected:** Shows last valid page or empty state
- [ ] **Verify:** No errors, pagination shows correct max page

### Test 25: Invalid Sort Value
- [ ] **Navigate to:** `/catalog/category-bte?sort=invalid`
- [ ] **Expected:** Defaults to `newest` sort
- [ ] **Verify:** Products still load correctly

---

## ✅ Regression Tests

### Test 26: Filters UI Still Works (P0)
- [ ] **Navigate to:** `/catalog/category-bte`
- [ ] **Verify:** Filter sidebar renders correctly
- [ ] **Verify:** Brand chips render correctly
- [ ] **Note:** Filters may not work server-side yet (P1 scope)

### Test 27: Product Cards Render
- [ ] **Verify:** Product cards show image, title, price, brand
- [ ] **Verify:** Cards link to `/products/<slug>`
- [ ] **Verify:** Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile

### Test 28: Breadcrumbs
- [ ] **Verify:** Breadcrumbs show: Главная › Каталог › <Category Name>
- [ ] **Verify:** Breadcrumb links work correctly

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Backend API (1-9) | ⬜ | |
| Frontend Catalog (10-16) | ⬜ | |
| Locale Integrity (17-20) | ⬜ | |
| Performance (21-22) | ⬜ | |
| Error Handling (23-25) | ⬜ | |
| Regression (26-28) | ⬜ | |

**Tested by:** ________________  
**Date:** ________________  
**Environment:** ________________

---

## Known Issues (P1 Scope)

- [ ] Property-based categories still use client-side filtering
- [ ] Multi-value filters (brand, audience, etc.) still client-side
- [ ] Facet counts calculated client-side

