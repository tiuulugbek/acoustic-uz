# Database Migration via DBeaver

DBeaver orqali database migration qilish yo'riqnomasi.

## 1. Remote Database'dan Dump Olish

### DBeaver'da Export:

1. **DBeaver'ni oching** va remote database'ga ulaning (news.acoustic.uz)
2. **Database'ni tanlang** (acoustic)
3. **Right-click** → **Tools** → **Dump Database**
4. **Settings:**
   - Format: `SQL`
   - Output: File'ga saqlash
   - Options:
     - ✅ Drop objects
     - ✅ Create objects
     - ✅ Insert data
     - ✅ Include schema
     - ❌ Include owner (agar kerak bo'lmasa)
5. **Start** ni bosing
6. Dump faylini saqlang (masalan: `acoustic-dump.sql`)

## 2. Local Database'ga Import Qilish

### DBeaver'da Import:

1. **DBeaver'ni oching** va local database'ga ulaning (acoustic.uz)
2. **Database'ni tanlang** (acousticwebdb)
3. **Right-click** → **Tools** → **Execute Script**
4. **Dump faylini tanlang** (acoustic-dump.sql)
5. **Settings:**
   - ✅ Continue on error (agar ba'zi jadvallar mavjud bo'lsa)
   - ✅ Auto-commit
6. **Start** ni bosing

### Yoki SQL Script orqali:

1. **SQL Editor** ni oching
2. Dump faylini oching
3. **Execute Script** (Ctrl+Alt+X)

## 3. Migration'larni Ishga Tushirish

DBeaver'dan keyin serverda:

```bash
cd /var/www/acoustic.uz

# Prisma migration'larni ishga tushirish
pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

# Backend ni restart qilish
pm2 restart acoustic-backend
```

## 4. Tekshirish

```bash
# Backend log'larni tekshirish
pm2 logs acoustic-backend --lines 20

# API ni test qilish
curl https://a.acoustic.uz/api
```

## Muammolar va Yechimlar

### Agar ba'zi jadvallar mavjud bo'lsa:
- DBeaver'da "Continue on error" ni yoqing
- Yoki avval jadvallarni o'chiring:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  ```

### Agar foreign key xatolari bo'lsa:
- Dump'da `SET session_replication_role = replica;` qo'shing
- Yoki DBeaver'da "Disable foreign key checks" ni yoqing

### Agar owner xatolari bo'lsa:
- Dump'da owner'lar o'chirilgan bo'lishi kerak
- Yoki DBeaver'da "Include owner" ni o'chiring

