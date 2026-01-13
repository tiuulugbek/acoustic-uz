# PostgreSQL O'rnatish va Sozlash

## ✅ Bajarilgan ishlar

1. ✅ Repository GitHub dan klonlandi
2. ✅ `.env` fayli yaratildi va JWT secretlar generatsiya qilindi
3. ✅ Barcha dependencies o'rnatildi (`pnpm install`)
4. ✅ Prisma Client generatsiya qilindi

## 📋 Keyingi qadamlar

### Variant 1: Docker Desktop orqali (Tavsiya etiladi)

#### 1. Docker Desktop o'rnatish

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) ni yuklab oling va o'rnating
2. Docker Desktop ni ishga tushiring
3. Docker ishlayotganini tekshiring:
   ```powershell
   docker ps
   ```

#### 2. PostgreSQL ni Docker orqali ishga tushirish

```powershell
# PostgreSQL container ni ishga tushirish
docker-compose up -d postgres

# 10-15 soniya kutib turing
Start-Sleep -Seconds 15

# Tekshirish
docker ps | Select-String "postgres"
```

#### 3. Database ni sozlash

```powershell
# Migrations ni ishga tushirish
pnpm --filter @acoustic/backend db:migrate

# Database ni seed qilish (admin user yaratadi)
pnpm --filter @acoustic/backend db:seed
```

### Variant 2: Lokal PostgreSQL o'rnatish

#### 1. PostgreSQL o'rnatish

**Windows uchun:**

1. [PostgreSQL Windows installer](https://www.postgresql.org/download/windows/) ni yuklab oling
2. O'rnatish jarayonida:
   - **Port**: 5432 (default)
   - **Superuser password**: eslab qoling (masalan: `postgres`)
   - **Locale**: Default

#### 2. Database yaratish

```powershell
# PostgreSQL ga ulanish (o'rnatishdan keyin PATH ga qo'shiladi)
psql -U postgres

# Database yaratish
CREATE DATABASE acoustic;

# Chiqish
\q
```

#### 3. .env faylini yangilash

`.env` faylida `DATABASE_URL` ni yangilang:

```env
# Agar default postgres user ishlatsangiz:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acoustic

# Yoki yangi user yaratib ishlatsangiz:
DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic
```

#### 4. Database ni sozlash

```powershell
# Migrations ni ishga tushirish
pnpm --filter @acoustic/backend db:migrate

# Database ni seed qilish (admin user yaratadi)
pnpm --filter @acoustic/backend db:seed
```

## 🚀 Development serverlarni ishga tushirish

Database sozlangandan keyin:

```powershell
# Barcha serverlarni ishga tushirish (frontend, admin, backend)
pnpm dev
```

Bu quyidagi serverlarni ishga tushiradi:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🔐 Default Admin Credentials

Database seed qilingandan keyin:

- **Email**: `admin@acoustic.uz`
- **Password**: `Admin#12345`
- **Eslatma**: Birinchi kirishda parolni o'zgartirish talab qilinadi

## 🐛 Muammolar bilan yordam

### "Cannot connect to database"

1. PostgreSQL ishlayotganini tekshiring:
   ```powershell
   # Docker uchun
   docker ps | Select-String "postgres"
   
   # Lokal PostgreSQL uchun
   Get-Service -Name "*postgres*"
   ```

2. `.env` faylida `DATABASE_URL` to'g'ri ekanligini tekshiring

3. Database mavjudligini tekshiring:
   ```powershell
   psql -U postgres -l | Select-String "acoustic"
   ```

### "Migration failed"

- `DATABASE_URL` to'g'ri ekanligini tekshiring
- Database mavjudligini tekshiring
- PostgreSQL ishlayotganini tekshiring

## 📚 Qo'shimcha ma'lumot

- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker sozlash bo'yicha batafsil qo'llanma
- [QUICK_START.md](./QUICK_START.md) - Tez boshlash qo'llanmasi
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables bo'yicha ma'lumot





