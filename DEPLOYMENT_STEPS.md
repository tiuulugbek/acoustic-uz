# Deployment Steps - Serverda Yangilash

## Oxirgi o'zgarishlarni serverga yuklash

### 1. Gitga Push Qilish (Local Machine)

Agar hali push qilmagan bo'lsangiz:

```bash
cd /path/to/acoustic-uz
git add -A
git commit -m "feat: Your commit message"
git push origin main
```

### 2. Serverda Yangilash

#### Variant A: Avtomatik Script (Tavsiya etiladi)

```bash
# Serverga SSH orqali ulaning
ssh root@your-server-ip

# Project papkasiga kiring
cd /var/www/acoustic.uz

# Yangilash scriptini ishga tushiring
bash deploy/update-from-git.sh
```

Bu script quyidagilarni avtomatik qiladi:
- Git status tekshirish
- Local o'zgarishlarni stash qilish
- Git pull qilish
- Backend rebuild qilish
- Frontend rebuild qilish
- PM2 restart qilish

#### Variant B: Qo'lda Yangilash

```bash
# 1. Serverga SSH orqali ulaning
ssh root@your-server-ip

# 2. Project papkasiga kiring
cd /var/www/acoustic.uz

# 3. Git status tekshirish
git status

# 4. Local o'zgarishlarni stash qilish (agar bor bo'lsa)
git stash

# 5. Yangi kodlarni olish
git pull origin main

# 6. Backend rebuild
cd apps/backend
pnpm install --frozen-lockfile
pnpm build
pm2 restart acoustic-backend

# 7. Frontend rebuild
cd /var/www/acoustic.uz
bash deploy/optimized-build-frontend.sh

# 8. Status tekshirish
pm2 list
pm2 logs acoustic-backend --lines 20
pm2 logs acoustic-frontend --lines 20
```

### 3. Tekshirish

```bash
# Backend tekshirish
curl http://localhost:3001/api/settings

# Frontend tekshirish
curl http://localhost:3000

# PM2 status
pm2 list
pm2 logs acoustic-backend --lines 50
pm2 logs acoustic-frontend --lines 50
```

### 4. Muammo Bo'lsa

```bash
# PM2 restart
pm2 restart all

# Loglarni ko'rish
pm2 logs --lines 100

# Backend qayta build
cd /var/www/acoustic.uz/apps/backend
pnpm build
pm2 restart acoustic-backend

# Frontend qayta build
cd /var/www/acoustic.uz
bash deploy/optimized-build-frontend.sh
```

## Qo'shimcha Ma'lumotlar

### Gitdan Build Papkalarini Olib Tashlash

Agar gitda build papkalari bo'lsa:

```bash
cd /var/www/acoustic.uz
bash deploy/clean-git-before-push.sh
git commit -m "chore: Remove build artifacts"
git push origin main
```

### Optimallashtirilgan Build

Frontendni optimallashtirilgan qilib build qilish:

```bash
cd /var/www/acoustic.uz
bash deploy/optimized-build-frontend.sh
```

Bu script:
- Eski buildlarni o'chiradi
- Cache tozalaydi
- Yangi build yaratadi
- PM2 ni restart qiladi

