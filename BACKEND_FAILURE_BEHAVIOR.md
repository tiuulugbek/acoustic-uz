# Backend Failure Behavior

This document describes how the frontend behaves when the backend server is down or unavailable.

## Overview

The frontend is designed to **gracefully degrade** when the backend is unavailable. It will:
- ✅ Always render the UI (never crash)
- ✅ Display fallback content instead of error messages
- ✅ Continue to function for static content
- ✅ Show user-friendly messages when specific content can't be loaded

## Architecture

### 1. Error Handling Strategy

The frontend uses a **"fail gracefully"** approach:

#### Client-Side API Layer (`lib/api.ts`)
- **Never throws errors** - always returns empty data (`[]` for arrays, `null` for objects)
- Catches all network errors, timeouts, and JSON parse errors
- Logs warnings to console but doesn't break the UI
- Returns appropriate empty values based on endpoint type

```typescript
// Returns [] for array endpoints, null for object endpoints
// Never throws, always allows UI to render
```

#### Server-Side API Layer (`lib/api-server.ts`)
- Wraps all API calls with `safeApiCall()` function
- Returns fallback values (empty arrays, null) on any error
- Prevents server-side rendering crashes
- Ensures pages always render HTML

#### React Query Configuration (`providers.tsx`)
- `retry: false` - Don't retry failed requests automatically
- `throwOnError: false` - Don't throw errors, return undefined instead
- Allows queries to fail silently and show placeholder/fallback data

### 2. Page-Level Behavior

#### Homepage (`app/page.tsx`)
**When backend is down:**
- ✅ Shows fallback banners (3 default slides)
- ✅ Shows fallback services (4 default services)
- ✅ Shows fallback hearing aid items (4 default items)
- ✅ Shows fallback Interacoustics products (4 default products)
- ✅ Shows fallback journey steps (4 default steps)
- ✅ Shows fallback news items (6 default news items)
- ✅ Shows fallback FAQ items (10 default FAQ items)
- ✅ All sections render with default content
- ✅ Page remains fully functional

**Fallback data:**
- Predefined content in both Uzbek and Russian
- Placeholder images (SVG data URIs)
- All links point to appropriate fallback routes

#### Catalog Page (`app/catalog/page.tsx`)
**When backend is down:**
- ✅ Shows fallback hearing aid categories (9 default categories)
- ✅ All category cards render with default images and links
- ✅ Page structure remains intact
- ✅ Breadcrumbs and navigation work

**Fallback data:**
- Predefined category names in both languages
- Default links to catalog routes
- Placeholder images

#### Catalog Category Page (`app/catalog/[slug]/page.tsx`)
**When backend is down:**
- ✅ If category exists in URL but backend is down: shows "Все товары" / "Barcha mahsulotlar" page with all products
- ✅ If category doesn't exist: shows all products instead of error
- ✅ Filters and sorting remain functional
- ✅ Shows empty product list with friendly message

**Error handling:**
```typescript
if (!category) {
  // Show all products instead of error
  const allProducts = await getProducts({ status: 'published' }, locale) || [];
  // Display products with filters
}
```

#### Product Detail Page (`app/products/[slug]/page.tsx`)
**When backend is down:**
- ✅ Shows friendly error message: "Продукт не найден" / "Mahsulot topilmadi"
- ✅ Shows helpful text: "К сожалению, мы не можем загрузить информацию о продукте в данный момент."
- ✅ Provides link back to catalog
- ✅ Page structure remains intact

**Error UI:**
```typescript
if (!product) {
  return (
    <main>
      <div className="error-message">
        <h1>Product not found</h1>
        <p>We cannot load product information at this time</p>
        <Link href="/catalog">Back to catalog</Link>
      </div>
    </main>
  );
}
```

#### Service Detail Page (`app/services/[slug]/page.tsx`)
**When backend is down:**
- ✅ Shows friendly error message: "Услуга не найдена" / "Xizmat topilmadi"
- ✅ Shows helpful text explaining the issue
- ✅ Provides link back to homepage
- ✅ Page structure remains intact

### 3. Component-Level Behavior

#### Site Header (`components/site-header.tsx`)
**When backend is down:**
- ✅ Shows default menu items from `DEFAULT_MENUS.header`
- ✅ Menu navigation remains functional
- ✅ Language switcher works
- ✅ Catalog dropdown shows fallback categories
- ✅ No errors or broken UI

**Fallback menu:**
- Uses predefined menu structure from shared constants
- Supports both languages
- All links remain functional

#### Site Footer (`components/site-footer.tsx`)
**When backend is down:**
- ✅ Fully functional (static content)
- ✅ All links work
- ✅ No backend dependencies

### 4. API Error Types Handled

The frontend handles these error scenarios:

1. **Network Errors** (`Failed to fetch`, `ERR_CONNECTION_REFUSED`)
   - Backend server is down
   - Network connectivity issues
   - CORS errors

2. **Timeout Errors** (`AbortError`)
   - Backend takes too long to respond (>5 seconds)
   - Request timeout

3. **HTTP Errors** (4xx, 5xx status codes)
   - Backend returns error status
   - Invalid responses

4. **JSON Parse Errors**
   - Backend returns invalid JSON
   - Malformed responses

5. **Empty Responses**
   - Backend returns empty arrays
   - Null/undefined responses

### 5. User Experience

#### What Users See When Backend is Down:

**Homepage:**
- Full page layout with all sections visible
- Default content in correct language (Uzbek/Russian based on cookie)
- All sections functional but showing fallback data
- No error messages visible to users

**Product Pages:**
- Friendly "Product not found" message
- Helpful explanation in user's language
- Navigation links back to catalog

**Catalog Pages:**
- Empty product lists with helpful messages
- Filter and sort UI remains functional
- Navigation breadcrumbs work

**Menu/Navigation:**
- Default menu items displayed
- All navigation links work
- Language switching works

### 6. Developer Experience

#### Console Logging:

When backend is unavailable, developers will see:

```
[API] ❌ Failed to fetch /banners: {
  error: "Failed to fetch",
  errorType: "TypeError",
  apiBase: "http://localhost:3001/api",
  locale: "ru"
}
[API] ⚠️ Backend appears to be unavailable or unreachable at http://localhost:3001/api
[API] 💡 Frontend will display fallback content. This is normal if backend is not running.
```

#### Debugging Tools:

- `window.refreshHomepageServices()` - Manual refresh for services
- Console warnings for all failed API calls
- Error details logged for debugging

### 7. Testing Backend Failure

#### To test backend failure behavior:

1. **Stop the backend server:**
   ```bash
   # Kill the backend process
   pkill -f "nest start"
   # Or stop it manually if running in a terminal
   ```

2. **Visit the frontend:**
   - Homepage: http://localhost:3000
   - Catalog: http://localhost:3000/catalog
   - Product page: http://localhost:3000/products/[any-slug]

3. **Expected behavior:**
   - All pages should load without errors
   - Fallback content should be displayed
   - Console should show API warnings (not errors)
   - UI should remain fully functional

#### Quick Test Script:

```bash
# Test if backend is down gracefully
curl -s http://localhost:3001/api/banners || echo "Backend is down (expected in this test)"
```

### 8. Recovery Behavior

When the backend comes back online:

1. **React Query** will refetch data on:
   - Window focus (`refetchOnWindowFocus: true` for some queries)
   - Manual refresh
   - Page navigation
   - Polling intervals (if configured)

2. **Automatic recovery:**
   - Some queries have `refetchInterval: 3000` (every 3 seconds)
   - Data will automatically update when backend responds
   - No user action required

### 9. Best Practices

The current implementation follows these best practices:

✅ **Graceful degradation** - Always show UI, never crash
✅ **User-friendly messages** - No technical error messages
✅ **Bilingual support** - Error messages in both languages
✅ **Fallback content** - Meaningful defaults, not empty pages
✅ **No broken links** - All navigation remains functional
✅ **Performance** - Fast rendering even without backend
✅ **Developer visibility** - Console warnings for debugging

### 10. Known Limitations

1. **Admin Panel:**
   - Requires backend to function (expected behavior)
   - Cannot manage content when backend is down

2. **Dynamic Content:**
   - Shows fallback content, not latest from database
   - Updates when backend comes back online

3. **User-generated Content:**
   - Forms and submissions won't work without backend
   - Contact forms won't submit

4. **Real-time Features:**
   - No live updates when backend is down
   - Data refreshes when backend recovers

## Summary

The frontend is **highly resilient** to backend failures:

- ✅ **Never crashes** - Always renders UI
- ✅ **Shows fallback content** - Default content in correct language
- ✅ **Maintains navigation** - All links work
- ✅ **User-friendly** - No technical error messages
- ✅ **Auto-recovery** - Updates when backend comes online
- ✅ **Developer-friendly** - Clear console warnings

This ensures a **smooth user experience** even during backend maintenance or outages.

