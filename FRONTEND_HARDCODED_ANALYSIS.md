# Frontend Hardcoded Ma'lumotlar Tahlili va Database Yechimi

## 📋 Hozirgi Hardcoded Ma'lumotlar Ro'yxati

### **1. Homepage (`apps/frontend/src/app/page.tsx`)**

#### **Services Section:**
```typescript
// Line 252
{locale === 'ru' ? 'Наши услуги' : 'Bizning xizmatlar'}

// Line 290
{locale === 'ru' ? 'Подробнее' : 'Batafsil'}

// Line 300
{locale === 'ru' ? 'Услуги будут добавлены в ближайшее время.' : 'Xizmatlar tez orada qo\'shiladi.'}

// Line 276, 355, 448
<span className="text-white text-lg font-bold">Acoustic</span> // Placeholder text
```

#### **Eshitish apparatlari Section:**
```typescript
// Line 312
{locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish apparatlari'}

// Line 315
{locale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}

// Line 318-324
{locale === 'ru' 
  ? 'Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету.'
  : 'Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.'}

// Line 375
{locale === 'ru' ? 'Подробнее' : 'Batafsil'}

// Line 386-388
{locale === 'ru' 
  ? 'Каталог продуктов пуст.' 
  : 'Mahsulotlar katalogi bo\'sh.'}
```

#### **Interacoustics Section:**
```typescript
// Line 402
Interacoustics // Hardcoded subtitle

// Line 405
{locale === 'ru' ? 'Диагностическое оборудование' : 'Eng so\'nggi diagnostika uskunalari'}

// Line 408-410
{locale === 'ru' 
  ? 'Выбор инновационных решений и устройств для специалистов по аудиологии.'
  : 'Audiologiya mutaxassislari uchun innovatsion yechimlar va qurilmalar tanlovi.'}

// Line 420, 475
{locale === 'ru' ? 'Полный каталог' : 'To\'liq katalog'}
```

#### **Journey Section:**
```typescript
// Line 489
{locale === 'ru' ? 'Путь к лучшему слуху' : 'Yaxshi eshitishga yo\'l'}

// Line 492
{locale === 'ru' ? 'Как мы помогаем' : 'Biz qanday yordam beramiz'}
```

#### **News Section:**
```typescript
// Line 519
{locale === 'ru' ? 'Новости' : 'Yangiliklar'}
```

---

### **2. Catalog Page (`apps/frontend/src/app/catalog/page.tsx`)**

```typescript
// Line 115
pageTitle = searchParams.productType === 'hearing-aids' 
  ? (locale === 'ru' ? 'Каталог и цены на слуховые аппараты' : 'Eshitish moslamalari katalogi va narxlari')
  : searchParams.productType === 'interacoustics'
  ? 'Interacoustics'
  : (locale === 'ru' ? 'Аксессуары' : 'Aksessuarlar');

// Line 121-124 (Brand filtering logic)
brandTabs = brandsData?.filter((brand) => {
  const brandName = brand.name?.toLowerCase() || '';
  return brandName.includes('oticon') || brandName.includes('resound') || brandName.includes('signia');
});

// Line 127-128 (Brand sorting)
const brandOrder = ['oticon', 'resound', 'signia'];

// Line 136-140 (Availability map)
const availabilityMap: Record<string, { uz: string; ru: string }> = {
  'in-stock': { uz: 'Sotuvda', ru: 'В наличии' },
  preorder: { uz: 'Buyurtmaga', ru: 'Под заказ' },
  'out-of-stock': { uz: 'Tugagan', ru: 'Нет в наличии' },
};
```

---

### **3. Product Detail Page (`apps/frontend/src/app/products/[slug]/page.tsx`)**

```typescript
// Line 28-47 (Availability map)
const availabilityMap: Record<string, { uz: string; ru: string; schema: string; color: string }> = {
  'in-stock': { uz: 'Sotuvda', ru: 'В наличии', ... },
  preorder: { uz: 'Buyurtmaga', ru: 'Под заказ', ... },
  'out-of-stock': { uz: 'Tugagan', ru: 'Нет в наличии', ... },
};
```

---

### **4. Placeholder Images**

```typescript
// Multiple locations
<span className="text-white text-lg font-bold">Acoustic</span>
<span className="text-white text-xs font-bold">Acoustic</span>
<span className="text-white text-[10px] md:text-sm font-bold">Acoustic</span>
```

---

## 🎯 Database Schema Design

### **1. HomepageSection Model**

```prisma
model HomepageSection {
  id            String   @id @default(cuid())
  key           String   @unique // "services", "hearing-aids", "interacoustics", "journey", "news"
  title_uz      String?
  title_ru      String?
  subtitle_uz   String?
  subtitle_ru   String?
  description_uz String? @db.Text
  description_ru String? @db.Text
  showTitle     Boolean  @default(true)
  showSubtitle  Boolean  @default(false)
  showDescription Boolean @default(false)
  order         Int      @default(0)
  status        String   @default("published") // "published", "draft", "hidden"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([key])
  @@index([status, order])
}
```

### **2. HomepageLink Model**

```prisma
model HomepageLink {
  id          String   @id @default(cuid())
  sectionKey  String   // "services", "hearing-aids", "interacoustics"
  text_uz     String
  text_ru     String
  href        String   // "/catalog", "/services/{slug}", etc.
  icon        String?  // "arrow-right", "external-link", etc.
  position    String   @default("bottom") // "bottom", "header", "inline"
  order       Int      @default(0)
  status      String   @default("published")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([sectionKey])
  @@index([position])
}
```

### **3. HomepagePlaceholder Model**

```prisma
model HomepagePlaceholder {
  id              String   @id @default(cuid())
  sectionKey      String   @unique // "services", "hearing-aids", "interacoustics"
  imageId         String?
  image           Media?   @relation(fields: [imageId], references: [id], onDelete: SetNull)
  text_uz         String?  @default("Acoustic")
  text_ru         String?  @default("Acoustic")
  backgroundColor String?  @default("#F07E22") // brand-primary
  textColor       String?  @default("#FFFFFF")
  fontSize        String?  @default("text-lg") // Tailwind classes
  fontWeight      String?  @default("font-bold")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### **4. HomepageEmptyState Model**

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

### **5. CatalogPageConfig Model**

```prisma
model CatalogPageConfig {
  id          String   @id @default("singleton")
  // Page titles for different product types
  hearingAidsTitle_uz String? @default("Eshitish moslamalari katalogi va narxlari")
  hearingAidsTitle_ru String? @default("Каталог и цены на слуховые аппараты")
  interacousticsTitle_uz String? @default("Interacoustics")
  interacousticsTitle_ru String? @default("Interacoustics")
  accessoriesTitle_uz String? @default("Aksessuarlar")
  accessoriesTitle_ru String? @default("Аксессуары")
  // Brand tabs configuration
  brandTabIds String[] @default([]) // Array of Brand IDs to show in tabs
  brandTabOrder String[] @default(["oticon", "resound", "signia"]) // Order of brands
  updatedAt   DateTime @updatedAt
}
```

### **6. CommonText Model** (Button texts, labels, etc.)

```prisma
model CommonText {
  id          String   @id @default(cuid())
  key         String   @unique // "readMore", "fullCatalog", "backToCatalog", etc.
  text_uz     String
  text_ru     String
  category    String   @default("button") // "button", "label", "placeholder", "status"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([key])
  @@index([category])
}
```

### **7. AvailabilityStatus Model** (Product availability statuses)

```prisma
model AvailabilityStatus {
  id          String   @id @default(cuid())
  key         String   @unique // "in-stock", "preorder", "out-of-stock"
  label_uz    String
  label_ru     String
  schema      String?  // Schema.org URL
  colorClass  String?  // Tailwind color classes
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([key])
}
```

---

## 🔧 Backend API Development

### **1. HomepageSections Module**

#### **Service:**
```typescript
// apps/backend/src/homepage-sections/homepage-sections.service.ts
@Injectable()
export class HomepageSectionsService {
  async findAll(publicOnly = false) {
    return this.prisma.homepageSection.findMany({
      where: publicOnly ? { status: 'published' } : {},
      orderBy: { order: 'asc' },
    });
  }
  
  async findByKey(key: string) {
    return this.prisma.homepageSection.findUnique({
      where: { key },
    });
  }
  
  async update(key: string, data: UpdateHomepageSectionDto) {
    return this.prisma.homepageSection.update({
      where: { key },
      data,
    });
  }
}
```

#### **Controller:**
```typescript
// apps/backend/src/homepage-sections/homepage-sections.controller.ts
@Controller('homepage-sections')
export class HomepageSectionsController {
  @Public()
  @Get()
  findAll() {
    return this.service.findAll(true);
  }
  
  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }
  
  @Patch(':key')
  @UseGuards(JwtAuthGuard, RbacGuard)
  update(@Param('key') key: string, @Body() dto: UpdateHomepageSectionDto) {
    return this.service.update(key, dto);
  }
}
```

### **2. HomepageLinks Module**

#### **Service:**
```typescript
// apps/backend/src/homepage-links/homepage-links.service.ts
@Injectable()
export class HomepageLinksService {
  async findAll(publicOnly = false) {
    return this.prisma.homepageLink.findMany({
      where: publicOnly ? { status: 'published' } : {},
      orderBy: [{ sectionKey: 'asc' }, { order: 'asc' }],
    });
  }
  
  async findBySection(sectionKey: string, position?: string) {
    const where: any = { sectionKey };
    if (position) {
      where.position = position;
    }
    return this.prisma.homepageLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }
  
  async create(data: CreateHomepageLinkDto) {
    return this.prisma.homepageLink.create({ data });
  }
  
  async update(id: string, data: UpdateHomepageLinkDto) {
    return this.prisma.homepageLink.update({
      where: { id },
      data,
    });
  }
  
  async delete(id: string) {
    return this.prisma.homepageLink.delete({
      where: { id },
    });
  }
}
```

### **3. HomepagePlaceholders Module**

#### **Service:**
```typescript
// apps/backend/src/homepage-placeholders/homepage-placeholders.service.ts
@Injectable()
export class HomepagePlaceholdersService {
  async findAll() {
    return this.prisma.homepagePlaceholder.findMany({
      include: { image: true },
    });
  }
  
  async findBySection(sectionKey: string) {
    return this.prisma.homepagePlaceholder.findUnique({
      where: { sectionKey },
      include: { image: true },
    });
  }
  
  async update(sectionKey: string, data: UpdateHomepagePlaceholderDto) {
    return this.prisma.homepagePlaceholder.upsert({
      where: { sectionKey },
      create: { sectionKey, ...data },
      update: data,
      include: { image: true },
    });
  }
}
```

### **4. HomepageEmptyStates Module**

#### **Service:**
```typescript
// apps/backend/src/homepage-empty-states/homepage-empty-states.service.ts
@Injectable()
export class HomepageEmptyStatesService {
  async findAll() {
    return this.prisma.homepageEmptyState.findMany();
  }
  
  async findBySection(sectionKey: string) {
    return this.prisma.homepageEmptyState.findUnique({
      where: { sectionKey },
    });
  }
  
  async update(sectionKey: string, data: UpdateHomepageEmptyStateDto) {
    return this.prisma.homepageEmptyState.upsert({
      where: { sectionKey },
      create: { sectionKey, ...data },
      update: data,
    });
  }
}
```

### **5. CatalogPageConfig Module**

#### **Service:**
```typescript
// apps/backend/src/catalog-page-config/catalog-page-config.service.ts
@Injectable()
export class CatalogPageConfigService {
  async get() {
    let config = await this.prisma.catalogPageConfig.findUnique({
      where: { id: 'singleton' },
    });
    
    if (!config) {
      config = await this.prisma.catalogPageConfig.create({
        data: { id: 'singleton' },
      });
    }
    
    return config;
  }
  
  async update(data: UpdateCatalogPageConfigDto) {
    return this.prisma.catalogPageConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    });
  }
}
```

### **6. CommonTexts Module**

#### **Service:**
```typescript
// apps/backend/src/common-texts/common-texts.service.ts
@Injectable()
export class CommonTextsService {
  async findAll(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.commonText.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }
  
  async findByKey(key: string) {
    return this.prisma.commonText.findUnique({
      where: { key },
    });
  }
  
  async update(key: string, data: UpdateCommonTextDto) {
    return this.prisma.commonText.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    });
  }
}
```

### **7. AvailabilityStatuses Module**

#### **Service:**
```typescript
// apps/backend/src/availability-statuses/availability-statuses.service.ts
@Injectable()
export class AvailabilityStatusesService {
  async findAll() {
    return this.prisma.availabilityStatus.findMany({
      orderBy: { order: 'asc' },
    });
  }
  
  async findByKey(key: string) {
    return this.prisma.availabilityStatus.findUnique({
      where: { key },
    });
  }
  
  async update(key: string, data: UpdateAvailabilityStatusDto) {
    return this.prisma.availabilityStatus.update({
      where: { key },
      data,
    });
  }
}
```

---

## 🖥️ Admin Panel UI

### **Yangi Tab: "Bosh sahifa kontenti"**

#### **Sub-tabs:**

1. **Sections Tab**
   - Har bir section uchun form:
     - Key (readonly)
     - Title (uz/ru)
     - Subtitle (uz/ru)
     - Description (uz/ru)
     - Show/Hide toggles
     - Order
     - Status

2. **Links Tab**
   - Links jadvali
   - Yangi link qo'shish formi
   - Har bir link uchun:
     - Section key (dropdown)
     - Text (uz/ru)
     - Href
     - Icon (dropdown)
     - Position (dropdown)
     - Order
     - Status

3. **Placeholders Tab**
   - Har bir placeholder uchun form:
     - Section key (dropdown)
     - Image (MediaLibraryModal)
     - Text (uz/ru)
     - Background color
     - Text color
     - Font size
     - Font weight

4. **Empty States Tab**
   - Har bir empty state uchun form:
     - Section key (dropdown)
     - Message (uz/ru)
     - Icon (dropdown)

5. **Catalog Config Tab**
   - Page titles (hearing-aids, interacoustics, accessories)
   - Brand tabs configuration
   - Brand order

6. **Common Texts Tab**
   - Common texts jadvali
   - Har bir text uchun:
     - Key
     - Text (uz/ru)
     - Category

7. **Availability Statuses Tab**
   - Availability statuses jadvali
   - Har bir status uchun:
     - Key
     - Label (uz/ru)
     - Schema URL
     - Color class

---

## 💻 Frontend Integration

### **1. API Functions**

#### `apps/frontend/src/lib/api.ts`
```typescript
export interface HomepageSectionResponse {
  id: string;
  key: string;
  title_uz?: string | null;
  title_ru?: string | null;
  subtitle_uz?: string | null;
  subtitle_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  showTitle: boolean;
  showSubtitle: boolean;
  showDescription: boolean;
  order: number;
  status: string;
}

export interface HomepageLinkResponse {
  id: string;
  sectionKey: string;
  text_uz: string;
  text_ru: string;
  href: string;
  icon?: string | null;
  position: string;
  order: number;
  status: string;
}

export interface HomepagePlaceholderResponse {
  id: string;
  sectionKey: string;
  imageId?: string | null;
  image?: MediaResponse | null;
  text_uz?: string | null;
  text_ru?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  fontSize?: string | null;
  fontWeight?: string | null;
}

export interface HomepageEmptyStateResponse {
  id: string;
  sectionKey: string;
  message_uz: string;
  message_ru: string;
  icon?: string | null;
}

export interface CatalogPageConfigResponse {
  id: string;
  hearingAidsTitle_uz?: string | null;
  hearingAidsTitle_ru?: string | null;
  interacousticsTitle_uz?: string | null;
  interacousticsTitle_ru?: string | null;
  accessoriesTitle_uz?: string | null;
  accessoriesTitle_ru?: string | null;
  brandTabIds: string[];
  brandTabOrder: string[];
}

export interface CommonTextResponse {
  id: string;
  key: string;
  text_uz: string;
  text_ru: string;
  category: string;
}

export interface AvailabilityStatusResponse {
  id: string;
  key: string;
  label_uz: string;
  label_ru: string;
  schema?: string | null;
  colorClass?: string | null;
  order: number;
}

// API Functions
export const getHomepageSections = (locale?: string) => {
  return fetchJson<HomepageSectionResponse[]>('/homepage-sections', locale);
};

export const getHomepageSectionByKey = (key: string, locale?: string) => {
  return fetchJson<HomepageSectionResponse>(`/homepage-sections/${key}`, locale);
};

export const getHomepageLinks = (locale?: string, sectionKey?: string, position?: string) => {
  const params = new URLSearchParams();
  if (sectionKey) params.append('sectionKey', sectionKey);
  if (position) params.append('position', position);
  const query = params.toString();
  return fetchJson<HomepageLinkResponse[]>(`/homepage-links${query ? `?${query}` : ''}`, locale);
};

export const getHomepagePlaceholders = () => {
  return fetchJson<HomepagePlaceholderResponse[]>('/homepage-placeholders');
};

export const getHomepagePlaceholderBySection = (sectionKey: string) => {
  return fetchJson<HomepagePlaceholderResponse>(`/homepage-placeholders/${sectionKey}`);
};

export const getHomepageEmptyStates = () => {
  return fetchJson<HomepageEmptyStateResponse[]>('/homepage-empty-states');
};

export const getHomepageEmptyStateBySection = (sectionKey: string) => {
  return fetchJson<HomepageEmptyStateResponse>(`/homepage-empty-states/${sectionKey}`);
};

export const getCatalogPageConfig = (locale?: string) => {
  return fetchJson<CatalogPageConfigResponse>('/catalog-page-config', locale);
};

export const getCommonTexts = (category?: string, locale?: string) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  const query = params.toString();
  return fetchJson<CommonTextResponse[]>(`/common-texts${query ? `?${query}` : ''}`, locale);
};

export const getCommonTextByKey = (key: string, locale?: string) => {
  return fetchJson<CommonTextResponse>(`/common-texts/${key}`, locale);
};

export const getAvailabilityStatuses = (locale?: string) => {
  return fetchJson<AvailabilityStatusResponse[]>('/availability-statuses', locale);
};

export const getAvailabilityStatusByKey = (key: string, locale?: string) => {
  return fetchJson<AvailabilityStatusResponse>(`/availability-statuses/${key}`, locale);
};
```

### **2. Server-Side API Functions**

#### `apps/frontend/src/lib/api-server.ts`
```typescript
export async function getHomepageSections(locale?: string): Promise<HomepageSectionResponse[]> {
  return safeApiCall(
    () => getHomepageSectionsApi(locale),
    [],
    'Failed to fetch homepage sections',
  );
}

export async function getHomepageSectionByKey(key: string, locale?: string): Promise<HomepageSectionResponse | null> {
  return safeApiCall(
    () => getHomepageSectionByKeyApi(key, locale),
    null,
    `Failed to fetch homepage section ${key}`,
  );
}

export async function getHomepageLinks(locale?: string, sectionKey?: string, position?: string): Promise<HomepageLinkResponse[]> {
  return safeApiCall(
    () => getHomepageLinksApi(locale, sectionKey, position),
    [],
    'Failed to fetch homepage links',
  );
}

export async function getHomepagePlaceholders(): Promise<HomepagePlaceholderResponse[]> {
  return safeApiCall(
    () => getHomepagePlaceholdersApi(),
    [],
    'Failed to fetch homepage placeholders',
  );
}

export async function getHomepageEmptyStates(): Promise<HomepageEmptyStateResponse[]> {
  return safeApiCall(
    () => getHomepageEmptyStatesApi(),
    [],
    'Failed to fetch homepage empty states',
  );
}

export async function getCatalogPageConfig(locale?: string): Promise<CatalogPageConfigResponse | null> {
  return safeApiCall(
    () => getCatalogPageConfigApi(locale),
    null,
    'Failed to fetch catalog page config',
  );
}

export async function getCommonTexts(category?: string, locale?: string): Promise<CommonTextResponse[]> {
  return safeApiCall(
    () => getCommonTextsApi(category, locale),
    [],
    'Failed to fetch common texts',
  );
}

export async function getAvailabilityStatuses(locale?: string): Promise<AvailabilityStatusResponse[]> {
  return safeApiCall(
    () => getAvailabilityStatusesApi(locale),
    [],
    'Failed to fetch availability statuses',
  );
}
```

### **3. Frontend'da Ishlatish**

#### `apps/frontend/src/app/page.tsx` - O'zgartirishlar:

```typescript
import {
  getHomepageSections,
  getHomepageLinks,
  getHomepagePlaceholders,
  getHomepageEmptyStates,
  getCommonTexts,
} from '@/lib/api-server';

export default async function HomePage() {
  const locale = detectLocale();
  
  // Fetch homepage content
  const [
    sections,
    links,
    placeholders,
    emptyStates,
    commonTexts,
    // ... existing data
  ] = await Promise.all([
    getHomepageSections(locale),
    getHomepageLinks(locale),
    getHomepagePlaceholders(),
    getHomepageEmptyStates(),
    getCommonTexts('button', locale),
    // ... existing fetches
  ]);
  
  // Helper functions
  const getSection = (key: string) => {
    const section = sections.find(s => s.key === key && s.status === 'published');
    if (!section) return null;
    return {
      title: locale === 'ru' ? (section.title_ru || '') : (section.title_uz || ''),
      subtitle: locale === 'ru' ? (section.subtitle_ru || '') : (section.subtitle_uz || ''),
      description: locale === 'ru' ? (section.description_ru || '') : (section.description_uz || ''),
      showTitle: section.showTitle,
      showSubtitle: section.showSubtitle,
      showDescription: section.showDescription,
    };
  };
  
  const getLink = (sectionKey: string, position: string) => {
    const link = links.find(l => l.sectionKey === sectionKey && l.position === position && l.status === 'published');
    if (!link) return null;
    return {
      text: locale === 'ru' ? link.text_ru : link.text_uz,
      href: link.href,
      icon: link.icon,
    };
  };
  
  const getPlaceholder = (sectionKey: string) => {
    return placeholders.find(p => p.sectionKey === sectionKey);
  };
  
  const getEmptyState = (sectionKey: string) => {
    const emptyState = emptyStates.find(e => e.sectionKey === sectionKey);
    if (!emptyState) return null;
    return {
      message: locale === 'ru' ? emptyState.message_ru : emptyState.message_uz,
      icon: emptyState.icon,
    };
  };
  
  const getCommonText = (key: string) => {
    const text = commonTexts.find(t => t.key === key);
    if (!text) return null;
    return locale === 'ru' ? text.text_ru : text.text_uz;
  };
  
  // Get sections
  const servicesSection = getSection('services');
  const hearingAidsSection = getSection('hearing-aids');
  const interacousticsSection = getSection('interacoustics');
  const journeySection = getSection('journey');
  const newsSection = getSection('news');
  
  // Get links
  const servicesLink = getLink('services', 'bottom');
  const hearingAidsLink = getLink('hearing-aids', 'bottom');
  const interacousticsHeaderLink = getLink('interacoustics', 'header');
  const interacousticsBottomLink = getLink('interacoustics', 'bottom');
  
  // Get placeholders
  const servicesPlaceholder = getPlaceholder('services');
  const hearingAidsPlaceholder = getPlaceholder('hearing-aids');
  const interacousticsPlaceholder = getPlaceholder('interacoustics');
  
  // Get empty states
  const servicesEmptyState = getEmptyState('services');
  const hearingAidsEmptyState = getEmptyState('hearing-aids');
  const interacousticsEmptyState = getEmptyState('interacoustics');
  
  // Get common texts
  const readMoreText = getCommonText('readMore') || (locale === 'ru' ? 'Подробнее' : 'Batafsil');
  const fullCatalogText = getCommonText('fullCatalog') || (locale === 'ru' ? 'Полный каталог' : 'To\'liq katalog');
  
  return (
    <main>
      {/* Services Section */}
      {servicesSection?.showTitle && (
        <h2>{servicesSection.title}</h2>
      )}
      
      {services.length === 0 && servicesEmptyState && (
        <p>{servicesEmptyState.message}</p>
      )}
      
      {servicesLink && (
        <span>
          {servicesLink.text}
        </span>
      )}
      
      {/* Placeholder */}
      {!service.image && servicesPlaceholder && (
        <div style={{ backgroundColor: servicesPlaceholder.backgroundColor || '#F07E22' }}>
          {servicesPlaceholder.image ? (
            <Image src={servicesPlaceholder.image.url} />
          ) : (
            <span style={{ 
              color: servicesPlaceholder.textColor || '#FFFFFF',
              fontSize: servicesPlaceholder.fontSize || 'text-lg',
              fontWeight: servicesPlaceholder.fontWeight || 'font-bold',
            }}>
              {locale === 'ru' ? (servicesPlaceholder.text_ru || 'Acoustic') : (servicesPlaceholder.text_uz || 'Acoustic')}
            </span>
          )}
        </div>
      )}
      
      {/* ... other sections */}
    </main>
  );
}
```

---

## 📊 Implementation Priority

### **Phase 1: Critical Sections** (1 hafta)
1. ✅ HomepageSection model va API
2. ✅ Services Section
3. ✅ Eshitish apparatlari Section
4. ✅ Interacoustics Section

### **Phase 2: Links va Placeholders** (1 hafta)
5. ✅ HomepageLink model va API
6. ✅ HomepagePlaceholder model va API
7. ✅ Frontend integration

### **Phase 3: Empty States va Common Texts** (1 hafta)
8. ✅ HomepageEmptyState model va API
9. ✅ CommonText model va API
10. ✅ Frontend integration

### **Phase 4: Catalog Config va Availability Statuses** (1 hafta)
11. ✅ CatalogPageConfig model va API
12. ✅ AvailabilityStatus model va API
13. ✅ Frontend integration

### **Phase 5: Admin Panel** (1 hafta)
14. ✅ Admin panel UI
15. ✅ Form validation
16. ✅ Testing

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

### **Step 3: Frontend Integration**
- API functions qo'shish
- Frontend'da hardcoded matnlarni o'rniga API'dan olish
- Fallback logic (agar API'dan kelmasa, default matnlar)

### **Step 4: Admin Panel**
- UI componentlar yaratish
- Form validation
- Image upload integration

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
   - Barcha homepage content barchasi bir API call'da olinishi kerak
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

**Yaratilgan sana**: 2025-01-XX
**Status**: 📋 Planning
**Priority**: High
**Estimated Time**: 4-5 hafta





