# Hydration Error Debug Guide

## Error #306 ni aniq topish

### 1. Browser Console'da to'liq error'ni ko'rish

1. Browser'da `/branches/fargona` sahifasini oching
2. F12 yoki Right Click → Inspect
3. Console tab'ni oching
4. Quyidagi kodni console'ga yozing va Enter bosing:

```javascript
// Enable detailed React error logging
const originalError = console.error;
console.error = function(...args) {
  if (args[0]?.includes?.('Hydration') || args[0]?.includes?.('306') || args[0]?.includes?.('310')) {
    console.group('🔴 Hydration Error Details');
    console.error('Full error:', ...args);
    console.trace('Stack trace:');
    console.groupEnd();
  }
  originalError.apply(console, args);
};

// Reload the page
location.reload();
```

### 2. React DevTools ishlatish

1. Browser'ga React DevTools extension'ni o'rnating
2. F12 → Components tab
3. Hydration error paydo bo'lganda, qaysi komponentda muammo borligini ko'rasiz

### 3. Source Maps bilan build qilish

Source maps endi yoqilgan (`productionBrowserSourceMaps: true`). Rebuild qilingandan keyin:

1. Browser'da error'ni bosib, qaysi faylda muammo borligini ko'rasiz
2. Stack trace'da aniq fayl nomi va qator raqami ko'rinadi

### 4. Manual tekshirish

Hydration error'lar odatda quyidagi sabablarga ko'ra yuzaga keladi:

1. **Server va client'da farq qiluvchi ma'lumotlar:**
   - `new Date()` - server va client'da farq qilishi mumkin
   - `Math.random()` - har safar boshqa qiymat
   - `window`, `document`, `localStorage` - faqat client'da mavjud

2. **Conditional rendering:**
   - `if (typeof window !== 'undefined')` - server'da false, client'da true
   - `useState` initial value - server va client'da farq qilishi mumkin

3. **Third-party libraries:**
   - Ba'zi library'lar faqat client-side ishlaydi

### 5. Qaysi komponentlarni tekshirish kerak

Quyidagi komponentlarni tekshiring:

- `SiteHeader` - locale o'qish, menu rendering
- `SiteFooter` - locale o'qish, menu rendering  
- `BranchTOC` - conditional rendering
- `BranchesMap` - map data processing
- `WorkingHoursDisplay` - date calculations
- `TelegramButton` - third-party script

### 6. Temporary fix - barcha komponentlarni client-only qilish

Agar muammoni topish qiyin bo'lsa, quyidagi komponentlarni `'use client'` va `mounted` state bilan o'zgartiring:

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Component() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null; // yoki loading state
  }
  
  // ... rest of component
}
```

### 7. Browser console'da aniq error'ni ko'rish

Error #306 paydo bo'lganda, browser console'da quyidagilar ko'rinishi kerak:

```
Error: Minified React error #306
  at [component name]
  at [parent component]
  ...
```

Source maps yoqilgan bo'lsa, aniq fayl nomi va qator raqami ko'rinadi.

