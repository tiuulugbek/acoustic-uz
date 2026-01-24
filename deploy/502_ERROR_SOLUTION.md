# 502 Bad Gateway - Yechim

## Muammo

- `GET https://acoustic.uz/patients 502 (Bad Gateway)`
- Frontend ishlamayapti
- Barcha portlarda (3000, 3002, 3003) EPERM xatosi

## Sabab

Port permission muammosi - Node.js processlar portlarni ochishga ruxsat olmayapti. Bu quyidagilar bo'lishi mumkin:
1. SELinux/AppArmor muammosi
2. Network namespace muammosi  
3. Container/chroot muammosi
4. System-level port restriction

## Yechim

### 1. System-level tekshirish

```bash
# SELinux status
getenforce

# Agar SELinux enabled bo'lsa, Node.js ga ruxsat berish
setsebool -P httpd_can_network_connect 1
```

### 2. PM2 orqali ishga tushirish (agar permission muammosi hal qilingan bo'lsa)

PM2 ba'zida permission muammosini hal qiladi:

```bash
cd /root/acoustic.uz

# PM2 daemon ni to'liq tozalash
pkill -9 -f "PM2.*God Daemon"
rm -rf /root/.pm2
mkdir -p /root/.pm2
chmod 755 /root/.pm2

# Frontend ni PM2 orqali ishga tushirish
pm2 start deploy/ecosystem.config.js --only acoustic-frontend
pm2 save
```

### 3. Systemd service sifatida ishga tushirish

```bash
# Systemd service yaratish
sudo nano /etc/systemd/system/acoustic-frontend.service
```

Service fayli:
```ini
[Unit]
Description=Acoustic Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/acoustic.uz/apps/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
Environment=NEXT_PUBLIC_SITE_URL=https://acoustic.uz
ExecStart=/usr/bin/node /root/acoustic.uz/apps/frontend/node_modules/.bin/next start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Keyin:
```bash
sudo systemctl daemon-reload
sudo systemctl enable acoustic-frontend
sudo systemctl start acoustic-frontend
sudo systemctl status acoustic-frontend
```

### 4. Nginx konfiguratsiyasini tekshirish

Nginx port 3000 ni kutmoqda. Agar frontend boshqa portda ishlayotgan bo'lsa:

```bash
# Nginx konfiguratsiyasini tahrirlash
sudo nano /etc/nginx/sites-available/acoustic.uz.conf

# proxy_pass ni yangilash (agar kerak bo'lsa)
proxy_pass http://localhost:3000;  # yoki boshqa port

# Nginx ni reload qilish
sudo nginx -t
sudo systemctl reload nginx
```

## Tekshirish

```bash
# Frontend process
ps aux | grep "next\|node.*3000"

# HTTP test
curl -I http://localhost:3000

# Nginx error loglar
sudo tail -f /var/log/nginx/acoustic.uz.error.log

# Systemd loglar (agar systemd ishlatilsa)
sudo journalctl -u acoustic-frontend -f
```

## Keyingi qadamlar

1. System-level permission muammosini hal qilish (SELinux/AppArmor)
2. Frontend ni systemd service sifatida ishga tushirish (tavsiya etiladi)
3. Nginx konfiguratsiyasini tekshirish
4. Browserda test qilish

## Muammo davom etsa

Agar muammo davom etsa, server administrator bilan bog'lanish kerak - bu system-level permission muammosi bo'lishi mumkin.
