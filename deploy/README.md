# Production Deployment Guide

## Domenlar
- **Frontend:** https://news.acoustic.uz
- **Backend API:** https://api.acoustic.uz
- **Admin Panel:** https://admins.acoustic.uz

## Server IP
- **IP:** 152.53.229.176
- **SSH:** `ssh root@152.53.229.176`

## Deployment Qadamlari

### 1. Serverga Kirish va Tayyorlash

```bash
ssh root@152.53.229.176
```

### 2. Server Setup Scriptini Ishga Tushirish

```bash
# Scriptni yuklab oling yoki serverga ko'chiring
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh
```

Bu script quyidagilarni o'rnatadi:
- Node.js 18.x
- pnpm 8.15.0
- PostgreSQL
- Nginx
- Certbot (SSL)
- PM2
- Git
- Deploy user yaratadi

### 3. PostgreSQL Parolini O'zgartirish

```bash
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'YANGI_KUCHLI_PAROL';
\q
```

### 4. Deploy User ga O'tish

```bash
su - deploy
```

### 5. Repository ni Klonlash

```bash
cd /var/www
git clone <your-repo-url> news.acoustic.uz
cd news.acoustic.uz
```

### 6. Environment Variables Sozlash

```bash
cp deploy/.env.production .env
nano .env
```

**Muhim o'zgartirishlar:**
- `DATABASE_URL` - PostgreSQL parolini yangilang
- `JWT_ACCESS_SECRET` - Random string generatsiya qiling
- `JWT_REFRESH_SECRET` - Random string generatsiya qiling

**JWT Secret generatsiya qilish:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 7. Deployment Scriptini Ishga Tushirish

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

Bu script:
- Dependencies o'rnatadi
- Database migrations ishlatadi
- Barcha app'larni build qiladi
- Admin build'ni `/var/www/admins.acoustic.uz` ga ko'chiradi
- PM2 ni sozlaydi
- Nginx ni sozlaydi

### 8. SSL Sertifikatlari O'rnatish

```bash
sudo certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz
```

### 9. DNS Sozlash

DNS provider'da quyidagi A record'larni qo'shing:

```
Type: A
Name: news
Value: 152.53.229.176
TTL: 3600

Type: A
Name: api
Value: 152.53.229.176
TTL: 3600

Type: A
Name: admins
Value: 152.53.229.176
TTL: 3600
```

### 10. Tekshirish

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs

# Nginx status
sudo systemctl status nginx

# Test URLs
curl -I https://news.acoustic.uz
curl -I https://api.acoustic.uz/api
curl -I https://admins.acoustic.uz
```

## Yangilash (Update)

```bash
cd /var/www/news.acoustic.uz
git pull origin main
pnpm install --frozen-lockfile
pnpm --filter @acoustic/backend build
pnpm --filter @acoustic/frontend build
pnpm --filter @acoustic/admin build
rm -rf /var/www/admins.acoustic.uz/dist
cp -r apps/admin/dist /var/www/admins.acoustic.uz/dist
pm2 restart all
```

## Database Backup

```bash
# Manual backup
pg_dump -U acoustic acoustic | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup_20241130.sql.gz | psql -U acoustic acoustic
```

## Loglar

```bash
# PM2 logs
pm2 logs acoustic-backend
pm2 logs acoustic-frontend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PM2 log files
tail -f /var/log/pm2/acoustic-backend-out.log
tail -f /var/log/pm2/acoustic-frontend-out.log
```

## Xavfsizlik Checklist

- [x] SSH key authentication
- [x] Firewall faollashtirilgan (80, 443, 22)
- [x] SSL sertifikatlari o'rnatilgan
- [x] Strong database paroli
- [x] JWT secrets random va uzun
- [x] PM2 auto-restart
- [x] Nginx security headers
- [x] Rate limiting faollashtirilgan

## Troubleshooting

### PM2 ishlamayapti
```bash
pm2 restart all
pm2 logs
```

### Nginx xatosi
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Database ulanish muammosi
```bash
sudo -u postgres psql -c "\l"  # Database ro'yxati
sudo systemctl status postgresql
```

### Port band
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

## Foydali Buyruqlar

```bash
# PM2
pm2 restart all
pm2 stop all
pm2 delete all
pm2 monit

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx

# Database
sudo -u postgres psql acoustic
pg_dump -U acoustic acoustic > backup.sql

# Logs
pm2 logs --lines 100
sudo journalctl -u nginx -f
```


