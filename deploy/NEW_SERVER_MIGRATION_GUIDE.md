# Yangi Server Migration Qo'llanmasi

Bu qo'llanma yangi serverga to'liq migration qilish uchun step-by-step ko'rsatmalar beradi.

## 📋 Oldindan Tayyorgarlik

### Eski Serverdan Olish Kerak:
1. **Database backup** - PostgreSQL dump
2. **Uploads fayllari** - `/var/www/acoustic.uz/uploads/` directory
3. **Environment variables** - `.env` fayllar
4. **SSL sertifikatlar** (ixtiyoriy, yangi yaratish mumkin)

### Yangi Server Talablari:
- Ubuntu 22.04 LTS yoki yangiroq
- Minimum 4 GB RAM (8 GB tavsiya etiladi)
- Minimum 50 GB disk space
- Root yoki sudo access
- Domain name'lar DNS'da yangi server IP'ga yo'naltirilgan bo'lishi kerak

## 🚀 Step-by-Step Migration

### Step 1: Yangi Serverni Tayyorlash

```bash
# Yangi serverga SSH orqali ulaning
ssh root@YOUR_NEW_SERVER_IP

# Setup scriptini yuklab oling va ishga tushiring
wget https://raw.githubusercontent.com/tiuulugbek/acoustic-uz/main/deploy/new-server-setup.sh
chmod +x new-server-setup.sh
sudo bash new-server-setup.sh
```

Bu script quyidagilarni o'rnatadi:
- Node.js (LTS)
- pnpm
- PostgreSQL
- Nginx
- PM2
- Certbot (SSL uchun)

### Step 2: Database Setup

```bash
# Database setup scriptini ishga tushiring
cd /var/www/acoustic.uz
sudo bash deploy/setup-database.sh
```

Bu script:
- PostgreSQL user va database yaratadi
- `.env` fayl template yaratadi
- Database parolini so'raydi

### Step 3: Repository Clone

```bash
# Repository'ni clone qiling
cd /var/www/acoustic.uz
sudo -u acoustic git clone https://github.com/tiuulugbek/acoustic-uz.git .

# Yoki agar allaqachon clone qilingan bo'lsa
sudo -u acoustic git pull origin main
```

### Step 4: Database Migration

#### Variant A: Eski Serverdan Backup Olish

```bash
# Eski serverda backup yaratish
ssh root@OLD_SERVER_IP
cd /var/www/acoustic.uz
sudo -u postgres pg_dump -U acoustic acoustic_db > /tmp/acoustic_backup.sql

# Backup'ni yangi serverga ko'chirish
scp root@OLD_SERVER_IP:/tmp/acoustic_backup.sql /tmp/

# Yangi serverda restore qilish
cd /var/www/acoustic.uz
export PGPASSWORD="your_password"
psql -U acoustic -d acoustic_db < /tmp/acoustic_backup.sql
unset PGPASSWORD
```

#### Variant B: Migration Script Ishlatish

```bash
# Migration scriptini ishga tushiring
cd /var/www/acoustic.uz
sudo bash deploy/migrate-database.sh
```

Bu script:
- Eski serverdan avtomatik backup oladi
- Yangi serverga ko'chiradi
- Restore qiladi
- Migrations'ni ishga tushiradi

### Step 5: Uploads Fayllarini Ko'chirish

```bash
# Eski serverdan uploads'ni ko'chirish
# Variant 1: rsync (tavsiya etiladi)
rsync -avz --progress root@OLD_SERVER_IP:/var/www/acoustic.uz/uploads/ /var/www/acoustic.uz/uploads/

# Variant 2: tar + scp
ssh root@OLD_SERVER_IP "cd /var/www/acoustic.uz && tar czf /tmp/uploads.tar.gz uploads/"
scp root@OLD_SERVER_IP:/tmp/uploads.tar.gz /tmp/
cd /var/www/acoustic.uz
tar xzf /tmp/uploads.tar.gz
chown -R acoustic:acoustic uploads/
```

### Step 6: Environment Variables Sozlash

```bash
# .env faylni tahrirlash
cd /var/www/acoustic.uz
sudo nano .env

# Quyidagilarni yangilang:
# - DATABASE_URL (agar o'zgardi bo'lsa)
# - CORS_ORIGIN (yangi domain'lar)
# - JWT_SECRET (yangi secret generate qiling)
# - SMTP settings (agar o'zgardi bo'lsa)
# - Telegram settings (agar o'zgardi bo'lsa)
```

### Step 7: To'liq Deployment

```bash
# Barcha komponentlarni build qilish va ishga tushirish
cd /var/www/acoustic.uz
sudo bash deploy/deploy-to-new-server.sh
```

Bu script:
- Kodni yangilaydi
- Dependencies o'rnatadi
- Shared package build qiladi
- Database migrations ishga tushiradi
- Backend build qiladi
- Admin panel build qiladi
- Frontend build qiladi
- PM2 processes ishga tushiradi
- Nginx konfiguratsiyasini sozlaydi

### Step 8: Nginx Configuration

```bash
# Nginx konfiguratsiyasini sozlash
cd /var/www/acoustic.uz
sudo bash deploy/setup-nginx-config.sh
```

### Step 9: SSL Sertifikatlarni O'rnatish

```bash
# Certbot bilan SSL o'rnatish
sudo certbot --nginx \
  -d acoustic.uz \
  -d www.acoustic.uz \
  -d admin.acoustic.uz \
  -d a.acoustic.uz

# Auto-renewal test qilish
sudo certbot renew --dry-run
```

### Step 10: DNS Yo'naltirish

DNS'da quyidagi A record'larni yangi server IP'ga yo'naltiring:
- `acoustic.uz` → NEW_SERVER_IP
- `www.acoustic.uz` → NEW_SERVER_IP
- `admin.acoustic.uz` → NEW_SERVER_IP
- `a.acoustic.uz` → NEW_SERVER_IP

### Step 11: Test Qilish

```bash
# Backend test
curl https://a.acoustic.uz/api/settings?lang=uz

# Frontend test
curl -I https://acoustic.uz

# Admin panel test
curl -I https://admin.acoustic.uz

# PM2 status
pm2 status
pm2 logs

# Nginx status
sudo nginx -t
sudo systemctl status nginx
```

## 🔧 Troubleshooting

### Backend ishlamasa:

```bash
# Loglarni tekshiring
pm2 logs acoustic-backend

# Restart qiling
pm2 restart acoustic-backend

# Database connection tekshiring
psql -U acoustic -d acoustic_db -c "SELECT 1;"
```

### Frontend ishlamasa:

```bash
# Loglarni tekshiring
pm2 logs acoustic-frontend

# Build'ni qayta qiling
cd /var/www/acoustic.uz/apps/frontend
rm -rf .next
NEXT_PUBLIC_API_URL="https://a.acoustic.uz/api" pnpm exec next build
pm2 restart acoustic-frontend
```

### Nginx xatolari:

```bash
# Config test
sudo nginx -t

# Error loglar
sudo tail -f /var/log/nginx/error.log

# Access loglar
sudo tail -f /var/log/nginx/access.log
```

## 📊 Performance Optimization

### 1. Nginx Caching

Nginx config'ga caching qo'shing:
```nginx
# Static files caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 2. PM2 Cluster Mode

Backend uchun cluster mode:
```bash
pm2 delete acoustic-backend
pm2 start dist/main.js --name acoustic-backend -i max
```

### 3. Database Optimization

PostgreSQL tuning:
```sql
-- Connection pool
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

## 🔐 Security Checklist

- [ ] Firewall sozlangan (UFW)
- [ ] SSH key authentication
- [ ] Fail2ban o'rnatilgan
- [ ] SSL sertifikatlar o'rnatilgan
- [ ] Database parollari kuchli
- [ ] Environment variables xavfsiz
- [ ] File permissions to'g'ri
- [ ] Regular backups sozlangan

## 📝 Post-Migration

1. **Monitoring sozlash**
   - PM2 monitoring
   - Nginx access logs
   - Database monitoring

2. **Backup automation**
   - Database backup script
   - Uploads backup script
   - Cron jobs sozlash

3. **Performance monitoring**
   - Server resources
   - Response times
   - Error rates

## 🆘 Yordam

Agar muammo yuzaga kelsa:
1. Loglarni tekshiring (`pm2 logs`, `nginx error.log`)
2. Service status'ni tekshiring (`pm2 status`, `systemctl status`)
3. Database connection'ni tekshiring
4. Network connectivity'ni tekshiring

