# AmoCRM 405 Method Not Allowed Xatosini Hal Qilish

## Muammo

URL to'g'ri ko'rinadi, lekin browser'da ochilganda 405 xatosi chiqadi:
```
https://acousticcrm.amocrm.ru/oauth2/authorize?client_id=31500922&response_type=code&redirect_uri=https%3A%2F%2Fapi.acoustic.uz%2Fapi%2Famocrm%2Fcallback
```

## Sabab

Bu xato AmoCRM Integration'da muammo borligini ko'rsatadi:
1. Integration turi "API Integration" emas bo'lishi mumkin
2. Redirect URI Integration'da to'g'ri sozlanmagan
3. Integration'da boshqa muammo bor

## Yechim (QADAM-BAQADAM)

### 1-qadam: AmoCRM Integration'ni to'liq o'chiring

1. AmoCRM'ga kiring: `https://acousticcrm.amocrm.ru`
2. Settings → Integrations ga o'ting
3. "acoustic.uz" yoki boshqa nomdagi Integration'ni toping
4. **TO'LIQ O'CHIRING** (Delete yoki Удалить)

### 2-qadam: Yangi "API Integration" yarating

1. **"Add Integration" yoki "Добавить интеграцию" tugmasini bosing**
2. **"API Integration" ni tanlang** (⚠️ MUHIM: Boshqa tur emas!)
   - "Webhook Integration" emas
   - "Widget Integration" emas
   - "API Integration" bo'lishi kerak
3. **Integration nomini kiriting:** "Acoustic.uz Website"
4. **Redirect URI ni kiriting:**
   ```
   https://api.acoustic.uz/api/amocrm/callback
   ```
   ⚠️ **MUHIM:**
   - HTTPS protokoli bo'lishi kerak (`https://`)
   - Trailing slash bo'lmasligi kerak (oxirida `/` bo'lmasligi kerak)
   - To'liq URL bo'lishi kerak
   - `api.acoustic.uz` domain to'g'ri bo'lishi kerak
5. **"Save" yoki "Сохранить" tugmasini bosing**

### 3-qadam: Client ID va Client Secret ni oling

1. Integration yaratilgandan keyin, Integration ro'yxatida integration nomiga bosing
2. **"Ключи и доступы" (Keys and Access) tab'iga o'ting**
3. **Client ID va Client Secret ni ko'ring va nusxalang**
   - Client ID: `31500922` (sizning holingizda)
   - Client Secret: (generate qilingan key)

### 4-qadam: Admin Panelda Sozlamalarni Yangilang

1. Admin panelga kiring: `https://admin.acoustic.uz`
2. Settings → AmoCRM integratsiyasi bo'limiga o'ting
3. **YANGI** Client ID va Client Secret ni kiriting
4. "Saqlash" tugmasini bosing

### 5-qadam: OAuth Authorization'ni Qayta Urinib Ko'ring

1. **Browser cache'ni tozalang** (Ctrl+Shift+R yoki Cmd+Shift+R)
2. **Incognito/Private mode'da ochib ko'ring**
3. "AmoCRM'ga ulanish" tugmasini bosing
4. Browser yangi tab'da AmoCRM OAuth sahifasini ochishi kerak

## Tekshirish

### Backend Log'larni Tekshirish

```bash
# Serverda
cd /var/www/news.acoustic.uz
pm2 logs acoustic-backend --lines 50 | grep -i "amocrm"
```

### URL'ni To'g'ridan-to'g'ri Tekshirish

Browser'da quyidagi URL'ni oching:
```
https://acousticcrm.amocrm.ru/oauth2/authorize?client_id=31500922&response_type=code&redirect_uri=https%3A%2F%2Fapi.acoustic.uz%2Fapi%2Famocrm%2Fcallback
```

Agar hali ham 405 chiqsa:
- Integration turi noto'g'ri
- Yoki Redirect URI noto'g'ri

## Qo'shimcha Tekshirish

### AmoCRM Integration'da Redirect URI'ni Tekshirish

1. AmoCRM'ga kiring
2. Settings → Integrations → Integration'ni oching
3. Redirect URI quyidagicha bo'lishi kerak:
   ```
   https://api.acoustic.uz/api/amocrm/callback
   ```
4. Agar noto'g'ri bo'lsa, tahrirlang yoki yangi Integration yarating

## Agar Hali Ham Muammo Bo'lsa

1. **AmoCRM Support'ga murojaat qiling:**
   - `https://www.amocrm.ru/support`
   - Yoki AmoCRM'da "Support" yoki "Поддержка" bo'limiga o'ting

2. **Muammoni tasvirlab bering:**
   - "405 Method Not Allowed" xatosi
   - OAuth authorization URL'ga GET so'rovi yuborilganda
   - Integration turi: "API Integration"
   - Redirect URI: `https://api.acoustic.uz/api/amocrm/callback`

3. **Backend log'larni yuboring:**
   ```bash
   pm2 logs acoustic-backend --lines 100 > amocrm-logs.txt
   ```

