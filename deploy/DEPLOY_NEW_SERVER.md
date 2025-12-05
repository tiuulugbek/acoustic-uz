# 🚀 Yangi Serverga Deploy Qilish Qo'llanmasi

Bu qo'llanma proektni yangi serverga clone qilib qo'yish uchun to'liq ko'rsatmalarni beradi.

## 📋 Talablar

- Ubuntu 20.04+ yoki Debian 11+
- Root yoki sudo ruxsati
- SSH ulanish
- Domen nomlari sozlangan (DNS)

## 🔧 Qadam 1: Server Sozlash

### 1.1. Serverga ulanish

```bash
ssh root@YOUR_SERVER_IP
```

### 1.2. Server sozlash scriptini ishga tushirish

```bash
# Scriptni yuklab olish va ishga tushirish
curl -fsSL https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/setup-server.sh -o /tmp/setup-server.sh
chmod +x /tmp/setup-server.sh
sudo /tmp/setup-server.sh
```

**Yoki qo'lda:**

```bash
# System update
apt-get update && apt-get upgrade -y

# Node.js 18.x o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# pnpm o'rnatish
npm install -g pnpm@8.15.0

# PostgreSQL o'rnatish
apt-get install -y postgresql postgresql-contrib

# PM2 o'rnatish
npm install -g pm2

# Nginx o'rnatish
apt-get install -y nginx

# Git o'rnatish
apt-get install -y git

# Build tools
apt-get install -y build-essential python3
```

## 📦 Qadam 2: Proektni Clone Qilish

### 2.1. Proekt papkasini yaratish

```bash
# Proekt papkasini yaratish
mkdir -p /var/www
cd /var/www

# Proektni clone qilish
git clone https://github.com/tiuulugbek/acoustic-uz.git news.acoustic.uz
cd news.acoustic.uz
```

### 2.2. Dependencies o'rnatish

```bash
# pnpm dependencies o'rnatish
pnpm install
```

## 🗄️ Qadam 3: Database Sozlash

### 3.1. PostgreSQL database va user yaratish

```bash
# PostgreSQL ga kirish
sudo -u postgres psql

# Database va user yaratish
CREATE DATABASE acoustic;
CREATE USER acoustic WITH PASSWORD 'YangiKuchliParol123!';
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;
\q
```

### 3.2. Database migration'larini ishga tushirish

```bash
cd /var/www/news.acoustic.uz

# Migration'lar
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
```

## 🔐 Qadam 4: Environment Variables Sozlash

### 4.1. .env faylini yaratish

```bash
cd /var/www/news.acoustic.uz
cp deploy/env.production.example .env
```

### 4.2. JWT Secrets generatsiya qilish

```bash
# JWT_ACCESS_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET (yana bir marta)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.3. .env faylini tahrirlash

```bash
nano .env
```

**Quyidagilarni o'zgartiring:**

```env
# Database (yuqorida yaratilgan parolni kiriting)
DATABASE_URL=postgresql://acoustic:YangiKuchliParol123!@localhost:5432/acoustic

# JWT Secrets (yuqorida generatsiya qilingan stringlarni kiriting)
JWT_ACCESS_SECRET=<generatsiya-qilingan-string-1>
JWT_REFRESH_SECRET=<generatsiya-qilingan-string-2>

# Domenlar (o'zgartiring agar kerak bo'lsa)
CORS_ORIGIN=https://news.acoustic.uz,https://admins.acoustic.uz
NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
VITE_API_URL=https://api.acoustic.uz/api
APP_URL=https://api.acoustic.uz

# Storage
STORAGE_DRIVER=local

# Telegram (ixtiyoriy)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

### 4.4. .env fayli xavfsizligi

```bash
chmod 600 .env
chown deploy:deploy .env  # yoki root:root
```

## 🏗️ Qadam 5: Build Qilish

### 5.1. Shared package build

```bash
cd /var/www/news.acoustic.uz
pnpm --filter @acoustic/shared build
```

### 5.2. Backend build

```bash
pnpm --filter @acoustic/backend build
```

### 5.3. Frontend build

```bash
# Environment variables export qilish
export NODE_ENV=production
export NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
export NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz

# Build
cd apps/frontend
pnpm build
```

### 5.4. Admin build

```bash
# Environment variables export qilish
export VITE_API_URL=https://api.acoustic.uz/api
export NODE_ENV=production

# Build
cd apps/admin
pnpm build
```

## 📁 Qadam 6: File Storage Sozlash

### 6.1. Uploads papkasini yaratish

```bash
# Backend uploads
mkdir -p /var/www/news.acoustic.uz/apps/backend/uploads
chmod -R 755 /var/www/news.acoustic.uz/apps/backend/uploads
chown -R deploy:deploy /var/www/news.acoustic.uz/apps/backend/uploads

# Frontend public
mkdir -p /var/www/news.acoustic.uz/apps/frontend/public
chmod -R 755 /var/www/news.acoustic.uz/apps/frontend/public
```

## 🚀 Qadam 7: PM2 bilan Ishga Tushirish

### 7.1. PM2 ecosystem config

```bash
cd /var/www/news.acoustic.uz
cp deploy/ecosystem.config.js ecosystem.config.js
```

**ecosystem.config.js ni tekshiring va kerak bo'lsa o'zgartiring:**

```javascript
module.exports = {
  apps: [
    {
      name: 'acoustic-backend',
      script: 'apps/backend/dist/main.js',
      cwd: '/var/www/news.acoustic.uz',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/acoustic-backend-error.log',
      out_file: '/var/log/pm2/acoustic-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false
    },
    {
      name: 'acoustic-frontend',
      script: 'apps/frontend/.next/standalone/apps/frontend/server.js',
      cwd: '/var/www/news.acoustic.uz',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/acoustic-frontend-error.log',
      out_file: '/var/log/pm2/acoustic-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false
    }
  ]
};
```

### 7.2. PM2 log papkasini yaratish

```bash
mkdir -p /var/log/pm2
chmod -R 755 /var/log/pm2
```

### 7.3. PM2 bilan ishga tushirish

```bash
cd /var/www/news.acoustic.uz

# Backend va Frontend ni ishga tushirish
pm2 start ecosystem.config.js

# PM2 ni startup ga qo'shish
pm2 save
pm2 startup
# Chiqgan buyruqni ishga tushiring (masalan: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy)
```

## 🌐 Qadam 8: Nginx Sozlash

### 8.1. Nginx config faylini yaratish

```bash
# Nginx config ni ko'chirish
cp /var/www/news.acoustic.uz/deploy/nginx-acoustic-uz.conf /etc/nginx/sites-available/acoustic-uz.conf

# Symlink yaratish
ln -s /etc/nginx/sites-available/acoustic-uz.conf /etc/nginx/sites-enabled/acoustic-uz.conf
```

### 8.2. Nginx config ni tahrirlash

```bash
nano /etc/nginx/sites-available/acoustic-uz.conf
```

**Quyidagilarni o'zgartiring:**
- `server_name` - domen nomlarini
- `root` - frontend va admin papkalarini
- `proxy_pass` - backend va frontend portlarini

### 8.3. Nginx ni tekshirish va reload qilish

```bash
# Config ni tekshirish
nginx -t

# Nginx ni reload qilish
systemctl reload nginx
```

## 🔒 Qadam 9: SSL Sozlash (Let's Encrypt)

### 9.1. Certbot o'rnatish

```bash
apt-get install -y certbot python3-certbot-nginx
```

### 9.2. SSL sertifikat olish

```bash
# Barcha domenlar uchun
certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz

# Yoki har birini alohida
certbot --nginx -d news.acoustic.uz
certbot --nginx -d api.acoustic.uz
certbot --nginx -d admins.acoustic.uz
```

### 9.3. Auto-renewal sozlash

```bash
# Test qilish
certbot renew --dry-run

# Cron job allaqachon o'rnatilgan bo'lishi kerak
```

## ✅ Qadam 10: Tekshirish

### 10.1. PM2 status

```bash
pm2 list
pm2 logs acoustic-backend --lines 50
pm2 logs acoustic-frontend --lines 50
```

### 10.2. Nginx status

```bash
systemctl status nginx
```

### 10.3. Database ulanish

```bash
cd /var/www/news.acoustic.uz
pnpm exec prisma studio --schema=prisma/schema.prisma
# Browser da http://localhost:5555 ochiladi
```

### 10.4. Browser da tekshirish

- Frontend: `https://news.acoustic.uz`
- Admin: `https://admins.acoustic.uz`
- API: `https://api.acoustic.uz/api`

## 🔄 Qadam 11: Yangilash (Update)

### 11.1. Kod yangilash

```bash
cd /var/www/news.acoustic.uz
git pull origin main
pnpm install
```

### 11.2. Rebuild va restart

```bash
# Frontend rebuild script
./deploy/rebuild-frontend.sh

# Yoki qo'lda:
pnpm --filter @acoustic/shared build
pnpm --filter @acoustic/backend build
cd apps/frontend && pnpm build
cd ../admin && pnpm build
pm2 restart all
```

## 📝 Qo'shimcha Ma'lumotlar

### Log fayllar

```bash
# PM2 logs
pm2 logs acoustic-backend
pm2 logs acoustic-frontend

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# System logs
journalctl -u nginx -f
```

### Permissions

```bash
# Proekt papkasiga ruxsatlar
chown -R deploy:deploy /var/www/news.acoustic.uz
chmod -R 755 /var/www/news.acoustic.uz

# Uploads papkasiga yozish ruxsati
chmod -R 775 /var/www/news.acoustic.uz/apps/backend/uploads
```

### Backup

```bash
# Database backup
pg_dump -U acoustic acoustic > backup_$(date +%Y%m%d_%H%M%S).sql

# Files backup
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/news.acoustic.uz/apps/backend/uploads
```

## 🆘 Muammolarni Hal Qilish

### Backend ishlamayapti

```bash
# Log'larni tekshirish
pm2 logs acoustic-backend --lines 100

# Port tekshirish
netstat -tulpn | grep 3001

# Restart
pm2 restart acoustic-backend
```

### Frontend ishlamayapti

```bash
# Log'larni tekshirish
pm2 logs acoustic-frontend --lines 100

# Build tekshirish
ls -la apps/frontend/.next/standalone/apps/frontend/

# Restart
pm2 restart acoustic-frontend
```

### Database muammosi

```bash
# PostgreSQL status
systemctl status postgresql

# Connection test
psql -U acoustic -d acoustic -h localhost
```

### Nginx 502 error

```bash
# Backend va Frontend portlarini tekshirish
netstat -tulpn | grep -E '3000|3001'

# Nginx error log
tail -f /var/log/nginx/error.log
```

## 📞 Yordam

Agar muammo bo'lsa:
1. Log'larni tekshiring
2. PM2 status ni ko'ring
3. Nginx config ni tekshiring
4. Database connection ni tekshiring

