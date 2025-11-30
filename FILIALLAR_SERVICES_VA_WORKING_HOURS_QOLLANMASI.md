# Filiallar Services va Working Hours Boshqarish Qo'llanmasi

Bu qo'llanmada Filiallar sahifasidagi Services va Working Hours ma'lumotlarini qanday boshqarish ko'rsatilgan.

---

## 📋 SERVICES (XIZMATLAR)

### Qayerdan olinadi:

**Admin Panel:**
- Admin Panel → Filiallar → Filialni tahrirlash → "Xizmatlar" maydoni
- Bu yerda `/services/admin` endpoint'idan kelgan barcha services ro'yxati ko'rsatiladi
- Kerakli xizmatlarni tanlash mumkin (multiple select)

**Frontend:**
- Frontend'da services `/services?public=true` endpoint'idan keladi
- Agar filialda `serviceIds` array'i bo'lsa, faqat shu ID'lardagi services ko'rsatiladi
- Agar `serviceIds` bo'sh bo'lsa, dastlabki 6 ta service ko'rsatiladi (fallback)

### Qanday ishlaydi:

1. **Admin Panel'da tanlash:**
   - Filialni tahrirlash
   - "Xizmatlar" maydonidan kerakli xizmatlarni tanlang
   - Saqlash

2. **Database'ga saqlash:**
   - `Branch.serviceIds` array'iga tanlangan service ID'lari saqlanadi

3. **Frontend'da ko'rsatish:**
   - `branch.serviceIds` array'i bo'sh emas bo'lsa, faqat shu ID'lardagi services ko'rsatiladi
   - Har bir service havola sifatida ko'rsatiladi (clickable)

### Services manbasi:

- **Admin Panel:** `/services/admin` endpoint'i (barcha services, status'ga qarab)
- **Frontend:** `/services?public=true` endpoint'i (faqat published services)

---

## ⏰ WORKING HOURS (ISH VAQTI)

### Qayerdan olinadi:

**Admin Panel:**
- Admin Panel → Filiallar → Filialni tahrirlash → "Ish vaqti (uz)" va "Ish vaqti (ru)" maydonlari
- Har bir filial uchun alohida ish vaqti sozlash mumkin

**Frontend:**
- Frontend'da `branch.workingHours_uz` yoki `branch.workingHours_ru` ishlatiladi
- Agar ma'lumotlar bo'sh bo'lsa, default ish vaqti ko'rsatiladi

### Format:

Ish vaqti har bir qatorga alohida yoziladi:
```
Dushanba - Juma: 09:00-20:00
Shanba - Yakshanba: 09:00-18:00
```

Yoki:
```
Понедельник - Пятница: 09:00-20:00
Суббота - Воскресенье: 09:00-18:00
```

### Qanday ishlaydi:

1. **Admin Panel'da kirish:**
   - Filialni tahrirlash
   - "Ish vaqti (uz)" va "Ish vaqti (ru)" maydonlariga kiriting
   - Har bir qatorga alohida yozing
   - Saqlash

2. **Database'ga saqlash:**
   - `Branch.workingHours_uz` va `Branch.workingHours_ru` maydonlariga saqlanadi

3. **Frontend'da ko'rsatish:**
   - Har bir qator alohida ko'rsatiladi
   - Agar ma'lumotlar bo'sh bo'lsa, default ish vaqti ko'rsatiladi

---

## 🔍 MUAMMOLAR VA YECHIMLAR

### Muammo: Admin paneldan ma'lumotlar to'ldirildi, lekin frontend'da chiqmayapti

**Yechim:**
1. **Backend'ni qayta ishga tushiring:**
   ```bash
   pnpm --filter @acoustic/backend restart
   ```

2. **Frontend'ni qayta ishga tushiring:**
   ```bash
   pnpm --filter @acoustic/frontend dev
   ```

3. **Browser cache'ni tozalang:**
   - Browser'da Ctrl+Shift+R (Windows/Linux) yoki Cmd+Shift+R (Mac)

4. **Database'ni tekshiring:**
   ```sql
   SELECT id, name_uz, workingHours_uz, workingHours_ru, serviceIds FROM "Branch" WHERE id = 'YOUR_BRANCH_ID';
   ```

5. **Backend API'ni tekshiring:**
   ```bash
   curl "http://localhost:3001/api/branches/slug/YOUR_BRANCH_SLUG" | jq '.workingHours_uz, .workingHours_ru, .serviceIds'
   ```

---

### Muammo: Services tanlanmayapti yoki ko'rinmayapti

**Yechim:**
1. **Services list'ni tekshiring:**
   - Admin Panel → Xizmatlar bo'limiga o'ting
   - Services mavjudligini tekshiring
   - Status'ni "Nashr etilgan" qilib belgilang

2. **Admin Panel'da services list'ni tekshiring:**
   - Filialni tahrirlash
   - "Xizmatlar" maydonida services ro'yxatini ko'ring
   - Agar bo'sh bo'lsa, `/services/admin` endpoint'ini tekshiring

3. **Frontend'da services'ni tekshiring:**
   - Browser console'da debug log'larni ko'ring
   - `branchServiceIds` va `allServicesCount` qiymatlarini tekshiring

---

## 📝 DEBUG QISMLARI

Frontend'da debug log'lar qo'shilgan:

```javascript
console.log('🔍 [BRANCH] Branch data:', {
  id: branch.id,
  name_uz: branch.name_uz,
  workingHours_uz: branch.workingHours_uz,
  workingHours_ru: branch.workingHours_ru,
  serviceIds: branch.serviceIds,
  hasWorkingHours: !!(branch.workingHours_uz || branch.workingHours_ru),
  hasServiceIds: !!branch.serviceIds && Array.isArray(branch.serviceIds) && branch.serviceIds.length > 0,
});

console.log('🔍 [BRANCH] Services:', {
  branchServiceIds,
  allServicesCount: allServices.length,
  filteredServicesCount: branchServiceIds.length > 0 ? allServices.filter(service => branchServiceIds.includes(service.id)).length : 0,
});
```

Bu log'lar browser console'da ko'rinadi va muammoni aniqlashga yordam beradi.

---

## 🎯 XULOSA

### Services:
- ✅ Admin Panel → Filiallar → Filialni tahrirlash → "Xizmatlar" maydonidan tanlash
- ✅ Services `/services/admin` endpoint'idan keladi
- ✅ Frontend'da `/services?public=true` endpoint'idan keladi
- ✅ Agar `serviceIds` bo'sh bo'lsa, dastlabki 6 ta service ko'rsatiladi

### Working Hours:
- ✅ Admin Panel → Filiallar → Filialni tahrirlash → "Ish vaqti (uz)" va "Ish vaqti (ru)" maydonlariga kirish
- ✅ Har bir qatorga alohida yozish
- ✅ Agar ma'lumotlar bo'sh bo'lsa, default ish vaqti ko'rsatiladi

---

**Oxirgi yangilanish:** 2024-yil







