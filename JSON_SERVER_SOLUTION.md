# JSON Yechimi - Server'ga Qo'yilganda Optimal Yechim

## Muammo

Next.js production'da `public/data/` papkasiga yozish muammo bo'lishi mumkin:
- Standalone build'da `public/` papkasi read-only bo'lishi mumkin
- File system writes production'da cheklangan bo'lishi mumkin
- Serverless muhitda ishlamaydi

## Yechim

### Variant 1: Writable Directory (Tavsiya)

**Production'da yoziladigan papka:**
```
/data/json-cache/  (server'da writable directory)
```

**Development'da:**
```
public/data/  (oddiy)
```

**Konfiguratsiya:**
```bash
# .env.production
JSON_DATA_DIR=/var/www/acousticuz/data/json-cache
```

### Variant 2: Build Time Pre-populate (Eng Yaxshi)

**Build vaqti:**
```bash
# Local'da backend ishlaydi
npm run generate-json

# JSON fayllar public/data/ ga yoziladi
# Bu fayllar build'da bo'ladi (read-only, lekin o'qish mumkin)
```

**Production'da:**
- JSON fayllar build'da bo'ladi
- O'qish mumkin (tez!)
- Yozish kerak emas (build'dan oldin to'ldirilgan)

## Tavsiya

### Sizning Holatingiz Uchun:

**Variant 2 (Build Time Pre-populate) - Eng Yaxshi:**

1. **Build'dan oldin:**
   ```bash
   # Local'da backend ishlaydi
   npm run generate-json
   ```

2. **Build:**
   ```bash
   npm run build
   # JSON fayllar public/data/ da bo'ladi
   ```

3. **Server'ga yuklash:**
   ```bash
   # Frontend build'ini server'ga yuklash
   # JSON fayllar bilan birga
   ```

4. **Production'da:**
   - JSON fayllar build'da bo'ladi
   - O'qish mumkin (tez!)
   - Yozish kerak emas

**Afzalliklari:**
- ✅ File system writes muammosi yo'q
- ✅ Birinchi so'rov tez (JSON'dan o'qadi)
- ✅ Oddiy va ishonchli
- ✅ Serverless'da ham ishlaydi

**Kamchiliklari:**
- ⚠️ Build'dan oldin script ishga tushirish kerak
- ⚠️ Yangilanish uchun rebuild kerak (lekin bu kam bo'ladi)

### Variant 1 (Writable Directory) - Alternativ:

Agar build time pre-populate qilishni xohlamasangiz:

1. **Server'da writable directory yaratish:**
   ```bash
   mkdir -p /var/www/acousticuz/data/json-cache
   chmod 755 /var/www/acousticuz/data/json-cache
   ```

2. **Environment variable:**
   ```bash
   JSON_DATA_DIR=/var/www/acousticuz/data/json-cache
   ```

3. **Production'da:**
   - Birinchi so'rovda backend'dan olinadi
   - JSON fayllarga yoziladi (writable directory'ga)
   - Keyingi so'rovlarda JSON'dan o'qiladi

**Afzalliklari:**
- ✅ Avtomatik yangilanadi
- ✅ Build'dan oldin script kerak emas

**Kamchiliklari:**
- ⚠️ File system writes kerak
- ⚠️ Writable directory kerak
- ⚠️ Serverless'da ishlamaydi

## Xulosa

**Sizning holatingizda (Traditional Server):**

**Tavsiya: Variant 2 (Build Time Pre-populate)**
- ✅ Eng oddiy
- ✅ Eng ishonchli
- ✅ File system writes muammosi yo'q
- ✅ Birinchi so'rov tez

**Agar avtomatik yangilanish kerak bo'lsa: Variant 1 (Writable Directory)**
- ✅ Avtomatik yangilanadi
- ⚠️ Writable directory kerak





