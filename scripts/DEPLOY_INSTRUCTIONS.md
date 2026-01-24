# Mahsulotlarni Serverga Ko'chirish va Import Qilish

## 1. Faylni Serverga Ko'chirish

### Variant A: SCP orqali (eng oson)

Local Mac kompyuteringizdan terminalda:

```bash
scp ~/Desktop/products-to-import.json user@your-server-ip:/root/acoustic.uz/
```

Yoki agar SSH key ishlatayotgan bo'lsangiz:

```bash
scp ~/Desktop/products-to-import.json user@your-server-ip:/root/acoustic.uz/products-to-import.json
```

### Variant B: Rsync orqali (tezroq, katta fayllar uchun)

```bash
rsync -avz ~/Desktop/products-to-import.json user@your-server-ip:/root/acoustic.uz/
```

### Variant C: SFTP orqali

```bash
sftp user@your-server-ip
cd /root/acoustic.uz
put ~/Desktop/products-to-import.json
exit
```

### Variant D: Terminal orqali (agar serverga ulangan bo'lsangiz)

Agar allaqachon serverga SSH orqali ulangan bo'lsangiz:

```bash
# Local Mac'da yangi terminal oynasida:
cat ~/Desktop/products-to-import.json | ssh user@your-server-ip "cat > /root/acoustic.uz/products-to-import.json"
```

## 2. Serverga Ulanish va Faylni Tekshirish

```bash
ssh user@your-server-ip
cd /root/acoustic.uz
ls -lh products-to-import.json
```

Fayl mavjudligini va hajmini tekshiring.

## 3. Scriptni Ishga Tushirish

### Variant A: To'g'ridan-to'g'ri

```bash
cd /root/acoustic.uz
pnpm run import:products
```

### Variant B: PM2 orqali (agar backend PM2 da ishlayotgan bo'lsa)

```bash
cd /root/acoustic.uz
pnpm run import:products
```

### Variant C: Screen yoki tmux orqali (uzoq jarayon uchun)

```bash
# Screen yaratish
screen -S import-products

# Scriptni ishga tushirish
cd /root/acoustic.uz
pnpm run import:products

# Screen'dan chiqish: Ctrl+A, keyin D
# Qayta kirish: screen -r import-products
```

## 4. Natijalarni Tekshirish

Script ishga tushgandan keyin, quyidagilarni tekshiring:

```bash
# Mahsulotlar sonini tekshirish
cd /root/acoustic.uz
pnpm --filter @acoustic/backend exec prisma studio
# yoki
pnpm run db:studio
```

Yoki to'g'ridan-to'g'ri:

```bash
cd /root/acoustic.uz
pnpm --filter @acoustic/backend exec prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Product\";"
```

## 5. Xatoliklarni Tekshirish

Agar xatolik yuzaga kelsa:

```bash
# Script loglarini ko'rish
cd /root/acoustic.uz
pnpm run import:products 2>&1 | tee import-log.txt

# Xatoliklar faylini ko'rish
cat import-log.txt
```

## Tez Bosqichlar (Copy-Paste uchun)

```bash
# 1. Local Mac'da - faylni serverga ko'chirish
scp ~/Desktop/products-to-import.json user@your-server-ip:/root/acoustic.uz/

# 2. Serverga ulanish
ssh user@your-server-ip

# 3. Faylni tekshirish
cd /root/acoustic.uz && ls -lh products-to-import.json

# 4. Scriptni ishga tushirish
pnpm run import:products

# 5. Natijalarni ko'rish (script tugagach)
```

## Muhim Eslatmalar

1. **Backup olish**: Import qilishdan oldin bazani backup qiling:
   ```bash
   pg_dump -U postgres -d acoustic_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Environment variables**: `.env` faylida `DATABASE_URL` to'g'ri sozlanganligini tekshiring.

3. **Fayl formati**: JSON fayl to'g'ri formatda bo'lishi kerak. Tekshirish:
   ```bash
   cat products-to-import.json | jq '.' > /dev/null && echo "JSON to'g'ri" || echo "JSON xato"
   ```

4. **Rasmlar**: Script rasmlarni URL'dan yuklab olmaydi, faqat URL'larni saqlaydi. Agar rasmlarni yuklab olish kerak bo'lsa, alohida script yozish kerak.

## Yordam

Agar muammo yuzaga kelsa:
- Script loglarini tekshiring
- Database connection'ni tekshiring
- JSON fayl formatini tekshiring
- Fayl yo'lini tekshiring
