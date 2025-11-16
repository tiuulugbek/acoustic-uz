# How to Link Products to the Catalog

## Overview

Products are linked to catalog categories via the `categoryId` field in the admin panel. When a product is assigned to a category, it appears on that category's page and can be filtered by various product properties.

---

## Step-by-Step Guide

### 1️⃣ Access Product Management

1. Open **Admin Panel**
2. Navigate to: **Catalog** → **Mahsulotlar** (Products) tab
3. You'll see a list of all products

### 2️⃣ Create or Edit a Product

**Option A: Create New Product**
- Click **"Yangi mahsulot"** (New Product) button
- Fill in the product form

**Option B: Edit Existing Product**
- Find the product in the table
- Click **"Tahrirlash"** (Edit) button
- The product form opens with existing data

### 3️⃣ Fill Product Details

Required fields:
- **Nomi (uz)** / **Nomi (ru)** - Product name in Uzbek and Russian
- **Slug** - URL-friendly name (e.g., `oticon-real-1`)
- **Tavsif (uz)** / **Tavsif (ru)** - Product description
- **Narx** - Price (optional)
- **Soni** - Stock quantity (optional)
- **Brend** - Brand (optional)

### 4️⃣ Link to Category (IMPORTANT)

1. Find the **"Kategoriya"** (Category) dropdown field in the form
2. Click the dropdown to see all available categories
3. Select one of the **8 catalog categories**:

   - **Ko'rinmas quloq apparatlari** (`category-invisible`)
   - **Keksalar uchun** (`category-seniors`)
   - **Bolalar uchun** (`category-children`)
   - **AI texnologiyalari** (`category-ai`)
   - **Ikkinchi darajadagi eshitish yo'qotilishi** (`category-moderate-loss`)
   - **Kuchli va superkuchli** (`category-powerful`)
   - **Tovushni boshqarish** (`category-tinnitus`)
   - **Smartfon uchun** (`category-smartphone`)

4. The category dropdown shows category names in Uzbek (you can search by typing)

### 5️⃣ Set Product Properties (For Filters)

These properties allow products to be filtered on category pages:

**Audience** (Kimlar uchun / Для кого):
- `children` - Bolalar / Детям
- `adults` - Kattalar / Взрослым
- `elderly` - Keksalar / Пожилым

**Form Factors** (Korpus turi / Тип корпуса):
- `bte` - BTE
- `ric` - RIC
- `ite` - ITE
- `cic` - CIC
- `iic` - IIC
- etc.

**Hearing Loss Levels** (Eshitish darajalari / Степень снижения слуха):
- `mild` - I daraja / I степень
- `moderate` - II daraja / II степень
- `severe` - III daraja / III степень
- `profound` - IV daraja / IV степень

**Power Level** (Quvvat / Мощность):
- `Standard` - Standart / Стандартная
- `Power` - Kuchli / Мощная
- `Super Power` - Super kuchli / Супермощная

**Signal Processing** (Tovushni qayta ishlash / Обработка сигнала):
- Various signal processing technologies

### 6️⃣ Save Product

1. Click **"Saqlash"** (Save) button
2. Product is saved with category assignment
3. Success message appears: **"Mahsulot saqlandi"** (Product saved)

---

## What Happens After Linking?

### ✅ Product Appears on Category Page

- Product appears on: `/catalog/{category-slug}`
- Example: If you assign product to `category-children`, it appears on `/catalog/category-children`

### ✅ Filters Work Automatically

When users visit a category page, they can filter products by:
- **Brand** (Brend)
- **Audience** (Kimlar uchun)
- **Form Factors** (Korpus turi)
- **Hearing Loss Levels** (Eshitish darajalari)
- **Power Level** (Quvvat)

### ✅ Catalog Card Links to Category

When users click a catalog card on the homepage or `/catalog`:
1. They navigate to the category page (e.g., `/catalog/category-children`)
2. They see all products assigned to that category
3. They can filter products using the sidebar filters

---

## Example Workflow

### Example: Adding "Oticon Real 1" to "Bolalar uchun" Category

1. **Go to:** Admin Panel → Catalog → Mahsulotlar
2. **Click:** "Yangi mahsulot" (or edit existing product)
3. **Fill in:**
   - Nomi (uz): `Oticon Real 1`
   - Nomi (ru): `Oticon Real 1`
   - Slug: `oticon-real-1`
   - Kategoriya: Select **"Bolalar uchun"** from dropdown
   - Audience: Select **"children"** (Bolalar)
   - Form Factors: Select **"ric"** (RIC)
   - Hearing Loss Levels: Select **"moderate"** (II daraja)
   - Power Level: Select **"Standard"** (Standart)
4. **Click:** "Saqlash" (Save)
5. **Result:**
   - Product appears on `/catalog/category-children`
   - Can be filtered by: audience, formFactors, hearingLossLevels, etc.
   - Users can click "Bolalar uchun" catalog card to see this product

---

## Technical Details

### Database Relationship

```
Product
  ├── categoryId (links to ProductCategory.id)
  ├── brandId (links to Brand.id)
  ├── audience (array: ['children', 'adults', 'elderly'])
  ├── formFactors (array: ['bte', 'ric', 'ite', ...])
  ├── hearingLossLevels (array: ['mild', 'moderate', ...])
  ├── powerLevel (string: 'Standard', 'Power', ...)
  └── signalProcessing (string: ...)
```

### API Flow

1. **Admin Panel** → Sets `categoryId` on product
2. **Backend** → Saves product with `categoryId` in database
3. **Frontend** → Fetches products filtered by `categoryId` on category page
4. **Filters** → Applied based on product properties (audience, formFactors, etc.)

---

## Troubleshooting

### Product Not Appearing on Category Page?

1. **Check category assignment:**
   - Go to product edit form
   - Verify "Kategoriya" dropdown has a category selected
   - Save product again

2. **Check product status:**
   - Product must have `status: 'published'`
   - Check "Holat" (Status) field in product form

3. **Check category slug:**
   - Category slug must match catalog item link
   - Example: Catalog item links to `/catalog/category-children`
   - Product must be assigned to category with slug `category-children`

### Filters Not Working?

1. **Check product properties:**
   - Ensure product has values for: `audience`, `formFactors`, `hearingLossLevels`, etc.
   - Empty arrays won't show in filters

2. **Check category page:**
   - Filters only appear if products in that category have those properties
   - Example: If no products have `audience: 'children'`, that filter won't appear

---

## Summary

**To link a product to the catalog:**

1. ✅ Assign product to a category via `categoryId` dropdown
2. ✅ Set product properties (audience, formFactors, etc.) for filtering
3. ✅ Save product
4. ✅ Product appears on category page with filters working automatically

The catalog cards on the homepage automatically link to these categories, so products assigned to categories will be discoverable through the catalog system!

