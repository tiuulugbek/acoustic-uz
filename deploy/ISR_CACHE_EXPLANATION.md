# ISR Cache va Disk Hajmi Tushuntirish

## ❓ Savol: Har 30 daqiqada revalidate qilish fayllar ko'payishiga sabab bo'ladimi?

**Javob: Yo'q, fayllar ko'paymaydi!**

## 🔍 ISR Qanday Ishlaydi?

### 1. Build Vaqtida (Bir marta)
```
Build → HTML fayllar yaratiladi → .next/server/app/ papkasida saqlanadi
```

**Misol:**
- `/products/oticon-own-cic` → `.next/server/app/products/oticon-own-cic.html`
- `/products/phonak-audeo` → `.next/server/app/products/phonak-audeo.html`

**Har bir sahifa uchun bitta HTML fayl.**

### 2. Revalidate Vaqti O'tgach (30 daqiqadan keyin)
```
Revalidate → Mavjud HTML fayl yangilanadi → Yangi fayl YARATILMAYDI
```

**Misol:**
- `/products/oticon-own-cic.html` → **YANGILANADI** (yangi fayl yaratilmaydi)
- Fayl o'rniga yangi kontent yoziladi

## 📊 Disk Hajmi

### Static HTML Fayllar
```
Bir sahifa: ~5-50 KB
1000 sahifa: ~5-50 MB
10000 sahifa: ~50-500 MB
```

**Xulosa:** HTML fayllar juda kichik!

### Asosiy Disk Hajmi

1. **`.next/cache/`** - Build cache (eng katta)
   - ~500 MB - 2 GB
   - Build vaqtida yaratiladi
   - Avtomatik tozalanadi

2. **`.next/static/`** - Static assets
   - ~50-200 MB
   - CSS, JS, rasmlar
   - Build vaqtida yaratiladi

3. **`.next/server/app/`** - Server-side HTML
   - ~10-100 MB (sahifalar soniga qarab)
   - ISR HTML fayllar shu yerda
   - **YANGILANADI, lekin ko'paymaydi**

## 🔄 Revalidate Jarayoni

### Qanday Ishlaydi:

```javascript
// 1. Build vaqtida
/products/oticon-own-cic.html → Yaratiladi (5 KB)

// 2. 30 daqiqadan keyin (revalidate)
/products/oticon-own-cic.html → YANGILANADI (5 KB)
// Yangi fayl YARATILMAYDI!

// 3. Keyingi 30 daqiqadan keyin
/products/oticon-own-cic.html → Yana YANGILANADI (5 KB)
// Hali ham bitta fayl!
```

**Xulosa:** Fayllar ko'paymaydi, faqat yangilanadi!

## 📈 Disk Hajmi Oshishi Sabablari

### 1. Yangi Sahifalar Qo'shilganda
```
Yangi mahsulot qo'shildi → Yangi HTML fayl yaratiladi
/products/new-product.html → +5 KB
```

**Bu normal!** Yangi kontent = yangi sahifa.

### 2. Build Cache
```
.next/cache/ → Build vaqtida to'planadi
```

**Yechim:** Muntazam tozalash kerak.

### 3. Log Fayllar
```
pm2 logs → Ko'p log fayllar
```

**Yechim:** Log rotation sozlash.

## 🛠️ Disk Hajmini Nazorat Qilish

### 1. Disk Hajmini Tekshirish
```bash
# Frontend disk hajmi
du -sh /var/www/acoustic.uz/apps/frontend/.next/

# Cache hajmi
du -sh /var/www/acoustic.uz/apps/frontend/.next/cache/

# HTML fayllar hajmi
du -sh /var/www/acoustic.uz/apps/frontend/.next/server/app/
```

### 2. Cache Tozalash
```bash
# Build cache tozalash (xavfsiz)
rm -rf /var/www/acoustic.uz/apps/frontend/.next/cache/

# Qayta build qilish
cd /var/www/acoustic.uz/apps/frontend
pnpm exec next build
```

### 3. Eski Build Fayllarni Tozalash
```bash
# Eski build fayllarni o'chirish (xavfsiz)
rm -rf /var/www/acoustic.uz/apps/frontend/.next/

# Qayta build qilish
pnpm exec next build
```

## ⚠️ Xavflar

### 1. Juda Ko'p Sahifalar
```
Agar 100,000+ sahifa bo'lsa:
- HTML fayllar: ~500 MB - 5 GB
- Bu muammo bo'lishi mumkin
```

**Yechim:** 
- Faqat muhim sahifalarni static qilish
- Qolganlarini dynamic qilish

### 2. Build Cache Ko'payishi
```
.next/cache/ → 10 GB+ bo'lishi mumkin
```

**Yechim:**
- Muntazam tozalash
- Build cache limit sozlash

## ✅ Xulosa

1. **ISR fayllar ko'paytirmaydi** - faqat yangilanadi
2. **Disk hajmi kichik** - HTML fayllar ~5-50 KB
3. **Asosiy hajm cache'da** - `.next/cache/` eng katta
4. **Avtomatik tozalanadi** - Next.js cache boshqaradi
5. **Xavf minimal** - odatda muammo emas

## 📋 Tavsiyalar

1. **Muntazam monitoring:**
   ```bash
   # Disk hajmini tekshirish
   df -h
   du -sh /var/www/acoustic.uz/apps/frontend/.next/
   ```

2. **Cache tozalash:**
   ```bash
   # Oylik cache tozalash
   rm -rf /var/www/acoustic.uz/apps/frontend/.next/cache/
   pnpm exec next build
   ```

3. **Log rotation:**
   ```bash
   # PM2 log rotation
   pm2 install pm2-logrotate
   ```

4. **Disk monitoring:**
   ```bash
   # Disk hajmini kuzatish
   watch -n 60 'df -h | grep -E "Filesystem|/dev/"'
   ```

## 🎯 Xulosa

**ISR disk hajmini ko'paytirmaydi!** 

- Fayllar yangilanadi, lekin ko'paymaydi
- Disk hajmi minimal (HTML fayllar kichik)
- Asosiy hajm cache'da (avtomatik tozalanadi)
- Xavf minimal

**Muammo bo'lishi mumkin bo'lsa:**
- Juda ko'p sahifalar (10,000+)
- Build cache ko'payishi
- Log fayllar ko'payishi

**Yechim:** Muntazam monitoring va cache tozalash!

