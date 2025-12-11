# Arzon Server Optimizatsiya Qo'llanmasi

Bu qo'llanma **$12/oy** (1 vCPU, 2 GB RAM) serverda loyihani ishlatish uchun optimizatsiya qadamlarini ko'rsatadi.

## Qadam 1: Optimizatsiya Qilingan Docker Compose

`docker-compose.optimized.yml` faylidan foydalaning:

```bash
# Optimizatsiya qilingan versiyani ishga tushiring
docker compose -f docker-compose.optimized.yml up -d
```

**O'zgarishlar:**
- ✅ Redis o'chirilgan (RAM tejash)
- ✅ Har bir servis uchun memory limit qo'shilgan
- ✅ PostgreSQL optimizatsiya qilingan
- ✅ Node.js memory limit qo'shilgan

## Qadam 2: Swap File Qo'shish

Agar RAM yetmasa, swap file qo'shing:

```bash
# Serverga SSH orqali ulaning
ssh root@YOUR_SERVER_IP

# Swap file yaratish (2 GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Avtomatik yoqilish uchun
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Tekshirish
free -h
```

## Qadam 3: PostgreSQL Optimizatsiyasi

PostgreSQL config'ni optimizatsiya qiling:

```bash
# PostgreSQL config faylini topish
docker compose exec postgres psql -U acoustic -c "SHOW config_file;"

# Yoki Docker container ichida:
docker compose exec postgres sh

# postgresql.conf faylini tahrirlash
# Quyidagi qatorlarni qo'shing yoki o'zgartiring:
shared_buffers = 128MB
effective_cache_size = 256MB
maintenance_work_mem = 32MB
work_mem = 2MB
max_connections = 50
```

**Eslatma:** `docker-compose.optimized.yml` da bu sozlamalar allaqachon qo'shilgan.

## Qadam 4: Admin Panelni Static File sifatida Serve Qilish

Admin panelni Docker container o'rniga Nginx orqali static file sifatida serve qiling:

### Local'da Build Qilish:

```bash
cd apps/admin
pnpm install
pnpm build
```

### Serverga Yuklash:

```bash
# Build qilingan fayllarni serverga yuklang
rsync -avz --progress \
    apps/admin/dist/ \
    root@YOUR_SERVER_IP:/var/www/acoustic-uz/admin/
```

### Nginx Sozlash:

```nginx
# /etc/nginx/sites-available/admin.acoustic.uz
server {
    listen 80;
    server_name admin.acoustic.uz;
    root /var/www/acoustic-uz/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Keyin Docker Compose'dan admin servisini olib tashlang.

## Qadam 5: Frontend Standalone Build

Frontend'ni standalone build qiling (hajmni kamaytirish):

```javascript
// apps/frontend/next.config.js
module.exports = {
  output: 'standalone',
  // ... boshqa sozlamalar
}
```

Build qilingan fayllar `.next/standalone` papkasida bo'ladi.

## Qadam 6: Memory Monitoring

Server resurslarini kuzatish:

```bash
# Docker container'lar memory ishlatishini ko'rish
docker stats

# Umumiy memory
free -h

# Disk hajmi
df -h

# CPU ishlatish
top
```

## Qadam 7: Qo'shimcha Optimizatsiyalar

### Docker Image'larini Tozalash:

```bash
# Ishlatilmayotgan image'larni o'chirish
docker image prune -a

# Ishlatilmayotgan container'larni o'chirish
docker container prune

# Ishlatilmayotgan volume'larni o'chirish
docker volume prune
```

### Log Rotation:

```bash
# Docker log rotation sozlash
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Nginx Cache:

```nginx
# Static file'lar uchun cache
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Xavfsizlik Optimizatsiyasi

### Firewall:

```bash
# UFW o'rnatish va sozlash
sudo apt install ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2ban:

```bash
# SSH hujumlaridan himoya
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Monitoring va Alerting

### Basic Monitoring Script:

```bash
#!/bin/bash
# check-resources.sh

# Memory check
MEMORY=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ $MEMORY -gt 90 ]; then
    echo "WARNING: Memory usage is ${MEMORY}%"
fi

# Disk check
DISK=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK -gt 80 ]; then
    echo "WARNING: Disk usage is ${DISK}%"
fi

# Docker containers check
if ! docker ps | grep -q "Up"; then
    echo "ERROR: Some containers are down"
fi
```

Cron job qo'shing:

```bash
# Har 5 minutda tekshirish
*/5 * * * * /path/to/check-resources.sh >> /var/log/resource-check.log 2>&1
```

## Xulosa

Ushbu optimizatsiyalar bilan **$12/oy** serverda loyihani ishlatish mumkin. Lekin:

- ⚠️ Trafik ko'payganda performance muammo bo'lishi mumkin
- ⚠️ Build jarayonlari sekinroq bo'lishi mumkin
- ⚠️ Bir vaqtning o'zida ko'p foydalanuvchi bo'lsa, server sekinlashishi mumkin

**Tavsiya:** Agar trafik ko'payganda, **$24/oy** (2 vCPU, 4 GB RAM) variantiga o'ting.





