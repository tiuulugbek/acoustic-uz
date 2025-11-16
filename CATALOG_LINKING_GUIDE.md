# Catalog Linking System - Complete Guide

## Overview

The catalog system has three main components that work together:

1. **HomepageHearingAid** (Catalog Cards) - The 9 items shown on homepage and `/catalog`
2. **ProductCategory** (Categories) - Real product categories (e.g., "BTE", "RIC", "Children")
3. **Product** (Products) - Actual hearing aid products (e.g., "Oticon Real 1")

---

## 🔗 How Products Link to Catalogs

### Flow Diagram

```
Admin Panel
    ↓
HomepageHearingAid (Catalog Card)
    ↓ link='/catalog/category-invisible'
Frontend Catalog Card Click
    ↓
/catalog/category-invisible Page
    ↓ categoryId filter
Products with categoryId matching that category
    ↓
Display Products on Category Page
```

---

## 📊 Component Details

### 1. HomepageHearingAid (Catalog Cards)

**Location in Admin:** `Admin Panel → Homepage → "Eshitish apparatlari kartochkalari"`

**Database Table:** `HomepageHearingAid`

**Fields:**
- `title_uz` / `title_ru` - Card title
- `description_uz` / `description_ru` - Card description
- `link` - URL to category page (e.g., `/catalog/category-invisible`)
- `imageId` - Optional image reference
- `order` - Display order (1-9)
- `status` - Must be 'published' to show on frontend

**Frontend Display:**
- Homepage: Product Catalog section (3x3 grid)
- `/catalog` page: Same 9 items in grid layout

**API Endpoints:**
- Public: `GET /api/homepage/hearing-aids` (returns only `status='published'`)
- Admin: `GET /api/homepage/hearing-aids/admin` (returns all items)

---

### 2. ProductCategory (Categories)

**Location in Admin:** `Admin Panel → Catalog → Categories`

**Database Table:** `ProductCategory`

**Fields:**
- `name_uz` / `name_ru` - Category name
- `slug` - URL slug (e.g., `category-invisible`, `category-children`)
- `description_uz` / `description_ru` - Category description
- `imageId` - Optional category image

**Frontend Display:**
- Category pages: `/catalog/category-invisible`, `/catalog/category-children`, etc.

**API Endpoints:**
- Public: `GET /api/product-categories` (returns all categories)
- By Slug: `GET /api/product-categories/slug/:slug`

---

### 3. Product (Products)

**Location in Admin:** `Admin Panel → Catalog → Products`

**Database Table:** `Product`

**Fields:**
- `name_uz` / `name_ru` - Product name
- `slug` - URL slug (e.g., `oticon-real-1`)
- `categoryId` - **Links to ProductCategory**
- `brandId` - Links to Brand
- `price`, `description`, `features`, etc.

**Frontend Display:**
- Product pages: `/products/oticon-real-1`
- Category pages: Shows all products with matching `categoryId`

**API Endpoints:**
- Public: `GET /api/products` (with filters)
- By Slug: `GET /api/products/slug/:slug`

---

## 🔗 Linking Flow Explained

### Step 1: User Sees Catalog Card

On homepage or `/catalog` page, user sees one of the 9 cards:
- **Title:** "Ko'rinmas quloq apparatlari"
- **Link:** `/catalog/category-invisible`

### Step 2: User Clicks Card

Clicking the card navigates to: `/catalog/category-invisible`

### Step 3: Category Page Loads

The `/catalog/[slug]` page:
1. Fetches category by slug: `getCategoryBySlug('category-invisible')`
2. Fetches all products: `getProducts({ status: 'published' })`
3. Filters products where `product.categoryId === category.id`
4. Displays filtered products in grid

### Step 4: User Sees Products

Products that have `categoryId` matching the category are displayed.

---

## ✅ Current Status

**9 Catalog Items Added:**
1. ✅ Ko'rinmas quloq apparatlari → `/catalog/category-invisible`
2. ✅ Keksalar uchun → `/catalog/category-seniors`
3. ✅ Bolalar uchun → `/catalog/category-children`
4. ✅ AI texnologiyalari → `/catalog/category-ai`
5. ✅ Ikkinchi darajadagi eshitish yo'qotilishi → `/catalog/category-moderate-loss`
6. ✅ Kuchli va superkuchli → `/catalog/category-powerful`
7. ✅ Tovushni boshqarish → `/catalog/category-tinnitus`
8. ✅ Smartfon uchun → `/catalog/category-smartphone`
9. ✅ Ko'rinmas → `/catalog/category-invisible`

**All items are:**
- ✅ Status: 'published'
- ✅ Displayed on homepage Product Catalog section
- ✅ Displayed on `/catalog` page
- ✅ Linked to category pages

---

## 📝 How to Add/Edit Products to Catalogs

### Adding Products to a Category:

1. Go to `Admin Panel → Catalog → Products`
2. Create or edit a product
3. Set the `categoryId` field to link the product to a category
4. Product will automatically appear on that category's page

### Example:
- Product: "Oticon Real 1"
- Category: "RIC (Kanal ichida)" → slug: `category-ric`
- Set `categoryId` to the RIC category's ID
- Product appears on `/catalog/category-ric`

---

## 🔄 Automatic Linking

The catalog cards (`HomepageHearingAid`) can automatically link to categories:

**In `/catalog/page.tsx` (line 72-86):**
- If a card's `link` is missing or generic (`/catalog`), the system tries to:
  1. Find a matching category by comparing titles
  2. Auto-link to that category if found
  3. Otherwise, use the card's default link

---

## ✅ Verification

Check that items appear:
1. Homepage: Product Catalog section shows 9 items
2. `/catalog` page shows the same 9 items
3. Clicking any card navigates to its linked category page
4. Category page shows products with matching `categoryId`

---

## 🎯 Summary

**Everything is linked:**
- ✅ Admin Panel → Backend → Frontend (all connected)
- ✅ Catalog Cards → Category Pages → Products
- ✅ Same data source used by homepage and `/catalog`
- ✅ Changes in admin panel appear on frontend immediately

