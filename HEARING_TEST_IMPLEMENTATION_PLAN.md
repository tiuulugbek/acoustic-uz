# Online Eshitish Testi - Implementatsiya Rejasi

## 📋 Umumiy Ma'lumot

ReSound online hearing testiga asoslangan implementatsiya rejasi. Test xizmatlar bo'limida joylashadi va foydalanuvchilarga eshitish qobiliyatini tekshirish imkoniyatini beradi.

## 🎯 Testning Asosiy Xususiyatlari

### 1. Test Bosqichlari
- **Kirish/Instructions** - Test haqida ma'lumot va ko'rsatmalar
- **Qurilma tanlash** - Speaker yoki Headphone tanlash
- **Ovoz sozlash** - Maksimal ovoz balandligini sozlash
- **Chap quloq testi** - Turli chastotalarda (250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz, 8000Hz)
- **O'ng quloq testi** - Turli chastotalarda
- **Natijalar** - Test natijalarini ko'rsatish
- **Aloqa formasi** (ixtiyoriy) - Mutaxassis bilan bog'lanish

### 2. Texnik Talablar
- **Web Audio API** - Ovoz signalini generate qilish
- **Frequency testing** - 6 xil chastota (250Hz, 500Hz, 1000Hz, 2000Hz, 4000Hz, 8000Hz)
- **Volume control** - Foydalanuvchi ovozni sozlashi mumkin
- **Results calculation** - Eshitish darajasini hisoblash
- **Data storage** - Test natijalarini saqlash

## 📁 Qilinadigan Ishlar

### 1. Database Schema (Prisma)

**Yangi Model: `HearingTest`**
```prisma
model HearingTest {
  id              String   @id @default(cuid())
  name            String?  // Foydalanuvchi ismi (ixtiyoriy)
  phone           String?  // Telefon raqami (ixtiyoriy)
  email           String?  // Email (ixtiyoriy)
  
  // Test sozlamalari
  deviceType      String   // "speaker" yoki "headphone"
  volumeLevel     Float?   // Ovoz balandligi (0-1)
  
  // Test natijalari
  leftEarResults  Json     // { "250": true/false, "500": true/false, ... }
  rightEarResults Json     // { "250": true/false, "500": true/false, ... }
  
  // Hisoblangan natijalar
  leftEarScore    Int?     // 0-100 (foiz)
  rightEarScore   Int?     // 0-100 (foiz)
  overallScore    Int?     // 0-100 (foiz)
  
  // Eshitish darajasi
  leftEarLevel    String?  // "normal", "mild", "moderate", "severe", "profound"
  rightEarLevel   String?  // "normal", "mild", "moderate", "severe", "profound"
  
  // Qo'shimcha ma'lumotlar
  source          String   @default("hearing_test")
  status          String   @default("completed") // "completed", "contacted", "converted"
  notes           String?  @db.Text
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, createdAt])
  @@index([source])
}
```

### 2. Backend Implementation

#### 2.1 Schema (packages/shared/src/schemas/content.ts)
```typescript
export const hearingTestSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  deviceType: z.enum(['speaker', 'headphone']),
  volumeLevel: z.number().min(0).max(1).optional(),
  leftEarResults: z.record(z.string(), z.boolean()),
  rightEarResults: z.record(z.string(), z.boolean()),
  leftEarScore: z.number().int().min(0).max(100).optional(),
  rightEarScore: z.number().int().min(0).max(100).optional(),
  overallScore: z.number().int().min(0).max(100).optional(),
  leftEarLevel: z.enum(['normal', 'mild', 'moderate', 'severe', 'profound']).optional(),
  rightEarLevel: z.enum(['normal', 'mild', 'moderate', 'severe', 'profound']).optional(),
  source: z.string().default('hearing_test'),
});
```

#### 2.2 Service (apps/backend/src/hearing-test/hearing-test.service.ts)
- `create()` - Test natijalarini saqlash
- `calculateScore()` - Eshitish darajasini hisoblash
- `findAll()` - Barcha testlarni olish (admin uchun)
- `findOne()` - Bitta testni olish
- `update()` - Test statusini yangilash

#### 2.3 Controller (apps/backend/src/hearing-test/hearing-test.controller.ts)
- `POST /api/hearing-test` - Test natijalarini yuborish (public)
- `GET /api/hearing-test` - Barcha testlar (admin)
- `GET /api/hearing-test/:id` - Bitta test (admin)
- `PATCH /api/hearing-test/:id` - Test statusini yangilash (admin)

#### 2.4 Module (apps/backend/src/hearing-test/hearing-test.module.ts)
- HearingTestService
- HearingTestController
- PrismaModule

### 3. Frontend Implementation

#### 3.1 Test Component (apps/frontend/src/components/hearing-test/)
- `hearing-test.tsx` - Asosiy test komponenti
- `test-intro.tsx` - Kirish sahifasi
- `device-selection.tsx` - Qurilma tanlash
- `volume-calibration.tsx` - Ovoz sozlash
- `frequency-test.tsx` - Chastota testi (chap/o'ng quloq)
- `test-results.tsx` - Natijalar sahifasi
- `contact-form.tsx` - Aloqa formasi

#### 3.2 Test Page (apps/frontend/src/app/services/hearing-test/page.tsx)
- Test sahifasi
- SEO metadata
- Locale support (UZ/RU)

#### 3.3 API Functions (apps/frontend/src/lib/api.ts)
```typescript
export interface HearingTestResult {
  name?: string;
  phone?: string;
  email?: string;
  deviceType: 'speaker' | 'headphone';
  volumeLevel?: number;
  leftEarResults: Record<string, boolean>;
  rightEarResults: Record<string, boolean>;
  leftEarScore?: number;
  rightEarScore?: number;
  overallScore?: number;
  leftEarLevel?: string;
  rightEarLevel?: string;
}

export async function submitHearingTest(data: HearingTestResult): Promise<void>;
```

#### 3.4 Web Audio API Hook (apps/frontend/src/hooks/useAudioTest.ts)
- `generateTone()` - Chastota signalini generate qilish
- `playFrequency()` - Ovozni ijro etish
- `stopAudio()` - Ovozni to'xtatish
- `calibrateVolume()` - Ovozni sozlash

### 4. Admin Panel

#### 4.1 Admin Page (apps/admin/src/pages/HearingTests.tsx)
- Testlar ro'yxati
- Test natijalarini ko'rish
- Status yangilash
- Filter va qidiruv
- Export funksiyasi

### 5. Integration

#### 5.1 Telegram Integration
- Test natijalari Telegram'ga yuboriladi (LeadsService orqali)
- Format: Test natijalari, foydalanuvchi ma'lumotlari

#### 5.2 Services Page Integration
- `/services` sahifasiga "Online Eshitish Testi" kartasi qo'shiladi
- Link: `/services/hearing-test`

## 🔧 Texnik Detallar

### Web Audio API Implementation
```typescript
// Tone generation
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

oscillator.frequency.value = frequency; // 250, 500, 1000, 2000, 4000, 8000
oscillator.type = 'sine';
gainNode.gain.value = volume;

oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);
```

### Score Calculation
```typescript
// Har bir quloq uchun
const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];
const totalFrequencies = frequencies.length;
const heardFrequencies = frequencies.filter(f => results[f]).length;
const score = Math.round((heardFrequencies / totalFrequencies) * 100);

// Eshitish darajasi
if (score >= 90) return 'normal';
if (score >= 70) return 'mild';
if (score >= 50) return 'moderate';
if (score >= 30) return 'severe';
return 'profound';
```

## 📝 Qo'shimcha Talablar

### 1. Legal/Medical Disclaimer
- Test tibbiy tashxis emas
- Professional tekshiruvni almashtirmaydi
- Ma'lumotlar faqat ma'lumot berish uchun

### 2. Privacy
- Ma'lumotlar testdan keyin o'chirilishi mumkin (GDPR)
- Foydalanuvchi roziligi

### 3. Accessibility
- Screen reader support
- Keyboard navigation
- High contrast mode

### 4. Mobile Optimization
- Touch-friendly controls
- Responsive design
- Mobile audio support

## 🚀 Implementatsiya Bosqichlari

### Bosqich 1: Database va Backend
1. Prisma schema qo'shish
2. Migration yaratish
3. Backend service, controller, module
4. API endpoint'larini test qilish

### Bosqich 2: Frontend Core
1. Web Audio API hook
2. Test komponentlari
3. Test sahifasi
4. API integratsiyasi

### Bosqich 3: UI/UX
1. Test bosqichlari UI
2. Animatsiyalar va transitions
3. Mobile optimization
4. Accessibility

### Bosqich 4: Admin Panel
1. Testlar ro'yxati
2. Natijalarni ko'rish
3. Status boshqaruvi

### Bosqich 5: Integration va Testing
1. Telegram integratsiyasi
2. Services page integration
3. End-to-end testing
4. Performance optimization

## 📊 Kutilayotgan Natijalar

- Foydalanuvchilar online eshitish testini o'tkazishlari mumkin
- Test natijalari saqlanadi va admin panelda ko'rinadi
- Natijalar Telegram'ga yuboriladi
- Professional tekshiruvga yo'naltirish mumkin

## ⚠️ Muhim Eslatmalar

1. **Tibbiy maslahat emas** - Test faqat ma'lumot beradi, tibbiy tashxis emas
2. **Aniqlik** - Test natijalari professional tekshiruvdan kamroq aniq
3. **Qurilma talablari** - Headphone tavsiya etiladi, lekin speaker ham ishlaydi
4. **Atrof-muhit** - Sessiya qulay va sokin bo'lishi kerak

