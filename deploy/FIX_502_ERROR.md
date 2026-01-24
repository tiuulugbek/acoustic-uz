# 502 Bad Gateway Muammosini Hal Qilish

## Muammo

Frontend ishlamayapti - `GET https://acoustic.uz/patients 502 (Bad Gateway)`

## Sabab

1. **Frontend ishlamayapti** - Port 3002 da process yo'q
2. **Port permission muammosi** - Port 3002 da EPERM xatosi

## Yechim

### Variant 1: Frontend ni boshqa portda ishga tushirish

```bash
cd /root/acoustic.uz/apps/frontend
PORT=3003 NODE_ENV=production \
NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api \
NEXT_PUBLIC_SITE_URL=https://acoustic.uz \
node_modules/.bin/next start > /tmp/pm2-logs/frontend-out.log 2> /tmp/pm2-logs/frontend-err.log &
```

Keyin nginx konfiguratsiyasini yangilash:
```nginx
proxy_pass http://localhost:3003;
```

### Variant 2: Port 3002 permission muammosini hal qilish

```bash
# Port 3002 ni ishlatayotgan processni topish
lsof -i :3002
fuser 3002/tcp

# Processni o'chirish
fuser -k 3002/tcp

# Yoki
pkill -9 -f "node.*3002"
```

### Variant 3: PM2 orqali ishga tushirish (agar permission muammosi hal qilingan bo'lsa)

```bash
cd /root/acoustic.uz
pm2 start deploy/ecosystem.config.js --only acoustic-frontend
```

## Tekshirish

```bash
# Frontend process
ps aux | grep "next\|node.*300"

# HTTP test
curl -I http://localhost:3002
# yoki
curl -I http://localhost:3003

# Loglar
tail -f /tmp/pm2-logs/frontend-out.log
tail -f /tmp/pm2-logs/frontend-err.log
```

## Nginx konfiguratsiyasini yangilash

Agar frontend boshqa portda ishlayotgan bo'lsa, nginx konfiguratsiyasini yangilash kerak:

```bash
# Nginx konfiguratsiyasini topish
find /etc/nginx -name "*acoustic*"

# Konfiguratsiyani tahrirlash
sudo nano /etc/nginx/sites-enabled/acoustic.uz

# proxy_pass ni yangilash
proxy_pass http://localhost:3003;  # yoki 3002

# Nginx ni reload qilish
sudo nginx -t
sudo systemctl reload nginx
```

## Keyingi qadamlar

1. Frontend ni ishga tushirish
2. Nginx konfiguratsiyasini tekshirish va yangilash
3. Nginx ni reload qilish
4. Browserda test qilish
