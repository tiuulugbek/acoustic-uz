# AmoCRM Integratsiya Qo'llanmasi

Bu qo'llanmada AmoCRM bilan saytni integratsiya qilish yo'riqnomasi ko'rsatilgan.

---

## 🎯 UMUMIY MA'LUMOT

AmoCRM integratsiyasi saytdan kelgan barcha lead'larni (so'rovlar) avtomatik ravishda AmoCRM'ga yuboradi. Bu Telegram integratsiyasiga o'xshash ishlaydi.

---

## 📋 QADAMLAR

### 1-qadam: AmoCRM'da Integration yaratish

1. **AmoCRM'ga kiring:**
   - `https://www.amocrm.ru` ga kiring
   - Yoki `https://yourcompany.amocrm.ru` ga kiring
   - Akkauntingizga login qiling

2. **Integration yarating:**
   - Settings → Integrations → Add Integration
   - **"API Integration"** ni tanlang (⚠️ MUHIM: Boshqa turdagi Integration emas!)
   - Integration nomini kiriting (masalan, "Acoustic.uz Website")
   - Redirect URI ni kiriting: `https://api.acoustic.uz/api/amocrm/callback` (production)

3. **Client ID va Client Secret ni oling:**
   - Integration yaratilgandan keyin, Integration ro'yxatida yangi integration ko'rinadi
   - Integration nomiga bosing yoki "View" tugmasini bosing
   - **"Ключи и доступы" (Keys and Access)** tab'iga o'ting
   - **Client ID** va **Client Secret** ko'rsatiladi
   - ⚠️ **MUHIM:** Client Secret faqat bir marta ko'rsatiladi! Uni darhol nusxalab oling
   - Bu ma'lumotlarni xavfsiz joyda saqlang

**⚠️ ESLATMA:**
- "ID интеграции" (Integration ID) ≠ Client ID
- "Секретный ключ" (Secret Key) ≠ Client Secret
- Faqat "API Integration" turidagi Integration OAuth 2.0 uchun Client ID va Client Secret beradi

**🔍 TEKSHIRISH QADAMLARI:**

Agar Integration yaratganingizdan keyin ham 405 xatosi chiqsa, quyidagilarni tekshiring:

1. **Integration turini tekshiring:**
   - AmoCRM'da Integration'ni oching
   - Integration turi "API Integration" bo'lishi kerak
   - Agar boshqa tur bo'lsa (masalan, "Webhook Integration", "Widget Integration"), yangi "API Integration" yarating

2. **Redirect URI'ni tekshiring:**
   - Integration'ni oching
   - "Settings" yoki "Настройки" tab'iga o'ting
   - Redirect URI quyidagicha bo'lishi kerak: `https://api.acoustic.uz/api/amocrm/callback`
   - ⚠️ **MUHIM:** 
     - HTTPS protokoli bo'lishi kerak (`https://`)
     - Trailing slash bo'lmasligi kerak (oxirida `/` bo'lmasligi kerak)
     - Bo'sh joylar bo'lmasligi kerak
     - To'liq URL bo'lishi kerak

3. **Client ID va Client Secret'ni tekshiring:**
   - "Ключи и доступы" (Keys and Access) tab'iga o'ting
   - Client ID va Client Secret ko'rsatilishi kerak
   - Agar ko'rsatilmasa, Integration turi noto'g'ri bo'lishi mumkin

4. **Integration'ni qayta yarating:**
   - Eski Integration'ni o'chiring
   - Yangi "API Integration" yarating
   - Redirect URI'ni to'g'ri kiriting
   - Yangi Client ID va Client Secret oling

---

### 2-qadam: Admin Panelda Sozlamalar

1. **Admin panelga kiring:**
   - `http://localhost:3002` ga kiring
   - Settings bo'limiga o'ting

2. **AmoCRM sozlamalarini kiriting:**
   - **AmoCRM Domain:** `yourcompany.amocrm.ru` (sizning AmoCRM domain'ingiz)
   - **Client ID:** Integration'dan olingan Client ID
   - **Client Secret:** Integration'dan olingan Client Secret
   - **Pipeline ID:** Lead yaratiladigan pipeline ID (ixtiyoriy)
   - **Status ID:** Lead yaratiladigan status ID (ixtiyoriy)

3. **Saqlash:**
   - "Saqlash" tugmasini bosing

---

### 3-qadam: OAuth Authorization (Bir marta)

AmoCRM OAuth 2.0 protokolidan foydalanadi. Birinchi marta integratsiya qilishda authorization code olish kerak.

**Qanday qilish:**

1. **Authorization URL format (AmoCRM rasmiy qo'llanmasi):**
   ```
   https://yourcompany.amocrm.ru/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI
   ```
   
   **⚠️ MUHIM (AmoCRM rasmiy qo'llanmasidan):**
   - `client_id` - Integration'dan olingan Client ID
   - `response_type` - har doim `code` bo'lishi kerak
   - `redirect_uri` - Integration'da sozlangan Redirect URI bilan **TO'LIQ MOS** bo'lishi kerak
   - Redirect URI Integration'da va URL'da bir xil bo'lishi kerak (case-sensitive)

2. **Browser'da oching:**
   - Bu URL'ni browser'da oching (⚠️ GET so'rovi yuboriladi, bu normal)
   - AmoCRM'da login qiling (agar login bo'lmasa)
   - Ruxsat bering (Allow/Accept tugmasini bosing)

3. **Callback URL'dan code ni oling:**
   - Browser sizni callback URL'ga yo'naltiradi
   - Backend avtomatik ravishda `code` parametrini oladi
   - Backend `code` ni access token va refresh token'ga almashtiradi
   - Token'lar database'ga saqlanadi

**⚠️ Eslatma:** 
- Bu qadamni avtomatiklashtirish uchun callback endpoint yaratilgan (`/api/amocrm/callback`)
- Agar ruxsat berilmasa, callback URL'ga `error=access_denied` parametri bilan yo'naltiriladi
- Agar muammo bo'lsa, callback URL'ga `error` parametri bilan yo'naltiriladi

**📚 Manba:** [AmoCRM OAuth qo'llanmasi](https://www.amocrm.ru/developers/content/oauth/step-by-step)

---

## 🔧 TEKNIK TAFSILOTLAR

### Lead yaratilganda nima bo'ladi:

1. **Lead ma'lumotlari yig'iladi:**
   - Ism (name)
   - Telefon (phone)
   - Email (ixtiyoriy)
   - Manba (source)
   - Xabar (message)
   - Mahsulot ID (productId)

2. **AmoCRM'ga yuboriladi:**
   - Avval Contact yaratiladi
   - Keyin Deal (Lead) yaratiladi
   - Contact Deal'ga bog'lanadi
   - Agar xabar bo'lsa, Note qo'shiladi

3. **Database'ga saqlanadi:**
   - Lead ma'lumotlari lokal database'ga ham saqlanadi
   - Telegram'ga ham yuboriladi (agar sozlangan bo'lsa)

---

## 📊 AMOCRM API STRUKTURASI

### Contact yaratish:
```json
{
  "name": "Ism Familiya",
  "custom_fields_values": [
    {
      "field_id": 123456,
      "values": [
        {
          "value": "+998 71 202 14 41",
          "enum_code": "WORK"
        }
      ]
    }
  ]
}
```

### Deal yaratish:
```json
{
  "name": "Yangi so'rov: Ism Familiya",
  "price": 0,
  "pipeline_id": 123456,
  "status_id": 123456,
  "_embedded": {
    "contacts": [
      {
        "id": 123456
      }
    ]
  }
}
```

---

## ⚙️ SOZLAMALAR

### Settings Schema'ga qo'shiladigan maydonlar:

- `amocrmDomain` - AmoCRM domain (masalan, `yourcompany.amocrm.ru`)
- `amocrmClientId` - Client ID (majburiy)
- `amocrmClientSecret` - Client Secret (majburiy)
- `amocrmAccessToken` - Access token (avtomatik yangilanadi, birinchi marta qo'lda kiriting)
- `amocrmRefreshToken` - Refresh token (avtomatik yangilanadi, birinchi marta qo'lda kiriting)
- `amocrmPipelineId` - Pipeline ID (ixtiyoriy, lead yaratiladigan pipeline)
- `amocrmStatusId` - Status ID (ixtiyoriy, lead yaratiladigan status)

**⚠️ MUHIM:** 
- Access Token va Refresh Token birinchi marta qo'lda kirilishi kerak
- Keyin avtomatik yangilanadi
- Agar token yo'q bo'lsa, lead lokal database'ga saqlanadi, lekin AmoCRM'ga yuborilmaydi

---

## 🚀 ISHGA TUSHIRISH

### Development:
1. AmoCRM integratsiyasini yarating
2. Client ID va Client Secret ni oling
3. Admin panelda sozlamalarni kiriting
4. OAuth authorization qiling
5. Test lead yuborib ko'ring

### Production:
1. Production URL'ni AmoCRM'da sozlang
2. HTTPS protokolidan foydalaning
3. Environment variables'ni sozlang
4. Monitoring qo'shing

---

## 🔍 MUAMMOLAR VA YECHIMLAR

### Muammo: 405 Method Not Allowed xatosi (To'g'ridan-to'g'ri browser'da ham chiqadi)
**Sabab:**
- Bu xato AmoCRM Integration'da muammo borligini ko'rsatadi
- Integration turi "API Integration" emas bo'lishi mumkin
- Yoki Redirect URI Integration'da to'g'ri sozlanmagan
- Yoki Integration'da boshqa muammo bor

**Yechim (QADAM-BAQADAM):**

#### 1-qadam: Integration turini tekshiring
1. **AmoCRM'ga kiring:** `https://acousticcrm.amocrm.ru`
2. **Settings → Integrations** ga o'ting
3. **"acoustic.uz" Integration'ni oching**
4. **Integration turini tekshiring:**
   - Agar "API Integration" bo'lmasa → **YANGI "API Integration" YARATING**
   - Agar "API Integration" bo'lsa → Keyingi qadamga o'ting

#### 2-qadam: Yangi "API Integration" yarating (agar kerak bo'lsa)
1. **Eski Integration'ni o'chiring** (agar mavjud bo'lsa)
2. **"Add Integration" yoki "Добавить интеграцию" tugmasini bosing**
3. **"API Integration" ni tanlang** (⚠️ MUHIM: Boshqa tur emas!)
4. **Integration ma'lumotlarini kiriting:**
   - **Nomi:** "Acoustic.uz Website" yoki "Acoustic.uz"
   - **Redirect URI:** `https://api.acoustic.uz/api/amocrm/callback`
     - ⚠️ **MUHIM:** 
       - HTTPS protokoli bo'lishi kerak (`https://`)
       - Trailing slash bo'lmasligi kerak (oxirida `/` bo'lmasligi kerak)
       - To'liq URL bo'lishi kerak
       - `api.acoustic.uz` domain to'g'ri bo'lishi kerak
5. **"Save" yoki "Сохранить" tugmasini bosing**

#### 3-qadam: Client ID va Client Secret ni oling
1. **Integration yaratilgandan keyin:**
   - Integration ro'yxatida yangi integration ko'rinadi
   - Integration nomiga bosing
2. **"Ключи и доступы" (Keys and Access)** tab'iga o'ting
3. **Client ID va Client Secret ni ko'ring:**
   - **Client ID** - bu uzun raqam (masalan: `31500922`)
   - **Client Secret** - bu ham uzun string
   - ⚠️ **MUHIM:** Client Secret faqat bir marta ko'rsatiladi! Uni darhol nusxalab oling

#### 4-qadam: Admin panelda sozlang
1. **Admin panelga kiring:** `https://admin.acoustic.uz`
2. **Settings → AmoCRM integratsiyasi** bo'limiga o'ting
3. **Ma'lumotlarni kiriting:**
   - **AmoCRM Domain:** `acousticcrm.amocrm.ru` (faqat domain, protocolsiz, trailing slash yo'q)
   - **Client ID:** Yangi olingan Client ID
   - **Client Secret:** Yangi olingan Client Secret
4. **"Saqlash" tugmasini bosing**

#### 5-qadam: OAuth Authorization
1. **"AmoCRM'ga ulanish" tugmasini bosing**
2. **Browser yangi tab'da AmoCRM OAuth sahifasini ochishi kerak**
3. **Agar 405 xatosi chiqsa:**
   - Integration turini qayta tekshiring (1-qadam)
   - Redirect URI'ni qayta tekshiring (2-qadam)
   - Browser cache'ni tozalang (Ctrl+Shift+R yoki Cmd+Shift+R)

#### 6-qadam: Agar hali ham muammo bo'lsa

**AmoCRM rasmiy qo'llanmasiga ko'ra ([manba](https://www.amocrm.ru/developers/content/oauth/step-by-step)):**

1. **Redirect URI mosligini tekshiring:**
   - ⚠️ **MUHIM:** Redirect URI Integration'da va Authorization URL'da **TO'LIQ MOS** bo'lishi kerak
   - Case-sensitive (katta/kichik harflar muhim)
   - Trailing slash muhim (`/` bo'lishi yoki bo'lmasligi)
   - Protocol muhim (`https://` yoki `http://`)
   - Masalan, agar Integration'da `https://api.acoustic.uz/api/amocrm/callback` bo'lsa, URL'da ham shunday bo'lishi kerak

2. **Integration turini tekshiring:**
   - Integration turi **"API Integration"** bo'lishi kerak
   - Boshqa turdagi Integration'lar OAuth 2.0'ni qo'llab-quvvatlamaydi

3. **Client ID'ni tekshiring:**
   - Client ID Integration'dan olingan bo'lishi kerak
   - "ID интеграции" (Integration ID) emas, Client ID bo'lishi kerak

4. **AmoCRM yordam markaziga murojaat qiling:**
   - `https://www.amocrm.ru/support`
   - Yoki AmoCRM'da "Support" yoki "Поддержка" bo'limiga o'ting
   - Muammoni tasvirlab bering:
     - "405 Method Not Allowed" xatosi
     - OAuth authorization URL'ga GET so'rovi yuborilganda
     - Integration turi: "API Integration"
     - Redirect URI: `https://api.acoustic.uz/api/amocrm/callback`
     - Client ID: `31500922`

**📚 Manba:** [AmoCRM OAuth qo'llanmasi](https://www.amocrm.ru/developers/content/oauth/step-by-step)

### Muammo: Client ID va Client Secret topilmayapti
**Sabab:**
- "ID интеграции" (Integration ID) ≠ Client ID
- "Секретный ключ" (Secret Key) ≠ Client Secret
- Faqat "API Integration" turidagi Integration OAuth 2.0 uchun Client ID va Client Secret beradi

**Yechim:**
1. **AmoCRM'da Integration'ni tekshiring:**
   - Settings → Integrations ga o'ting
   - Integration turini tekshiring
   - Agar "API Integration" bo'lmasa, yangi "API Integration" yarating
2. **"API Integration" yarating:**
   - "Add Integration" → "API Integration" ni tanlang
   - Integration nomini kiriting
   - Redirect URI ni kiriting: `https://api.acoustic.uz/api/amocrm/callback`
   - "Save" tugmasini bosing
3. **Client ID va Client Secret ni oling:**
   - Integration yaratilgandan keyin, Integration ro'yxatida integration nomiga bosing
   - **"Ключи и доступы" (Keys and Access)** tab'iga o'ting
   - **Client ID** va **Client Secret** ko'rsatiladi
   - ⚠️ **MUHIM:** Client Secret faqat bir marta ko'rsatiladi!

### Muammo: Access token olinmayapti
**Yechim:**
- Client ID va Client Secret'ni tekshiring
- Redirect URI'ni to'g'ri sozlang
- OAuth flow'ni qayta bajarib ko'ring

### Muammo: Lead yaratilmayapti
**Yechim:**
- Access token'ni tekshiring
- Pipeline ID va Status ID'ni tekshiring
- AmoCRM API xatolarini console'da ko'ring
- Field ID'larni to'g'ri sozlang

### Muammo: Contact yaratilmayapti
**Yechim:**
- Phone va Email field ID'larini tekshiring
- AmoCRM'da custom field'lar mavjudligini tekshiring

---

## 📝 FIELD ID'LARNI TOPISH

AmoCRM'da Field ID'larni topish:

1. **AmoCRM'ga kiring**
2. **Settings → Custom Fields** ga o'ting
3. **Contact Fields** yoki **Lead Fields** ni tanlang
4. Field ID'ni ko'ring (masalan, Phone field ID: 123456)

**Muhim Field'lar:**
- Phone field ID (Contact uchun) - hozircha hardcoded: 123456
- Email field ID (Contact uchun) - hozircha hardcoded: 123457
- Source field ID (Lead uchun, ixtiyoriy) - hozircha hardcoded: 123458
- Product ID field ID (Lead uchun, ixtiyoriy) - hozircha hardcoded: 123459

**⚠️ MUHIM:** 
- Hozircha Field ID'lar kod ichida hardcoded
- Kelajakda Settings'ga qo'shish mumkin
- Field ID'larni topib, kodda o'zgartirish kerak
- Yoki Settings'ga qo'shib, dinamik qilish mumkin

---

## 🎯 TAVSIYALAR

1. **Field ID'larni sozlang:**
   - AmoCRM'da custom field'lar yarating
   - Field ID'larni kodga qo'shing
   - Yoki Settings'ga qo'shing

2. **Error handling:**
   - Barcha xatolarni log qiling
   - Lead yaratilmasa ham, lokal database'ga saqlang

3. **Performance:**
   - AmoCRM API'ga so'rovlar asinxron yuboriladi
   - Lead yaratish tez bo'lishi kerak
   - AmoCRM'ga yuborish background'da bo'lishi mumkin

4. **Monitoring:**
   - AmoCRM integratsiyasini monitoring qiling
   - Xatolarni kuzatib boring
   - Lead'lar sonini tekshiring

---

## 📞 YORDAM

Agar muammo bo'lsa:
1. Backend console'da xatolarni ko'ring
2. AmoCRM API xatolarini tekshiring
3. Settings'ni qayta tekshiring
4. OAuth flow'ni qayta bajarib ko'ring

---

**Oxirgi yangilanish:** 2024-yil

