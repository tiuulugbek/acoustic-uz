# Frontend Hardcode Strategy (JSON Files)

## Maqsad
Frontend'da hardcoded bo'lgan barcha matnlar, rasmlar, linklar va boshqa ma'lumotlarni admin paneldan o'zgartiriladigan JSON fayllarga ko'chirish. Database'ga saqlanmaydi, balki frontend'da JSON fayllar sifatida saqlanadi.

---

## 📋 Hozirgi Struktura

### Mavjud JSON Fayllar:
- `apps/frontend/src/locales/uz.json` - O'zbekcha tarjimalar
- `apps/frontend/src/locales/ru.json` - Ruscha tarjimalar

### Mavjud Translation System:
- `apps/frontend/src/lib/translations.ts` - `getTranslation()` va `useTranslation()` funksiyalari
- Server-side: `getTranslation(locale, key, params)`
- Client-side: `useTranslation(locale)`

---

## 🎯 Yechim: Yangi JSON Struktura

### **1. Homepage Content JSON**

#### `apps/frontend/src/locales/homepage-content.json`
```json
{
  "sections": {
    "services": {
      "title": {
        "uz": "Bizning xizmatlar",
        "ru": "Наши услуги"
      },
      "subtitle": null,
      "description": null,
      "showTitle": true,
      "showSubtitle": false,
      "showDescription": false,
      "order": 1,
      "status": "published"
    },
    "hearing-aids": {
      "title": {
        "uz": "Turmush tarziga mos eshitish yechimlari",
        "ru": "Решения для вашего образа жизни"
      },
      "subtitle": {
        "uz": "Eshitish apparatlari",
        "ru": "Слуховые аппараты"
      },
      "description": {
        "uz": "Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.",
        "ru": "Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету."
      },
      "showTitle": true,
      "showSubtitle": true,
      "showDescription": true,
      "order": 2,
      "status": "published"
    },
    "interacoustics": {
      "title": {
        "uz": "Eng so'nggi diagnostika uskunalari",
        "ru": "Диагностическое оборудование"
      },
      "subtitle": {
        "uz": "Interacoustics",
        "ru": "Interacoustics"
      },
      "description": {
        "uz": "Audiologiya mutaxassislari uchun innovatsion yechimlar va qurilmalar tanlovi.",
        "ru": "Выбор инновационных решений и устройств для специалистов по аудиологии."
      },
      "showTitle": true,
      "showSubtitle": true,
      "showDescription": true,
      "order": 3,
      "status": "published"
    }
  },
  "links": {
    "services": {
      "bottom": {
        "text": {
          "uz": "Batafsil",
          "ru": "Подробнее"
        },
        "href": "/services/{slug}",
        "icon": "arrow-right"
      }
    },
    "hearing-aids": {
      "bottom": {
        "text": {
          "uz": "Batafsil",
          "ru": "Подробнее"
        },
        "href": "/catalog/{slug}",
        "icon": "arrow-right"
      }
    },
    "interacoustics": {
      "header": {
        "text": {
          "uz": "To'liq katalog",
          "ru": "Полный каталог"
        },
        "href": "/catalog?productType=interacoustics",
        "icon": "arrow-right"
      }
    }
  },
  "placeholders": {
    "services": {
      "image": null,
      "text": {
        "uz": "Acoustic",
        "ru": "Acoustic"
      },
      "backgroundColor": "#F07E22",
      "textColor": "#FFFFFF"
    },
    "hearing-aids": {
      "image": null,
      "text": {
        "uz": "Acoustic",
        "ru": "Acoustic"
      },
      "backgroundColor": "#F07E22",
      "textColor": "#FFFFFF"
    }
  },
  "emptyStates": {
    "services": {
      "message": {
        "uz": "Xizmatlar tez orada qo'shiladi.",
        "ru": "Услуги будут добавлены в ближайшее время."
      },
      "icon": "info"
    },
    "hearing-aids": {
      "message": {
        "uz": "Mahsulotlar katalogi bo'sh.",
        "ru": "Каталог продуктов пуст."
      },
      "icon": "info"
    },
    "interacoustics": {
      "message": {
        "uz": "Mahsulotlar topilmadi.",
        "ru": "Продукты не найдены."
      },
      "icon": "info"
    }
  }
}
```

---

### **2. Catalog Page Content JSON**

#### `apps/frontend/src/locales/catalog-content.json`
```json
{
  "titles": {
    "hearing-aids": {
      "uz": "Eshitish moslamalari katalogi va narxlari",
      "ru": "Каталог и цены на слуховые аппараты"
    },
    "interacoustics": {
      "uz": "Interacoustics",
      "ru": "Interacoustics"
    },
    "accessories": {
      "uz": "Aksessuarlar",
      "ru": "Аксессуары"
    }
  },
  "emptyStates": {
    "products": {
      "uz": "Mahsulotlar topilmadi.",
      "ru": "Товары не найдены."
    }
  }
}
```

---

### **3. Common Content JSON** (Button texts, etc.)

#### `apps/frontend/src/locales/common-content.json`
```json
{
  "buttons": {
    "readMore": {
      "uz": "Batafsil",
      "ru": "Подробнее"
    },
    "fullCatalog": {
      "uz": "To'liq katalog",
      "ru": "Полный каталог"
    },
    "backToCatalog": {
      "uz": "← Katalogga qaytish",
      "ru": "← Вернуться в каталог"
    }
  },
  "placeholders": {
    "search": {
      "uz": "Qidirish...",
      "ru": "Поиск..."
    }
  }
}
```

---

## 🔧 Implementation Plan

### **Bosqich 1: JSON Fayllarni Yaratish**

1. ✅ `apps/frontend/src/locales/homepage-content.json` yaratish
2. ✅ `apps/frontend/src/locales/catalog-content.json` yaratish
3. ✅ `apps/frontend/src/locales/common-content.json` yaratish

### **Bosqich 2: Helper Functions Yaratish**

#### `apps/frontend/src/lib/homepage-content.ts`
```typescript
import homepageContent from '@/locales/homepage-content.json';

export function getHomepageSection(locale: 'uz' | 'ru', sectionKey: string) {
  const section = homepageContent.sections[sectionKey];
  if (!section || section.status !== 'published') return null;
  
  return {
    title: section.title?.[locale] || '',
    subtitle: section.subtitle?.[locale] || '',
    description: section.description?.[locale] || '',
    showTitle: section.showTitle ?? true,
    showSubtitle: section.showSubtitle ?? false,
    showDescription: section.showDescription ?? false,
    order: section.order ?? 0,
  };
}

export function getHomepageLink(locale: 'uz' | 'ru', sectionKey: string, position: string) {
  const link = homepageContent.links[sectionKey]?.[position];
  if (!link) return null;
  
  return {
    text: link.text[locale] || '',
    href: link.href,
    icon: link.icon,
  };
}

export function getHomepagePlaceholder(sectionKey: string) {
  return homepageContent.placeholders[sectionKey] || null;
}

export function getHomepageEmptyState(locale: 'uz' | 'ru', sectionKey: string) {
  const emptyState = homepageContent.emptyStates[sectionKey];
  if (!emptyState) return null;
  
  return {
    message: emptyState.message[locale] || '',
    icon: emptyState.icon,
  };
}
```

### **Bosqich 3: Frontend'da Ishlatish**

#### `apps/frontend/src/app/page.tsx` - O'zgartirishlar:

```typescript
import { getHomepageSection, getHomepageLink, getHomepagePlaceholder, getHomepageEmptyState } from '@/lib/homepage-content';

export default async function HomePage() {
  const locale = detectLocale();
  
  // Homepage sections
  const servicesSection = getHomepageSection(locale, 'services');
  const hearingAidsSection = getHomepageSection(locale, 'hearing-aids');
  const interacousticsSection = getHomepageSection(locale, 'interacoustics');
  
  // Links
  const interacousticsLink = getHomepageLink(locale, 'interacoustics', 'header');
  
  // Placeholders
  const servicesPlaceholder = getHomepagePlaceholder('services');
  const hearingAidsPlaceholder = getHomepagePlaceholder('hearing-aids');
  
  // Empty states
  const servicesEmptyState = getHomepageEmptyState(locale, 'services');
  const hearingAidsEmptyState = getHomepageEmptyState(locale, 'hearing-aids');
  
  return (
    <main>
      {/* Services Section */}
      {servicesSection?.showTitle && (
        <h2>{servicesSection.title}</h2>
      )}
      
      {services.length === 0 && servicesEmptyState && (
        <p>{servicesEmptyState.message}</p>
      )}
      
      {/* Interacoustics Link */}
      {interacousticsLink && (
        <Link href={interacousticsLink.href}>
          {interacousticsLink.text}
        </Link>
      )}
      
      {/* Placeholder */}
      {!service.image && servicesPlaceholder && (
        <div style={{ backgroundColor: servicesPlaceholder.backgroundColor }}>
          {servicesPlaceholder.image ? (
            <Image src={servicesPlaceholder.image} />
          ) : (
            <span style={{ color: servicesPlaceholder.textColor }}>
              {servicesPlaceholder.text[locale]}
            </span>
          )}
        </div>
      )}
    </main>
  );
}
```

---

## 🖥️ Admin Panel Integration

### **Yondashuv 1: JSON Faylni To'g'ridan-to'g'ri Tahrirlash**

Admin panelda JSON faylni to'g'ridan-to'g'ri tahrirlash imkoniyati:

#### `apps/admin/src/pages/HomepageContent.tsx` (yangi)
```typescript
import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs, Card } from 'antd';
import { getHomepageContent, updateHomepageContent } from '../lib/api';

export default function HomepageContentPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Fetch current JSON content
    getHomepageContent().then(data => {
      form.setFieldsValue({ content: JSON.stringify(data, null, 2) });
    });
  }, []);
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const content = JSON.parse(values.content);
      
      // Validate JSON structure
      // ...
      
      await updateHomepageContent(content);
      message.success('Homepage content yangilandi');
    } catch (error) {
      message.error('Xatolik: ' + error.message);
    }
  };
  
  return (
    <Card title="Bosh sahifa kontenti">
      <Form form={form} layout="vertical">
        <Form.Item
          name="content"
          label="JSON Content"
          rules={[{ required: true, message: 'JSON content kiritish kerak' }]}
        >
          <Input.TextArea
            rows={20}
            style={{ fontFamily: 'monospace' }}
            placeholder='{"sections": {...}}'
          />
        </Form.Item>
        <Button type="primary" onClick={handleSubmit} loading={loading}>
          Saqlash
        </Button>
      </Form>
    </Card>
  );
}
```

### **Yondashuv 2: Form-Based Editor** (Tavsiya etiladi)

Har bir section uchun alohida form:

#### `apps/admin/src/pages/HomepageContent.tsx` (Form-based)
```typescript
import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs, Card, Switch } from 'antd';
import { getHomepageContent, updateHomepageContent } from '../lib/api';

export default function HomepageContentPage() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('services');
  
  useEffect(() => {
    getHomepageContent().then(data => {
      form.setFieldsValue(data);
    });
  }, []);
  
  const handleSubmit = async () => {
    try {
      const values = await form.getFieldsValue();
      await updateHomepageContent(values);
      message.success('Homepage content yangilandi');
    } catch (error) {
      message.error('Xatolik: ' + error.message);
    }
  };
  
  return (
    <Card title="Bosh sahifa kontenti">
      <Form form={form} layout="vertical">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane key="services" tab="Services Section">
            <Form.Item name={['sections', 'services', 'title', 'uz']} label="Title (UZ)">
              <Input />
            </Form.Item>
            <Form.Item name={['sections', 'services', 'title', 'ru']} label="Title (RU)">
              <Input />
            </Form.Item>
            <Form.Item name={['sections', 'services', 'showTitle']} valuePropName="checked">
              <Switch checkedChildren="Ko'rsatish" unCheckedChildren="Yashirish" />
            </Form.Item>
          </Tabs.TabPane>
          
          <Tabs.TabPane key="hearing-aids" tab="Eshitish apparatlari">
            {/* Similar form fields */}
          </Tabs.TabPane>
          
          <Tabs.TabPane key="interacoustics" tab="Interacoustics">
            {/* Similar form fields */}
          </Tabs.TabPane>
        </Tabs>
        
        <Button type="primary" onClick={handleSubmit}>
          Saqlash
        </Button>
      </Form>
    </Card>
  );
}
```

---

## 🔄 Backend API (JSON Fayllarni Saqlash)

### **Yondashuv 1: Backend'da JSON Fayllarni Saqlash**

Backend'da JSON fayllarni file system'da saqlash:

#### `apps/backend/src/homepage-content/homepage-content.controller.ts`
```typescript
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Controller('homepage-content')
export class HomepageContentController {
  private readonly contentPath = join(process.cwd(), 'apps/frontend/src/locales/homepage-content.json');
  
  @Get()
  get() {
    const content = readFileSync(this.contentPath, 'utf-8');
    return JSON.parse(content);
  }
  
  @Patch()
  @UseGuards(JwtAuthGuard, RbacGuard)
  update(@Body() content: any) {
    // Validate structure
    // ...
    
    writeFileSync(this.contentPath, JSON.stringify(content, null, 2), 'utf-8');
    return { success: true };
  }
}
```

### **Yondashuv 2: Database'da JSON Saqlash** (Agar kerak bo'lsa)

Agar JSON fayllarni database'da saqlash kerak bo'lsa:

```prisma
model HomepageContent {
  id      String   @id @default("singleton")
  content Json     // Barcha homepage content JSON formatida
  updatedAt DateTime @updatedAt
}
```

Lekin bu yondashuvda JSON fayllar to'g'ridan-to'g'ri frontend'da bo'ladi va backend faqat admin panel orqali o'zgartirish uchun ishlatiladi.

---

## 📊 Implementation Steps

### **Step 1: JSON Fayllarni Yaratish** (1 kun)
1. ✅ `homepage-content.json` yaratish
2. ✅ `catalog-content.json` yaratish
3. ✅ `common-content.json` yaratish

### **Step 2: Helper Functions** (1 kun)
1. ✅ `lib/homepage-content.ts` yaratish
2. ✅ `lib/catalog-content.ts` yaratish
3. ✅ `lib/common-content.ts` yaratish

### **Step 3: Frontend Integration** (2-3 kun)
1. ✅ `page.tsx` da hardcoded matnlarni JSON'dan olish
2. ✅ `catalog/page.tsx` da hardcoded matnlarni JSON'dan olish
3. ✅ Boshqa sahifalarda ham o'zgartirishlar

### **Step 4: Admin Panel** (2-3 kun)
1. ✅ `HomepageContent.tsx` page yaratish
2. ✅ Form-based editor yaratish
3. ✅ Backend API yaratish (agar kerak bo'lsa)

### **Step 5: Testing** (1 kun)
1. ✅ JSON fayllarni o'zgartirish va frontend'da ko'rish
2. ✅ Admin panel orqali o'zgartirish
3. ✅ Build va deployment testlari

---

## ⚠️ Muhim Eslatmalar

### **Afzalliklari:**
1. ✅ Database migration kerak emas
2. ✅ Tezroq implementation
3. ✅ Frontend'da to'g'ridan-to'g'ri boshqariladi
4. ✅ Version control'da JSON fayllar ko'rinadi
5. ✅ Build vaqtida JSON fayllar bundle'ga kiradi

### **Kamchiliklari:**
1. ⚠️ JSON faylni o'zgartirish uchun rebuild kerak bo'lishi mumkin (agar ISR ishlatilmasa)
2. ⚠️ Agar runtime'da o'zgartirish kerak bo'lsa, backend API kerak
3. ⚠️ JSON fayllar katta bo'lishi mumkin

### **Yechim:**
- JSON fayllarni backend'da saqlash va frontend'ga API orqali berish
- Yoki JSON fayllarni build vaqtida bundle'ga kiritish va ISR orqali revalidate qilish

---

## 🎯 Tavsiya

**Yondashuv:** JSON fayllarni backend'da saqlash va frontend'ga API orqali berish, lekin frontend'da hardcode sifatida ishlatish.

**Sabab:**
1. Admin panel orqali o'zgartirish mumkin
2. Rebuild kerak emas (runtime'da o'zgaradi)
3. Frontend'da JSON fayllar mavjud (fallback)
4. Backend down bo'lsa ham frontend ishlaydi

---

**Yaratilgan sana**: 2025-01-XX
**Status**: 📋 Planning
**Priority**: High
**Estimated Time**: 1-2 hafta






