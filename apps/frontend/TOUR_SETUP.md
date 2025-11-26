# 3D Virtual Tour Setup Guide

## 📋 Umumiy ma'lumot

Bu loyiha Pannellum kutubxonasi asosida 3D virtual tour yaratish uchun mo'ljallangan. Tashqi servislar (Kuula, Matterport) ishlatilmaydi.

## 🚀 O'rnatish

### 1. Pannellum kutubxonasini o'rnatish

```bash
cd apps/frontend
pnpm add pannellum
```

Yoki CDN orqali (avtomatik yuklanadi):
- CSS: `https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css`
- JS: `https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js`

### 2. Panorama rasmlarni qo'shish

Panorama rasmlarni quyidagi papkaga qo'ying:
```
apps/frontend/public/panorama/
```

Masalan:
- `room1.jpg` - Birinchi xona
- `room2.jpg` - Ikkinchi xona
- `hall.jpg` - Zal

**Muhim:** Panorama rasmlar equirectangular formatda bo'lishi kerak (360° panorama).

### 3. Tour konfiguratsiyasini sozlash

`apps/frontend/public/tour-config.json` faylini tahrirlang:

```json
{
  "default": {
    "firstScene": "room1",
    "hfov": 100,
    "pitch": 0,
    "yaw": 0
  },
  "scenes": {
    "room1": {
      "id": "room1",
      "panorama": "/panorama/room1.jpg",
      "type": "equirectangular",
      "hfov": 100,
      "pitch": 0,
      "yaw": 0,
      "title": {
        "uz": "Asosiy xona",
        "ru": "Главный зал"
      },
      "hotSpots": [
        {
          "pitch": -10,
          "yaw": 30,
          "type": "scene",
          "text": "Ikkinchi xonaga o'tish",
          "sceneId": "room2"
        },
        {
          "pitch": 5,
          "yaw": -45,
          "type": "info",
          "text": "Ma'lumot",
          "description": "Bu xona haqida qo'shimcha ma'lumot"
        }
      ],
      "order": 1
    }
  }
}
```

## 📖 Konfiguratsiya parametrlari

### Scene (Sahna) parametrlari:

- `id` - Sahna identifikatori (majburiy)
- `panorama` - Panorama rasm yo'li (majburiy)
- `type` - Panorama turi (`equirectangular` yoki `cubemap`)
- `hfov` - Boshlang'ich ko'rish burchagi (default: 100)
- `pitch` - Vertikal burilish (default: 0)
- `yaw` - Gorizontal burilish (default: 0)
- `hotSpots` - Hotspotlar ro'yxati
- `title` - Sahna nomi (uz/ru)
- `order` - Ko'rsatish tartibi

### Hotspot parametrlari:

- `pitch` - Vertikal pozitsiya (-90 dan 90 gacha)
- `yaw` - Gorizontal pozitsiya (-180 dan 180 gacha)
- `type` - Hotspot turi (`scene` yoki `info`)
- `text` - Tooltip matni
- `sceneId` - Agar `type: "scene"` bo'lsa, o'tiladigan sahna ID si
- `description` - Agar `type: "info"` bo'lsa, ko'rsatiladigan ma'lumot

## 🎮 Ishlatish

### Frontend'da tour sahifasiga kirish:

```
http://localhost:3000/tour
```

### Kod orqali tour'ga link qo'shish:

```tsx
import Link from 'next/link';

<Link href="/tour">Virtual tur</Link>
```

## 🔧 Hotspot pozitsiyalarini topish

Hotspot pozitsiyalarini topish uchun:

1. Tour sahifasini oching
2. Browser console'ni oching (F12)
3. Panoramani aylantiring va kerakli nuqtaga keling
4. Console'da quyidagi kodni ishlating:

```javascript
// Viewer instance'ni olish
const viewer = document.querySelector('#pannellum').pannellum.viewer;

// Joriy pozitsiyani olish
const pitch = viewer.getPitch();
const yaw = viewer.getYaw();

console.log(`Pitch: ${pitch}, Yaw: ${yaw}`);
```

## 📱 Responsive dizayn

Tour avtomatik ravishda mobil qurilmalarda ham ishlaydi:
- Touch eventlar orqali aylantirish
- Responsive tugmalar
- Landscape rejimda ham to'liq ishlash

## 🎨 Stilni o'zgartirish

Hotspot va tooltip stillarini o'zgartirish uchun `apps/frontend/src/app/globals.css` faylini tahrirlang:

```css
.custom-hotspot {
  /* Hotspot stillari */
}

.pannellum-tooltip {
  /* Tooltip stillari */
}
```

## 🚀 Keyingi bosqichlar (Admin panel)

Keyinchalik admin panel orqali:
- Sahnalar qo'shish/o'chirish
- Hotspot pozitsiyalarini o'zgartirish
- Matnlarni tahrirlash

imkoniyati qo'shiladi.

## 📝 Eslatmalar

1. Panorama rasmlar katta bo'lishi mumkin - optimallashtirish tavsiya etiladi
2. Birinchi sahna avtomatik yuklanadi
3. Boshqa sahnalar hotspot bosilganda yuklanadi
4. Xatolik yuz berganda foydalanuvchiga xabar ko'rsatiladi

## 🐛 Muammolarni hal qilish

### Panorama yuklanmayapti:
- Rasm yo'lini tekshiring (`/panorama/room1.jpg`)
- Rasm equirectangular formatda ekanligini tekshiring
- Browser console'dagi xatolarni ko'ring

### Hotspot ishlamayapti:
- `sceneId` to'g'ri ekanligini tekshiring
- Hotspot pozitsiyalarini tekshiring (pitch, yaw)

### Mobil qurilmada ishlamayapti:
- Touch eventlar yoqilganligini tekshiring
- Browser'ning touch qo'llab-quvvatlashini tekshiring

