# Development Setup Guide

## Backend'ni ishga tushirish

Development'da frontend ishlashi uchun backend'ni ham ishga tushirish kerak.

### 1. Oldindan tekshirishlar

**a) PostgreSQL ishlayotganini tekshiring:**

```bash
# Docker orqali
docker-compose up -d postgres

# Yoki PostgreSQL local ishlayotganini tekshiring
pg_isready
```

**b) Environment variables o'rnatilganini tekshiring:**

`apps/backend/.env` fayli mavjud bo'lishi kerak. Agar yo'q bo'lsa:

```bash
cd apps/backend
cp .env.example .env
# .env faylini tahrirlang
```

**c) Database migration'larni o'tkazing (agar kerak bo'lsa):**

```bash
cd apps/backend
pnpm db:migrate
```

### 2. Backend'ni ishga tushirish

**Variant A: Root directory'dan (tavsiya etiladi):**

```bash
# Root directory'dan
pnpm --filter @acoustic/backend dev
```

**Variant B: Backend directory'dan:**

```bash
cd apps/backend
pnpm dev
```

Backend `http://localhost:3001` da ishga tushadi va quyidagi xabarni ko'rasiz:

```
[Nest] INFO  [NestFactory] Starting Nest application...
[Nest] INFO  [InstanceLoader] AppModule dependencies initialized
[Nest] INFO  [NestApplication] Nest application successfully started
```

**Swagger API Documentation:** http://localhost:3001/api/docs

### 2. Barcha servislarni bir vaqtda ishga tushirish

```bash
# Root directory'dan
pnpm dev
```

Bu barcha servislarni (frontend, backend, admin) parallel ishga tushiradi.

### 3. Faqat frontend ishga tushirish (production API ishlatish)

Agar backend'ni ishga tushirmasangiz, frontend production API'ni ishlatishi mumkin:

**`.env.local` faylini yarating** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=https://a.acoustic.uz/api
```

Keyin frontend'ni qayta ishga tushiring:

```bash
cd apps/frontend
pnpm dev
```

## Tekshirish

Backend ishlayotganini tekshirish:

```bash
curl http://localhost:3001/api/settings?lang=uz
```

Agar javob qaytsa, backend ishlayapti.

## Muammolar

### Backend ishlamayapti

1. PostgreSQL ishlayotganini tekshiring:
   ```bash
   docker-compose up -d postgres
   # yoki
   pg_isready
   ```

2. Database migration'larni o'tkazing:
   ```bash
   cd apps/backend
   pnpm db:migrate
   ```

3. Backend'ni qayta ishga tushiring:
   ```bash
   cd apps/backend
   pnpm dev
   ```

### Port 3001 band (EADDRINUSE)

Agar port 3001 band bo'lsa, backend allaqachon ishga tushirilgan bo'lishi mumkin:

**Variant 1: PM2 orqali ishga tushirilgan bo'lsa:**

```bash
# PM2 process'larni ko'rish
pm2 list

# Backend'ni to'xtatish
pm2 stop acoustic-backend

# Yoki barcha PM2 process'larni to'xtatish
pm2 stop all
```

**Variant 2: Boshqa process ishlatayotgan bo'lsa:**

```bash
# Port'ni ishlatayotgan process'ni toping
lsof -i :3001
# yoki
netstat -tulpn | grep :3001

# Process'ni to'xtating
kill -9 <PID>
```

**Variant 3: Boshqa port'da ishga tushirish:**

`.env` faylida `PORT=3002` o'rnating va frontend'ning `.env.local` faylida ham `NEXT_PUBLIC_API_URL=http://localhost:3002/api` o'rnating.

