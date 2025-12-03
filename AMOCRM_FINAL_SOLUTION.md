# AmoCRM OAuth 405 Error - Final Solution

## Muammo

Browser to'g'ridan-to'g'ri AmoCRM URL'ga so'rov yuborayapti va 405 xatosi olmoqda. Response Headers'da `Allow: POST` ko'rsatilmoqda.

## Sabab

Browser hali ham eski kod bilan ishlayapti yoki backend'ga so'rov kelmayapti.

## Yechim

### 1. Backend'da redirect'ni tekshirish

Backend log'larni tekshiring:

```bash
pm2 logs acoustic-backend --lines 0 | grep -i amocrm
```

Agar log'larda `[AmoCRM] Authorization request received` ko'rsatilmasa, bu shuni anglatadiki, backend'ga so'rov kelmayapti.

### 2. Browser'da Network tab'ni tekshirish

1. Browser console'ni oching (F12)
2. Network tab'ni oching
3. "Preserve log" va "Disable cache" ni yoqing
4. "AmoCRM'ga ulanish" tugmasini bosing
5. Quyidagilarni tekshiring:
   - `/api/amocrm/authorize` so'rovi yuborilishi kerak
   - Status: 302 (Redirect)
   - Keyin AmoCRM'ga redirect

Agar `/api/amocrm/authorize` so'rovi yuborilmasa, bu shuni anglatadiki, browser hali ham eski kod bilan ishlayapti.

### 3. Admin panel'ni rebuild qilish

```bash
cd /var/www/news.acoustic.uz
git pull origin main
bash deploy/rebuild-admin-clean.sh
```

### 4. Browser cache'ni tozalash

1. Chrome: Settings → Privacy → Clear browsing data → "Cached images and files" → "All time" → Clear data
2. Yoki Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
3. Yoki incognito/private mode'da ochib ko'ring

### 5. Nginx cache'ni tekshirish

Agar Nginx cache ishlatilsa, uni o'chirish kerak:

```bash
sudo systemctl reload nginx
```

### 6. AmoCRM Integration'ni tekshirish

AmoCRM Integration'da Redirect URI to'g'ri sozlanganligini tekshiring:
- Redirect URI: `https://api.acoustic.uz/api/amocrm/callback`

### 7. AmoCRM Integration'ni qayta yaratish

Agar muammo davom etsa, AmoCRM Integration'ni qayta yarating:
1. AmoCRM'da Integration'ni o'chiring
2. Yangi Integration yarating
3. Redirect URI'ni to'g'ri sozlang
4. Client ID va Client Secret'ni yangilang

## Tekshirish

1. Browser console'da Network tab'ni oching
2. "AmoCRM'ga ulanish" tugmasini bosing
3. Quyidagilarni tekshiring:
   - `/api/amocrm/authorize` so'rovi yuborilishi kerak
   - Status: 302 (Redirect)
   - Keyin AmoCRM'ga redirect
   - 405 xatosi chiqmasligi kerak

## Muammo davom etsa

Agar muammo davom etsa, quyidagilarni tekshiring:

1. Backend log'larni tekshiring: `pm2 logs acoustic-backend --lines 0 | grep -i amocrm`
2. Browser console'da Network tab'ni tekshiring
3. Admin panel'ni rebuild qiling
4. Browser cache'ni tozalang
5. Nginx cache'ni tekshiring
6. AmoCRM Integration'ni qayta yarating

