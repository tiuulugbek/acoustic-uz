# Server Yangilash Ko'rsatmasi

## 🚀 Serverda Git Pull Qilish

Serverda yangi o'zgarishlarni olish uchun quyidagi qadamlar:

### 1. Serverga SSH orqali ulanish
```bash
ssh root@YOUR_SERVER_IP
# yoki
ssh user@YOUR_SERVER_IP
```

### 2. Project directory'ga o'tish
```bash
cd /var/www/acoustic.uz
```

### 3. Git Pull Qilish
```bash
# Barcha o'zgarishlarni olish (o'chirilgan fayllar ham)
git pull origin main
```

**Muhim:** `git pull` qilganda:
- ✅ Yangi fayllar qo'shiladi
- ✅ O'zgargan fayllar yangilanadi
- ✅ Git'dan o'chirilgan fayllar serverdan ham o'chadi

### 4. Tozalash Scriptini Ishga Tushirish (Ixtiyoriy)
```bash
# Ortiqcha fayllarni tozalash
bash deploy/cleanup-server-files.sh
```

Bu script:
- `.DS_Store` fayllarini o'chiradi
- Log fayllarini o'chiradi
- Temporary fayllarni o'chiradi
- Git status ko'rsatadi

### 5. Application Restart (Agar kerak bo'lsa)
```bash
# PM2 restart
pm2 restart all

# yoki alohida
pm2 restart acoustic-frontend
pm2 restart acoustic-backend
```

## 📋 Qadam-baqadam

### Minimal Yangilash (Faqat kod)
```bash
cd /var/www/acoustic.uz
git pull origin main
pm2 restart all
```

### To'liq Yangilash (Kod + Tozalash)
```bash
cd /var/www/acoustic.uz
git pull origin main
bash deploy/cleanup-server-files.sh
pm2 restart all
```

## ⚠️ Muhim Eslatmalar

1. **Git Pull Yetarli:** `git pull` qilganda barcha o'zgarishlar (fayllar o'chirilishi ham) avtomatik serverga keladi.

2. **Ortiqcha Fayllar:** Agar serverda qo'lda yaratilgan fayllar bo'lsa (masalan, `.DS_Store`), ularni `cleanup-server-files.sh` scripti o'chiradi.

3. **Environment Variables:** `.env` fayllar `.gitignore`da, shuning uchun ular o'chmaydi.

4. **Build Fayllar:** `.next`, `dist` kabi build fayllar `.gitignore`da, shuning uchun ularni qo'lda o'chirish kerak emas.

5. **Logs:** PM2 log fayllari (`/var/log/pm2/`) o'chmaydi, chunki ular `.gitignore`da.

## 🔍 Tekshirish

### Qaysi fayllar o'chirildi?
```bash
cd /var/www/acoustic.uz
git log --oneline -1
git show --name-status --pretty="" HEAD | grep "^D" | head -20
```

### Qolgan .md fayllar
```bash
find . -name "*.md" -type f ! -path "./node_modules/*" ! -path "./.git/*"
```

Kutilgan natija:
```
./README.md
./SERVER_REQUIREMENTS.md
./DIGITALOCEAN_SETUP.md
./SEO_STATUS.md
./deploy/README.md
./docs/API_PRODUCTS.md
```

## ✅ Checklist

- [ ] Serverga SSH orqali ulangan
- [ ] `cd /var/www/acoustic.uz` qilingan
- [ ] `git pull origin main` bajarilgan
- [ ] `cleanup-server-files.sh` ishga tushirilgan (ixtiyoriy)
- [ ] PM2 restart qilingan (agar kerak bo'lsa)
- [ ] Application ishlayapti (tekshirilgan)

## 🎯 Xulosa

**Git pull yetarli!** Serverda faqat `git pull origin main` qilish kifoya. Barcha o'zgarishlar (fayllar o'chirilishi ham) avtomatik serverga keladi.

