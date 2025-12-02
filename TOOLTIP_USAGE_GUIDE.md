# Tooltip Kiritish Qo'llanmasi

## 📝 Qanday Kiritish

Mahsulot texnik ma'lumotlarida (specifications) tooltip'larni kiritish uchun quyidagi formatdan foydalaning:

### Format:
```
[tooltips keyword="Kalit so'z" content="Tooltip matni"]
```

### Misollar:

#### 1. Oddiy Tooltip
```
[tooltips keyword="MoreSound Intelligence" content="More Sound Intelligence — это революционная технология, которая позволяет пациентам получать удовольствие, следить за разговорами и участвовать в них."]
```

#### 2. Jadval Ichida
HTML jadval ichida tooltip'larni shunday kiritasiz:

```html
<td>
  [tooltips keyword="Virtual Outer Ear" content="Три реалистичные модели ушной раковины для лучшего пространственного баланса."]
</td>
```

#### 3. Bir Nechta Tooltip
Bir qatorda bir nechta tooltip bo'lishi mumkin:

```html
<td>
  [tooltips keyword="MoreSound Optimizer™" content="Оптимальное усиление в течение всего дня, без риска обратной связи."] & 
  [tooltips keyword="Feedback shield" content="Feedback shield обеспечивает эффективный подход к управлению обратной связью с превосходным качеством звука."]
</td>
```

---

## 🎯 QAYERDA ISHLATILADI

### 1. Product Tabs (Texnologiyalar, Sozlash diapazoni)
**Maydon:** `tech_uz`, `tech_ru`, `fittingRange_uz`, `fittingRange_ru`

**Misol:**
```html
<p>
  [tooltips keyword="MoreSound Intelligence" content="More Sound Intelligence — это революционная технология, которая позволяет пациентам получать удовольствие, следить за разговорами и участвовать в них."]
  технология mavjud.
</p>
```

### 2. Product Specs Table (Asosiy xususiyatlar)
**Maydon:** `specsText`

**Misol:**
```html
<table>
  <tr>
    <td>Texnologiya</td>
    <td>[tooltips keyword="MoreSound Intelligence" content="More Sound Intelligence — это революционная технология."]</td>
  </tr>
</table>
```

### 3. Product Features List
**Maydon:** `description_uz`, `description_ru`

**Misol:**
```html
<table>
  <tr>
    <td>[tooltips keyword="Spatial Sound™" content="Улучшает способность находить самые интересные звуки."]</td>
    <td>4 оценщика</td>
  </tr>
</table>
```

---

## 📋 TO'LIQ MISOL

### Admin Panelda Kiritish:

**Maydon:** `tech_ru` (Texnologiyalar - Rus tili)

**Qiymat:**
```html
<p>
  OWN seriyasida quyidagi texnologiyalar mavjud:
</p>
<ul>
  <li>
    [tooltips keyword="MoreSound Intelligence" content="More Sound Intelligence — это революционная технология, которая позволяет пациентам получать удовольствие, следить за разговорами и участвовать в них. Он всесторонне сканирует и точно анализирует звуковую сцену."]
  </li>
  <li>
    [tooltips keyword="Speech Rescue™" content="По мере снижения слуха человек теряет способность воспринимать высокие частоты. Впервые используемая компанией Oticon инновационная технологии Speech Rescue™, которая восстанавливает доступ к утраченным высокочастотным звукам у пациентов даже с тяжелой и глубокой степенью потери слуха."]
  </li>
  <li>
    [tooltips keyword="Spatial Sound™" content="Улучшает способность находить самые интересные звуки."]
  </li>
</ul>
```

### Frontend'da Ko'rinishi:

- **MoreSound Intelligence** (underline, hover qilganda tooltip ko'rinadi)
- **Speech Rescue™** (underline, hover qilganda tooltip ko'rinadi)
- **Spatial Sound™** (underline, hover qilganda tooltip ko'rinadi)

---

## 🎨 TOOLTIP KO'RINISHI

### Styling:
- **Keyword:** To'q sariq rang, dashed underline (`border-brand-primary/40`)
- **Hover:** To'q sariq rang (`hover:border-brand-primary`)
- **Tooltip:** Qora fon, oq matn, shadow
- **Cursor:** `help` (question mark)

### Tooltip Content:
- **Title:** Bold, oq rang
- **Description:** Gray rang, leading-relaxed
- **Position:** Avtomatik (yuqorida yoki pastda, ekran chegarasiga qarab)

---

## ✅ QOIDALAR

### 1. Format Qoidalari:
- ✅ `keyword` va `content` qo'shtirnoq ichida bo'lishi kerak
- ✅ `keyword` va `content` o'rtasida bo'sh joy bo'lishi kerak
- ✅ `content` ichida qo'shtirnoq bo'lsa, escape qilish kerak: `\"`

### 2. Content Qoidalari:
- ✅ Tooltip matni qisqa va tushunarli bo'lishi kerak (100-200 belgi)
- ✅ Texnik terminlar tushuntirilishi kerak
- ✅ Rus yoki O'zbek tilida yozilishi mumkin

### 3. HTML Qoidalari:
- ✅ HTML jadval ichida ishlatish mumkin
- ✅ Paragraf ichida ishlatish mumkin
- ✅ List ichida ishlatish mumkin

---

## 🔍 MISOL: OWN Seriyasi

### Admin Panelda:

**Maydon:** `specsText`

**Qiymat:**
```html
<table>
  <tr>
    <td>OWN 1</td>
    <td>OWN 3</td>
    <td>OWN 5</td>
  </tr>
  <tr>
    <td>MoreSound Intelligence</td>
    <td>
      [tooltips keyword="MoreSound Intelligence" content="More Sound Intelligence — это революционная технология, которая позволяет пациентам получать удовольствие, следить за разговорами и участвовать в них."]
    </td>
    <td>
      [tooltips keyword="MoreSound Intelligence" content="More Sound Intelligence — это революционная технология, которая позволяет пациентам получать удовольствие, следить за разговорами и участвовать в них."]
    </td>
  </tr>
  <tr>
    <td>Virtual Outer Ear</td>
    <td>
      [tooltips keyword="Virtual Outer Ear" content="Три реалистичные модели ушной раковины для лучшего пространственного баланса."]
    </td>
    <td>
      [tooltips keyword="Virtual Outer Ear" content="Три реалистичные модели ушной раковины для лучшего пространственного баланса."]
    </td>
  </tr>
  <tr>
    <td>Sound Enhancer</td>
    <td>
      [tooltips keyword="Sound Enhancer" content="Динамическое усиление в первую очередь для речи, передаваемой в сложных условиях."]
    </td>
    <td>
      [tooltips keyword="Sound Enhancer" content="Динамическое усиление в первую очередь для речи, передаваемой в сложных условиях."]
    </td>
  </tr>
</table>
```

### Frontend'da:

Jadvalda "MoreSound Intelligence", "Virtual Outer Ear", "Sound Enhancer" so'zlari underline bilan ko'rinadi va hover qilganda tooltip ochiladi.

---

## 🚀 QO'SHIMCHA MISOLLAR

### 1. Feedback Shield
```
[tooltips keyword="Feedback shield" content="Feedback shield обеспечивает эффективный подход к управлению обратной связью с превосходным качеством звука, сохраняя при этом сигнал свободным от завывания и артефактов."]
```

### 2. Speech Rescue™
```
[tooltips keyword="Speech Rescue™" content="По мере снижения слуха человек теряет способность воспринимать высокие частоты. Впервые используемая компанией Oticon инновационная технологии Speech Rescue™, которая восстанавливает доступ к утраченным высокочастотным звукам у пациентов даже с тяжелой и глубокой степенью потери слуха."]
```

### 3. MoreSound Amplifier™
```
[tooltips keyword="MoreSound Amplifier™" content="MoreSound Amplifier — это новаторская сбалансированная система усиления. Он плавно адаптирует свое разрешение и скорость к характеру звуковой сцены."]
```

### 4. Tinnitus SoundSupport™
```
[tooltips keyword="Tinnitus SoundSupport™" content="Функция Tinnitus SoundSupport™ представляет собой управляемый звуковой сигнал, который может перекрыть собственный шум человека принося ему облегчение."]
```

### 5. Oticon ON app
```
[tooltips keyword="Oticon ON app & Oticon RemoteCare app" content="Приложение Oticon ON обеспечивает незаметное дистанционное управление вашими слуховыми аппаратами, позволяя легко менять громкость или программы прослушивания. Oticon RemoteCare позволяет вам проводить виртуальные встречи с выбранными клиентами, где вы можете удаленно настроить их слуховые аппараты и виртуально провести аудиометрию на месте."]
```

---

## ⚠️ MUAMMOLAR VA YECHIMLAR

### Muammo 1: Tooltip Ko'rinmaydi
**Sabab:** Format noto'g'ri  
**Yechim:** Formatni tekshiring: `[tooltips keyword="..." content="..."]`

### Muammo 2: Tooltip Matni To'liq Emas
**Sabab:** Content ichida qo'shtirnoq escape qilinmagan  
**Yechim:** Qo'shtirnoq o'rniga `\"` yoki boshqa belgi ishlating

### Muammo 3: HTML Taglar Ko'rinadi
**Sabab:** HTML escape qilinmagan  
**Yechim:** Admin panelda HTML editor ishlatilsa, avtomatik escape qilinadi

---

## 📊 NATIJA

Tooltip'larni kiritgandan keyin:

1. ✅ Frontend'da keyword underline bilan ko'rinadi
2. ✅ Hover qilganda tooltip ochiladi
3. ✅ Tooltip'da keyword va tushuntirish ko'rinadi
4. ✅ Tooltip avtomatik pozitsiyalanadi (yuqorida yoki pastda)

---

## ✅ XULOSA

Tooltip'larni kiritish juda oson:
1. Admin panelda mahsulot ma'lumotlarini kiritish
2. Tooltip kerak bo'lgan joyda `[tooltips keyword="..." content="..."]` formatini ishlatish
3. Saqlash

Frontend'da avtomatik tooltip'lar ko'rinadi!






