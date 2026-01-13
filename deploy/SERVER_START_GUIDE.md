# Serverda Ishga Tushirish Qo'llanmasi

## 🚀 Tezkor Ishga Tushirish

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

## 📋 Ishga Tushirish Variantlari

### Variant A: Avtomatik Rebuild Scriptlar (Tavsiya etiladi)

#### Backend'ni ishga tushirish:
```bash
cd /var/www/acoustic.uz
bash deploy/rebuild-backend-acoustic.sh
```

Bu script:
- ✅ Git pull qiladi
- ✅ Dependencies o'rnatadi
- ✅ Shared package build qiladi
- ✅ Backend build qiladi
- ✅ PM2 restart qiladi

#### Frontend'ni ishga tushirish:
```bash
cd /var/www/acoustic.uz
bash deploy/rebuild-frontend-acoustic.sh
```

Bu script:
- ✅ Git pull qiladi
- ✅ Dependencies o'rnatadi
- ✅ Shared package build qiladi
- ✅ Frontend build qiladi
- ✅ PM2 restart qiladi

#### Ikkalasini ham bir vaqtda:
```bash
cd /var/www/acoustic.uz
bash deploy/rebuild-backend-acoustic.sh
bash deploy/rebuild-frontend-acoustic.sh
```

### Variant B: Qo'lda Ishga Tushirish

#### 1. Git Pull
```bash
cd /var/www/acoustic.uz
git pull origin main
```

#### 2. Dependencies O'rnatish
```bash
pnpm install
```

#### 3. Shared Package Build
```bash
pnpm --filter @acoustic/shared build
```

#### 4. Backend Build va Ishga Tushirish
```bash
cd apps/backend
rm -rf dist .tsbuildinfo
pnpm exec nest build
cd ../..
pm2 restart acoustic-backend
```

#### 5. Frontend Build va Ishga Tushirish
```bash
cd apps/frontend
rm -rf .next
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz
pnpm build
cd ../..
pm2 restart acoustic-frontend
```

### Variant C: PM2 Ecosystem Config (Agar build allaqachon mavjud bo'lsa)

```bash
cd /var/www/acoustic.uz

# PM2 bilan ishga tushirish
pm2 start deploy/ecosystem.config.js

# yoki restart
pm2 restart all

# yoki alohida
pm2 restart acoustic-backend
pm2 restart acoustic-frontend
```

## 🔍 Tekshirish

### PM2 Status
```bash
pm2 list
pm2 status
```

### PM2 Logs
```bash
# Barcha loglar
pm2 logs

# Backend loglar
pm2 logs acoustic-backend

# Frontend loglar
pm2 logs acoustic-frontend

# Real-time loglar (son 50 qator)
pm2 logs --lines 50
```

### Application Status
```bash
# Backend API tekshirish
curl http://localhost:3001/api/settings?lang=uz

# Frontend tekshirish
curl http://localhost:3000 | head -20
```

### Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Konfiguratsiyani tekshirish
```

## 🛠️ Muammolarni Hal Qilish

### Backend ishlamayapti

1. **PM2 status tekshiring:**
```bash
pm2 list
pm2 logs acoustic-backend --lines 50
```

2. **Port 3001 bandmi?**
```bash
lsof -i :3001
# yoki
netstat -tulpn | grep 3001
```

3. **Database ulanishini tekshiring:**
```bash
cd apps/backend
# .env faylida DATABASE_URL to'g'ri ekanligini tekshiring
cat .env | grep DATABASE_URL
```

4. **Backend'ni qayta build qiling:**
```bash
cd /var/www/acoustic.uz/apps/backend
rm -rf dist .tsbuildinfo
pnpm exec nest build
pm2 restart acoustic-backend
```

### Frontend ishlamayapti

1. **PM2 status tekshiring:**
```bash
pm2 list
pm2 logs acoustic-frontend --lines 50
```

2. **Port 3000 bandmi?**
```bash
lsof -i :3000
```

3. **Build mavjudmi?**
```bash
ls -la apps/frontend/.next
```

4. **Frontend'ni qayta build qiling:**
```bash
cd /var/www/acoustic.uz/apps/frontend
rm -rf .next
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz
pnpm build
pm2 restart acoustic-frontend
```

### PM2 Process'lar to'xtagan

```bash
# Barcha process'larni qayta ishga tushirish
pm2 restart all

# yoki to'xtatib, qayta ishga tushirish
pm2 stop all
pm2 start deploy/ecosystem.config.js
```

### Nginx 502 Bad Gateway

1. **Backend ishlayotganini tekshiring:**
```bash
curl http://localhost:3001/api/settings?lang=uz
```

2. **Nginx konfiguratsiyasini tekshiring:**
```bash
sudo nginx -t
sudo cat /etc/nginx/sites-available/acoustic.uz
```

3. **Nginx'ni reload qiling:**
```bash
sudo systemctl reload nginx
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process info
pm2 info acoustic-backend
pm2 info acoustic-frontend

# Memory usage
pm2 list
```

### System Resources
```bash
# CPU va Memory
htop
# yoki
top

# Disk usage
df -h

# Network connections
netstat -tulpn
```

## 🔄 Yangilash (Update)

### Minimal Yangilash (Faqat kod)
```bash
cd /var/www/acoustic.uz
git pull origin main
pm2 restart all
```

### To'liq Yangilash (Kod + Build)
```bash
cd /var/www/acoustic.uz
git pull origin main
bash deploy/rebuild-backend-acoustic.sh
bash deploy/rebuild-frontend-acoustic.sh
```

## ✅ Checklist

### Birinchi Ishga Tushirish
- [ ] Serverga SSH orqali ulangan
- [ ] `cd /var/www/acoustic.uz` qilingan
- [ ] Git repository clone qilingan
- [ ] `.env` fayllar o'rnatilgan (backend va frontend)
- [ ] Dependencies o'rnatilgan (`pnpm install`)
- [ ] Database migration'lar o'tkazilgan
- [ ] Backend build qilingan
- [ ] Frontend build qilingan
- [ ] PM2 process'lar ishga tushirilgan
- [ ] Nginx konfiguratsiyasi o'rnatilgan
- [ ] SSL sertifikat o'rnatilgan (Let's Encrypt)
- [ ] Application ishlayapti (tekshirilgan)

### Muntazam Yangilash
- [ ] `git pull origin main` qilingan
- [ ] Dependencies yangilangan (agar kerak bo'lsa)
- [ ] Backend rebuild qilingan (agar o'zgarishlar bo'lsa)
- [ ] Frontend rebuild qilingan (agar o'zgarishlar bo'lsa)
- [ ] PM2 restart qilingan
- [ ] Application ishlayapti (tekshirilgan)

## 🎯 Xulosa

**Eng oddiy usul:**
```bash
cd /var/www/acoustic.uz
bash deploy/rebuild-backend-acoustic.sh
bash deploy/rebuild-frontend-acoustic.sh
```

Bu scriptlar barcha kerakli qadamlarni avtomatik bajaradi!

