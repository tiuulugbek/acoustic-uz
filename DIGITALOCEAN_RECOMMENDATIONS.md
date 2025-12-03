# DigitalOcean Server Tavsiyalari - acoustic-uz

## Loyiha Talablari

Sizning loyihangiz quyidagi komponentlarni o'z ichiga oladi:
- **Frontend**: Next.js (Node.js)
- **Backend**: NestJS (Node.js)
- **Admin Panel**: React/Vite
- **Database**: PostgreSQL
- **Cache**: Redis (ixtiyoriy)
- **Reverse Proxy**: Nginx
- **File Storage**: Uploads folder

## Tavsiya Etilgan Variantlar

### Variant 1: Droplet (Tavsiya Etiladi) ⭐

**Qanday olish:**
1. DigitalOcean dashboard'da **"Create"** tugmasini bosing
2. **"Droplets"** ni tanlang
3. Quyidagi sozlamalarni tanlang:

**ENG ARZON VARIANT (Boshlang'ich uchun) 💰:**
- **Plan**: Regular (Shared CPU)
- **CPU**: 1 vCPU
- **RAM**: 2 GB
- **Storage**: 50 GB SSD
- **Region**: Amsterdam yoki Frankfurt (Yevropa - O'zbekistonga yaqin)
- **Image**: Ubuntu 22.04 LTS
- **Authentication**: SSH keys (xavfsirroq) yoki Password
- **Monthly Cost**: ~$12/oy (~$0.018/soat)
- ⚠️ **Optimizatsiya kerak** (quyida ko'rsatilgan)

**Minimum Tavsiya:**
- **Plan**: Regular (Shared CPU)
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Storage**: 80 GB SSD
- **Region**: Amsterdam yoki Frankfurt (Yevropa - O'zbekistonga yaqin)
- **Image**: Ubuntu 22.04 LTS
- **Authentication**: SSH keys (xavfsizroq) yoki Password
- **Monthly Cost**: ~$24/oy (~$0.036/soat)

**Optimal Tavsiya (Production uchun):**
- **Plan**: Regular (Shared CPU)
- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Storage**: 160 GB SSD
- **Region**: Amsterdam yoki Frankfurt
- **Image**: Ubuntu 22.04 LTS
- **Monthly Cost**: ~$48/oy (~$0.072/soat)

**Nima uchun bu variant:**
✅ Barcha servislarni bitta serverda ishlatish mumkin (Docker Compose bilan)
✅ Narxi arzon
✅ To'liq nazorat
✅ Docker bilan oson deployment
✅ Keyinchalik kengaytirish mumkin

**Kamchiliklari:**
⚠️ Database backup'ni o'zingiz sozlash kerak
⚠️ Server boshqaruvini o'zingiz qilish kerak

---

### Variant 2: App Platform (Oson, Lekin Qimmatroq)

**Qanday olish:**
1. **"Create"** → **"App Platform"**
2. GitHub repository'ni ulash
3. Avtomatik build va deployment

**Narxi**: ~$12-25/oy (asosiy plan) + Database uchun alohida

**Nima uchun bu variant:**
✅ Avtomatik deployment
✅ SSL sertifikat avtomatik
✅ Scaling oson
✅ Monitoring built-in

**Kamchiliklari:**
⚠️ Qimmatroq
⚠️ Docker Compose bilan to'liq mos emas
⚠️ Har bir servis uchun alohida sozlash kerak

---

### Variant 3: Droplet + Managed Database (Production uchun eng yaxshi)

**Qanday olish:**
1. **"Create"** → **"Droplets"** (2 vCPU, 4 GB RAM, ~$24/oy)
2. **"Create"** → **"Databases"** → PostgreSQL
   - **Plan**: Basic
   - **RAM**: 1 GB (minimum) yoki 2 GB (tavsiya)
   - **Storage**: 10 GB (minimum) yoki 25 GB (tavsiya)
   - **Monthly Cost**: ~$15-30/oy

**Jami narxi**: ~$39-54/oy

**Nima uchun bu variant:**
✅ Database backup avtomatik
✅ Database performance yaxshiroq
✅ Scaling oson
✅ Xavfsizlik yaxshiroq

**Kamchiliklari:**
⚠️ Narxi biroz yuqori
⚠️ Ikki xil resursni boshqarish kerak

---

## Menimcha Tavsiyam

**Boshlang'ich uchun: Variant 1 (Droplet - 4 GB RAM)**

Nega:
1. **Narxi arzon** - $24-48/oy
2. **Docker Compose** bilan barcha servislarni bitta joyda ishlatish mumkin
3. **Oson deployment** - sizda allaqachon docker-compose.yml bor
4. **Keyinchalik kengaytirish** mumkin

**Qanday olish:**

1. DigitalOcean'da **"Create"** → **"Droplets"**
2. Quyidagilarni tanlang:
   - **Region**: Amsterdam (AMS3) yoki Frankfurt (FRA1)
   - **Image**: Ubuntu 22.04 (LTS) x64
   - **Plan**: 
     - **Regular** → **Basic** → **$24/oy** (2 vCPU, 4 GB RAM, 80 GB SSD)
     - Yoki **$48/oy** (4 vCPU, 8 GB RAM, 160 GB SSD) - production uchun yaxshiroq
   - **Authentication**: SSH keys (tavsiya) yoki Password
   - **Hostname**: `acoustic-uz-server`
   - **Tags**: `production`, `acoustic-uz`
3. **"Create Droplet"** tugmasini bosing

**Keyingi qadamlar:**
1. Serverga SSH orqali ulanish
2. Docker va Docker Compose o'rnatish
3. Loyihani yuklash va docker-compose up qilish

---

## Qo'shimcha Resurslar Kerak Bo'lishi Mumkin

### 1. Domain Name (Domain DNS)
- **"Create"** → **"Domains/DNS"**
- `acoustic.uz` domain'ini qo'shing
- DNS record'larini sozlang

### 2. Spaces Object Storage (Rasmlar uchun)
- **"Create"** → **"Spaces Object Storage"**
- Upload qilingan rasmlar uchun
- **Narxi**: ~$5/oy (250 GB)

### 3. Load Balancer (Agar trafik ko'p bo'lsa)
- **"Create"** → **"Load Balancers"**
- Bir nechta serverlar uchun
- **Narxi**: ~$12/oy

---

## Xavfsizlik Sozlamalari

1. **Firewall** sozlash:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 3001 (Backend) - faqat ichki tarmoq

2. **Fail2ban** o'rnatish (SSH hujumlaridan himoya)

3. **SSL sertifikat** (Let's Encrypt - bepul)

---

## Deployment Qadamlar

Server olingandan keyin:

```bash
# 1. Serverga ulanish
ssh root@YOUR_SERVER_IP

# 2. Docker o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Docker Compose o'rnatish
apt-get update
apt-get install docker-compose-plugin

# 4. Loyihani klonlash yoki yuklash
git clone YOUR_REPO_URL
cd acoustic-uz

# 5. Environment variables sozlash
cp .env.example .env
nano .env

# 6. Docker Compose bilan ishga tushirish
docker compose up -d

# 7. Migration'lar
docker compose exec backend pnpm db:migrate
docker compose exec backend pnpm db:seed
```

---

## Arzon Variant uchun Optimizatsiya Qadamlar

Agar **$12/oy** (1 vCPU, 2 GB RAM) variantini tanlasangiz, quyidagi optimizatsiyalarni qilish kerak:

### 1. Redis'ni O'chirish (Ixtiyoriy)
Redis cache ixtiyoriy, uni o'chirib RAM tejash mumkin:

```yaml
# docker-compose.yml dan redis servisini olib tashlang
# Yoki environment variable'da REDIS_URL ni o'chiring
```

### 2. Docker Compose Optimizatsiyasi
Memory limit'lar qo'shing:

```yaml
services:
  postgres:
    mem_limit: 512m
    mem_reservation: 256m
  
  backend:
    mem_limit: 512m
    mem_reservation: 256m
  
  frontend:
    mem_limit: 256m
    mem_reservation: 128m
  
  admin:
    mem_limit: 128m
    mem_reservation: 64m
  
  nginx:
    mem_limit: 64m
    mem_reservation: 32m
```

### 3. PostgreSQL Optimizatsiyasi
PostgreSQL config'ni optimizatsiya qiling:

```bash
# /etc/postgresql/15/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 512MB
maintenance_work_mem = 64MB
work_mem = 4MB
```

### 4. Swap File Qo'shish
Agar RAM yetmasa, swap file qo'shing:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5. Admin Panelni Static File sifatida Serve Qilish
Admin panelni Docker emas, balki Nginx orqali static file sifatida serve qiling:

```bash
# Local'da build qiling
cd apps/admin
pnpm build

# Serverga yuklang va Nginx'da sozlang
# Docker container o'rniga static files
```

### 6. Frontend'ni Standalone Build Qilish
Next.js standalone build ishlatib, hajmini kamaytiring:

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  // ...
}
```

---

## Xulosa

**Eng Arzon Variant (Optimizatsiya bilan):**
- **Droplet**: 1 vCPU, 2 GB RAM, 50 GB SSD (~$12/oy)
- **Region**: Amsterdam yoki Frankfurt
- **OS**: Ubuntu 22.04 LTS
- ⚠️ **Optimizatsiya qilish kerak** (yuqoridagi qadamlar)

**Tavsiya Etilgan Variant:**
- **Droplet**: 2 vCPU, 4 GB RAM, 80 GB SSD (~$24/oy)
- **Region**: Amsterdam yoki Frankfurt
- **OS**: Ubuntu 22.04 LTS

**Production uchun Optimal:**
- **Droplet**: 4 vCPU, 8 GB RAM, 160 GB SSD (~$48/oy)
- **Region**: Amsterdam yoki Frankfurt
- **OS**: Ubuntu 22.04 LTS

**Menimcha tavsiyam:** Agar budjet cheklangan bo'lsa, **$12/oy** variantini optimizatsiya qilib ishlatish mumkin, lekin trafik ko'payganda **$24/oy** variantiga o'tishni tavsiya qilaman.

