# Root dan Production Setup

Bu qo'llanma backend va frontend ni `/root/acoustic.uz` dan productionda ishga tushirish uchun.

## Tayanch konfiguratsiya

PM2 konfiguratsiyasi `/root/acoustic.uz/deploy/ecosystem.config.js` da yangilandi:
- Backend: `/root/acoustic.uz/apps/backend/dist/main.js`
- Frontend: `/root/acoustic.uz/apps/frontend` (npm start)

## PM2 Permission muammosini hal qilish

Agar PM2 permission xatosi bo'lsa, quyidagi qadamlarni bajaring:

### 1. PM2 daemon ni to'liq to'xtatish

```bash
# Barcha PM2 processlarni to'xtatish
pm2 kill

# Yoki faqat root PM2 daemon ni o'chirish
pkill -9 -f "PM2.*God Daemon.*root"
```

### 2. PM2 katalogini tozalash

```bash
# PM2 katalogini tozalash (ihtiyotkorlik bilan!)
rm -rf /root/.pm2
```

### 3. PM2 ni qayta ishga tushirish

```bash
cd /root/acoustic.uz

# Avval PM2 ni ishga tushirish (daemon yaratish uchun)
pm2 list

# Keyin processlarni ishga tushirish
pm2 start deploy/ecosystem.config.js
pm2 save
```

## Deployment skriptlari

### To'liq deployment

```bash
cd /root/acoustic.uz
bash deploy/deploy-from-root.sh
```

### Faqat PM2 ni yangilash

```bash
cd /root/acoustic.uz
bash deploy/update-pm2-to-root.sh
```

## Manual ishga tushirish

Agar skriptlar ishlamasa, quyidagi qadamlarni qo'lda bajaring:

### Backend

```bash
cd /root/acoustic.uz
pm2 start apps/backend/dist/main.js \
    --name acoustic-backend \
    --cwd /root/acoustic.uz \
    --env NODE_ENV=production \
    --env PORT=3001 \
    --error /var/log/pm2/acoustic-backend-error.log \
    --output /var/log/pm2/acoustic-backend-out.log \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --autorestart \
    --max-memory-restart 500M \
    --no-watch
```

### Frontend

```bash
cd /root/acoustic.uz/apps/frontend
pm2 start npm \
    --name acoustic-frontend \
    -- start \
    --cwd /root/acoustic.uz/apps/frontend \
    --interpreter none \
    --env NODE_ENV=production \
    --env PORT=3002 \
    --env NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api \
    --env NEXT_PUBLIC_SITE_URL=https://acoustic.uz \
    --error /var/log/pm2/acoustic-frontend-error.log \
    --output /var/log/pm2/acoustic-frontend-out.log \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --merge-logs \
    --autorestart \
    --max-memory-restart 500M \
    --no-watch
```

### PM2 ni saqlash

```bash
pm2 save
```

## Tekshirish

```bash
# Status
pm2 list

# Loglar
pm2 logs acoustic-backend
pm2 logs acoustic-frontend

# HTTP tekshiruv
curl http://localhost:3001/api/health
curl http://localhost:3002
```

## Muammolarni hal qilish

### PM2 permission xatosi

```bash
# PM2 katalogini tozalash
rm -rf /root/.pm2
pm2 kill
pm2 list  # Bu yangi daemon yaratadi
```

### Processlar ishlamayapti

```bash
# Loglarni tekshirish
pm2 logs acoustic-backend --lines 50
pm2 logs acoustic-frontend --lines 50

# Qayta ishga tushirish
pm2 restart all
```

### Port band

```bash
# Portlarni tekshirish
netstat -tulpn | grep -E "3001|3002"
lsof -i :3001
lsof -i :3002
```

## Keyingi qadamlar

1. Nginx konfiguratsiyasini yangilash (agar kerak bo'lsa)
2. Environment variables ni tekshirish
3. Database connection ni tekshirish
4. SSL sertifikatlarni tekshirish
