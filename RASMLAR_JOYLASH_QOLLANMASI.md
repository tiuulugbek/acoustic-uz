# Rasmlarni Joylash Qo'llanmasi

Bu qo'llanmada saytda ishlatiladigan barcha rasmlar haqida ma'lumot berilgan.

---

## 1. LOGO (Sayt Logosi)

### Qayerda ishlatiladi:
- Sayt header'ining chap tomonida (yuqori qism)
- Barcha sahifalarda ko'rsatiladi

### Format:
- **PNG** (shaffof fon bilan) yoki **SVG** (tavsiya etiladi)
- **JPG** ham qabul qilinadi, lekin shaffof fon bo'lmaydi

### O'lchamlar:
- **Kenglik:** 120-200px (maksimal)
- **Balandlik:** 40px (maksimal)
- **Nisbat:** Har qanday (logo o'lchamiga qarab moslashadi)
- **Og'irlik:** 50KB dan kam (tez yuklanishi uchun)

### Qanday yuklash:
1. Admin panelga kiring: `http://localhost:3000/admin/settings`
2. "Rasmlar" bo'limiga o'ting
3. "Logo" bo'limida "Logo yuklash" tugmasini bosing
4. Rasmni tanlang va yuklang
5. Yoki mavjud rasmlardan birini tanlang
6. "Saqlash" tugmasini bosing

### Tavsiyalar:
- Logo oq fon yoki rangli fonda ham chiroyli ko'rinishi kerak
- Rasm sifati yuqori bo'lishi kerak (pikselatsiya bo'lmasligi kerak)
- Logo markazda joylashgan bo'lishi kerak

---

## 2. CATALOG HERO RASM (Katalog Promotional Banner)

### Qayerda ishlatiladi:
- Catalog sahifasida (`/catalog?productType=hearing-aids`)
- Mahsulotlar ro'yxati ustida, brand filterlaridan oldin
- Promotional banner sifatida

### Format:
- **JPG** (tavsiya etiladi - kichik fayl hajmi)
- **PNG** ham qabul qilinadi

### O'lchamlar:
- **Kenglik:** 1200-1920px (to'liq kenglik)
- **Balandlik:** 320-400px
- **Nisbat:** 3:1 yoki 4:1 (kenglik balandlikdan 3-4 marta katta)
- **Og'irlik:** 200KB dan kam (tez yuklanishi uchun)

### Qanday yuklash:
1. Admin panelga kiring: `http://localhost:3000/admin/settings`
2. "Rasmlar" bo'limiga o'ting
3. "Catalog Hero Rasm" bo'limida "Rasm yuklash" tugmasini bosing
4. Rasmni tanlang va yuklang
5. Yoki mavjud rasmlardan birini tanlang
6. "Saqlash" tugmasini bosing

### Tavsiyalar:
- Rasm eshitish moslamalari yoki eshitishga oid motivlarga ega bo'lishi kerak
- Matn qo'shish kerak bo'lsa, rasmning markazida bo'lishi kerak
- Rasm yorug' va optimistik bo'lishi kerak
- Agar rasm yuklanmasa, fallback yozuv ko'rsatiladi: "Слышать и жить полной жизнью" / "Eshitish va to'liq hayot kechirish"

---

## 3. RASMLAR UMUMIY TAVSIFLARI

### Qabul qilinadigan formatlar:
- **JPG/JPEG** - fotosuratlar uchun (kichik fayl hajmi)
- **PNG** - shaffof fon yoki grafikalar uchun
- **SVG** - vektor rasmlar uchun (logo uchun eng yaxshi)
- **WebP** - zamonaviy format (tavsiya etiladi, kichik fayl hajmi)

### Rasm optimizatsiyasi:
- Barcha rasmlar yuklanishdan oldin optimizatsiya qilinishi kerak
- Onlayn vositalar:
  - TinyPNG (https://tinypng.com/)
  - Squoosh (https://squoosh.app/)
  - ImageOptim (Mac uchun)

### Fayl nomlash qoidalari:
- Lotin harflari ishlatilsin
- Bo'shliq o'rniga tire (-) yoki pastki chiziq (_) ishlatilsin
- Katta-kichik harflar: `logo-acoustic.png`, `catalog-hero.jpg`
- Yomon: `Лого Акустик.png`, `catalog hero.jpg`

---

## 4. ADMIN PANELDA RASM YUKLASH

### Qadamlar:
1. Admin panelga kirish: `http://localhost:3000/admin`
2. Chap menyudan "Sozlamalar" bo'limini tanlash
3. "Rasmlar" bo'limiga o'tish
4. Kerakli rasm bo'limini topish (Logo yoki Catalog Hero Rasm)
5. "Rasm yuklash" tugmasini bosish
6. Kompyuterdan rasmni tanlash
7. Rasm yuklangandan keyin "Saqlash" tugmasini bosish

### Mavjud rasmlardan tanlash:
- Har bir rasm bo'limida "Yoki mavjud rasmdan tanlang" qismi bor
- Bu yerda avval yuklangan rasmlar ko'rsatiladi
- Kerakli rasmini tanlash uchun unga bosing
6. "Saqlash" tugmasini bosish

### Rasmni o'chirish:
- Rasm yuklangandan keyin "O'chirish" tugmasi paydo bo'ladi
- Bu tugmani bosib rasmini olib tashlash mumkin
- Keyin "Saqlash" tugmasini bosish kerak

---

## 5. RASMLAR UCHUN TEKNIK TALABLAR

### Minimal talablar:
- **Rasm sifati:** Yuqori (pikselatsiya bo'lmasligi kerak)
- **Fayl formati:** JPG, PNG, SVG, WebP
- **Maksimal fayl hajmi:** 2MB (lekin optimizatsiya qilingan 200KB dan kam bo'lishi kerak)
- **Rang rejimi:** RGB (CMYK emas)

### Tavsiya etiladigan vositalar:
- **Rasm tahrirlash:** Photoshop, Figma, Canva
- **Rasm optimizatsiyasi:** TinyPNG, Squoosh
- **Vektor rasmlar:** Illustrator, Figma

---

## 6. RASMLAR JOYLANISH JADVALI

| Rasm turi | Qayerda | Format | Kenglik | Balandlik | Fayl hajmi |
|-----------|---------|--------|---------|-----------|------------|
| Logo | Header | PNG/SVG | 120-200px | 40px max | <50KB |
| Catalog Hero | Catalog sahifa | JPG/PNG | 1200-1920px | 320-400px | <200KB |

---

## 7. MUAMMOLAR VA YECHIMLAR

### Rasm ko'rinmayapti:
- Rasm yuklanganligini tekshiring (Settings sahifasida)
- Rasm URL'ini tekshiring (browser console'da)
- Rasm fayl hajmi juda katta bo'lishi mumkin (optimizatsiya qiling)

### Rasm sekin yuklanmoqda:
- Rasm fayl hajmini kamaytiring (optimizatsiya)
- Rasm o'lchamini kamaytiring
- WebP formatidan foydalaning

### Rasm sifati yomon:
- Yuqori pikselli rasmdan foydalaning
- Rasmni kattalashtirib ko'rmang (pikselatsiya bo'ladi)
- Vektor formatdan (SVG) foydalaning

---

## 8. KONTAKTLAR VA YORDAM

Agar rasmlarni yuklashda muammo bo'lsa:
1. Admin panelga kirish huquqini tekshiring
2. Rasm fayl formati va hajmini tekshiring
3. Browser console'da xatoliklarni ko'ring
4. Texnik yordamga murojaat qiling

---

## 9. QO'SHIMCHA MA'LUMOTLAR

### Rasm cache:
- Rasmlar avtomatik cache qilinadi
- O'zgarishlar darhol ko'rinmay qolishi mumkin
- Browser cache'ni tozalash kerak bo'lishi mumkin (Ctrl+Shift+R yoki Cmd+Shift+R)

### Rasm URL'lari:
- Barcha rasmlar Media kutubxonasida saqlanadi
- Har bir rasmning o'z URL'i bor
- URL'lar avtomatik yaratiladi va boshqariladi

---

**Oxirgi yangilanish:** 2024-yil
**Versiya:** 1.0


