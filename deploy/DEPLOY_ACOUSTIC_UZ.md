# 🚀 Acoustic.uz - Mavjud Serverga Deploy Qilish

## 📋 Mavjud Struktura

```
/var/www/
├── acoustic.uz/          # Asosiy sayt (Frontend)
└── admin.acoustic.uz/    # Admin panel
```

## 🎯 Kerakli Domenlar

- **Asosiy sayt:** `acoustic.uz` → Frontend
- **Admin panel:** `admin.acoustic.uz` → Admin Panel
- **Backend API:** `a.acoustic.uz` → Backend API

## 📁 Yangi Struktura

```
/var/www/
├── acoustic.uz/          # Frontend (acoustic.uz)
│   ├── apps/
│   │   ├── frontend/     # Next.js frontend
│   │   ├── backend/      # NestJS backend
│   │   └── admin/        # Vite admin panel
│   └── ...
└── admin.acoustic.uz/    # Admin panel (symlink yoki copy)
```

## 🔧 Qadamlar

### 1. Mavjud papkalarni tekshirish

```bash
# Mavjud papkalarni ko'rish
ls -la /var/www/

# Har bir papkani tekshirish
du -sh /var/www/acoustic.uz
du -sh /var/www/admin.acoustic.uz
```

### 2. Proektni clone qilish

```bash
cd /var/www
git clone https://github.com/tiuulugbek/acoustic-uz.git acoustic.uz.new
cd acoustic.uz.new
```

### 3. Backup qilish (muhim!)

```bash
# Mavjud papkalarni backup qilish
tar -czf /root/backup-acoustic-uz-$(date +%Y%m%d).tar.gz /var/www/acoustic.uz
tar -czf /root/backup-admin-acoustic-uz-$(date +%Y%m%d).tar.gz /var/www/admin.acoustic.uz
```

### 4. Mavjud papkalarni o'chirish yoki ko'chirish

**Variant A: O'chirish (agar kerak bo'lmasa)**
```bash
# Eslatma: Backup qilingan bo'lishi kerak!
rm -rf /var/www/acoustic.uz
rm -rf /var/www/admin.acoustic.uz
```

**Variant B: Ko'chirish (eski versiyani saqlash uchun)**
```bash
mv /var/www/acoustic.uz /var/www/acoustic.uz.old
mv /var/www/admin.acoustic.uz /var/www/admin.acoustic.uz.old
```

### 5. Yangi proektni o'rnatish

```bash
# Proektni to'g'ri joyga ko'chirish
mv /var/www/acoustic.uz.new /var/www/acoustic.uz
cd /var/www/acoustic.uz
```

### 6. Dependencies o'rnatish

```bash
pnpm install
```

### 7. Database sozlash

```bash
# .env faylini yaratish
cp deploy/env.production.example .env
nano .env

# Database URL ni sozlash
DATABASE_URL=postgresql://acoustic:PASSWORD@localhost:5432/acoustic

# Migration'lar
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
```

### 8. Build qilish

```bash
# Shared package
pnpm --filter @acoustic/shared build

# Backend
pnpm --filter @acoustic/backend build

# Frontend (acoustic.uz uchun)
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://acoustic.uz
cd apps/frontend
pnpm build
cd ../..

# Admin (admin.acoustic.uz uchun)
export VITE_API_URL=https://a.acoustic.uz/api
cd apps/admin
pnpm build
cd ../..
```

### 9. Admin panelni ko'chirish

```bash
# Admin build ni admin.acoustic.uz papkasiga ko'chirish
rm -rf /var/www/admin.acoustic.uz
mkdir -p /var/www/admin.acoustic.uz
cp -r apps/admin/dist/* /var/www/admin.acoustic.uz/
chown -R www-data:www-data /var/www/admin.acoustic.uz
```

### 10. PM2 sozlash

```bash
cd /var/www/acoustic.uz
cp deploy/ecosystem.config.js ecosystem.config.js

# PM2 ni ishga tushirish
pm2 start ecosystem.config.js
pm2 save
```

### 11. Nginx sozlash

```bash
# Nginx config yaratish
nano /etc/nginx/sites-available/acoustic-uz.conf
```

**Config quyidagicha bo'lishi kerak:**

```nginx
# acoustic.uz - Frontend
server {
    listen 80;
    listen [::]:80;
    server_name acoustic.uz www.acoustic.uz;
    
    root /var/www/acoustic.uz/apps/frontend/.next/standalone/apps/frontend;
    index index.html;
    
    # ... (to'liq config)
}

# a.acoustic.uz - Backend API
server {
    listen 80;
    listen [::]:80;
    server_name a.acoustic.uz;
    
    location /api {
        proxy_pass http://localhost:3001;
        # ... (proxy settings)
    }
    
    location /uploads {
        alias /var/www/acoustic.uz/apps/backend/uploads;
    }
}

# admin.acoustic.uz - Admin Panel
server {
    listen 80;
    listen [::]:80;
    server_name admin.acoustic.uz;
    
    root /var/www/admin.acoustic.uz;
    index index.html;
    
    # ... (to'liq config)
}
```

### 12. SSL sozlash

```bash
certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz
```

## ✅ Tekshirish

```bash
# PM2 status
pm2 list

# Nginx status
systemctl status nginx

# Logs
pm2 logs
tail -f /var/log/nginx/error.log
```

