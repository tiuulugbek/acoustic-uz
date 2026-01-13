# Database Yaratish - Windows PostgreSQL

## PostgreSQL Parolini Bilish

Agar PostgreSQL parolini bilmasangiz, quyidagi usullardan birini ishlating:

### Usul 1: pgAdmin 4 orqali

1. **pgAdmin 4 ni oching** (Start menudan qidiring)
2. O'rnatishda qo'ygan **master password** ni kiriting
3. **Servers** > **PostgreSQL 17** > **Login/Group Roles** > **postgres** ga o'ng tugma bilan bosing
4. **Properties** > **Definition** tabida parolni ko'ring yoki yangilang

### Usul 2: Command Prompt orqali

```powershell
# PostgreSQL bin papkasini toping (odatda):
# C:\Program Files\PostgreSQL\17\bin

# psql ni ishga tushiring
cd "C:\Program Files\PostgreSQL\17\bin"
.\psql.exe -U postgres

# Parolni kiriting va database yarating:
CREATE DATABASE acoustic;
\q
```

## .env Faylini Yangilash

PostgreSQL parolini bilganingizdan keyin, `.env` faylida `DATABASE_URL` ni yangilang:

```env
# Agar postgres user paroli "postgres" bo'lsa:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acoustic

# Yoki boshqa parol bo'lsa:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acoustic
```

## Database Yaratish va Sozlash

### 1. Database yaratish

```powershell
# PostgreSQL bin papkasiga boring
cd "C:\Program Files\PostgreSQL\17\bin"

# psql ni ishga tushiring
.\psql.exe -U postgres

# Database yaratish
CREATE DATABASE acoustic;

# Chiqish
\q
```

### 2. Migrations ni ishga tushirish

```powershell
cd C:\Users\AzzaPRO\Desktop\acoustic-uz\acoustic-uz
pnpm --filter @acoustic/backend db:migrate
```

### 3. Database ni seed qilish

```powershell
pnpm --filter @acoustic/backend db:seed
```

## Tezkor Yechim

Agar parolni bilmasangiz va tezkor yechim kerak bo'lsa:

1. **pgAdmin 4** ni oching
2. **postgres** user'ning parolini yangilang (masalan: `postgres`)
3. `.env` faylida `DATABASE_URL` ni yangilang:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acoustic
   ```
4. Database yaratish va migrations ni ishga tushirish




