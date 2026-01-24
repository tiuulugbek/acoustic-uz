# Topilgan Muammolar va Yechimlar

## 1. ❌ Backend ishlamayapti

**Muammo:**
- Port 3001 bo'sh
- PM2 process'lar yo'q
- Systemd service ishlamayapti

**Yechim:**
```bash
# PM2 orqali ishga tushirish
cd /var/www/acoustic.uz
pm2 start deploy/ecosystem.config.js --only acoustic-backend

# Yoki systemd service orqali
systemctl start pm2-acoustic
```

## 2. ❌ Database ulanish xatolik

**Muammo:**
- PostgreSQL process ishlayapti
- Port 5432 bo'sh (socket orqali ishlayotgan bo'lishi mumkin)
- Connection string'da muammo bo'lishi mumkin

**Yechim:**
```bash
# PostgreSQL port'ni tekshirish
netstat -tlnp | grep 5432
# Yoki
ss -tlnp | grep 5432

# PostgreSQL config'ni tekshirish
cat /etc/postgresql/*/main/postgresql.conf | grep -E "port|listen_addresses"

# Connection test
PGPASSWORD='Acoustic##4114' psql -h localhost -U acoustic_user -d acousticwebdb -c "SELECT 1;"

# Agar socket orqali ishlayotgan bo'lsa
psql -h /var/run/postgresql -U acoustic_user -d acousticwebdb -c "SELECT 1;"
```

**Connection string'ni to'g'rilash:**
- Agar socket orqali ishlayotgan bo'lsa: `postgresql://user:pass@/dbname?host=/var/run/postgresql`
- Yoki port'ni to'g'rilash: `postgresql://user:pass@localhost:5432/dbname`

## 3. ⚠️ Frontend ishlamayapti

**Muammo:**
- Port 3000, 3002 bo'sh
- Systemd service mavjud, lekin ishlamayapti

**Yechim:**
```bash
# PM2 orqali ishga tushirish
cd /var/www/acoustic.uz
pm2 start deploy/ecosystem.config.js --only acoustic-frontend

# Yoki systemd service orqali
systemctl start pm2-acoustic
```

## 4. ⚠️ Nginx

**Muammo:**
- Permission muammosi
- Config to'g'ri

**Yechim:**
```bash
# Nginx'ni ishga tushirish (root user sifatida)
systemctl start nginx

# Permission muammosini hal qilish
chown -R www-data:www-data /var/log/nginx
chmod 755 /var/log/nginx
```

## 5. ⚠️ Systemd service

**Muammo:**
- Service fayl mavjud
- Sudo ishlamayapti (root user sifatida ishlatish kerak)

**Yechim:**
```bash
# Service'ni qayta o'rnatish (root user sifatida)
cp /root/acoustic.uz/deploy/pm2-acoustic.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable pm2-acoustic
systemctl start pm2-acoustic

# Monitor timer'ni ham o'rnatish
cp /root/acoustic.uz/deploy/pm2-acoustic-monitor.service /etc/systemd/system/
cp /root/acoustic.uz/deploy/pm2-acoustic-monitor.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable pm2-acoustic-monitor.timer
systemctl start pm2-acoustic-monitor.timer
```

## Barcha muammolarni hal qilish

```bash
# 1. Database connection'ni to'g'rilash
# .env faylini tekshirish va to'g'rilash

# 2. Backend va Frontend'ni ishga tushirish
cd /var/www/acoustic.uz
pm2 start deploy/ecosystem.config.js

# 3. Systemd service'ni o'rnatish
/root/acoustic.uz/scripts/setup-systemd-service.sh

# 4. Nginx'ni ishga tushirish
systemctl start nginx

# 5. Tekshirish
/root/acoustic.uz/scripts/full-system-check.sh
```
