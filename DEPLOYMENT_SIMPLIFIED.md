# Soddalashtirilgan Deployment Qo'llanmasi

## Umumiy ma'lumot

Bu qo'llanma deployment jarayonini soddalashtirish uchun yaratilgan. Frontend va Admin panelni local'da build qilib, serverga yuklash, Backend'ni esa serverda to'g'ridan-to'g'ri ishga tushirish.

## Deployment Strategiyasi

### 1. Frontend va Admin Panel
- **Local'da build qilish** → Serverga yuklash
- **Standalone build** ishlatish (node_modules'siz)
- **Static files** alohida ko'chirish

### 2. Backend
- **Serverda to'g'ridan-to'g'ri ishga tushirish**
- **Prisma migration'lar** serverda bajariladi
- **Environment variables** serverda sozlanadi

## Qadamlar

### Local Mashinada (Development)

#### 1. Frontend Build
```bash
cd apps/frontend
pnpm build
```

#### 2. Admin Panel Build
```bash
cd apps/admin
pnpm build
```

#### 3. Serverga Yuklash
```bash
# Frontend
rsync -avz --progress \
    apps/frontend/.next/standalone/apps/frontend/ \
    user1@192.168.20.66:/var/www/acousticuz/apps/frontend/

rsync -avz --progress \
    apps/frontend/.next/static/ \
    user1@192.168.20.66:/var/www/acousticuz/apps/frontend/.next/static/

rsync -avz --progress \
    apps/frontend/public/ \
    user1@192.168.20.66:/var/www/acousticuz/apps/frontend/public/

# Admin Panel
rsync -avz --progress \
    apps/admin/dist/ \
    user1@192.168.20.66:/var/www/acousticuz/apps/admin/
```

### Serverda

#### 1. Backend Setup
```bash
cd /var/www/acousticuz/backend

# Dependencies o'rnatish
npm install --production

# Prisma Client generate
npx prisma generate --schema=./prisma/schema.prisma

# Migration'lar
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Environment variables
nano .env
# DATABASE_URL, JWT_SECRET, PORT, va boshqalar

# Backendni ishga tushirish
nohup node dist/main.js > backend.log 2>&1 &
```

#### 2. Frontend Setup
```bash
cd /var/www/acousticuz/apps/frontend

# Dependencies o'rnatish (agar kerak bo'lsa)
npm install --production

# Environment variables
nano .env.production
# NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL

# Frontendni ishga tushirish
nohup node server.js > frontend.log 2>&1 &
```

#### 3. Admin Panel Setup
```bash
cd /var/www/acousticuz/apps/admin

# Nginx yoki boshqa web server sozlash
# Yoki Node.js server ishlatish
```

## Avtomatlashtirilgan Script

`deploy-simple.sh` script yaratish mumkin:

```bash
#!/bin/bash
# Local mashinada ishga tushirish

# 1. Build
cd apps/frontend && pnpm build && cd ../..
cd apps/admin && pnpm build && cd ../..

# 2. Upload
./scripts/upload-frontend.sh
./scripts/upload-admin.sh

# 3. Serverda restart
ssh user1@192.168.20.66 "cd /var/www/acousticuz && ./restart.sh"
```

## Afzalliklari

✅ **Tezroq deployment** - Build local'da, upload tez  
✅ **Kamroq server resurslari** - Build jarayoni serverda emas  
✅ **Xavfsizroq** - Source code serverga yuklanmaydi  
✅ **Oson rollback** - Oldingi build'ni saqlab qolish oson  

## Kamchiliklari

⚠️ **Local build environment** kerak  
⚠️ **Node.js versiyasi** mos bo'lishi kerak  
⚠️ **Environment variables** ikkala joyda ham sozlash kerak  






