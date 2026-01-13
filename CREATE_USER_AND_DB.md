# PostgreSQL User va Database Yaratish

## Qadam 1: psql'ga kiring

PowerShell'da quyidagilarni bajaring:

```powershell
cd "C:\Program Files\PostgreSQL\17\bin"
.\psql.exe -U postgres
```

PostgreSQL parolini kiriting (o'rnatishda qo'ygan parol).

## Qadam 2: User va Database yaratish

psql ichida quyidagi buyruqlarni kiriting (har birini Enter bilan yakunlang):

```sql
CREATE USER acoustic WITH PASSWORD 'acoustic123';
CREATE DATABASE acoustic OWNER acoustic;
GRANT ALL PRIVILEGES ON DATABASE acoustic TO acoustic;
\q
```

## Qadam 3: Tekshirish

```powershell
# Yangi user bilan ulanish
.\psql.exe -U acoustic -d acoustic

# Agar ulanish muvaffaqiyatli bo'lsa, chiqish:
\q
```

## Keyingi qadamlar

User va database yaratilgandan keyin:

```powershell
cd C:\Users\AzzaPRO\Desktop\acoustic-uz\acoustic-uz
pnpm --filter @acoustic/backend db:migrate
pnpm --filter @acoustic/backend db:seed
pnpm dev
```




