# PM2'ni qayta ishga tushirish

## ✅ Build fayllar ko'chirildi

- Source: `/root/acoustic.uz/apps/frontend/.next` (112M, 259 fayl)
- Target: `/var/www/acoustic.uz/apps/frontend/.next` (111M, 259 fayl)
- ✅ Ko'chirish muvaffaqiyatli yakunlandi

## ✅ Ecosystem config yangilandi

- Frontend port: **3000 → 3002**
- Backend port: **3001** (o'zgarmadi)
- Config fayl: `/var/www/acoustic.uz/deploy/ecosystem.config.js`

## 📋 PM2'ni qayta ishga tushirish

PM2 `acoustic` user'da ishlayapti, shuning uchun quyidagi qadamlarni bajaring:

### Usul 1: SSH orqali acoustic user sifatida kirish

```bash
# SSH orqali acoustic user sifatida kirish
ssh acoustic@server

# PM2 ecosystem config'ni yangilash
cd /var/www/acoustic.uz
pm2 delete acoustic-frontend  # Eski process'ni o'chirish
pm2 start deploy/ecosystem.config.js  # Yangi config bilan ishga tushirish

# Yoki faqat frontend'ni restart qilish
pm2 restart acoustic-frontend

# Tekshirish
pm2 list
pm2 logs acoustic-frontend --lines 20
curl -I http://localhost:3002
```

### Usul 2: Systemd service orqali (agar root bo'lsangiz)

```bash
systemctl restart pm2-acoustic
systemctl status pm2-acoustic
```

## 🔍 Tekshirish

Frontend'ni tekshirish:

```bash
# Port 3002'da frontend ishlayaptimi?
curl -I http://localhost:3002

# Yoki port tekshiruvi
ss -tlnp | grep ":3002"

# PM2 process'lari
pm2 list

# Frontend loglar
pm2 logs acoustic-frontend
```

## ⚠️ Eslatma

Agar frontend ishga tushmasa, loglarni tekshiring:

```bash
pm2 logs acoustic-frontend --err --lines 50
```

Yoki PM2 error log faylini ko'ring:

```bash
tail -50 /var/log/pm2/acoustic-frontend-error.log
```

## 📝 Port ma'lumotlari

- **Backend**: Port 3001
- **Frontend**: Port 3002 (yangilandi)
- **Nginx**: Frontend'ni 3002 portga proxy qiladi
