# Rasmlar Muammosini Hal Qilish

## ✅ Nima qilingan

1. ✅ Backend `.env` faylida `UPLOADS_DIR` yangilandi:
   - Eski: `/var/www/acoustic.uz/apps/backend/uploads`
   - Yangi: `/root/acoustic.uz/apps/backend/uploads`

2. ✅ Backend kodida uploads path topish logikasi yaxshilandi (`src/main.ts`)

3. ✅ Backend build qilindi

## 🔄 Backend ni Restart Qilish

PM2 permission muammosi tufayli quyidagi usullardan birini ishlating:

### Variant 1: PM2 ni tozalab restart qilish

```bash
# PM2 daemon ni o'chirish
pkill -9 -f "PM2.*God Daemon.*root"
rm -rf /root/.pm2

# Backend ni qayta ishga tushirish
cd /root/acoustic.uz
pm2 start deploy/ecosystem.config.js --only acoustic-backend
pm2 save
```

### Variant 2: Backend ni to'g'ridan-to'g'ri ishga tushirish (test uchun)

```bash
cd /root/acoustic.uz/apps/backend
node dist/main.js
```

### Variant 3: PM2 processlarni qo'lda yangilash

```bash
# Mavjud backend processni topish
ps aux | grep "node.*dist/main.js" | grep -v grep

# Processni o'chirish (agar kerak bo'lsa)
pkill -f "node.*dist/main.js"

# PM2 orqali qayta ishga tushirish
cd /root/acoustic.uz
pm2 restart acoustic-backend
```

## 🔍 Tekshirish

### 1. Backend loglarini tekshirish

```bash
pm2 logs acoustic-backend --lines 50
```

Logda quyidagi xabarni ko'rish kerak:
```
📁 Serving static files from: /root/acoustic.uz/apps/backend/uploads
```

### 2. Uploads katalogini tekshirish

```bash
ls -la /root/acoustic.uz/apps/backend/uploads/ | head -10
```

### 3. HTTP test

```bash
# Mavjud rasmni test qilish
curl -I http://localhost:3001/uploads/2026-01-15-1768452603047-blob-s2k16h.webp

# Yoki browserda ochish
# http://localhost:3001/uploads/2026-01-15-1768452603047-blob-s2k16h.webp
```

### 4. Production URL test

```bash
# Nginx orqali test (agar nginx sozlangan bo'lsa)
curl -I https://a.acoustic.uz/uploads/2026-01-15-1768452603047-blob-s2k16h.webp
```

## ⚠️ Muammo bo'lsa

### Rasmlar hali ham ko'rinmayapti

1. **Backend ishlamayapti**:
   ```bash
   pm2 list
   pm2 logs acoustic-backend
   ```

2. **Uploads katalogi noto'g'ri**:
   ```bash
   # Backend loglarida qaysi path ishlatilayotganini ko'ring
   pm2 logs acoustic-backend | grep "Serving static"
   
   # Agar noto'g'ri bo'lsa, .env faylini tekshiring
   cat /root/acoustic.uz/apps/backend/.env | grep UPLOADS_DIR
   ```

3. **Nginx konfiguratsiyasi**:
   - Nginx `/uploads/` ni backend ga proxy qilishi kerak
   - Yoki static fayllarni to'g'ridan-to'g'ri serve qilishi kerak

### Nginx konfiguratsiyasi (agar kerak bo'lsa)

```nginx
location /uploads/ {
    alias /root/acoustic.uz/apps/backend/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

Yoki backend ga proxy:

```nginx
location /uploads/ {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 📝 Keyingi qadamlar

1. Backend ni restart qiling
2. Loglarni tekshiring
3. Browserda rasmlarni test qiling
4. Agar kerak bo'lsa, Nginx konfiguratsiyasini yangilang
