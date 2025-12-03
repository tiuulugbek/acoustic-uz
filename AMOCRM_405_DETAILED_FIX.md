# AmoCRM 405 Method Not Allowed - Batafsil Yechim

## Muammo

URL to'g'ri ko'rinadi, lekin browser'da ochilganda 405 xatosi chiqadi:
```
https://acousticcrm.amocrm.ru/oauth2/authorize?client_id=31500922&response_type=code&redirect_uri=https%3A%2F%2Fapi.acoustic.uz%2Fapi%2Famocrm%2Fcallback
```

**Error:** `405 Method Not Allowed`

## Asosiy Sabab

Bu xato **AmoCRM Integration sozlamalarida muammo** borligini ko'rsatadi. URL to'g'ri, lekin AmoCRM bu URL'ga GET so'rovi yuborilishini qabul qilmayapti.

## Yechim (QADAM-BAQADAM)

### ⚠️ MUHIM: AmoCRM Integration'ni TO'LIQ QAYTA YARATISH KERAK

### 1-qadam: Eski Integration'ni TO'LIQ O'chiring

1. **AmoCRM'ga kiring:** `https://acousticcrm.amocrm.ru`
2. **Settings → Integrations** ga o'ting
3. **Barcha "acoustic" yoki "Acoustic" nomli Integration'larni toping**
4. **HAR BIRINI TO'LIQ O'CHIRING** (Delete yoki Удалить)
   - ⚠️ **MUHIM:** Faqat o'chirib qo'yish emas, TO'LIQ O'CHIRISH kerak

### 2-qadam: Yangi "API Integration" YARATING

1. **"Add Integration" yoki "Добавить интеграцию" tugmasini bosing**

2. **Integration turini tanlang:**
   - ⚠️ **"API Integration" ni tanlang** (Boshqa tur emas!)
   - ❌ "Webhook Integration" emas
   - ❌ "Widget Integration" emas
   - ❌ "Telegram Bot Integration" emas
   - ✅ **"API Integration" bo'lishi kerak**

3. **Integration ma'lumotlarini kiriting:**
   - **Nom:** `Acoustic.uz Website` (yoki boshqa nom)
   - **Redirect URI:** `https://api.acoustic.uz/api/amocrm/callback`
     - ⚠️ **MUHIM:**
       - HTTPS protokoli bo'lishi kerak (`https://`)
       - Trailing slash bo'lmasligi kerak (oxirida `/` bo'lmasligi kerak)
       - To'liq URL bo'lishi kerak
       - `api.acoustic.uz` domain to'g'ri bo'lishi kerak
       - Case-sensitive (katta/kichik harflar muhim)

4. **"Save" yoki "Сохранить" tugmasini bosing**

### 3-qadam: Client ID va Client Secret ni OLING

1. **Integration yaratilgandan keyin**, Integration ro'yxatida integration nomiga bosing

2. **"Ключи и доступы" (Keys and Access) tab'iga o'ting**

3. **Client ID va Client Secret ni ko'ring va nusxalang:**
   - **Client ID:** (masalan: `31500922`)
   - **Client Secret:** (generate qilingan key - "Сгенерировать" tugmasini bosing)

   ⚠️ **MUHIM:**
   - "ID интеграции" (Integration ID) ≠ Client ID
   - "Секретный ключ" (Secret Key) ≠ Client Secret
   - Faqat "Ключи и доступы" (Keys and Access) tab'ida ko'rsatilgan Client ID va Client Secret ishlatiladi

### 4-qadam: Admin Panelda Sozlamalarni Yangilang

1. **Admin panelga kiring:** `https://admin.acoustic.uz`
2. **Settings → AmoCRM integratsiyasi** bo'limiga o'ting
3. **YANGI ma'lumotlarni kiriting:**
   - **AmoCRM Domain:** `acousticcrm.amocrm.ru` (protocolsiz, trailing slash yo'q)
   - **Client ID:** Yangi Client ID (masalan: `31500922`)
   - **Client Secret:** Yangi Client Secret
4. **"Saqlash" tugmasini bosing**

### 5-qadam: Browser Cache'ni Tozalang

1. **Browser cache'ni tozalang:**
   - **Chrome/Edge:** Ctrl+Shift+R (Windows/Linux) yoki Cmd+Shift+R (Mac)
   - **Firefox:** Ctrl+F5 (Windows/Linux) yoki Cmd+Shift+R (Mac)
   - **Safari:** Cmd+Option+R (Mac)

2. **Yoki incognito/private mode'da ochib ko'ring:**
   - **Chrome:** Ctrl+Shift+N (Windows/Linux) yoki Cmd+Shift+N (Mac)
   - **Firefox:** Ctrl+Shift+P (Windows/Linux) yoki Cmd+Shift+P (Mac)
   - **Safari:** Cmd+Shift+N (Mac)

### 6-qadam: OAuth Authorization'ni Qayta Urinib Ko'ring

1. **Admin panelda "AmoCRM'ga ulanish" tugmasini bosing**
2. **Browser yangi tab'da AmoCRM OAuth sahifasini ochishi kerak**
3. **Agar hali ham 405 chiqsa:**
   - Integration turini qayta tekshiring
   - Redirect URI'ni qayta tekshiring
   - AmoCRM Support'ga murojaat qiling

## Tekshirish

### Backend Log'larni Tekshirish

```bash
# Serverda
cd /var/www/news.acoustic.uz
bash deploy/check-amocrm-full-logs.sh
```

### URL'ni To'g'ridan-to'g'ri Tekshirish

Browser'da quyidagi URL'ni oching (incognito mode'da):
```
https://acousticcrm.amocrm.ru/oauth2/authorize?client_id=31500922&response_type=code&redirect_uri=https%3A%2F%2Fapi.acoustic.uz%2Fapi%2Famocrm%2Fcallback
```

Agar hali ham 405 chiqsa:
- Integration turi noto'g'ri
- Yoki Redirect URI noto'g'ri
- Yoki AmoCRM'da Integration'da boshqa muammo bor

## Qo'shimcha Tekshirish

### AmoCRM Integration'da Redirect URI'ni Tekshirish

1. **AmoCRM'ga kiring:** `https://acousticcrm.amocrm.ru`
2. **Settings → Integrations → Integration'ni oching**
3. **Redirect URI quyidagicha bo'lishi kerak:**
   ```
   https://api.acoustic.uz/api/amocrm/callback
   ```
4. **Agar noto'g'ri bo'lsa:**
   - Tahrirlang (agar mumkin bo'lsa)
   - Yoki yangi Integration yarating

### Integration Turini Tekshirish

1. **Integration'ni oching**
2. **Integration turi "API Integration" bo'lishi kerak**
3. **Agar boshqa tur bo'lsa:**
   - Integration'ni o'chiring
   - Yangi "API Integration" yarating

## Agar Hali Ham Muammo Bo'lsa

### 1. AmoCRM Support'ga Murojaat Qiling

1. **AmoCRM Support'ga kiring:**
   - `https://www.amocrm.ru/support`
   - Yoki AmoCRM'da "Support" yoki "Поддержка" bo'limiga o'ting

2. **Muammoni tasvirlab bering:**
   - "405 Method Not Allowed" xatosi
   - OAuth authorization URL'ga GET so'rovi yuborilganda
   - Integration turi: "API Integration"
   - Redirect URI: `https://api.acoustic.uz/api/amocrm/callback`
   - Client ID: `31500922`

3. **Backend log'larni yuboring:**
   ```bash
   pm2 logs acoustic-backend --lines 100 > amocrm-logs.txt
   ```

### 2. Alternative: AmoCRM'da Boshqa Integration Turini Sinab Ko'ring

Agar "API Integration" ishlamasa, AmoCRM'da boshqa integration turlarini sinab ko'ring, lekin bu tavsiya etilmaydi, chunki OAuth 2.0 uchun "API Integration" kerak.

## Xulosa

405 xatosi AmoCRM Integration sozlamalarida muammo borligini ko'rsatadi. Eng yaxshi yechim - Integration'ni to'liq o'chirib, yangi "API Integration" yaratish.

