# P0 Implementation Notes: Backend Pagination

## Backend Changes

### 1. Products Service (`apps/backend/src/products/products.service.ts`)

**Changes:**
- Added `limit`, `offset`, and `sort` parameters to `findAll()` method
- Defaults: `limit=12`, `offset=0`, `sort='newest'`
- Returns paginated response: `{ items: Product[], total: number, page: number, pageSize: number }`
- Sorting support: `newest` (default, createdAt desc), `price_asc`, `price_desc`

**Response Format:**
```typescript
{
  items: ProductResponse[],  // Up to 12 products
  total: number,             // Total count matching filters
  page: number,              // Current page (1-based)
  pageSize: number           // Always 12
}
```

### 2. Products Controller (`apps/backend/src/products/products.controller.ts`)

**Changes:**
- Added `limit`, `offset`, `sort` query parameters
- Parses string query params to numbers
- Passes to service with `status: 'published'` enforced

**Request Format:**
```
GET /products?categoryId=<id>&limit=12&offset=0&sort=newest&lang=uz
```

**Query Parameters:**
- `categoryId` (string, optional): Filter by category ID
- `limit` (number, optional, default: 12): Number of items per page
- `offset` (number, optional, default: 0): Number of items to skip
- `sort` ('newest' | 'price_asc' | 'price_desc', optional, default: 'newest'): Sort order
- `lang` ('uz' | 'ru', optional): Locale for bilingual fields

**Error Cases:**
- Missing category: Returns `{ items: [], total: 0, page: 1, pageSize: 12 }`
- Invalid limit/offset: Parsed as NaN, defaults used
- Invalid sort: Defaults to 'newest'

---

## Frontend Changes

### 1. API Client (`apps/frontend/src/lib/api.ts`)

**Changes:**
- Updated `ProductListParams` to include `limit`, `offset`, `sort`
- Updated `getProducts()` return type from `ProductResponse[]` to `ProductListResponse`
- Added `ProductListResponse` interface

**New Interface:**
```typescript
interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 2. Server-Side API Wrapper (`apps/frontend/src/lib/api-server.ts`)

**Changes:**
- Updated `getProducts()` return type to `ProductListResponse`
- Fallback changed from `[]` to `{ items: [], total: 0, page: 1, pageSize: 12 }`

### 3. Catalog Category Page (`apps/frontend/src/app/catalog/[slug]/page.tsx`)

**Changes:**
- **Direct categoryId matches:** Uses server-side pagination
  - Calculates `offset = (page - 1) * 12`
  - Fetches only current page: `limit=12, offset=offset, sort=sortBy`
  - Uses `productsResponse.total` for pagination UI
  
- **Property-based matches:** Still uses client-side pagination (P1 scope)
  - Detects property-based categories (category-children, category-seniors, etc.)
  - Fetches all products (limit=1000) and filters client-side
  - TODO (P1): Move to backend filters

- **Sort handling:**
  - Sort options work: newest (default), price_asc, price_desc
  - Changing sort resets to page 1 (handled by `CatalogSort` component)

- **Pagination:**
  - Uses `productsResponse.page` (from backend) for current page
  - Uses `productsResponse.total` for total count
  - Calculates `totalPages = Math.ceil(total / pageSize)`

**URL Format:**
```
/catalog/<category-slug>?page=2&sort=price_asc&brand=phonak&audience=children
```

**Page/Sort Mapping:**
- `page=1` → `offset=0`
- `page=2` → `offset=12`
- `page=3` → `offset=24`
- `sort=newest` → Backend sorts by `createdAt desc`
- `sort=price_asc` → Backend sorts by `price asc`
- `sort=price_desc` → Backend sorts by `price desc`

---

## Locale Integrity

**Status:** ✅ Already implemented

- All SSR requests include `lang=uz|ru` query param
- All SSR requests include `X-Locale` header
- Pages use `export const dynamic = 'force-dynamic'` and `export const revalidate = 0`
- Backend sets `Cache-Control: no-store` for locale-dependent endpoints
- Middleware prevents caching for locale-dependent pages

**Verification:**
- `apps/frontend/src/lib/api.ts:46-48`: Adds `lang` query param
- `apps/frontend/src/lib/api.ts:71-73`: Sets `X-Locale` header
- `apps/frontend/src/app/catalog/[slug]/page.tsx:16-17`: `export const dynamic = 'force-dynamic'`
- `apps/backend/src/common/interceptors/locale-cache.interceptor.ts:54`: `Cache-Control: no-store`

---

## Known Limitations (P1 Scope)

1. **Property-based category matching:** Still requires client-side filtering
   - Categories like `category-children` match products by `audience.includes('children')`
   - Backend doesn't support this yet - requires filter array support (P1)

2. **Multi-value filters:** Still client-side
   - Filters like `?brand=phonak,oticon` need backend array support (P1)
   - Frontend filters client-side for now

3. **Filter counts:** Calculated client-side
   - Facet counts (brand, audience, form, etc.) computed in browser
   - Backend should provide counts (P1)

---

## Testing Checklist

### Backend API
- [ ] `GET /products?limit=12&offset=0` returns 12 items
- [ ] `GET /products?limit=12&offset=12` returns different 12 items
- [ ] `GET /products?categoryId=<id>&limit=12` returns only products in category
- [ ] `GET /products?sort=price_asc` sorts by price ascending
- [ ] `GET /products?sort=price_desc` sorts by price descending
- [ ] `GET /products?sort=newest` sorts by createdAt descending (default)
- [ ] Response includes `{ items, total, page, pageSize }`
- [ ] Only published products returned (status='published')

### Frontend Catalog Page
- [ ] `/catalog/<slug>` loads 12 products per page
- [ ] Pagination shows correct total pages from backend
- [ ] Clicking page 2 shows different products
- [ ] Network tab shows `limit=12&offset=(page-1)*12`
- [ ] Changing sort resets to page 1
- [ ] Sort options work: newest, price_asc, price_desc
- [ ] Direct categoryId categories use server-side pagination
- [ ] Property-based categories still work (client-side for P0)

### Locale
- [ ] UZ locale renders correctly on first load
- [ ] RU locale renders correctly on first load
- [ ] Switching locale shows correct language without refresh
- [ ] No language "flip" when navigating homepage → catalog → homepage
- [ ] Network requests include `?lang=uz` or `?lang=ru`
- [ ] Network requests include `X-Locale` header

### Error Handling
- [ ] Backend down: Catalog page still renders (empty state)
- [ ] Invalid category slug: Shows fallback "all products" page
- [ ] Invalid page number: Defaults to page 1
- [ ] Invalid sort value: Defaults to 'newest'

---

## Migration Notes

**Breaking Changes:**
- `getProducts()` now returns `ProductListResponse` instead of `ProductResponse[]`
- Frontend code that called `getProducts()` must handle new response format

**Non-Breaking:**
- Backend endpoint still accepts all existing filters
- Old requests without `limit`/`offset` work (defaults applied)
- Backward compatible response format (just wrapped)

**Files Modified:**
- `apps/backend/src/products/products.service.ts`
- `apps/backend/src/products/products.controller.ts`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/lib/api-server.ts`
- `apps/frontend/src/app/catalog/[slug]/page.tsx`

---

## Next Steps (P1)

1. Add backend support for filter arrays (multi-value filters)
2. Add backend facet counts endpoint
3. Move property-based category matching to backend filters
4. Move all client-side filtering to backend

