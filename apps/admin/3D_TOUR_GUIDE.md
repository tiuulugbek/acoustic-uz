# 3D Tour Qo'shish Qo'llanmasi

## 📋 Umumiy ma'lumot

Har bir filialga 3D virtual tour qo'shish uchun quyidagi qadamlarni bajaring.

## 🎯 Qadam 1: Panorama rasmlarni tayyorlash

### 1.1 Panorama rasmlarni olish

Filialning 360° panorama rasmlarini oling. Bu quyidagi usullar bilan amalga oshirilishi mumkin:
- **360° kamera** (Ricoh Theta, Insta360, yoki boshqa)
- **Telefon** (Google Street View, Panorama 360° app)
- **Professional xizmatlar** (360° panoramalar yaratish)

### 1.2 Rasmlarni saqlash

Panorama rasmlarni quyidagi papkaga qo'ying:
```
apps/frontend/public/panorama/
```

**Masalan:**
- `chilonzor-room1.jpg` - Chilonzor filiali, 1-xona
- `chilonzor-room2.jpg` - Chilonzor filiali, 2-xona
- `yunusobod-hall.jpg` - Yunusobod filiali, zal

**Muhim:** 
- Rasmlar **equirectangular** formatda bo'lishi kerak (360° panorama)
- Rasm nomida bo'sh joylar bo'lmasligi kerak (masalan: `room 1.jpg` ❌, `room1.jpg` ✅)
- Rasm hajmi optimallashtirilgan bo'lishi kerak (masalan: 2-5 MB)

## 🎯 Qadam 2: Admin panelda 3D tour qo'shish

### 2.1 Filialni tahrirlash

1. Admin panelga kiring: `http://localhost:3002`
2. **Filiallar** bo'limiga o'ting
3. Qo'shmoqchi bo'lgan filialni **Tahrirlash** tugmasini bosing

### 2.2 3D Tour konfiguratsiyasini kiriting

Form'da quyidagi maydonlarni toping:

#### **3D Tour Konfiguratsiyasi (Pannellum)** maydoni

Bu maydonga JSON formatida konfiguratsiya kiriting. Quyidagi misolni ishlating:

```json
{
  "default": {
    "firstScene": "hall",
    "hfov": 100,
    "pitch": 0,
    "yaw": 0,
    "autoLoad": true,
    "autoRotate": -2,
    "compass": true
  },
  "scenes": {
    "hall": {
      "id": "hall",
      "panorama": "/panorama/chilonzor-hall.jpg",
      "type": "equirectangular",
      "hfov": 100,
      "pitch": 0,
      "yaw": 0,
      "title": {
        "uz": "Asosiy zal",
        "ru": "Главный зал"
      },
      "hotSpots": [
        {
          "pitch": -10,
          "yaw": 30,
          "type": "scene",
          "text": "Konsultatsiya xonasiga o'tish",
          "sceneId": "consultation"
        },
        {
          "pitch": 5,
          "yaw": -45,
          "type": "info",
          "text": "Qabulxona",
          "description": "Bu yerda bemorlar qabul qilinadi"
        }
      ],
      "order": 1
    },
    "consultation": {
      "id": "consultation",
      "panorama": "/panorama/chilonzor-consultation.jpg",
      "type": "equirectangular",
      "hfov": 100,
      "pitch": 0,
      "yaw": 0,
      "title": {
        "uz": "Konsultatsiya xonasi",
        "ru": "Кабинет консультации"
      },
      "hotSpots": [
        {
          "pitch": -10,
          "yaw": -30,
          "type": "scene",
          "text": "Asosiy zalga qaytish",
          "sceneId": "hall"
        }
      ],
      "order": 2
    }
  },
  "autoRotate": -2,
  "autoLoad": true,
  "showControls": true,
  "showFullscreenCtrl": true,
  "showZoomCtrl": true,
  "keyboardZoom": true,
  "mouseZoom": true,
  "compass": false
}
```

### 2.3 Konfiguratsiya parametrlari tushuntirilishi

#### **default** bo'limi:
- `firstScene` - Birinchi ko'rsatiladigan sahna ID si
- `hfov` - Boshlang'ich ko'rish burchagi (100-120 tavsiya etiladi)
- `pitch` - Vertikal burilish (-90 dan 90 gacha)
- `yaw` - Gorizontal burilish (-180 dan 180 gacha)
- `autoLoad` - Avtomatik yuklash (true/false)
- `autoRotate` - Avtomatik aylanish tezligi (0 = o'chirilgan, -2 = sekin)
- `compass` - Kompas ko'rsatish (true/false)

#### **scenes** bo'limi:
Har bir sahna uchun:
- `id` - Sahna identifikatori (majburiy)
- `panorama` - Panorama rasm yo'li (`/panorama/fayl-nomi.jpg`)
- `type` - Panorama turi (`equirectangular` yoki `cubemap`)
- `hfov` - Ko'rish burchagi
- `pitch` - Vertikal pozitsiya
- `yaw` - Gorizontal pozitsiya
- `title` - Sahna nomi (uz/ru)
- `hotSpots` - Hotspotlar ro'yxati
- `order` - Ko'rsatish tartibi

#### **hotSpots** parametrlari:
- `pitch` - Vertikal pozitsiya (-90 dan 90 gacha)
- `yaw` - Gorizontal pozitsiya (-180 dan 180 gacha)
- `type` - Hotspot turi:
  - `scene` - Boshqa sahna'ga o'tish
  - `info` - Ma'lumot ko'rsatish
- `text` - Tooltip matni
- `sceneId` - Agar `type: "scene"` bo'lsa, o'tiladigan sahna ID si
- `description` - Agar `type: "info"` bo'lsa, ko'rsatiladigan ma'lumot

## 🎯 Qadam 3: Hotspot pozitsiyalarini topish

Hotspot pozitsiyalarini topish uchun:

1. **Frontend'da tour sahifasini oching**: `http://localhost:3000/tour`
2. **Browser console'ni oching** (F12 yoki Cmd+Option+I)
3. **Panoramani aylantiring** va kerakli nuqtaga keling
4. **Console'da quyidagi kodni ishlating**:

```javascript
// Viewer instance'ni olish
const viewer = document.querySelector('#pannellum').pannellum.viewer;

// Joriy pozitsiyani olish
const pitch = viewer.getPitch();
const yaw = viewer.getYaw();

console.log(`Pitch: ${pitch}, Yaw: ${yaw}`);
```

5. **Olingan qiymatlarni** konfiguratsiyaga qo'shing

## 🎯 Qadam 4: Saqlash va tekshirish

1. **Saqlash** tugmasini bosing
2. **Frontend'da filial sahifasini oching**: `http://localhost:3000/branches/chilonzor`
3. **3D Tour** bo'limini toping va tekshiring

## 📝 Misol: Chilonzor filiali uchun to'liq konfiguratsiya

```json
{
  "default": {
    "firstScene": "reception",
    "hfov": 110,
    "pitch": -3,
    "yaw": 117,
    "autoLoad": true,
    "autoRotate": -2,
    "compass": true
  },
  "scenes": {
    "reception": {
      "id": "reception",
      "panorama": "/panorama/chilonzor-reception.jpg",
      "type": "equirectangular",
      "hfov": 110,
      "pitch": -3,
      "yaw": 117,
      "title": {
        "uz": "Qabulxona",
        "ru": "Ресепшн"
      },
      "hotSpots": [
        {
          "pitch": -2.1,
          "yaw": 132.6,
          "type": "scene",
          "text": "Konsultatsiya xonasiga o'tish",
          "sceneId": "consultation"
        },
        {
          "pitch": 14.1,
          "yaw": -50.1,
          "type": "info",
          "text": "Qabulxona stoli",
          "description": "Bu yerda bemorlar ro'yxatdan o'tkaziladi"
        }
      ],
      "order": 1
    },
    "consultation": {
      "id": "consultation",
      "panorama": "/panorama/chilonzor-consultation.jpg",
      "type": "equirectangular",
      "hfov": 110,
      "pitch": -3,
      "yaw": 117,
      "title": {
        "uz": "Konsultatsiya xonasi",
        "ru": "Кабинет консультации"
      },
      "hotSpots": [
        {
          "pitch": -2.1,
          "yaw": -47.4,
          "type": "scene",
          "text": "Qabulxonaga qaytish",
          "sceneId": "reception"
        },
        {
          "pitch": 5,
          "yaw": 90,
          "type": "info",
          "text": "Eshitish apparati",
          "description": "Professional eshitish apparatlari ko'rsatiladi"
        }
      ],
      "order": 2
    }
  },
  "autoRotate": -2,
  "autoLoad": true,
  "showControls": true,
  "showFullscreenCtrl": true,
  "showZoomCtrl": true,
  "keyboardZoom": true,
  "mouseZoom": true,
  "compass": false
}
```

## ⚠️ Muhim eslatmalar

1. **Rasm yo'llari** har doim `/panorama/` dan boshlanishi kerak
2. **JSON format** to'g'ri bo'lishi kerak (vergul, qavslar)
3. **Sahna ID lari** takrorlanmasligi kerak
4. **Hotspot pozitsiyalari** to'g'ri bo'lishi kerak (pitch, yaw)
5. **Rasm fayllari** `public/panorama/` papkasida bo'lishi kerak

## 🐛 Muammolarni hal qilish

### Panorama yuklanmayapti:
- Rasm yo'lini tekshiring (`/panorama/fayl-nomi.jpg`)
- Rasm fayli `public/panorama/` papkasida ekanligini tekshiring
- Browser console'dagi xatolarni ko'ring

### Hotspot ishlamayapti:
- `sceneId` to'g'ri ekanligini tekshiring (sahna ID si mavjud bo'lishi kerak)
- Hotspot pozitsiyalarini tekshiring (pitch, yaw)

### JSON xatosi:
- JSON formatini tekshiring (vergullar, qavslar)
- Online JSON validator ishlating: https://jsonlint.com/

## 📞 Yordam

Agar muammo bo'lsa, quyidagi fayllarni tekshiring:
- `apps/frontend/src/components/tour/PanoramaViewer.tsx` - Tour komponenti
- `apps/frontend/src/app/branches/[slug]/page.tsx` - Filial sahifasi
- `apps/frontend/public/tour-config.example.json` - Misol konfiguratsiya

