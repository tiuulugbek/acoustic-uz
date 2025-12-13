# DigitalOcean Server Setup Guide

## 🎯 DigitalOcean Droplet Tavsiyalari

### Minimal Konfiguratsiya (Kichik trafik uchun)
```
Droplet Type: Basic
Plan: Regular Intel
CPU: 2 vCPU
RAM: 2 GB
Storage: 30 GB SSD
Bandwidth: 2 TB
Price: ~$12/oy
```

### Tavsiya Etilgan Konfiguratsiya (O'rtacha trafik uchun) ⭐
```
Droplet Type: Basic
Plan: Regular Intel
CPU: 4 vCPU
RAM: 4 GB
Storage: 50 GB SSD
Bandwidth: 4 TB
Price: ~$24/oy
```

### Optimal Konfiguratsiya (Yuqori trafik uchun)
```
Droplet Type: Basic
Plan: Regular Intel
CPU: 8 vCPU
RAM: 8 GB
Storage: 80 GB SSD
Bandwidth: 5 TB
Price: ~$48/oy
```

## 📋 Qadam-baqadam Ko'rsatma

### 1. Droplet Yaratish

#### Step 1: Choose an image
```
✅ Ubuntu 22.04 (LTS) x64
   yoki
✅ Ubuntu 20.04 (LTS) x64
```

#### Step 2: Choose a plan
```
✅ Basic
✅ Regular Intel (yoki Premium Intel)
✅ CPU va RAM: yuqoridagi tavsiyalardan birini tanlang
```

#### Step 3: Choose a datacenter region
```
Tavsiya: Amsterdam, Netherlands (yoki sizga yaqin region)
   - Yevropa: Amsterdam, Frankfurt, London
   - AQSH: New York, San Francisco
   - Osiyo: Singapore, Bangalore
```

#### Step 4: Authentication
```
✅ SSH keys (tavsiya etiladi)
   yoki
✅ Password (keyin o'zgartirish kerak)
```

#### Step 5: Finalize
```
Hostname: acoustic-uz (yoki istalgan nom)
✅ Enable Monitoring
✅ Enable IPv6 (ixtiyoriy)
```

### 2. Server Sozlash

#### SSH orqali ulanish
```bash
ssh root@YOUR_SERVER_IP
```

#### Dastlabki sozlash
```bash
# System update
apt update && apt upgrade -y

# Asosiy dasturlar
apt install -y curl wget git build-essential

# Node.js 18.x LTS o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# pnpm o'rnatish
npm install -g pnpm@8

# PostgreSQL o'rnatish
apt install -y postgresql postgresql-contrib

# Nginx o'rnatish
apt install -y nginx

# PM2 o'rnatish
npm install -g pm2

# Firewall sozlash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. Database Sozlash

```bash
# PostgreSQL user yaratish
sudo -u postgres psql
CREATE DATABASE acoustic;
CREATE USER acoustic_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic_user;
\q
```

### 4. Application Deployment

```bash
# Project klonlash
cd /var/www
git clone https://github.com/tiuulugbek/acoustic-uz.git
cd acoustic-uz

# Dependencies o'rnatish
pnpm install

# Environment variables sozlash
# Backend
cd apps/backend
cp .env.example .env
nano .env  # Database va boshqa sozlamalarni kiriting

# Frontend
cd ../frontend
cp .env.example .env.local
nano .env.local  # API URL va boshqa sozlamalarni kiriting

# Database migrations
cd ../..
pnpm --filter @acoustic/backend db:migrate:deploy

# Build
pnpm build

# PM2 orqali ishga tushirish
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Auto-start sozlash
```

### 5. Nginx Sozlash

```bash
# Nginx config yaratish
sudo nano /etc/nginx/sites-available/acoustic.uz
```

**Nginx Configuration:**
```nginx
# Frontend (acoustic.uz)
server {
    listen 80;
    server_name acoustic.uz www.acoustic.uz;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API (a.acoustic.uz)
server {
    listen 80;
    server_name a.acoustic.uz;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads {
        alias /var/www/acoustic.uz/apps/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Admin Panel (admin.acoustic.uz)
server {
    listen 80;
    server_name admin.acoustic.uz;
    
    location / {
        proxy_pass http://localhost:3002;  # Admin port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/acoustic.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Sertifikat (Let's Encrypt)

```bash
# Certbot o'rnatish
apt install -y certbot python3-certbot-nginx

# SSL sertifikat olish
certbot --nginx -d acoustic.uz -d www.acoustic.uz -d a.acoustic.uz -d admin.acoustic.uz

# Auto-renewal sozlash
certbot renew --dry-run
```

## 💰 Narxlar (2024)

### Minimal (2 GB RAM, 2 vCPU)
- **Narx**: $12/oy yoki $0.018/soat
- **Yillik**: ~$144
- **Traffic**: 2 TB

### Tavsiya Etilgan (4 GB RAM, 4 vCPU) ⭐
- **Narx**: $24/oy yoki $0.036/soat
- **Yillik**: ~$288
- **Traffic**: 4 TB

### Optimal (8 GB RAM, 8 vCPU)
- **Narx**: $48/oy yoki $0.072/soat
- **Yillik**: ~$576
- **Traffic**: 5 TB

## 🔧 Qo'shimcha Sozlamalar

### Monitoring
DigitalOcean'da built-in monitoring mavjud:
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

### Backups
```
✅ Enable Automatic Backups
   Narx: +20% (masalan, $24 → $28.80/oy)
   Frequency: Daily
   Retention: 7 days
```

### Firewall Rules
DigitalOcean Firewall'da:
```
Inbound Rules:
- HTTP (80) - Allow
- HTTPS (443) - Allow
- SSH (22) - Allow (faqat IP whitelist)

Outbound Rules:
- All - Allow
```

## 📊 Performance Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### System Monitoring
```bash
# CPU va RAM
htop

# Disk usage
df -h

# Network
iftop
```

## 🚀 Deployment Script

Quyidagi scriptni server'ga yuklab, bajarish mumkin:

```bash
#!/bin/bash
# DigitalOcean deployment script

set -e

echo "🚀 Starting deployment..."

# System update
apt update && apt upgrade -y

# Install dependencies
apt install -y curl wget git build-essential

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm@8

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

echo "✅ Server setup complete!"
```

## ✅ Checklist

### DigitalOcean Droplet
- [ ] Ubuntu 22.04 LTS tanlangan
- [ ] 4 GB RAM, 4 vCPU (tavsiya etilgan)
- [ ] 50 GB SSD disk
- [ ] SSH key qo'shilgan
- [ ] Monitoring yoqilgan
- [ ] Backups yoqilgan (ixtiyoriy)

### Server Setup
- [ ] Node.js 18.x o'rnatilgan
- [ ] pnpm o'rnatilgan
- [ ] PostgreSQL o'rnatilgan va sozlangan
- [ ] Nginx o'rnatilgan
- [ ] PM2 o'rnatilgan
- [ ] Firewall sozlangan

### Application
- [ ] Code klonlangan
- [ ] Dependencies o'rnatilgan
- [ ] Environment variables sozlangan
- [ ] Database migrations bajarilgan
- [ ] Build qilingan
- [ ] PM2 orqali ishga tushirilgan

### Nginx
- [ ] Virtual hosts sozlangan
- [ ] SSL sertifikat olingan
- [ ] Nginx restart qilingan

## 🎯 Xulosa

**Tavsiya Etilgan Konfiguratsiya:**
- **Droplet**: 4 GB RAM, 4 vCPU, 50 GB SSD
- **Narx**: ~$24/oy
- **OS**: Ubuntu 22.04 LTS
- **Region**: Amsterdam yoki sizga yaqin

Bu konfiguratsiya o'rtacha trafik uchun yetarli va yaxshi performance beradi.

