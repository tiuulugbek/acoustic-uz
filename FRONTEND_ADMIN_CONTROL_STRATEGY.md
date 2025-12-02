# Frontend Admin Panel Control Strategy

## Maqsad
Frontend'da hardcoded bo'lgan barcha matnlar, rasmlar, linklar va boshqa ma'lumotlarni admin paneldan boshqariladigan qilish.

---

## 📋 Hozirgi Holat: Hardcoded Ma'lumotlar

### 1. **Homepage (`apps/frontend/src/app/page.tsx`)**

#### Section Titles va Descriptions:
- ✅ **Services Section**: 
  - Title: "Bizning xizmatlar" / "Наши услуги" (hardcoded)
  - Empty state: "Xizmatlar tez orada qo'shiladi." (hardcoded)
  
- ✅ **Eshitish apparatlari Section**:
  - Subtitle: "Eshitish apparatlari" / "Слуховые аппараты" (hardcoded)
  - Title: "Turmush tarziga mos eshitish yechimlari" / "Решения для вашего образа жизни" (hardcoded)
  - Description: "Biz sizning odatlaringiz..." / "Мы подберём модель..." (hardcoded)
  - Empty state: "Mahsulotlar katalogi bo'sh." (hardcoded)
  
- ✅ **Interacoustics Section**:
  - Subtitle: "Interacoustics" (hardcoded)
  - Title: "Eng so'nggi diagnostika uskunalari" / "Диагностическое оборудование" (hardcoded)
  - Description: "Audiologiya mutaxassislari uchun..." / "Выбор инновационных решений..." (hardcoded)
  - "To'liq katalog" link text (hardcoded)

- ✅ **Journey Section** (agar bor bo'lsa):
  - Section title va descriptions (hardcoded)

- ✅ **FAQ Section**:
  - Section title (hardcoded)

- ✅ **News Section**:
  - Section title (hardcoded)

#### Placeholder Images:
- ✅ Services bo'limida rasm yo'q bo'lsa: "Acoustic" placeholder (hardcoded)
- ✅ Eshitish apparatlari bo'limida rasm yo'q bo'lsa: "Acoustic" placeholder (hardcoded)

#### Links:
- ✅ "Batafsil" / "Подробнее" link text (hardcoded)
- ✅ "To'liq katalog" / "Полный каталог" link text va href="/catalog" (hardcoded)

---

### 2. **Catalog Page (`apps/frontend/src/app/catalog/page.tsx`)**

- ✅ Page titles: "Eshitish moslamalari katalogi va narxlari" / "Каталог и цены на слуховые аппараты" (hardcoded)
- ✅ Brand filtering logic: Oticon, ReSound, Signia hardcoded
- ✅ Empty states va messages (hardcoded)

---

### 3. **Footer (`apps/frontend/src/components/site-footer.tsx`)**

- ✅ Copyright text (hozir settings'dan olinyapti, lekin format hardcoded)
- ✅ Section titles (hozir translations'dan olinyapti, lekin struktura hardcoded)

---

### 4. **Header (`apps/frontend/src/components/site-header.tsx`)**

- ✅ Search placeholder text (hardcoded)
- ✅ Menu items (hozir backend'dan keladi, lekin struktura hardcoded)

---

### 5. **Other Pages**

- ✅ Product detail page: Empty states, button texts
- ✅ Service detail page: Empty states, button texts
- ✅ Post detail page: Empty states, button texts

---

## 🎯 Yechim Strategiyasi

### **Bosqich 1: Database Schema Design**

#### 1.1. **HomepageSections Table** (yangi)
```prisma
model HomepageSection {
  id          String   @id @default(cuid())
  key         String   @unique // "services", "hearing-aids", "interacoustics", "journey", "faq", "news"
  title_uz    String?
  title_ru    String?
  subtitle_uz String?
  subtitle_ru String?
  description_uz String? @db.Text
  description_ru String? @db.Text
  showTitle   Boolean  @default(true)
  showSubtitle Boolean @default(true)
  showDescription Boolean @default(true)
  order       Int      @default(0)
  status      String   @default("published") // "published", "draft", "hidden"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### 1.2. **HomepageLinks Table** (yangi)
```prisma
model HomepageLink {
  id          String   @id @default(cuid())
  sectionKey  String   // "services", "hearing-aids", "interacoustics"
  text_uz     String
  text_ru     String
  href        String   // "/catalog", "/services", etc.
  icon        String?  // "arrow-right", "external-link", etc.
  position    String   @default("bottom") // "bottom", "header", "inline"
  order       Int      @default(0)
  status      String   @default("published")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([sectionKey])
}
```

#### 1.3. **HomepagePlaceholders Table** (yangi)
```prisma
model HomepagePlaceholder {
  id          String   @id @default(cuid())
  sectionKey  String   @unique // "services", "hearing-aids"
  imageId     String?
  image       Media?   @relation(fields: [imageId], references: [id], onDelete: SetNull)
  text_uz     String?  // "Acoustic" o'rniga boshqa matn
  text_ru     String?
  backgroundColor String? @default("#F07E22") // brand-primary
  textColor   String?  @default("#FFFFFF")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### 1.4. **HomepageEmptyStates Table** (yangi)
```prisma
model HomepageEmptyState {
  id          String   @id @default(cuid())
  sectionKey  String   @unique // "services", "hearing-aids", "interacoustics"
  message_uz  String   @db.Text
  message_ru  String   @db.Text
  icon        String?  // "info", "empty-box", etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

### **Bosqich 2: Backend API Development**

#### 2.1. **New Endpoints:**

```
GET    /api/homepage/sections          - Barcha sections
GET    /api/homepage/sections/:key     - Bitta section
PATCH  /api/homepage/sections/:key     - Section yangilash

GET    /api/homepage/links              - Barcha links
POST   /api/homepage/links              - Yangi link
PATCH  /api/homepage/links/:id         - Link yangilash
DELETE /api/homepage/links/:id          - Link o'chirish

GET    /api/homepage/placeholders       - Barcha placeholders
PATCH  /api/homepage/placeholders/:key  - Placeholder yangilash

GET    /api/homepage/empty-states       - Barcha empty states
PATCH  /api/homepage/empty-states/:key  - Empty state yangilash
```

#### 2.2. **Backend Services:**
- `HomepageSectionsService`
- `HomepageLinksService`
- `HomepagePlaceholdersService`
- `HomepageEmptyStatesService`

---

### **Bosqich 3: Admin Panel UI**

#### 3.1. **Yangi Tab: "Bosh sahifa sozlamalari"**

**Sub-tabs:**
1. **Sections** - Har bir section uchun:
   - Title (uz/ru)
   - Subtitle (uz/ru)
   - Description (uz/ru)
   - Show/Hide toggles
   - Order
   - Status

2. **Links** - Har bir link uchun:
   - Section key (dropdown)
   - Text (uz/ru)
   - Href
   - Icon (dropdown)
   - Position (dropdown)
   - Order
   - Status

3. **Placeholders** - Har bir placeholder uchun:
   - Section key (dropdown)
   - Image (MediaLibraryModal)
   - Text (uz/ru)
   - Background color
   - Text color

4. **Empty States** - Har bir empty state uchun:
   - Section key (dropdown)
   - Message (uz/ru)
   - Icon (dropdown)

---

### **Bosqich 4: Frontend Integration**

#### 4.1. **New API Functions:**
```typescript
// apps/frontend/src/lib/api.ts
export const getHomepageSections = (locale?: string) => { ... }
export const getHomepageLinks = (locale?: string) => { ... }
export const getHomepagePlaceholders = () => { ... }
export const getHomepageEmptyStates = (locale?: string) => { ... }
```

#### 4.2. **Frontend Updates:**

**`apps/frontend/src/app/page.tsx`:**
```typescript
// Fetch sections, links, placeholders, empty states
const [sections, links, placeholders, emptyStates] = await Promise.all([
  getHomepageSections(locale),
  getHomepageLinks(locale),
  getHomepagePlaceholders(),
  getHomepageEmptyStates(locale),
]);

// Use sections data instead of hardcoded
const servicesSection = sections.find(s => s.key === 'services');
const hearingAidsSection = sections.find(s => s.key === 'hearing-aids');
const interacousticsSection = sections.find(s => s.key === 'interacoustics');

// Use links data
const servicesLink = links.find(l => l.sectionKey === 'services' && l.position === 'bottom');
const interacousticsLink = links.find(l => l.sectionKey === 'interacoustics' && l.position === 'header');

// Use placeholders
const servicesPlaceholder = placeholders.find(p => p.sectionKey === 'services');
const hearingAidsPlaceholder = placeholders.find(p => p.sectionKey === 'hearing-aids');

// Use empty states
const servicesEmptyState = emptyStates.find(e => e.sectionKey === 'services');
```

---

## 📊 Implementation Priority

### **Phase 1: Critical Sections** (1-2 hafta)
1. ✅ Services Section (title, description, empty state)
2. ✅ Eshitish apparatlari Section (title, description, empty state)
3. ✅ Interacoustics Section (title, description, link)

### **Phase 2: Links va Placeholders** (1 hafta)
4. ✅ "Batafsil" / "Подробнее" links
5. ✅ "To'liq katalog" links
6. ✅ Placeholder images va texts

### **Phase 3: Other Sections** (1 hafta)
7. ✅ Journey Section
8. ✅ FAQ Section
9. ✅ News Section

### **Phase 4: Other Pages** (1 hafta)
10. ✅ Catalog page titles
11. ✅ Product/Service/Post detail pages empty states
12. ✅ Footer va Header hardcoded texts

---

## 🔄 Migration Strategy

### **Step 1: Database Migration**
- Prisma schema'ga yangi modellar qo'shish
- Migration yaratish va ishga tushirish
- Default ma'lumotlarni seed qilish (hozirgi hardcoded matnlar)

### **Step 2: Backend Development**
- Services va Controllers yaratish
- API endpoints qo'shish
- Validation va error handling

### **Step 3: Admin Panel**
- UI componentlar yaratish
- Form validation
- Image upload integration

### **Step 4: Frontend Integration**
- API functions qo'shish
- Frontend'da hardcoded matnlarni o'rniga API'dan olish
- Fallback logic (agar API'dan kelmasa, default matnlar)

### **Step 5: Testing**
- Backend API testlari
- Admin panel testlari
- Frontend integration testlari
- E2E testlari

---

## ⚠️ Muhim Eslatmalar

1. **Backward Compatibility**: 
   - Agar API'dan ma'lumot kelmasa, fallback sifatida hozirgi hardcoded matnlar ishlatilishi kerak
   - Bu migration jarayonida muhim

2. **Performance**:
   - Homepage sections, links, placeholders, empty states barchasi bir API call'da olinishi kerak
   - Caching strategiyasi (ISR) saqlanib qolishi kerak

3. **Localization**:
   - Barcha matnlar uz/ru formatida saqlanishi kerak
   - Frontend'da locale'ga qarab to'g'ri matn tanlash

4. **Default Values**:
   - Database'ga seed qilishda hozirgi hardcoded matnlar default sifatida qo'shilishi kerak
   - Bu migration jarayonida frontend'ning ishlashini ta'minlaydi

---

## 📝 Next Steps

1. ✅ Bu strategiyani review qilish va tasdiqlash
2. ✅ Database schema'ni Prisma'ga qo'shish
3. ✅ Backend API'ni yaratish
4. ✅ Admin panel UI'ni yaratish
5. ✅ Frontend'ni yangilash
6. ✅ Testing va deployment

---

## 🎯 Foyda

1. **Flexibility**: Admin panel orqali barcha matnlar o'zgartiriladi
2. **No Code Changes**: Frontend kodini o'zgartirmasdan matnlarni yangilash mumkin
3. **Multi-language**: uz/ru matnlar alohida boshqariladi
4. **Consistency**: Barcha sahifalarda bir xil struktura
5. **Maintainability**: Hardcoded matnlar yo'qoladi, kod tozaroq bo'ladi

---

**Yaratilgan sana**: 2025-01-XX
**Status**: 📋 Planning
**Priority**: High
**Estimated Time**: 4-5 hafta






