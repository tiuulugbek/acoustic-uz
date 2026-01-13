# Server Talablari va Tavsiyalar

## 📋 Minimal Server Talablari

### Asosiy Komponentlar
- **Node.js**: >= 18.0.0 (LTS versiyasi tavsiya etiladi)
- **pnpm**: >= 8.0.0
- **PostgreSQL**: >= 13.0 (yoki 14+)
- **Nginx**: >= 1.18 (reverse proxy uchun)
- **PM2**: Process manager (production uchun)

### Server Resurslari

#### Minimal Konfiguratsiya (Kichik trafik uchun)
```
CPU: 2 cores
RAM: 2 GB
Disk: 20 GB SSD
Bandwidth: 100 Mbps
```

#### Tavsiya Etilgan Konfiguratsiya (O'rtacha trafik uchun)
```
CPU: 4 cores
RAM: 4 GB
Disk: 40 GB SSD
Bandwidth: 1 Gbps
```

#### Optimal Konfiguratsiya (Yuqori trafik uchun)
```
CPU: 8 cores
RAM: 8 GB
Disk: 80 GB SSD
Bandwidth: 1 Gbps+
```

## 🔧 Komponentlar va Resurs Talablari

### 1. Frontend (Next.js)
- **Port**: 3000
- **Memory**: ~500 MB (PM2 max_memory_restart: 500M)
- **CPU**: 1 core
- **Disk**: ~2 GB (build fayllari va node_modules)

**Xususiyatlar:**
- Next.js 14.0.4
- React 18.2.0
- SSR (Server-Side Rendering)
- ISR (Incremental Static Regeneration)
- Image optimization o'chirilgan (unoptimized: true)

### 2. Backend (NestJS)
- **Port**: 3001
- **Memory**: ~500 MB (PM2 max_memory_restart: 500M)
- **CPU**: 1-2 cores
- **Disk**: ~1 GB (build fayllari va node_modules)

**Xususiyatlar:**
- NestJS 10.3.0
- Express.js
- Prisma ORM
- File upload support (multer)
- Image processing (sharp)

### 3. Database (PostgreSQL)
- **Port**: 5432
- **Memory**: ~512 MB - 1 GB
- **CPU**: 1 core
- **Disk**: 5-10 GB (ma'lumotlar hajmiga qarab)

**Xususiyatlar:**
- Prisma ORM
- Connection pooling
- Migrations support

### 4. Nginx (Reverse Proxy)
- **Memory**: ~50-100 MB
- **CPU**: Minimal
- **Disk**: ~100 MB

**Vazifalari:**
- SSL/TLS termination
- Static file serving
- Load balancing (agar kerak bo'lsa)
- Rate limiting

### 5. PM2 (Process Manager)
- **Memory**: Minimal (~10-20 MB)
- **CPU**: Minimal

**Vazifalari:**
- Process management
- Auto-restart
- Log management
- Memory monitoring

## 📊 Umumiy Resurs Taqsimoti

### Minimal Server (2 GB RAM)
```
Frontend:     500 MB
Backend:      500 MB
PostgreSQL:   512 MB
Nginx:        50 MB
PM2:          10 MB
System:       ~428 MB (OS va boshqa)
─────────────────────
Jami:         ~2000 MB (2 GB)
```

### Tavsiya Etilgan Server (4 GB RAM)
```
Frontend:     500 MB
Backend:      500 MB
PostgreSQL:   1 GB
Nginx:        100 MB
PM2:          20 MB
System:       ~1.88 GB (OS va boshqa)
─────────────────────
Jami:         ~4000 MB (4 GB)
```

### Optimal Server (8 GB RAM)
```
Frontend:     500 MB (yoki ko'p instance)
Backend:      500 MB (yoki ko'p instance)
PostgreSQL:   2 GB
Nginx:        100 MB
PM2:          20 MB
System:       ~4.88 GB (OS va boshqa)
─────────────────────
Jami:         ~8000 MB (8 GB)
```

## 🚀 Performance Optimizatsiyalari

### 1. Frontend Optimizatsiyalari
- ✅ SSR (Server-Side Rendering)
- ✅ ISR (Incremental Static Regeneration)
- ✅ Code splitting
- ✅ Image optimization (unoptimized: true - external CDN tavsiya etiladi)
- ✅ Script loading optimization (afterInteractive strategy)
- ✅ DNS prefetch va preconnect

### 2. Backend Optimizatsiyalari
- ✅ Connection pooling (Prisma)
- ✅ Caching (React Query client-side)
- ✅ Rate limiting (@nestjs/throttler)
- ✅ Compression (helmet)
- ✅ Logging (pino)

### 3. Database Optimizatsiyalari
- ✅ Indexes (Prisma migrations)
- ✅ Connection pooling
- ✅ Query optimization

## 🌐 Network Talablari

### Portlar
- **80/443**: HTTP/HTTPS (Nginx)
- **3000**: Frontend (Next.js)
- **3001**: Backend (NestJS)
- **5432**: PostgreSQL (faqat localhost)

### Firewall Qoidalari
```bash
# Faqat HTTP/HTTPS portlarini ochiq qoldiring
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 💾 Disk Talablari

### Minimal Disk Hajmi
```
OS:             10 GB
Application:    5 GB (code, node_modules)
Database:       5 GB (ma'lumotlar)
Logs:           2 GB
Backups:        5 GB
─────────────────────
Jami:           ~27 GB (minimal 30 GB tavsiya etiladi)
```

### Tavsiya Etilgan Disk Hajmi
```
OS:             10 GB
Application:    10 GB
Database:       10 GB
Logs:           5 GB
Backups:        10 GB
─────────────────────
Jami:           ~45 GB (minimal 50 GB tavsiya etiladi)
```

## 🔒 Xavfsizlik Talablari

### SSL/TLS
- ✅ Let's Encrypt sertifikat (yoki boshqa CA)
- ✅ HTTPS redirect
- ✅ HSTS headers

### Firewall
- ✅ UFW yoki iptables
- ✅ Faqat kerakli portlar ochiq

### Updates
- ✅ Muntazam OS updates
- ✅ Node.js LTS versiyasi
- ✅ Security patches

## 📈 Scalability Tavsiyalari

### Horizontal Scaling
Agar trafik oshsa:
1. **Load Balancer** qo'shish (Nginx yoki Cloudflare)
2. **Multiple Frontend Instances** (PM2 cluster mode)
3. **Multiple Backend Instances** (PM2 cluster mode)
4. **Database Replication** (PostgreSQL master-slave)

### Vertical Scaling
Agar resurslar yetmasa:
1. RAM ni oshirish (4 GB → 8 GB)
2. CPU ni oshirish (2 cores → 4 cores)
3. SSD disk oshirish (20 GB → 40 GB)

## 🎯 Tavsiya Etilgan Server Konfiguratsiyasi

### Production Server (Tavsiya Etilgan)
```
OS: Ubuntu 22.04 LTS yoki 20.04 LTS
CPU: 4 cores
RAM: 4 GB
Disk: 50 GB SSD
Bandwidth: 1 Gbps
Node.js: 18.x LTS yoki 20.x LTS
PostgreSQL: 14+ yoki 15+
Nginx: 1.24+
PM2: Latest
```

### Development Server
```
OS: Ubuntu 22.04 LTS yoki macOS
CPU: 2 cores
RAM: 2 GB
Disk: 20 GB
Node.js: 18.x LTS
PostgreSQL: 14+
```

## 📝 Monitoring va Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### System Monitoring
- **htop**: CPU va RAM monitoring
- **df -h**: Disk usage
- **netstat**: Network connections
- **nginx -t**: Nginx configuration test

### Log Files
- Frontend: `/var/log/pm2/acoustic-frontend-*.log`
- Backend: `/var/log/pm2/acoustic-backend-*.log`
- Nginx: `/var/log/nginx/`
- System: `/var/log/syslog`

## 🔧 Environment Variables

### Frontend (.env)
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
NEXT_PUBLIC_SITE_URL=https://acoustic.uz
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/acoustic
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://acoustic.uz,https://www.acoustic.uz,https://admin.acoustic.uz
```

## ✅ Checklist

### Server Setup
- [ ] Ubuntu 22.04 LTS yoki 20.04 LTS
- [ ] Node.js 18.x LTS yoki 20.x LTS
- [ ] pnpm 8.x yoki yuqori
- [ ] PostgreSQL 14+ yoki 15+
- [ ] Nginx 1.24+
- [ ] PM2 latest
- [ ] SSL sertifikat (Let's Encrypt)
- [ ] Firewall sozlangan
- [ ] Backup strategiyasi

### Application Setup
- [ ] Frontend build qilingan
- [ ] Backend build qilingan
- [ ] Database migrations bajarilgan
- [ ] Environment variables sozlangan
- [ ] PM2 processes ishlamoqda
- [ ] Nginx reverse proxy sozlangan
- [ ] Logs monitoring qilinmoqda

## 🎓 Xulosa

**Minimal Server**: 2 GB RAM, 2 CPU cores, 30 GB disk - kichik trafik uchun  
**Tavsiya Etilgan**: 4 GB RAM, 4 CPU cores, 50 GB disk - o'rtacha trafik uchun  
**Optimal**: 8 GB RAM, 8 CPU cores, 80 GB disk - yuqori trafik uchun

**Eng Muhim**: SSD disk va yaxshi bandwidth (1 Gbps+)

