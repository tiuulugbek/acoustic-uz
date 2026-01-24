# Backend Status - Root Production

## ✅ Hal qilingan

1. **Port 3001 muammosi hal qilindi** - Eski processlar o'chirildi
2. **Uploads path to'g'ri sozlandi** - `/root/acoustic.uz/apps/backend/uploads`
3. **Backend ishga tushdi** - PID: 4117262 (yoki yangi PID)

## 📋 Backend ma'lumotlari

- **Path**: `/root/acoustic.uz/apps/backend/dist/main.js`
- **Uploads**: `/root/acoustic.uz/apps/backend/uploads`
- **Loglar**: `/tmp/pm2-logs/backend-out.log` va `/tmp/pm2-logs/backend-err.log`
- **Port**: 3001

## 🔍 Tekshirish

```bash
# Process status
ps aux | grep "node.*dist/main.js" | grep -v grep

# Loglar
tail -f /tmp/pm2-logs/backend-out.log
tail -f /tmp/pm2-logs/backend-err.log

# HTTP test
curl http://localhost:3001/api/health
curl -I http://localhost:3001/uploads/2026-01-15-1768452603047-blob-s2k16h.webp
```

## ⚠️ Ma'lum muammolar

1. **Database connection** - PostgreSQL connection muammosi bo'lishi mumkin
2. **PM2 permission** - PM2 orqali boshqarib bo'lmayapti (to'g'ridan-to'g'ri ishga tushirilgan)

## 🔄 Restart qilish

```bash
# Processni topish
ps aux | grep "node.*dist/main.js" | grep -v grep

# O'chirish
pkill -9 -f "node.*dist/main.js"

# Qayta ishga tushirish
cd /root/acoustic.uz/apps/backend
NODE_ENV=production PORT=3001 nohup node dist/main.js > /tmp/pm2-logs/backend-out.log 2> /tmp/pm2-logs/backend-err.log &
```

## 📝 Keyingi qadamlar

1. Database connection ni tekshirish va hal qilish
2. PM2 permission muammosini hal qilish (agar kerak bo'lsa)
3. Nginx konfiguratsiyasini tekshirish (uploads uchun)
