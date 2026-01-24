# Development va Production'ni Sync Qilish Strategiyasi

## 📂 Hozirgi holat

- **Development:** `/root/acoustic.uz` - kod o'zgartirish joyi
- **Production:** `/var/www/acoustic.uz` - ishlayotgan ilova

## 🎯 Variant 1: Production'ni Development bilan to'liq almashtirish

### Nima qiladi:
```bash
# Production'ni backup qilish
mv /var/www/acoustic.uz /var/www/acoustic.uz.backup

# Development'ni Production'ga ko'chirish
cp -r /root/acoustic.uz /var/www/acoustic.uz

# Permission'lar
chown -R acoustic:acoustic /var/www/acoustic.uz
```

### ✅ Afzalliklari:
- ✅ Bir xil kod bazasi
- ✅ O'zgarishlar darhol ko'rinadi
- ✅ Sync muammosi yo'q
- ✅ Bitta joyda ishlash

### ❌ Yutqaziladigan narsalar:
- ❌ **Development test muhiti yo'qoladi** - production'da to'g'ridan-to'g'ri ishlash xavfli
- ❌ **Rollback imkoniyati cheklanadi** - agar muammo bo'lsa, eski versiyaga qaytish qiyin
- ❌ **Xavfsizlik** - root'da ishlash production'ga ta'sir qilishi mumkin
- ❌ **Version control muammosi** - git history aralashishi mumkin
- ❌ **Database migration xavfi** - test qilmasdan migration qo'llash xavfli

## 🎯 Variant 2: Symbolic Link (Tavsiya etiladi)

### Nima qiladi:
```bash
# Production'ni backup
mv /var/www/acoustic.uz /var/www/acoustic.uz.backup

# Development'ga symbolic link
ln -s /root/acoustic.uz /var/www/acoustic.uz

# Permission'lar
chown -R acoustic:acoustic /var/www/acoustic.uz
```

### ✅ Afzalliklari:
- ✅ Bir xil kod bazasi (real-time sync)
- ✅ O'zgarishlar darhol ko'rinadi
- ✅ Development'da ishlash mumkin
- ✅ Backup saqlanadi

### ❌ Yutqaziladigan narsalar:
- ❌ **Xavfsizlik** - root'da o'zgartirishlar production'ga ta'sir qiladi
- ❌ **Permission muammolari** - root va acoustic user o'rtasida
- ❌ **Build fayllar aralashishi** - development va production build'lar aralashishi mumkin

## 🎯 Variant 3: Avtomatik Sync Skripti (Eng yaxshi)

### Nima qiladi:
Development'da o'zgartirish qilinganda, avtomatik production'ga ko'chiriladi.

### ✅ Afzalliklari:
- ✅ Development muhiti saqlanadi
- ✅ Production xavfsiz
- ✅ Avtomatik sync
- ✅ Rollback imkoniyati

### ❌ Yutqaziladigan narsalar:
- ❌ Biroz murakkabroq setup
- ❌ Sync vaqtida biroz kechikish

## 🎯 Variant 4: Bitta Joyda Ishlash (Hozirgi holatni yaxshilash)

### Nima qiladi:
Faqat `/var/www/acoustic.uz` da ishlash, lekin yaxshi workflow bilan.

### ✅ Afzalliklari:
- ✅ Bitta kod bazasi
- ✅ Permission muammosi yo'q
- ✅ O'zgarishlar darhol ko'rinadi

### ❌ Yutqaziladigan narsalar:
- ❌ Development test muhiti yo'q
- ❌ Git workflow muammosi (agar git ishlatilsa)

## 💡 Tavsiya

**Variant 3 (Avtomatik Sync)** eng yaxshi, chunki:
1. Development muhiti saqlanadi
2. Production xavfsiz
3. O'zgarishlar tez ko'rinadi
4. Rollback mumkin

Agar tezkor yechim kerak bo'lsa, **Variant 4** (bitta joyda ishlash) yaxshi.

## 🔧 Qaysi variantni tanlaymiz?
