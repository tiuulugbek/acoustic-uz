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
   - Akkauntingizga login qiling

2. **Integration yarating:**
   - Settings → Integrations → Add Integration
   - "API Integration" ni tanlang
   - Integration nomini kiriting (masalan, "Acoustic.uz Website")
   - Redirect URI ni kiriting: `http://localhost:3001/api/amocrm/callback` (development) yoki `https://yourdomain.com/api/amocrm/callback` (production)

3. **Client ID va Client Secret ni oling:**
   - Integration yaratilgandan keyin, Client ID va Client Secret ko'rsatiladi
   - Bu ma'lumotlarni saqlang

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

1. **Authorization URL'ni tayyorlang:**
   ```
   https://yourcompany.amocrm.ru/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3001/api/amocrm/callback
   ```

2. **Browser'da oching:**
   - Bu URL'ni browser'da oching
   - AmoCRM'da login qiling
   - Ruxsat bering

3. **Callback URL'dan code ni oling:**
   - Browser sizni callback URL'ga yo'naltiradi
   - URL'dan `code` parametrini oling
   - Bu code'ni bir marta ishlatib, access token va refresh token olasiz

**⚠️ Eslatma:** Bu qadamni avtomatiklashtirish uchun callback endpoint yaratish kerak bo'ladi.

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

