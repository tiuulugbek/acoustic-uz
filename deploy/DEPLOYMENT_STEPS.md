# Deployment Ketma-Ketligi

## 1️⃣ Lokal Mashinada: Gitga Push Qilish

```bash
# Hozirgi o'zgarishlarni ko'rish
git status

# Barcha o'zgarishlarni qo'shish
git add .

# Commit qilish
git commit -m "Add production deployment configuration"

# Gitga push qilish
git push origin main
# yoki
git push origin master
```

## 2️⃣ Serverga SSH orqali Ulanish

```bash
ssh root@152.53.229.176
```

## 3️⃣ Serverda: Dastlabki Tayyorlash

```bash
# Server setup scriptini yuklab olish yoki ko'chirish
# Agar git repoda bo'lsa, avval clone qiling:

# Git reponi klonlash (root user)
cd /root
git clone <your-repo-url> temp-acoustic
cd temp-acoustic

# Yoki agar allaqachon serverda bo'lsa, faqat yangilash:
cd /root/temp-acoustic
git pull origin main
```

## 4️⃣ Serverda: Server Setup (Bir marta)

```bash
# Root user sifatida
cd /root/temp-acoustic
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh
```

Bu script:
- Node.js, pnpm, PostgreSQL, Nginx o'rnatadi
- Deploy user yaratadi
- Database yaratadi
- Papkalarni yaratadi

**⚠️ Muhim:** PostgreSQL parolini o'zgartiring:
```bash
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'KUCHLI_PAROL_BU_YERDA';
\q
```

## 5️⃣ Deploy User ga O'tish

```bash
su - deploy
```

## 6️⃣ Deploy User: Repository Klonlash

```bash
# Deploy user home directory
cd ~

# Git reponi klonlash
git clone <your-repo-url> /var/www/news.acoustic.uz
cd /var/www/news.acoustic.uz

# Yoki agar root user allaqachon klonlagan bo'lsa:
# sudo cp -r /root/temp-acoustic /var/www/news.acoustic.uz
# sudo chown -R deploy:deploy /var/www/news.acoustic.uz
```

## 7️⃣ Environment Variables Sozlash

```bash
cd /var/www/news.acoustic.uz

# .env faylini yaratish
cp deploy/env.production.example .env

# .env ni tahrirlash
nano .env
```

**Muhim o'zgartirishlar:**
```env
DATABASE_URL=postgresql://acoustic:KUCHLI_PAROL@localhost:5432/acoustic
JWT_ACCESS_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>
```

**JWT Secret generatsiya qilish:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 8️⃣ Deployment Scriptini Ishga Tushirish

```bash
cd /var/www/news.acoustic.uz

# Scriptni executable qilish
chmod +x deploy/deploy.sh

# Deployment
./deploy/deploy.sh
```

Bu script:
- Dependencies o'rnatadi
- Database migrations ishlatadi
- Build qiladi
- PM2 ni sozlaydi
- Nginx ni sozlaydi

## 9️⃣ SSL Sertifikatlari O'rnatish

```bash
# Root user ga qaytish
exit

# SSL sertifikatlari
sudo certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz
```

## 🔟 Tekshirish

```bash
# Deploy user ga qaytish
su - deploy

# Verification
cd /var/www/news.acoustic.uz
./deploy/verify-deployment.sh

# PM2 status
pm2 status

# Logs
pm2 logs
```

## 📋 To'liq Ketma-Ketlik (Qisqa)

```bash
# ===== LOKAL MASHINADA =====
git add .
git commit -m "Deployment config"
git push origin main

# ===== SERVERDA (Root) =====
ssh root@152.53.229.176
cd /root
git clone <repo-url> temp-acoustic
cd temp-acoustic
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh

# PostgreSQL parolini o'zgartirish
sudo -u postgres psql
ALTER USER acoustic WITH PASSWORD 'PAROL';
\q

# ===== SERVERDA (Deploy User) =====
su - deploy
git clone <repo-url> /var/www/news.acoustic.uz
cd /var/www/news.acoustic.uz
cp deploy/env.production.example .env
nano .env  # Parollarni o'zgartirish
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# ===== SERVERDA (Root - SSL) =====
exit
sudo certbot --nginx -d news.acoustic.uz -d api.acoustic.uz -d admins.acoustic.uz

# ===== TEKSHIRISH =====
su - deploy
cd /var/www/news.acoustic.uz
./deploy/verify-deployment.sh
pm2 status
```

## 🔄 Keyingi Yangilanishlar

```bash
# Deploy user
cd /var/www/news.acoustic.uz
git pull origin main
./deploy/deploy.sh
```

## ❓ FAQ

**Q: Git reponi serverga qanday ko'chirish kerak?**
A: Ikki variant:
1. `git clone` - to'g'ridan-to'g'ri klonlash
2. Lokal mashinada `git push`, serverda `git pull`

**Q: Agar git repoda bo'lmasa?**
A: `scp` yoki `rsync` bilan ko'chirish:
```bash
# Lokal mashinada
scp -r . deploy@152.53.229.176:/var/www/news.acoustic.uz
```

**Q: Deployment xatolik bersa?**
A: Loglarni tekshiring:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```


