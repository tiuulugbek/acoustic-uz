# Production Deployment Guide

## Server Ma'lumotlari
- **Server IP:** 152.53.229.176
- **SSH:** `ssh root@152.53.229.176`
- **Domen:** news.acoustic.uz

## Domen Strategiyasi

### Variant 1: Bitta domen (news.acoustic.uz)
✅ **Ishlaydi, lekin kamchiliklar bor:**
- Frontend: `news.acoustic.uz`
- Admin: `news.acoustic.uz/admin`
- API: `news.acoustic.uz/api`

**Kamchiliklar:**
- Admin panel va frontend bir xil domainda bo'ladi
- SEO va xavfsizlik jihatidan yaxshiroq emas
- Cookie va session management murakkabroq

### Variant 2: Subdomainlar (Tavsiya etiladi) ⭐
✅ **Yaxshiroq yechim:**
- Frontend: `news.acoustic.uz` yoki `acoustic.uz`
- Admin: `admin.acoustic.uz`
- API: `api.acoustic.uz`

**Afzalliklari:**
- Alohida xavfsizlik sozlamalari
- Cookie isolation
- Yaxshiroq SEO
- Production va development o'rtasida aniq ajratish

## Server Talablari

### Minimal Talablar
- **OS:** Ubuntu 20.04+ / Debian 11+
- **RAM:** 2GB+ (4GB tavsiya)
- **CPU:** 2 core+
- **Disk:** 20GB+ (rasmlar uchun)
- **Network:** 80, 443 portlar ochiq

### Kerakli Dasturlar
```bash
# Node.js va pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pnpm@8.15.0

# PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Nginx
apt-get install -y nginx

# Certbot (SSL uchun)
apt-get install -y certbot python3-certbot-nginx

# PM2 (process manager)
npm install -g pm2

# Git
apt-get install -y git
```

## Deployment Qadamlari

### 1. Serverga Kirish va Tayyorlash
```bash
ssh root@152.53.229.176

# Yangi foydalanuvchi yaratish (root emas)
adduser deploy
usermod -aG sudo deploy
su - deploy

# Proyektni klonlash
cd /var/www
git clone <your-repo-url> acoustic-uz
cd acoustic-uz
```

### 2. Environment Variables Sozlash
```bash
# .env faylini yaratish
cp .env.example .env
nano .env
```

**Production .env konfiguratsiyasi:**
```env
# Database
DATABASE_URL=postgresql://acoustic:STRONG_PASSWORD@localhost:5432/acoustic

# JWT Secrets (random stringlar generatsiya qiling)
JWT_ACCESS_SECRET=<generate-random-string>
JWT_REFRESH_SECRET=<generate-random-string>

# Node Environment
NODE_ENV=production

# Backend
PORT=3001
CORS_ORIGIN=https://news.acoustic.uz,https://admin.acoustic.uz
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Frontend
NEXT_PUBLIC_API_URL=https://api.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz

# Admin
VITE_API_URL=https://api.acoustic.uz/api

# Storage (local yoki S3)
STORAGE_DRIVER=local

# Telegram (ixtiyoriy)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# AmoCRM (ixtiyoriy)
AMOCRM_DOMAIN=
AMOCRM_CLIENT_ID=
AMOCRM_CLIENT_SECRET=
```

### 3. Database Sozlash
```bash
# PostgreSQL yaratish
sudo -u postgres psql
CREATE DATABASE acoustic;
CREATE USER acoustic WITH PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;
\q

# Migrations va seed
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed
```

### 4. Build Qilish
```bash
# Barcha paketlarni o'rnatish
pnpm install --frozen-lockfile

# Backend build
pnpm --filter @acoustic/backend build

# Frontend build
pnpm --filter @acoustic/frontend build

# Admin build
pnpm --filter @acoustic/admin build
```

### 5. PM2 bilan Ishga Tushirish

**Backend uchun PM2 config (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [
    {
      name: 'acoustic-backend',
      script: 'dist/apps/backend/src/main.js',
      cwd: '/var/www/acoustic-uz/apps/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/backend-error.log',
      out_file: '/var/log/pm2/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'acoustic-frontend',
      script: 'apps/frontend/server.js',
      cwd: '/var/www/acoustic-uz',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/frontend-error.log',
      out_file: '/var/log/pm2/frontend-out.log'
    }
  ]
};
```

**PM2 ni ishga tushirish:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # systemd ga qo'shish
```

### 6. Nginx Konfiguratsiyasi

**Frontend (`/etc/nginx/sites-available/news.acoustic.uz`):**
```nginx
server {
    listen 80;
    server_name news.acoustic.uz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Admin (`/etc/nginx/sites-available/admin.acoustic.uz`):**
```nginx
server {
    listen 80;
    server_name admin.acoustic.uz;

    root /var/www/acoustic-uz/apps/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**API (`/etc/nginx/sites-available/api.acoustic.uz`):**
```nginx
server {
    listen 80;
    server_name api.acoustic.uz;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads uchun static files
    location /uploads {
        alias /var/www/acoustic-uz/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Nginx ni faollashtirish:**
```bash
ln -s /etc/nginx/sites-available/news.acoustic.uz /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/admin.acoustic.uz /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/api.acoustic.uz /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 7. SSL Sertifikatlari (Let's Encrypt)
```bash
# Barcha domenlar uchun SSL
certbot --nginx -d news.acoustic.uz
certbot --nginx -d admin.acoustic.uz
certbot --nginx -d api.acoustic.uz

# Avtomatik yangilash
certbot renew --dry-run
```

### 8. File Permissions
```bash
# Uploads papkasi uchun
mkdir -p /var/www/acoustic-uz/uploads
chown -R deploy:deploy /var/www/acoustic-uz
chmod -R 755 /var/www/acoustic-uz/uploads
```

### 9. Firewall Sozlash
```bash
# UFW
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Bitta Domen Varianti (news.acoustic.uz)

Agar faqat bitta domen ishlatsangiz:

**Nginx konfiguratsiyasi:**
```nginx
server {
    listen 80;
    server_name news.acoustic.uz;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin {
        alias /var/www/acoustic-uz/apps/admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads {
        alias /var/www/acoustic-uz/uploads;
        expires 30d;
    }
}
```

**Environment variables:**
```env
NEXT_PUBLIC_API_URL=https://news.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://news.acoustic.uz
VITE_API_URL=https://news.acoustic.uz/api
CORS_ORIGIN=https://news.acoustic.uz
```

## Monitoring va Backup

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Database Backup (Cron)
```bash
# Crontab ga qo'shish
0 2 * * * pg_dump -U acoustic acoustic | gzip > /var/backups/acoustic_$(date +\%Y\%m\%d).sql.gz
```

## Xavfsizlik Checklist

- [ ] SSH key authentication (password emas)
- [ ] Firewall faollashtirilgan
- [ ] SSL sertifikatlari o'rnatilgan
- [ ] Strong database parollari
- [ ] JWT secrets random va uzun
- [ ] Regular backups
- [ ] PM2 auto-restart
- [ ] Nginx security headers
- [ ] Rate limiting faollashtirilgan

## Kamchiliklar va Yechimlar

### Bitta Domen Varianti Kamchiliklari:
1. **Admin panel xavfsizligi:** `/admin` path orqali kirish osonroq topiladi
2. **Cookie conflicts:** Frontend va admin bir xil domainda
3. **SEO:** Admin panel ham index qilinishi mumkin
4. **CORS:** API va frontend bir xil domainda bo'lsa ham, admin uchun alohida sozlash kerak

### Yechimlar:
- Admin panelga IP whitelist qo'shish
- robots.txt da `/admin` ni block qilish
- Admin panel uchun alohida cookie prefix ishlatish

## Post-Deployment Testlar

```bash
# Frontend
curl -I https://news.acoustic.uz

# Admin
curl -I https://admin.acoustic.uz

# API
curl https://api.acoustic.uz/api/health

# SSL
curl -I https://news.acoustic.uz
```

## Foydali Buyruqlar

```bash
# PM2
pm2 restart all
pm2 logs acoustic-backend
pm2 status

# Nginx
nginx -t
systemctl reload nginx
systemctl status nginx

# Database
sudo -u postgres psql acoustic
pg_dump -U acoustic acoustic > backup.sql

# Logs
tail -f /var/log/pm2/backend-out.log
tail -f /var/log/nginx/error.log
```

