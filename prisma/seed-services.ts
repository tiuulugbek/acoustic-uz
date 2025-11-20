import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServices() {
  // Get all service categories
  const categories = await prisma.serviceCategory.findMany({
    where: { status: 'published' },
    orderBy: { order: 'asc' },
  });

  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat.id]));

  const services = [
    // 1. Bolalar uchun eshitish diagnostikasi
    {
      title_uz: 'Bolalar uchun eshitish tekshiruvi',
      title_ru: 'Проверка слуха для детей',
      excerpt_uz: 'Professional eshitish diagnostikasi - bolalarda eshitish qobiliyatini aniqlash va baholash',
      excerpt_ru: 'Профессиональная диагностика слуха - выявление и оценка слуховых способностей у детей',
      body_uz: `Acoustic eshitish markazida bolalar uchun eshitish diagnostikasi professional surdologlar tomonidan amalga oshiriladi. Bizning mutaxassislarimiz bolalarda eshitish qobiliyatini aniqlash, baholash va davolash bo'yicha keng tajribaga ega.

## Xizmat tarkibi

- Bola bilan dastlabki suhbat va anamnez olish
- Eshitish qobiliyatini vizual tekshiruv
- Audiometrik tekshiruvlar (bolalar uchun maxsus usullar)
- Timpanometriya (o'rta quloq funksiyasini baholash)
- Natijalarni tahlil qilish va tavsiyalar berish

## Qachon murojaat qilish kerak

- Bola ovozlarga javob bermasa
- Nutq rivojlanishida kechikishlar
- Maktabda o'qishda qiyinchiliklar
- Tez-tez quloq yallig'lanishi

Bizning markazda bolalar uchun qulay sharoitlar yaratilgan va barcha tekshiruvlar xavfsiz va og'riqsiz amalga oshiriladi.`,
      body_ru: `В центре слуха Acoustic диагностика слуха для детей проводится профессиональными сурдологами. Наши специалисты имеют большой опыт в выявлении, оценке и лечении слуховых способностей у детей.

## Состав услуги

- Первичная беседа и сбор анамнеза с ребенком
- Визуальный осмотр слуховых способностей
- Аудиометрические исследования (специальные методы для детей)
- Тимпанометрия (оценка функции среднего уха)
- Анализ результатов и предоставление рекомендаций

## Когда следует обратиться

- Ребенок не реагирует на звуки
- Задержки в развитии речи
- Трудности в обучении в школе
- Частые воспаления уха

В нашем центре созданы комфортные условия для детей, и все исследования проводятся безопасно и безболезненно.`,
      slug: 'bolalar-uchun-eshitish-tekshiruvi',
      categoryId: categoryMap.get('diagnostika-dlya-detey'),
      order: 10,
      status: 'published',
    },
    {
      title_uz: 'Bolalar uchun OAE tekshiruvi',
      title_ru: 'ОАЭ исследование для детей',
      excerpt_uz: 'Otoakustik emissiya (OAE) tekshiruvi - yangi tug\'ilgan chaqaloqlar va kichik bolalarda eshitish qobiliyatini aniqlash',
      excerpt_ru: 'Исследование отоакустической эмиссии (ОАЭ) - выявление слуховых способностей у новорожденных и маленьких детей',
      body_uz: `OAE (Otoakustik Emissiya) tekshiruvi - bu yangi tug'ilgan chaqaloqlar va kichik bolalarda eshitish qobiliyatini aniqlash uchun eng zamonaviy va xavfsiz usul.

## Xizmat afzalliklari

- Xavfsiz va og'riqsiz tekshiruv
- Tez natija (10-15 daqiqa)
- Yuqori aniqlik
- Uyqu holatida ham o'tkazish mumkin

## Qachon tavsiya etiladi

- Yangi tug'ilgan chaqaloqlar uchun skrining
- Eshitish qobiliyatida shubha bo'lganda
- Oilada eshitish muammolari bo'lganda

Acoustic markazida OAE tekshiruvi professional uskunalar yordamida amalga oshiriladi.`,
      body_ru: `Исследование ОАЭ (Отоакустическая Эмиссия) - это самый современный и безопасный метод выявления слуховых способностей у новорожденных и маленьких детей.

## Преимущества услуги

- Безопасное и безболезненное исследование
- Быстрый результат (10-15 минут)
- Высокая точность
- Можно проводить во время сна

## Когда рекомендуется

- Скрининг для новорожденных
- При подозрении на проблемы со слухом
- При наличии проблем со слухом в семье

В центре Acoustic исследование ОАЭ проводится с использованием профессионального оборудования.`,
      slug: 'bolalar-uchun-oae-tekshiruvi',
      categoryId: categoryMap.get('diagnostika-dlya-detey'),
      order: 20,
      status: 'published',
    },

    // 2. Diagnostika
    {
      title_uz: 'Umumiy eshitish diagnostikasi',
      title_ru: 'Общая диагностика слуха',
      excerpt_uz: 'To\'liq eshitish diagnostikasi - eshitish qobiliyatini to\'liq baholash va muammolarni aniqlash',
      excerpt_ru: 'Полная диагностика слуха - полная оценка слуховых способностей и выявление проблем',
      body_uz: `Acoustic eshitish markazida professional eshitish diagnostikasi amalga oshiriladi. Bizning mutaxassislarimiz zamonaviy uskunalar yordamida eshitish qobiliyatini to'liq baholaydi.

## Tekshiruv turlari
- Audiometriya (eshitish qobiliyatini o'lchash)
- Timpanometriya (o'rta quloq funksiyasini tekshirish)
- OAE tekshiruvi (ichki quloq funksiyasini baholash)
- ABR tekshiruvi (miya ildizlarining reaktsiyasini o'lchash)

## Natijalar
- Batafsil hisobot
- Eshitish qobiliyatining holati
- Tavsiyalar va davolash rejasi

Bizning markazda barcha tekshiruvlar professional darajada amalga oshiriladi.`,
      body_ru: `В центре слуха Acoustic проводится профессиональная диагностика слуха. Наши специалисты с помощью современного оборудования полностью оценивают слуховые способности.

## Виды исследований
- Аудиометрия (измерение слуховых способностей)
- Тимпанометрия (проверка функции среднего уха)
- Исследование ОАЭ (оценка функции внутреннего уха)
- Исследование ABR (измерение реакции ствола мозга)

## Результаты
- Подробный отчет
- Состояние слуховых способностей
- Рекомендации и план лечения

В нашем центре все исследования проводятся на профессиональном уровне.`,
      slug: 'umumiy-eshitish-diagnostikasi',
      categoryId: categoryMap.get('diagnostika'),
      order: 10,
      status: 'published',
    },

    // 3. Kattalar uchun eshitish diagnostikasi
    {
      title_uz: 'Kattalar uchun eshitish tekshiruvi',
      title_ru: 'Проверка слуха для взрослых',
      excerpt_uz: 'Kattalar uchun professional eshitish diagnostikasi - eshitish qobiliyatini baholash va muammolarni aniqlash',
      excerpt_ru: 'Профессиональная диагностика слуха для взрослых - оценка слуховых способностей и выявление проблем',
      body_uz: `Kattalar uchun eshitish diagnostikasi Acoustic markazida professional surdologlar tomonidan amalga oshiriladi.

## Xizmat tarkibi
- Dastlabki konsultatsiya va anamnez
- Eshitish qobiliyatini tekshirish
- Audiometrik tekshiruvlar
- Timpanometriya
- Natijalarni tahlil qilish

## Qachon murojaat qilish kerak
- Eshitish qobiliyati pasayganida
- Quloqda shovqin bo'lganda
- Quloq og'rig'i bo'lganda
- Bosh aylanishi bo'lganda

Bizning markazda kattalar uchun qulay sharoitlar yaratilgan.`,
      body_ru: `Диагностика слуха для взрослых в центре Acoustic проводится профессиональными сурдологами.

## Состав услуги
- Первичная консультация и сбор анамнеза
- Проверка слуховых способностей
- Аудиометрические исследования
- Тимпанометрия
- Анализ результатов

## Когда следует обратиться
- При снижении слуха
- При шуме в ушах
- При боли в ухе
- При головокружении

В нашем центре созданы комфортные условия для взрослых.`,
      slug: 'kattalar-uchun-eshitish-tekshiruvi',
      categoryId: categoryMap.get('diagnostika-dlya-vzroslyh'),
      order: 10,
      status: 'published',
    },
    {
      title_uz: 'Kattalar uchun audiometriya',
      title_ru: 'Аудиометрия для взрослых',
      excerpt_uz: 'Professional audiometrik tekshiruv - eshitish qobiliyatini aniq o\'lchash va baholash',
      excerpt_ru: 'Профессиональное аудиометрическое исследование - точное измерение и оценка слуховых способностей',
      body_uz: `Audiometriya - bu eshitish qobiliyatini o'lchash va baholash uchun asosiy usul. Acoustic markazida zamonaviy audiometrik uskunalar yordamida aniq natijalar olinadi.

## Xizmat afzalliklari
- Yuqori aniqlik
- Tez natija
- Professional tahlil
- Batafsil hisobot

## Tekshiruv jarayoni
- Ovozli xona yoki kabinetda o'tkaziladi
- Turli chastotalarda eshitish qobiliyati o'lchanadi
- Natijalar grafik shaklda ko'rsatiladi

Bizning mutaxassislarimiz natijalarni tahlil qilib, kerakli tavsiyalar beradi.`,
      body_ru: `Аудиометрия - это основной метод измерения и оценки слуховых способностей. В центре Acoustic с помощью современного аудиометрического оборудования получают точные результаты.

## Преимущества услуги
- Высокая точность
- Быстрый результат
- Профессиональный анализ
- Подробный отчет

## Процесс исследования
- Проводится в звукоизолированной комнате или кабинете
- Измеряется слуховая способность на различных частотах
- Результаты отображаются в графическом виде

Наши специалисты анализируют результаты и предоставляют необходимые рекомендации.`,
      slug: 'kattalar-uchun-audiometriya',
      categoryId: categoryMap.get('diagnostika-dlya-vzroslyh'),
      order: 20,
      status: 'published',
    },

    // 4. Maslahat va konsultatsiya
    {
      title_uz: 'Eshitish muammolari bo\'yicha maslahat',
      title_ru: 'Консультация по проблемам слуха',
      excerpt_uz: 'Professional maslahat - eshitish muammolari, davolash va profilaktika bo\'yicha tavsiyalar',
      excerpt_ru: 'Профессиональная консультация - рекомендации по проблемам слуха, лечению и профилактике',
      body_uz: `Acoustic eshitish markazida professional surdologlar eshitish muammolari bo'yicha batafsil maslahat beradi.

## Maslahat mavzulari
- Eshitish qobiliyatining pasayishi
- Quloq shovqini (tinnitus)
- Quloq yallig'lanishi
- Eshitish apparatlari tanlash
- Eshitishni tiklash usullari

## Maslahat davomida
- Muammoni aniqlash
- Sabablarni tushuntirish
- Davolash variantlarini muhokama qilish
- Profilaktika tavsiyalari

Bizning mutaxassislarimiz har bir bemor bilan individual yondashadi.`,
      body_ru: `В центре слуха Acoustic профессиональные сурдологи предоставляют подробную консультацию по проблемам слуха.

## Темы консультации
- Снижение слуха
- Шум в ушах (тиннитус)
- Воспаление уха
- Выбор слуховых аппаратов
- Методы восстановления слуха

## Во время консультации
- Выявление проблемы
- Объяснение причин
- Обсуждение вариантов лечения
- Рекомендации по профилактике

Наши специалисты подходят индивидуально к каждому пациенту.`,
      slug: 'eshitish-muammolari-boyicha-maslahat',
      categoryId: categoryMap.get('konsultatsiya'),
      order: 10,
      status: 'published',
    },

    // 5. Surdolog maslahatlari
    {
      title_uz: 'Surdolog bilan konsultatsiya',
      title_ru: 'Консультация с сурдологом',
      excerpt_uz: 'Professional surdolog bilan konsultatsiya - eshitish muammolarini hal qilish bo\'yicha tavsiyalar',
      excerpt_ru: 'Консультация с профессиональным сурдологом - рекомендации по решению проблем слуха',
      body_uz: `Acoustic markazida tajribali surdologlar bilan konsultatsiya o'tkaziladi. Bizning mutaxassislarimiz eshitish muammolarini hal qilishda keng tajribaga ega.

## Konsultatsiya tarkibi
- Bemor bilan suhbat
- Eshitish qobiliyatini tekshirish
- Muammoni aniqlash
- Davolash rejasini tuzish
- Profilaktika tavsiyalari

## Qachon murojaat qilish kerak
- Eshitish qobiliyatida o'zgarishlar bo'lganda
- Quloq shovqini bo'lganda
- Eshitish apparati kerak bo'lganda
- Ikkinchi fikr kerak bo'lganda

Bizning markazda barcha konsultatsiyalar professional darajada o'tkaziladi.`,
      body_ru: `В центре Acoustic проводятся консультации с опытными сурдологами. Наши специалисты имеют большой опыт в решении проблем слуха.

## Состав консультации
- Беседа с пациентом
- Проверка слуховых способностей
- Выявление проблемы
- Составление плана лечения
- Рекомендации по профилактике

## Когда следует обратиться
- При изменениях в слухе
- При шуме в ушах
- При необходимости слухового аппарата
- При необходимости второго мнения

В нашем центре все консультации проводятся на профессиональном уровне.`,
      slug: 'surdolog-bilan-konsultatsiya',
      categoryId: categoryMap.get('konsultatsii-surdologov'),
      order: 10,
      status: 'published',
    },

    // 6. Korreksiya va reabilitatsiya
    {
      title_uz: 'Eshitishni tiklash dasturi',
      title_ru: 'Программа восстановления слуха',
      excerpt_uz: 'Individual eshitishni tiklash dasturi - eshitish qobiliyatini yaxshilash va tiklash',
      excerpt_ru: 'Индивидуальная программа восстановления слуха - улучшение и восстановление слуховых способностей',
      body_uz: `Acoustic markazida har bir bemor uchun individual eshitishni tiklash dasturi tuziladi.

## Dastur tarkibi
- Dastlabki diagnostika
- Individual reja tuzish
- Davolash kursi
- Muntazam monitoring
- Natijalarni baholash

## Davolash usullari
- Eshitish apparatlari bilan korreksiya
- Audioterapiya
- Nutq terapiyasi
- Profilaktika choralari

Bizning mutaxassislarimiz har bir bemor bilan individual ishlaydi.`,
      body_ru: `В центре Acoustic для каждого пациента составляется индивидуальная программа восстановления слуха.

## Состав программы
- Первичная диагностика
- Составление индивидуального плана
- Курс лечения
- Регулярный мониторинг
- Оценка результатов

## Методы лечения
- Коррекция с помощью слуховых аппаратов
- Аудиотерапия
- Речевая терапия
- Профилактические меры

Наши специалисты работают индивидуально с каждым пациентом.`,
      slug: 'eshitishni-tiklash-dasturi',
      categoryId: categoryMap.get('korreksiya-reabilitatsiya'),
      order: 10,
      status: 'published',
    },

    // 7. Eshitish apparatlari bilan eshitishni tuzatish
    {
      title_uz: 'Eshitish apparatini tanlash va sozlash',
      title_ru: 'Выбор и настройка слухового аппарата',
      excerpt_uz: 'Professional eshitish apparatini tanlash va individual sozlash - sizga mos apparatni topish',
      excerpt_ru: 'Профессиональный выбор и индивидуальная настройка слухового аппарата - найти подходящий вам аппарат',
      body_uz: `Acoustic markazida professional mutaxassislar sizga mos eshitish apparatini tanlashda yordam beradi.

## Xizmat tarkibi
- Eshitish qobiliyatini baholash
- Apparat turini tanlash
- Individual sozlash
- O'qitish va maslahat
- Keyingi xizmat ko'rsatish

## Apparat turlari
- BTE (quloq orqasida)
- ITE (quloq ichida)
- RIC (kanal ichida)
- Zamonaviy raqamli apparatlar

Bizning mutaxassislarimiz sizga eng mos apparatni tanlashda yordam beradi.`,
      body_ru: `В центре Acoustic профессиональные специалисты помогут вам выбрать подходящий слуховой аппарат.

## Состав услуги
- Оценка слуховых способностей
- Выбор типа аппарата
- Индивидуальная настройка
- Обучение и консультация
- Последующее обслуживание

## Типы аппаратов
- BTE (за ухом)
- ITE (в ухе)
- RIC (в канале)
- Современные цифровые аппараты

Наши специалисты помогут вам выбрать наиболее подходящий аппарат.`,
      slug: 'eshitish-apparatini-tanlash-va-sozlash',
      categoryId: categoryMap.get('korrektsiya-sluhom-apparatami'),
      order: 10,
      status: 'published',
    },
    {
      title_uz: 'Eshitish apparatini qayta sozlash',
      title_ru: 'Перенастройка слухового аппарата',
      excerpt_uz: 'Eshitish apparatini qayta sozlash - apparatni yangi ehtiyojlarga moslashtirish',
      excerpt_ru: 'Перенастройка слухового аппарата - адаптация аппарата к новым потребностям',
      body_uz: `Agar sizda allaqachon eshitish apparati bo'lsa, Acoustic markazida uni qayta sozlash xizmati mavjud.

## Qachon kerak
- Eshitish qobiliyati o'zgarganda
- Apparat sozlamalarini yaxshilash kerak bo'lganda
- Yangi funksiyalar qo'shish kerak bo'lganda
- Apparat ishlamay qolganda

## Xizmat tarkibi
- Apparatni tekshirish
- Sozlamalarni yangilash
- Individual sozlash
- Test va tekshiruv

Bizning mutaxassislarimiz barcha brendlar bilan ishlaydi.`,
      body_ru: `Если у вас уже есть слуховой аппарат, в центре Acoustic доступна услуга его перенастройки.

## Когда необходимо
- При изменении слуха
- При необходимости улучшения настроек аппарата
- При необходимости добавления новых функций
- При неисправности аппарата

## Состав услуги
- Проверка аппарата
- Обновление настроек
- Индивидуальная настройка
- Тестирование и проверка

Наши специалисты работают со всеми брендами.`,
      slug: 'eshitish-apparatini-qayta-sozlash',
      categoryId: categoryMap.get('korrektsiya-sluhom-apparatami'),
      order: 20,
      status: 'published',
    },

    // 8. Xizmat ko'rsatish va ta'mirlash
    {
      title_uz: 'Eshitish apparatini ta\'mirlash',
      title_ru: 'Ремонт слухового аппарата',
      excerpt_uz: 'Professional ta\'mirlash xizmati - barcha brendlar uchun eshitish apparatlarini ta\'mirlash',
      excerpt_ru: 'Профессиональный ремонт - ремонт слуховых аппаратов для всех брендов',
      body_uz: `Acoustic markazida barcha brendlar uchun professional ta'mirlash xizmati mavjud.

## Ta'mirlash turlari
- Mexanik shikastlanishlar
- Elektr muammolari
- Mikrofon va dinamik muammolari
- Batareya muammolari
- Dasturiy muammolar

## Xizmat afzalliklari
- Tez diagnostika
- Professional ta'mirlash
- Original ehtiyot qismlar
- Kafolat

Bizning mutaxassislarimiz barcha brendlar bilan ishlaydi.`,
      body_ru: `В центре Acoustic доступна профессиональная услуга ремонта для всех брендов.

## Виды ремонта
- Механические повреждения
- Электрические проблемы
- Проблемы с микрофоном и динамиком
- Проблемы с батареей
- Программные проблемы

## Преимущества услуги
- Быстрая диагностика
- Профессиональный ремонт
- Оригинальные запчасти
- Гарантия

Наши специалисты работают со всеми брендами.`,
      slug: 'eshitish-apparatini-tamirlash',
      categoryId: categoryMap.get('servis-remont'),
      order: 10,
      status: 'published',
    },

    // 9. Qo'shimcha xizmatlar
    {
      title_uz: 'Quloq tozalash xizmati',
      title_ru: 'Услуга чистки ушей',
      excerpt_uz: 'Professional quloq tozalash - quloq kanalini tozalash va parvarish qilish',
      excerpt_ru: 'Профессиональная чистка ушей - очистка и уход за ушным каналом',
      body_uz: `Acoustic markazida professional quloq tozalash xizmati mavjud.

## Xizmat tarkibi
- Quloq kanalini tekshirish
- Professional tozalash
- Parvarish tavsiyalari

## Qachon kerak
- Quloq kanalida haddan tashqari kir bo'lganda
- Eshitish apparati ishlamay qolganda
- Quloq og'rig'i bo'lganda

Bizning mutaxassislarimiz xavfsiz va professional tozalashni amalga oshiradi.`,
      body_ru: `В центре Acoustic доступна профессиональная услуга чистки ушей.

## Состав услуги
- Проверка ушного канала
- Профессиональная чистка
- Рекомендации по уходу

## Когда необходимо
- При избытке серы в ушном канале
- При неисправности слухового аппарата
- При боли в ухе

Наши специалисты проводят безопасную и профессиональную чистку.`,
      slug: 'quloq-tozalash-xizmati',
      categoryId: categoryMap.get('dopolnitelnye-uslugi'),
      order: 10,
      status: 'published',
    },

    // 10. Quloq ichi vkladysh tayyorlash
    {
      title_uz: 'Individual quloq ichi vkladysh tayyorlash',
      title_ru: 'Изготовление индивидуальных ушных вкладышей',
      excerpt_uz: 'Sizga mos individual quloq ichi vkladysh tayyorlash - eshitish apparati uchun',
      excerpt_ru: 'Изготовление индивидуальных ушных вкладышей на заказ - для слухового аппарата',
      body_uz: `Acoustic markazida sizga mos individual quloq ichi vkladysh tayyorlash xizmati mavjud.

## Xizmat tarkibi
- Quloq kanalini o'lchash
- Individual vkladysh tayyorlash
- Test va sozlash
- Kafolat

## Afzalliklari
- Qulaylik
- Yaxshi eshitish
- Xavfsizlik
- Uzoq muddatli xizmat

Bizning mutaxassislarimiz zamonaviy materiallar va texnologiyalar yordamida vkladysh tayyorlaydi.`,
      body_ru: `В центре Acoustic доступна услуга изготовления индивидуальных ушных вкладышей на заказ.

## Состав услуги
- Измерение ушного канала
- Изготовление индивидуального вкладыша
- Тестирование и настройка
- Гарантия

## Преимущества
- Комфорт
- Хороший слух
- Безопасность
- Долгосрочное обслуживание

Наши специалисты изготавливают вкладыши с использованием современных материалов и технологий.`,
      slug: 'individual-quloq-ichi-vkladysh-tayyorlash',
      categoryId: categoryMap.get('izgotovlenie-ushnyh-vkladyshey'),
      order: 10,
      status: 'published',
    },

    // 11. Eshitish apparatlarini xizmat ko'rsatish
    {
      title_uz: 'Eshitish apparatini muntazam xizmat ko\'rsatish',
      title_ru: 'Регулярное обслуживание слухового аппарата',
      excerpt_uz: 'Muntazam xizmat ko\'rsatish - apparatning uzoq muddatli ishlashini ta\'minlash',
      excerpt_ru: 'Регулярное обслуживание - обеспечение долгосрочной работы аппарата',
      body_uz: `Acoustic markazida eshitish apparatlarini muntazam xizmat ko'rsatish xizmati mavjud.

## Xizmat tarkibi
- Apparatni tozalash
- Sozlamalarni tekshirish
- Batareyani almashtirish
- Kichik ta'mirlash
- Maslahat va tavsiyalar

## Afzalliklari
- Uzoq muddatli ishlash
- Yaxshi sifat
- Xavfsizlik
- Kafolat

Bizning mutaxassislarimiz muntazam xizmat ko'rsatishni tavsiya qiladi.`,
      body_ru: `В центре Acoustic доступна услуга регулярного обслуживания слуховых аппаратов.

## Состав услуги
- Чистка аппарата
- Проверка настроек
- Замена батареи
- Мелкий ремонт
- Консультация и рекомендации

## Преимущества
- Долгосрочная работа
- Хорошее качество
- Безопасность
- Гарантия

Наши специалисты рекомендуют регулярное обслуживание.`,
      slug: 'eshitish-apparatini-muntazam-xizmat-korsatish',
      categoryId: categoryMap.get('servisnoe-obsluzhivanie-apparatov'),
      order: 10,
      status: 'published',
    },

    // 12. Chet el fuqarolarini qabul qilish
    {
      title_uz: 'Chet el fuqarolarini qabul qilish',
      title_ru: 'Прием иностранных граждан',
      excerpt_uz: 'Chet el fuqarolari uchun xizmatlar - O\'zbekistonda bo\'lgan chet elliklar uchun eshitish xizmatlari',
      excerpt_ru: 'Услуги для иностранных граждан - слуховые услуги для иностранцев в Узбекистане',
      body_uz: `Acoustic markazida chet el fuqarolari uchun maxsus xizmatlar mavjud.

## Xizmatlar
- Eshitish diagnostikasi
- Konsultatsiya
- Eshitish apparatini tanlash va sozlash
- Ta'mirlash va xizmat ko'rsatish

## Qulayliklar
- Ingliz tilida konsultatsiya
- Professional xizmat
- Tez va samarali yechimlar

Bizning mutaxassislarimiz chet el fuqarolari bilan ishlashda keng tajribaga ega.`,
      body_ru: `В центре Acoustic доступны специальные услуги для иностранных граждан.

## Услуги
- Диагностика слуха
- Консультация
- Выбор и настройка слухового аппарата
- Ремонт и обслуживание

## Удобства
- Консультация на английском языке
- Профессиональное обслуживание
- Быстрые и эффективные решения

Наши специалисты имеют большой опыт работы с иностранными гражданами.`,
      slug: 'chet-el-fuqarolarini-qabul-qilish',
      categoryId: categoryMap.get('priem-inostrannyh-grazhdan'),
      order: 10,
      status: 'published',
    },

    // 13. Tibbiy xizmatlar narxlari - bu kategoriyaga xizmat qo'shish kerak emas, chunki bu narxlar ro'yxati
  ];

  // Delete existing services to avoid duplicates
  console.log('Deleting existing services...');
  await prisma.service.deleteMany({});

  // Create services
  console.log('Creating services...');
  for (const service of services) {
    try {
      await prisma.service.create({
        data: service,
      });
      console.log(`✓ Created: ${service.title_uz}`);
    } catch (error) {
      console.error(`✗ Failed to create ${service.title_uz}:`, error);
    }
  }

  console.log(`\nSuccessfully created ${services.length} services!`);
}

seedServices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

