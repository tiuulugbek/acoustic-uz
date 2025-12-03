# AmoCRM Client ID va Client Secret ni olish - Batafsil qo'llanma

## 📋 QADAMLAR

### 1-qadam: AmoCRM'ga kiring

1. **AmoCRM'ga kiring:**
   - `https://www.amocrm.ru` ga kiring
   - Yoki `https://yourcompany.amocrm.ru` ga kiring
   - Akkauntingizga login qiling

### 2-qadam: Settings'ga o'ting

1. **Settings'ni oching:**
   - O'ng yuqori burchakdagi profil ikonkasini bosing
   - Yoki to'g'ridan-to'g'ri `https://yourcompany.amocrm.ru/settings` ga kiring

### 3-qadam: Integrations bo'limiga o'ting

1. **Integrations'ni toping:**
   - Settings sahifasida chap menudan **"Integrations"** ni tanlang
   - Yoki to'g'ridan-to'g'ri `https://yourcompany.amocrm.ru/settings/integrations` ga kiring

### 4-qadam: API Integration yarating

1. **"Add Integration" yoki "Добавить интеграцию" tugmasini bosing**

2. **Integration turini tanlang:**
   - **"API Integration"** yoki **"API интеграция"** ni tanlang
   - Bu OAuth 2.0 protokolidan foydalanadi

3. **Integration ma'lumotlarini kiriting:**
   - **Integration nomi:** Masalan, "Acoustic.uz Website" yoki "Acoustic.uz Sayt"
   - **Redirect URI:** 
     - Development uchun: `http://localhost:3001/api/amocrm/callback`
     - Production uchun: `https://api.acoustic.uz/api/amocrm/callback`
     - **⚠️ MUHIM:** Bu URI to'g'ri bo'lishi kerak, aks holda OAuth ishlamaydi

4. **"Save" yoki "Сохранить" tugmasini bosing**

### 5-qadam: Client ID va Client Secret ni oling

1. **Integration yaratilgandan keyin:**
   - Integration ro'yxatida yangi integration ko'rinadi
   - Integration nomiga bosing yoki "View" tugmasini bosing

2. **Ma'lumotlarni ko'ring:**
   - **Client ID** - bu uzun raqam (masalan: `12345678-1234-1234-1234-123456789012`)
   - **Client Secret** - bu ham uzun raqam/string (masalan: `abcdef1234567890abcdef1234567890abcdef12`)
   - **⚠️ MUHIM:** Client Secret faqat bir marta ko'rsatiladi! Uni darhol nusxalab oling va xavfsiz joyda saqlang.

3. **Nusxalab oling:**
   - Client ID ni nusxalab oling
   - Client Secret ni nusxalab oling (bu muhim!)
   - Agar Client Secret ni yo'qotib qo'ysangiz, yangi integration yaratishingiz kerak bo'ladi

## 🖼️ VIZUAL QO'LLANMA

### AmoCRM Settings sahifasi:
```
┌─────────────────────────────────────┐
│  AmoCRM Settings                    │
├─────────────────────────────────────┤
│  [Profil ikonkasi]                  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Integrations                   │ │ ← Buni tanlang
│  │ Account                        │ │
│  │ Users                          │ │
│  │ ...                            │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Integrations sahifasi:
```
┌─────────────────────────────────────┐
│  Integrations                       │
├─────────────────────────────────────┤
│  [Add Integration] [Добавить]      │ ← Buni bosing
│                                     │
│  Mavjud integratsiyalar ro'yxati:  │
│  - Integration 1                    │
│  - Integration 2                    │
│  ...                                │
└─────────────────────────────────────┘
```

### Integration yaratish formasi:
```
┌─────────────────────────────────────┐
│  Create API Integration             │
├─────────────────────────────────────┤
│  Name: [Acoustic.uz Website]       │
│                                     │
│  Redirect URI:                      │
│  [http://localhost:3001/api/        │
│   amocrm/callback]                  │
│                                     │
│  [Save] [Cancel]                    │
└─────────────────────────────────────┘
```

### Integration ma'lumotlari:
```
┌─────────────────────────────────────┐
│  API Integration: Acoustic.uz       │
├─────────────────────────────────────┤
│  Client ID:                          │
│  12345678-1234-1234-1234-...        │ ← Nusxalab oling
│                                     │
│  Client Secret:                      │
│  abcdef1234567890abcdef12...        │ ← Nusxalab oling (muhim!)
│                                     │
│  Redirect URI:                       │
│  http://localhost:3001/api/...      │
│                                     │
│  [Regenerate Secret] [Delete]       │
└─────────────────────────────────────┘
```

## ⚠️ MUHIM ESLATMALAR

1. **Client Secret faqat bir marta ko'rsatiladi:**
   - Uni darhol nusxalab oling
   - Agar yo'qotib qo'ysangiz, yangi integration yaratishingiz kerak

2. **Redirect URI to'g'ri bo'lishi kerak:**
   - Development: `http://localhost:3001/api/amocrm/callback`
   - Production: `https://api.acoustic.uz/api/amocrm/callback`
   - Bu URI AmoCRM'da va backend'da bir xil bo'lishi kerak

3. **Xavfsizlik:**
   - Client Secret ni hech kimga bermang
   - Faqat admin panelda ishlating
   - Git'ga commit qilmaslik yaxshiroq (agar commit qilsangiz, .env faylida saqlang)

## 🔍 MUAMMOLAR VA YECHIMLAR

### Muammo: Integrations bo'limini topa olmayapman
**Yechim:**
- AmoCRM'da admin huquqlari kerak
- Agar sizda admin huquqlari bo'lmasa, administratorga murojaat qiling

### Muammo: Client Secret ni ko'ra olmayapman
**Yechim:**
- Integration yaratilgandan keyin, integration ro'yxatida integration nomiga bosing
- Yoki "View" yoki "Просмотр" tugmasini bosing
- Agar hali ham ko'rmasangiz, yangi integration yarating

### Muammo: Redirect URI xatosi
**Yechim:**
- Redirect URI to'g'ri formatda bo'lishi kerak
- HTTP yoki HTTPS protokoli bo'lishi kerak
- Port raqami to'g'ri bo'lishi kerak (masalan, 3001)
- Path to'g'ri bo'lishi kerak (`/api/amocrm/callback`)

## 📞 YORDAM

Agar muammo bo'lsa:
1. AmoCRM yordam markaziga murojaat qiling: `https://www.amocrm.ru/support`
2. AmoCRM API hujjatlarini ko'ring: `https://www.amocrm.ru/developers/content/api/oauth`
3. Backend console'da xatolarni tekshiring

---

**Oxirgi yangilanish:** 2024-yil

