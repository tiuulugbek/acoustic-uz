# Development Setup Guide

## Backend'ni ishga tushirish

Development'da frontend ishlashi uchun backend'ni ham ishga tushirish kerak.

### 1. Backend'ni ishga tushirish

```bash
# Root directory'dan
cd apps/backend
pnpm dev

# Yoki root directory'dan
pnpm --filter @acoustic/backend dev
```

Backend `http://localhost:3001` da ishga tushadi.

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

### Port 3001 band

Agar port 3001 band bo'lsa:

1. Port'ni ishlatayotgan process'ni toping:
   ```bash
   lsof -i :3001
   ```

2. Process'ni to'xtating:
   ```bash
   kill -9 <PID>
   ```

3. Yoki backend'ni boshqa port'da ishga tushiring (`.env` faylida `PORT=3002` o'rnating)

