# Insta360 Flow 360° Panorama Saytga Joylashtirish Qo'llanmasi

Bu qo'llanmada Insta360 Flow yordamida yaratilgan 360° panoramalarni saytga qanday joylashtirish ko'rsatilgan.

---

## 📸 INSTA360 FLOW BILAN 360° PANORAMA YARATISH

### 1-qadam: Panorama suratga olish
1. Insta360 Flow qurilmasini telefoningizga ulang
2. Insta360 ilovasini oching
3. "Panorama" rejimini tanlang
4. Panorama suratga oling
5. Suratni saqlang

---

## 🌐 SAYTGA JOYLASHTIRISH YO'LLARI

### **Yo'l 1: Insta360 Studio/Viewer orqali (Tavsiya etiladi)**

Insta360 o'zining 360° panorama ko'rsatish xizmatiga ega.

**Qadamlar:**
1. **Insta360 Studio'da eksport qiling:**
   - Insta360 ilovasida panoramani oching
   - "Share" yoki "Eksport" tugmasini bosing
   - "Web Share" yoki "Embed" variantini tanlang
   - Agar mavjud bo'lsa, iframe kodini oling

2. **Agar Insta360 to'g'ridan-to'g'ri iframe bermasa:**
   - Panoramani Insta360 Studio'ga yuklang
   - "Share" → "Web Link" yoki "Embed" variantini tanlang
   - Olingan link yoki iframe kodini nusxalang

3. **Admin panelga joylashtiring:**
   - Admin panelga kiring (`http://localhost:3002`)
   - "Filiallar" bo'limiga o'ting
   - Filialni tanlang va "Tahrirlash" tugmasini bosing
   - "3D Tour iframe" maydoniga iframe kodini yozing
   - "Saqlash" tugmasini bosing

---

### **Yo'l 2: Kuula orqali (Eng oson)**

Kuula - bu 360° panoramalarni saytga joylashtirish uchun bepul xizmat.

**Qadamlar:**
1. **Kuula'ga ro'yxatdan o'ting:**
   - `https://www.kuula.co` saytiga kiring
   - Bepul akkaunt yarating

2. **Panoramani yuklang:**
   - Insta360 Flow'dan panoramani kompyuterga eksport qiling
   - Kuula'ga kirib, "Upload" tugmasini bosing
   - Panoramani yuklang

3. **Iframe kodini oling:**
   - Yuklangan panoramani oching
   - "Share" yoki "Embed" tugmasini bosing
   - Iframe kodini nusxalang

4. **Admin panelga joylashtiring:**
   - Admin panel → Filiallar → Filialni tahrirlash
   - "3D Tour iframe" maydoniga Kuula'dan olingan iframe kodini yozing
   - "Saqlash" tugmasini bosing

**Kuula iframe misoli:**
```html
<iframe src="https://www.kuula.co/share/collection/7X..." width="100%" height="600" frameborder="0" allowfullscreen></iframe>
```

---

### **Yo'l 3: Matterport orqali (Professional)**

Matterport - professional 3D tour xizmati (pullik).

**Qadamlar:**
1. **Matterport akkaunt yarating:**
   - `https://matterport.com` saytiga kiring
   - Akkaunt yarating (pullik)

2. **Panoramani yuklang:**
   - Matterport'ga kirib, yangi tour yarating
   - Panoramani yuklang

3. **Iframe kodini oling:**
   - Tour'ni publish qiling
   - "Share" → "Embed" variantini tanlang
   - Iframe kodini nusxalang

4. **Admin panelga joylashtiring:**
   - Admin panel → Filiallar → Filialni tahrirlash
   - "3D Tour iframe" maydoniga Matterport'dan olingan iframe kodini yozing
   - "Saqlash" tugmasini bosing

**Matterport iframe misoli:**
```html
<iframe src="https://my.matterport.com/show/?m=..." width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking"></iframe>
```

---

### **Yo'l 4: Pannellum orqali (O'z hosting'ingizda)**

Agar panoramani o'z serveringizda saqlashni xohlasangiz, Pannellum JavaScript library'sidan foydalanishingiz mumkin.

**Qadamlar:**
1. **Panoramani serverga yuklang:**
   - Insta360 Flow'dan panoramani eksport qiling
   - Media Library'ga yuklang yoki `uploads/` papkasiga joylashtiring

2. **Pannellum komponentini qo'shing:**
   - Frontend'ga Pannellum library'sini qo'shing
   - 360 viewer komponentini yarating

**⚠️ Eslatma:** Bu variantni amalga oshirish uchun kod o'zgarishlari kerak bo'ladi.

---

## 🎯 TAVSIYA ETILGAN YO'L

**Kuula (Yo'l 2)** eng oson va bepul variant:
- ✅ Bepul
- ✅ Oson foydalanish
- ✅ Tez yuklash
- ✅ Iframe kodini oson olish
- ✅ Mobil qurilmalarda yaxshi ishlaydi

---

## 📝 ADMIN PANELDA JOYLASHTIRISH

1. **Admin panelga kiring:**
   - `http://localhost:3002` ga kiring
   - Login qiling

2. **Filiallar bo'limiga o'ting:**
   - Sidebar'dan "Filiallar" ni tanlang

3. **Filialni tahrirlash:**
   - Filialni toping
   - "Tahrirlash" tugmasini bosing

4. **3D Tour iframe kodini kiriting:**
   - "3D Tour iframe" maydoniga iframe kodini yozing
   - Misol:
     ```html
     <iframe src="https://www.kuula.co/share/collection/7X..." width="100%" height="600" frameborder="0" allowfullscreen></iframe>
     ```

5. **Saqlash:**
   - "Saqlash" tugmasini bosing
   - Frontend'da filial sahifasida 360° panorama ko'rinadi

---

## 🔍 IFrame KODINI TEKSHIRISH

Iframe kodida quyidagilar bo'lishi kerak:
- ✅ `src` - Panorama URL'i
- ✅ `width="100%"` yoki aniq o'lcham
- ✅ `height="600"` yoki boshqa balandlik
- ✅ `frameborder="0"` yoki `style="border:0;"`
- ✅ `allowfullscreen` (ixtiyoriy)

**To'g'ri iframe misoli:**
```html
<iframe 
  src="https://www.kuula.co/share/collection/7X..." 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen
></iframe>
```

---

## ⚠️ MUHIM ESLATMALAR

1. **Panorama format:**
   - Insta360 Flow'dan panoramani `.jpg` yoki `.png` formatida eksport qiling
   - Ko'pincha `equirectangular` formatida bo'ladi

2. **Fayl hajmi:**
   - Panoramalar katta bo'lishi mumkin (10-50 MB)
   - Yuklash vaqtini hisobga oling

3. **Mobil qurilmalar:**
   - Barcha 360° viewer'lar mobil qurilmalarda ishlaydi
   - Kuula va Matterport mobil uchun optimallashtirilgan

4. **Xavfsizlik:**
   - Iframe kodida faqat ishonchli manbalardan URL'larni ishlating
   - HTTPS protokolidan foydalaning

---

## 🆘 MUAMMOLAR VA YECHIMLAR

### Muammo: Panorama ko'rinmayapti
**Yechim:**
- Iframe kodini to'g'ri kiriting
- URL'ni tekshiring
- Browser console'da xatolarni ko'ring

### Muammo: Panorama sekin yuklanmoqda
**Yechim:**
- Panorama faylini siqib oling
- CDN xizmatidan foydalaning
- Kuula yoki Matterport kabi optimallashtirilgan xizmatlardan foydalaning

### Muammo: Mobil qurilmalarda ishlamayapti
**Yechim:**
- Kuula yoki Matterport kabi mobil uchun optimallashtirilgan xizmatlardan foydalaning
- Iframe kodida `allow="xr-spatial-tracking"` qo'shing

---

## 📞 YORDAM

Agar muammo bo'lsa:
1. Iframe kodini to'g'ri kiriting
2. Browser console'da xatolarni tekshiring
3. Panorama URL'ini to'g'ridan-to'g'ri browser'da ochib ko'ring

---

**Oxirgi yangilanish:** 2024-yil



