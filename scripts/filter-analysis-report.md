# Mahsulot Filterlari Tahlil Hisoboti

**Sana:** 2026-01-24  
**Jami mahsulotlar:** 61 ta (published)

---

## 📊 Umumiy Statistika

| Ko'rsatkich | Qiymat |
|------------|--------|
| Jami mahsulotlar | 61 |
| Brendlar soni | 3 (Signia, Interacoustics, ReSound) |
| Mahsulot turlari | 2 (hearing-aids, interacoustics) |
| Mavjudlik holatlari | 1 (in-stock) |

---

## ✅ To'liq To'ldirilgan Filterlar (100%)

### 1. **Brend (brandId)**
- ✅ **100% to'ldirilgan** (61/61)
- Eng ko'p: Signia (50 ta, 81.97%)
- Interacoustics (10 ta, 16.39%)
- ReSound (1 ta, 1.64%)

### 2. **Mahsulot turi (productType)**
- ✅ **100% to'ldirilgan** (61/61)
- hearing-aids: 51 ta (83.61%)
- interacoustics: 10 ta (16.39%)

### 3. **Signal Processing**
- ✅ **100% to'ldirilgan** (61/61)
- Barchasi: `digital`

### 4. **Power Level**
- ✅ **100% to'ldirilgan** (61/61)
- standard: 50 ta (81.97%)
- powerful: 11 ta (18.03%)

### 5. **Availability Status**
- ✅ **100% to'ldirilgan** (61/61)
- Barchasi: `in-stock`

---

## ⚠️ Qisman To'ldirilgan Filterlar

### 6. **Audience (Kimlar uchun)**
- ⚠️ **98.36% to'ldirilgan** (60/61)
- adults: 48 ta (78.69%)
- elderly: 25 ta (40.98%)
- children: 0 ta (0%)
- **Belgilanmagan: 1 ta mahsulot** (1.64%)

**Kerakli ish:** 1 ta mahsulotga audience belgilash kerak.

### 7. **Form Factors (Korpus turi)**
- ⚠️ **81.97% to'ldirilgan** (50/61)
- BTE: 34 ta (55.74%)
- RIC: 14 ta (22.95%)
- ITE: 3 ta (4.92%)
- ITC: 3 ta (4.92%)
- CIC: 2 ta (3.28%)
- **Belgilanmagan: 11 ta mahsulot** (18.03%)

**Kerakli ish:** 11 ta mahsulotga formFactors belgilash kerak.

### 8. **Smartphone Compatibility**
- ⚠️ **86.89% to'ldirilgan** (53/61)
- bluetooth: 50 ta (81.97%)
- app: 50 ta (81.97%)
- phone-calls: 50 ta (81.97%)
- streaming: 9 ta (14.75%)
- **Belgilanmagan: 8 ta mahsulot** (13.11%)

**Kerakli ish:** 8 ta mahsulotga smartphoneCompatibility belgilash kerak.

---

## ❌ To'liq Bo'sh Filterlar

### 9. **Kataloglar (Catalogs)**
- ❌ **0% to'ldirilgan** (0/61)
- Hech qanday mahsulot kataloglarga biriktirilmagan!
- 9 ta katalog mavjud, lekin hech biri ishlatilmayapti.

**Kerakli ish:** Barcha mahsulotlarni tegishli kataloglarga biriktirish kerak.

### 10. **Hearing Loss Levels**
- ❌ **16.39% to'ldirilgan** (10/61)
- **Belgilanmagan: 51 ta mahsulot** (83.61%)
- mild: 0 ta
- moderate: 0 ta
- severe: 0 ta
- profound: 0 ta

**Kerakli ish:** 51 ta mahsulotga hearingLossLevels belgilash kerak.

### 11. **Payment Options**
- ❌ **1.64% to'ldirilgan** (1/61)
- **Belgilanmagan: 60 ta mahsulot** (98.36%)
- cash-card: 0 ta
- installment-0: 0 ta
- installment-6: 0 ta

**Kerakli ish:** 60 ta mahsulotga paymentOptions belgilash kerak.

---

## 📋 To'ldirilganlik Jadvali

| Filter | To'ldirilgan | Bo'sh | Foiz |
|--------|--------------|-------|------|
| Brend | 61 | 0 | 100% ✅ |
| Mahsulot turi | 61 | 0 | 100% ✅ |
| Signal Processing | 61 | 0 | 100% ✅ |
| Power Level | 61 | 0 | 100% ✅ |
| Availability Status | 61 | 0 | 100% ✅ |
| Audience | 60 | 1 | 98.36% ⚠️ |
| Smartphone Compatibility | 53 | 8 | 86.89% ⚠️ |
| Form Factors | 50 | 11 | 81.97% ⚠️ |
| Hearing Loss Levels | 10 | 51 | 16.39% ❌ |
| Payment Options | 1 | 60 | 1.64% ❌ |
| Kataloglar | 0 | 61 | 0% ❌ |

---

## 🎯 Prioritizatsiya

### **Yuqori Prioritet (Filterlar ishlashi uchun zarur):**

1. **Kataloglar** - 0% to'ldirilgan
   - Barcha 61 ta mahsulotni tegishli kataloglarga biriktirish kerak
   - Bu filter frontend'da ishlatilmayapti, lekin backend'da mavjud

2. **Form Factors** - 11 ta mahsulot bo'sh
   - Bu eng muhim filterlardan biri
   - Frontend'da ishlatiladi

3. **Smartphone Compatibility** - 8 ta mahsulot bo'sh
   - Frontend'da ishlatiladi

### **O'rta Prioritet:**

4. **Audience** - 1 ta mahsulot bo'sh
   - Frontend'da ishlatiladi

5. **Hearing Loss Levels** - 51 ta mahsulot bo'sh
   - Frontend'da ishlatiladi, lekin hozircha hech qanday mahsulotda belgilanmagan

### **Past Prioritet:**

6. **Payment Options** - 60 ta mahsulot bo'sh
   - Backend'da mavjud, lekin frontend'da ishlatilmayapti

---

## 🔍 Frontend vs Backend Filterlar

### Frontend'da ishlatiladigan filterlar:
- ✅ Brend (brandId)
- ✅ Korpus turi (formFactor)
- ✅ Signal Processing
- ✅ Power Level
- ✅ Hearing Loss Level
- ✅ Smartphone Compatibility
- ✅ Audience (frontend'da ko'rsatilmaydi, lekin backend'da mavjud)

### Backend'da mavjud, lekin frontend'da ishlatilmaydigan filterlar:
- ❌ Kataloglar (catalogId)
- ❌ Payment Options
- ❌ Category (o'chirilgan)

---

## 📝 Tavsiyalar

1. **Darhol to'ldirish kerak:**
   - Form Factors: 11 ta mahsulot
   - Smartphone Compatibility: 8 ta mahsulot
   - Audience: 1 ta mahsulot

2. **Kataloglarni biriktirish:**
   - Barcha mahsulotlarni tegishli kataloglarga biriktirish
   - Kataloglar filter sifatida ishlatilishi mumkin

3. **Hearing Loss Levels:**
   - Bu filter frontend'da mavjud, lekin hech qanday ma'lumot yo'q
   - Agar bu filter ishlatilishi kerak bo'lsa, barcha mahsulotlarga belgilash kerak

4. **Payment Options:**
   - Agar bu filter ishlatilishi kerak bo'lsa, barcha mahsulotlarga belgilash kerak
   - Yoki frontend'da o'chirish kerak

---

## 🚀 Keyingi Qadamlar

1. ✅ **Form Factors** - 11 ta mahsulotni to'ldirish
2. ✅ **Smartphone Compatibility** - 8 ta mahsulotni to'ldirish
3. ✅ **Audience** - 1 ta mahsulotni to'ldirish
4. ⚠️ **Kataloglar** - Barcha mahsulotlarni kataloglarga biriktirish
5. ⚠️ **Hearing Loss Levels** - Qaror qabul qilish: ishlatiladimi yoki o'chiriladimi?
6. ⚠️ **Payment Options** - Qaror qabul qilish: ishlatiladimi yoki o'chiriladimi?
