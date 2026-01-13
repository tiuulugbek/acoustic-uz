# PostgreSQL Windows'da O'rnatish va Sozlash

## ✅ Hozirgi holat

- ✅ Repository klonlandi
- ✅ Dependencies o'rnatildi
- ✅ Prisma Client generatsiya qilindi
- ✅ Seed script ishlayapti
- ❌ PostgreSQL o'rnatilmagan yoki ishlamayapti

## 🚀 PostgreSQL O'rnatish (Windows)

### Variant 1: PostgreSQL Installer (Tavsiya etiladi)

1. **PostgreSQL yuklab oling:**
   - [PostgreSQL Windows installer](https://www.postgresql.org/download/windows/) ga kiring
   - "Download the installer" ni bosing
   - Windows x64 versiyasini yuklab oling

2. **O'rnatish:**
   - Installer ni ishga tushiring
   - **Port**: 5432 (default) - o'zgartirmang
   - **Superuser password**: eslab qoling (masalan: `postgres`)
   - **Locale**: Default (English, United States)
   - **Components**: PostgreSQL Server, pgAdmin 4, Stack Builder - hammasini tanlang

3. **O'rnatishdan keyin:**
   - PostgreSQL Service avtomatik ishga tushadi
   - Windows Services'da tekshirish:
     ```powershell
     Get-Service -Name "*postgres*"
     ```

4. **Database yaratish:**
   ```powershell
   # PostgreSQL ga ulanish (PATH ga qo'shilgan bo'lishi kerak)
   psql -U postgres
   
   # Database yaratish
   CREATE DATABASE acoustic;
   
   # Chiqish
   \q
   ```

5. **.env faylini yangilash:**
   
   `.env` faylida `DATABASE_URL` ni yangilang:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/acoustic
   ```
   
   Masalan, agar parol `postgres` bo'lsa:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acoustic
   ```

### Variant 2: Docker Desktop (Agar Docker o'rnatilgan bo'lsa)

1. **Docker Desktop ni ishga tushiring**

2. **PostgreSQL container ni ishga tushirish:**
   ```powershell
   cd C:\Users\AzzaPRO\Desktop\acoustic-uz\acoustic-uz
   docker-compose up -d postgres
   ```

3. **10-15 soniya kutib turing:**
   ```powershell
   Start-Sleep -Seconds 15
   ```

4. **Tekshirish:**
   ```powershell
   docker ps | Select-String "postgres"
   ```

5. **.env fayli allaqachon to'g'ri sozlangan** (Docker uchun):
   ```env
   DATABASE_URL=postgresql://acoustic:acoustic123@localhost:5432/acoustic
   ```

## 📋 Database ni Sozlash

PostgreSQL ishga tushgandan keyin:

### 1. Migrations ni ishga tushirish

```powershell
cd C:\Users\AzzaPRO\Desktop\acoustic-uz\acoustic-uz
pnpm --filter @acoustic/backend db:migrate
```

### 2. Database ni seed qilish (admin user yaratadi)

```powershell
pnpm --filter @acoustic/backend db:seed
```

Agar seed command ishlamasa, quyidagini ishlating:

```powershell
cd apps\backend
pnpm exec ts-node --transpile-only --project tsconfig.json ../../prisma/seed.ts
```

## 🔐 Default Admin Credentials

Database seed qilingandan keyin:

- **Email**: `admin@acoustic.uz`
- **Password**: `Admin#12345`
- **Eslatma**: Birinchi kirishda parolni o'zgartirish talab qilinadi

## 🐛 Muammolar bilan yordam

### "Can't reach database server at localhost:5432"

**Yechim:**
1. PostgreSQL Service ishlayotganini tekshiring:
   ```powershell
   Get-Service -Name "*postgres*"
   ```

2. Agar service to'xtatilgan bo'lsa, ishga tushiring:
   ```powershell
   Start-Service -Name "postgresql-x64-15"  # versiya farq qilishi mumkin
   ```

3. Port 5432 band emasligini tekshiring:
   ```powershell
   netstat -ano | findstr :5432
   ```

### "password authentication failed"

**Yechim:**
- `.env` faylida `DATABASE_URL` dagi parolni tekshiring
- PostgreSQL o'rnatishda qo'ygan parolni ishlating

### "database does not exist"

**Yechim:**
```powershell
psql -U postgres
CREATE DATABASE acoustic;
\q
```

### EPERM error (C:\Config.Msi)

Bu Windows permission muammosi. Yechim:

1. **PowerShell ni Administrator sifatida ishga tushiring:**
   - Start menudan PowerShell ni toping
   - O'ng tugma bilan bosing
   - "Run as administrator" ni tanlang

2. Yoki `.npmrc` fayl yaratib, pnpm ni sozlash:
   ```powershell
   echo "shamefully-hoist=true" > .npmrc
   ```

## 🚀 Development Serverlarni Ishga Tushirish

Database sozlangandan keyin:

```powershell
cd C:\Users\AzzaPRO\Desktop\acoustic-uz\acoustic-uz
pnpm dev
```

Bu quyidagi serverlarni ishga tushiradi:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 📚 Qo'shimcha Ma'lumot

- [PostgreSQL Windows Documentation](https://www.postgresql.org/docs/current/installation-windows.html)
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker sozlash bo'yicha qo'llanma
- [QUICK_START.md](./QUICK_START.md) - Tez boshlash qo'llanmasi




