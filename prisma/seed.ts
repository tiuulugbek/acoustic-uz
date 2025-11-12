import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.lead.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.page.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.post.deleteMany();
  await prisma.showcase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.service.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
}

async function seedRoles() {
  const roles = [
    { name: 'superadmin', permissions: ['*'] },
    {
      name: 'admin',
      permissions: [
        'users.read',
        'users.write',
        'content.*',
        'settings.read',
        'settings.write',
        'media.*',
        'leads.read',
        'audit.read',
      ],
    },
    {
      name: 'editor',
      permissions: ['content.*', 'media.*', 'leads.read'],
    },
    {
      name: 'viewer',
      permissions: ['content.read', 'media.read', 'leads.read'],
    },
  ];

  for (const role of roles) {
    await prisma.role.create({ data: role });
  }
}

async function seedUsers() {
  const superadminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'superadmin' },
  });

  const hashedPassword = await bcrypt.hash('Admin#12345', 10);

  await prisma.user.create({
    data: {
      email: 'admin@acoustic.uz',
      password: hashedPassword,
      fullName: 'Super Admin',
      roleId: superadminRole.id,
      mustChangePassword: true,
    },
  });
}

async function seedSettings() {
  await prisma.setting.create({
    data: {
      id: 'singleton',
      phonePrimary: '1385',
      phoneSecondary: '+998 71 202 14 41',
      email: 'info@acoustic.uz',
      brandPrimary: '#F07E22',
      brandAccent: '#3F3091',
      featureFlags: {
        home: {
          hero: true,
          services: true,
          hearingAidCategories: true,
          interacousticsCarousel: true,
          cochlearGrid: true,
          pathToBetterHearing: true,
          freshPosts: true,
          faq: true,
          branches: true,
          strongCta: true,
        },
        integrations: {
          telegram: true,
          smtpFallback: false,
          analytics: false,
          sentry: false,
        },
      },
      socialLinks: {
        facebook: 'https://facebook.com/acousticuz',
        instagram: 'https://instagram.com/acoustic.uz',
        telegram: 'https://t.me/acousticuz',
      },
    },
  });
}

async function seedBanners() {
  const banners = Array.from({ length: 3 }).map((_, index) => ({
    title_uz: `Banner ${index + 1} - O'zbek`,
    title_ru: `Баннер ${index + 1} - Русский`,
    text_uz: `Banner ${index + 1} matni - O'zbek`,
    text_ru: `Текст баннера ${index + 1} - Русский`,
    ctaText_uz: "Qo'ng'iroq qilish",
    ctaText_ru: 'Позвонить',
    ctaLink: 'tel:+998712021441',
    order: index + 1,
    status: 'published',
  }));

  await prisma.banner.createMany({ data: banners });
}

async function seedServices() {
  const services = [
    {
      title_uz: 'Eshitish qobiliyatini tekshirish',
      title_ru: 'Проверка слуха',
      excerpt_uz: 'To’liq diagnostika va konsultatsiya',
      excerpt_ru: 'Полная диагностика и консультация',
      slug: 'eshitish-qobiliyatini-tekshirish',
      order: 1,
      status: 'published',
    },
    {
      title_uz: "Quloq apparatlarini tanlash",
      title_ru: 'Подбор слуховых аппаратов',
      excerpt_uz: "Individuallashtirilgan yechimlar",
      excerpt_ru: 'Индивидуальные решения',
      slug: 'quloq-apparatlarini-tanlash',
      order: 2,
      status: 'published',
    },
    {
      title_uz: "Quloq apparatlari xizmat ko'rsatish",
      title_ru: 'Обслуживание слуховых аппаратов',
      excerpt_uz: 'Tozalash va sozlash',
      excerpt_ru: 'Чистка и настройка',
      slug: 'quloq-apparatlari-xizmat',
      order: 3,
      status: 'published',
    },
    {
      title_uz: 'Koxlear implantlar',
      title_ru: 'Кохлеарные импланты',
      excerpt_uz: 'Murakkab eshitish yechimlari',
      excerpt_ru: 'Комплексные слуховые решения',
      slug: 'koxlear-implantlar',
      order: 4,
      status: 'published',
    },
  ];

  await prisma.service.createMany({ data: services });
}

async function seedBrandsAndCategories() {
  const brandData = [
    {
      name: 'Interacoustics',
      slug: 'interacoustics',
      desc_uz: 'Interacoustics — diagnostika va eshitish uskunalari bo‘yicha yetakchi brend.',
      desc_ru: 'Interacoustics — ведущий бренд в области диагностики и слуховых решений.',
    },
    {
      name: 'Cochlear',
      slug: 'cochlear',
      desc_uz: 'Cochlear — koxlear implantlar bo‘yicha jahonda yetakchi.',
      desc_ru: 'Cochlear — мировой лидер в области кохлеарных имплантов.',
    },
    {
      name: 'Oticon',
      slug: 'oticon',
      desc_uz: 'Oticon — MoreSound Intelligence texnologiyasi asosidagi smart eshitish apparatlari.',
      desc_ru: 'Oticon — слуховые аппараты с технологией MoreSound Intelligence.',
    },
    {
      name: 'Phonak',
      slug: 'phonak',
      desc_uz: 'Phonak — Paradise va Lumity platformalaridagi premium yechimlar.',
      desc_ru: 'Phonak — премиальные решения на платформах Paradise и Lumity.',
    },
    {
      name: 'Widex',
      slug: 'widex',
      desc_uz: 'Widex — tabiiy tovush va sun’iy intellekt asosidagi apparatlar.',
      desc_ru: 'Widex — естественное звучание и ИИ в каждом аппарате.',
    },
    {
      name: 'ReSound',
      slug: 'resound',
      desc_uz: 'ReSound — 360° eshitish tajribasini taqdim etuvchi Omnia platformasi.',
      desc_ru: 'ReSound — платформа Omnia c 360° восприятием окружающего звука.',
    },
  ];

  await prisma.brand.createMany({
    data: brandData,
    skipDuplicates: true,
  });

  const categoriesData = [
    { name_uz: 'BTE (Quloq orqasida)', name_ru: 'BTE (За ухом)', slug: 'category-bte' },
    { name_uz: 'ITE (Quloq ichida)', name_ru: 'ITE (В ухе)', slug: 'category-ite' },
    { name_uz: 'RIC (Kanal ichida)', name_ru: 'RIC (В канале)', slug: 'category-ric' },
    { name_uz: 'CIC (Chuqur kanal)', name_ru: 'CIC (Глубокий канал)', slug: 'category-cic' },
    { name_uz: 'Power BTE', name_ru: 'Power BTE', slug: 'category-power-bte' },
    { name_uz: 'Mini BTE', name_ru: 'Mini BTE', slug: 'category-mini-bte' },
    { name_uz: 'RITE', name_ru: 'RITE', slug: 'category-rite' },
    { name_uz: 'IIC (Chuqur)', name_ru: 'IIC (Глубокий)', slug: 'category-iic' },
    { name_uz: 'Boshqa', name_ru: 'Другое', slug: 'category-other' },
  ];

  await prisma.productCategory.createMany({ data: categoriesData });

  return {
    brands: await prisma.brand.findMany(),
    categories: await prisma.productCategory.findMany(),
  };
}

async function seedProducts() {
  const brandList = await prisma.brand.findMany();
  const categoryList = await prisma.productCategory.findMany();

  const products: Prisma.ProductUncheckedCreateInput[] = [];

  const demoBrand = brandList.find((brand) => brand.slug === 'oticon') ?? brandList[0];
  const demoCategory =
    categoryList.find((category) => category.slug === 'category-ric') ?? categoryList[0];

  products.push({
    name_uz: 'Oticon Real 1 miniRITE T',
    name_ru: 'Oticon Real 1 miniRITE T',
    slug: 'oticon-real-1',
    description_uz:
      'Oticon Real 1 miniRITE T — sun’iy intellekt asosidagi yuqori darajadagi eshitish apparati. U real vaqt rejimida tovushlarni tahlil qilib, shovqinni kamaytiradi va nutqni aniq yetkazib beradi.',
    description_ru:
      'Oticon Real 1 miniRITE T — премиальный слуховой аппарат с поддержкой ИИ. Он анализирует звук в реальном времени, снижает шум и усиливает речь даже в самых сложных ситуациях.',
    intro_uz:
      'Real 1 sizga tabiiy eshitish tajribasini qaytaradi. DNN 2.0 algoritmlari hayotdagi minglab tovushlarni o‘rgangan va ular asosida nutqni ajratib beradi.',
    intro_ru:
      'Real 1 возвращает естественное восприятие звуков. Алгоритмы DNN 2.0 обучены на тысячах сценариев и обеспечивают комфортное восприятие речи.',
    price: new Prisma.Decimal(18500000),
    stock: 5,
    brandId: demoBrand?.id,
    categoryId: demoCategory?.id,
    specsText:
      'Bluetooth Low Energy, Deep Neural Network 2.0, MoreSound Amplifier, IP68 himoya, to‘liq eshitish darajalari uchun mos.',
    galleryUrls: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511116054793-9639a1b0bfcc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615634260167-3ad1feadf059?auto=format&fit=crop&w=800&q=80',
    ],
    audience: ['adults', 'elderly'],
    formFactors: ['ric'],
    signalProcessing: 'Deep Neural Network 2.0',
    powerLevel: '110 dB / Power receiver',
    hearingLossLevels: ['moderate', 'severe'],
    smartphoneCompatibility: ['iphone', 'android'],
    tinnitusSupport: true,
    paymentOptions: ['cash-card', 'installment-0', 'installment-6'],
    availabilityStatus: 'in-stock',
    features_uz: [
      'Sun’iy intellekt yordamida avtomatik shovqin nazorati',
      'Bluetooth orqali iPhone va Android bilan to‘liq moslik',
      'Qiymati 12 oy davomida bepul servis va sozlash',
    ],
    features_ru: [
      'Автоматический контроль шума на базе нейросетей',
      'Полная совместимость с iPhone и Android по Bluetooth',
      '12 месяцев бесплатного сервиса и настройки',
    ],
    benefits_uz: [
      'Acoustic markazida 0% muddatli to‘lov',
      'Har bir xaridga bepul eshitish testi va konsultatsiya',
    ],
    benefits_ru: [
      'Рассрочка 0% в центрах Acoustic',
      'Бесплатная диагностика и консультация при покупке',
    ],
    tech_uz:
      'MoreSound Intelligence 2.0, SuddenSound Stabilizer, MoreSound Booster mobil ilovada, polimer qoplama.',
    tech_ru:
      'MoreSound Intelligence 2.0, SuddenSound Stabilizer, MoreSound Booster в мобильном приложении, водоотталкивающее покрытие.',
    fittingRange_uz: 'Yengil — og‘ir eshitish yo‘qotishlari (75 dB gacha).',
    fittingRange_ru: 'От лёгкой до тяжёлой потери слуха (до 75 дБ).',
    regulatoryNote_uz: 'Tibbiy uskunalar toifasi: 2A. CE va RoHS sertifikatlari.',
    regulatoryNote_ru: 'Медицинское изделие класса 2A. Сертификаты CE и RoHS.',
    usefulArticleSlugs: ['post-1'],
    status: 'published',
  });

  const phonakBrand = brandList.find((brand) => brand.slug === 'phonak') ?? brandList[0];
  const widexBrand = brandList.find((brand) => brand.slug === 'widex') ?? brandList[0];
  const resoundBrand = brandList.find((brand) => brand.slug === 'resound') ?? brandList[0];
  const cochlearBrand = brandList.find((brand) => brand.slug === 'cochlear') ?? brandList[0];
  const interacousticsBrand = brandList.find((brand) => brand.slug === 'interacoustics') ?? brandList[0];

  const bteCategory = categoryList.find((cat) => cat.slug === 'category-bte') ?? categoryList[0];
  const iteCategory = categoryList.find((cat) => cat.slug === 'category-ite') ?? categoryList[0];
  const powerCategory = categoryList.find((cat) => cat.slug === 'category-power-bte') ?? categoryList[0];
  const otherCategory = categoryList.find((cat) => cat.slug === 'category-other') ?? categoryList[0];

  products.push(
    {
      name_uz: 'Phonak Audéo Lumity L90-R',
      name_ru: 'Phonak Audéo Lumity L90-R',
      slug: 'phonak-audeo-lumity-l90-r',
      description_uz:
        'Lumity platformasi Soundsense Focus bilan hordiq chiqaruvchi muhitlarda ham nutqni aniq yetkazib beradi. IP68 korpus, zaryadlanadigan batareya va suvga chidamli dizayn.',
      description_ru:
        'Платформа Lumity с технологией SmartSpeech обеспечивает уверенное восприятие речи даже в сложных условиях. Класс защиты IP68 и аккумулятор повышенной ёмкости.',
      intro_uz:
        'Universal shakldagi RIC apparat, Adaptive ActiveVent va AutoSense OS 5.0 bilan har qanday sharoitda moslashadi.',
      intro_ru:
        'Универсальный RIC с ActiveVent и AutoSense OS 5.0 адаптируется к любой акустической ситуации.',
      price: new Prisma.Decimal(17850000),
      stock: 8,
      brandId: phonakBrand.id,
      categoryId: demoCategory.id,
      specsText:
        'AutoSense OS 5.0, SmartSpeech Technology, IP68, to‘liq Bluetooth LE Audio, qo‘shimcha ko‘rsatkichlar uchun myPhonak ilovasi.',
      galleryUrls: [
        'https://images.unsplash.com/photo-1580330067187-0ef3c08cc61d?auto=format&fit=crop&w=800&q=80',
      ],
      audience: ['adults', 'elderly'],
      formFactors: ['ric'],
      signalProcessing: 'AutoSense OS 5.0, Speech Enhancer',
      powerLevel: 'Power receiver (105 dB)',
      hearingLossLevels: ['mild', 'moderate', 'severe'],
      smartphoneCompatibility: ['iphone', 'android'],
      tinnitusSupport: true,
      paymentOptions: ['cash-card', 'installment-0'],
      availabilityStatus: 'in-stock',
      features_uz: [
        'SmartSound texnologiyasi bilan nutqni aniqlik bilan eshitish',
        'Qiymati ta’minlangan zaryadlanadigan batareya va portativ PowerPack',
      ],
      features_ru: [
        'SmartSound Technology для чёткого восприятия речи',
        'Ёмкий аккумулятор с портативной станцией зарядки PowerPack',
      ],
      benefits_uz: ['Acoustic markazida bepul sozlash va 3 oylik kuzatuv', '0% muddatli to‘lov'],
      benefits_ru: ['Бесплатная настройка и сопровождение 3 месяца', 'Рассрочка 0% в центрах Acoustic'],
      tech_uz:
        'Multisensor AutoSense OS 5.0, Speech Enhancer, Dynamic Noise Cancellation, Motion Sensor Hearing.',
      tech_ru:
        'AutoSense OS 5.0, Speech Enhancer, Dynamic Noise Cancellation, Motion Sensor Hearing.',
      fittingRange_uz: 'Yengil — og‘ir eshitish yo‘qotishlari (70 dB gacha).',
      fittingRange_ru: 'От лёгкой до тяжёлой потери слуха (до 70 дБ).',
      regulatoryNote_uz: 'CE, FDA va RoHS sertifikatlari mavjud.',
      regulatoryNote_ru: 'Сертифицировано CE, FDA и RoHS.',
      usefulArticleSlugs: ['post-2'],
      status: 'published',
    },
    {
      name_uz: 'Widex Moment Sheer 440 sRIC R D',
      name_ru: 'Widex Moment Sheer 440 sRIC R D',
      slug: 'widex-moment-sheer-440',
      description_uz:
        'Widex Moment Sheer tabiiy tovush va tezkor qayta ishlashga ega. ZeroDelay texnologiyasi vibratsiyani minimallashtiradi.',
      description_ru:
        'Widex Moment Sheer обеспечивает натуральное звучание благодаря технологии ZeroDelay и PureSound.',
      intro_uz:
        'Moment ilovasi orqali EQ sozlamalari, SoundSense Learn va moliyalashtirilgan parvarish rejalari.',
      intro_ru:
        'Приложение Moment позволяет тонко настроить звук, а SoundSense Learn обучается вашим предпочтениям.',
      price: new Prisma.Decimal(16500000),
      stock: 6,
      brandId: widexBrand.id,
      categoryId: demoCategory.id,
      specsText: 'ZeroDelay, PureSound, SoundSense Learn, Qi simsiz zaryadlash.',
      galleryUrls: [
        'https://images.unsplash.com/photo-1598662976925-c7c9a6c6735c?auto=format&fit=crop&w=800&q=80',
      ],
      audience: ['adults'],
      formFactors: ['ric'],
      signalProcessing: 'ZeroDelay, PureSound, TruAcoustics',
      powerLevel: 'Standard receiver (85 dB)',
      hearingLossLevels: ['mild', 'moderate'],
      smartphoneCompatibility: ['iphone', 'android'],
      tinnitusSupport: true,
      paymentOptions: ['cash-card', 'installment-6'],
      availabilityStatus: 'in-stock',
      features_uz: [
        'ZeroDelay bilan tabiiy tovush va minimal kechikish',
        'SoundSense Learn foydalanuvchi afzalliklarini o‘rganadi',
      ],
      features_ru: [
        'ZeroDelay обеспечивает естественное звучание без задержек',
        'SoundSense Learn адаптируется под предпочтения пользователя',
      ],
      benefits_uz: ['Qi simsiz zaryadlash stansi̇yasi to‘plamga kiradi', 'Bepul individual sozlash'],
      benefits_ru: ['Qi зарядка в комплекте', 'Бесплатная индивидуальная настройка'],
      tech_uz: 'PureSound, TruAcoustics, Moment App, Widex Dex moslamalari.',
      tech_ru: 'PureSound, TruAcoustics, Moment App, аксессуары WIDEX Dex.',
      fittingRange_uz: 'Yengil — o‘rta eshitish yo‘qotishlari.',
      fittingRange_ru: 'Подходит при лёгкой и средней потере слуха.',
      regulatoryNote_uz: 'CE sertifikati, IP68 himoya darajasi.',
      regulatoryNote_ru: 'Сертификат CE, степень защиты IP68.',
      usefulArticleSlugs: ['post-3'],
      status: 'published',
    },
    {
      name_uz: 'ReSound Omnia 9 RIE 61',
      name_ru: 'ReSound Omnia 9 RIE 61',
      slug: 'resound-omnia-9-rie-61',
      description_uz:
        'Omnia 9 360° eshitish qamrovi uchun yon va orqa tovushlarni balanslaydi. Ultra Focus nutqqa e’tiborni kuchaytiradi.',
      description_ru:
        'Omnia 9 обеспечивает 360° восприятие звука, Ultra Focus усиливает речь спереди при шуме.',
      intro_uz:
        'M&RIE uchinchi mikrofonli eshitish bo‘lagi bilan tabiiy lokalizatsiya, Hands-free qo‘ng‘iroqlar.',
      intro_ru:
        'Микрофон M&RIE в ушном вкладыше обеспечивает естественную локализацию, свободные звонки Hands-free.',
      price: new Prisma.Decimal(17250000),
      stock: 7,
      brandId: resoundBrand.id,
      categoryId: demoCategory.id,
      specsText: '360 All-Around, Ultra Focus, Check My Fit, iOS/Android qo‘ng‘iroqlari.',
      galleryUrls: [
        'https://images.unsplash.com/photo-1603579230719-577b3e388740?auto=format&fit=crop&w=800&q=80',
      ],
      audience: ['adults', 'elderly'],
      formFactors: ['ric'],
      signalProcessing: '360 All-Around, Ultra Focus, Front Focus',
      powerLevel: 'M&RIE yoki Power receiver',
      hearingLossLevels: ['mild', 'moderate', 'severe'],
      smartphoneCompatibility: ['iphone', 'android'],
      tinnitusSupport: true,
      paymentOptions: ['cash-card', 'installment-6'],
      availabilityStatus: 'in-stock',
      features_uz: [
        '360° All-Around bilan tabiiy lokalizatsiya',
        'Check My Fit ilovasi orqali moslash nazorati',
      ],
      features_ru: [
        '360° All-Around — естественная локализация звука',
        'Check My Fit позволяет контролировать посадку аппарата',
      ],
      benefits_uz: ['Bepul 6 oylik servis va tekshiruv', 'Hands-free qo‘ng‘iroqlar qo‘llab-quvvatlanadi'],
      benefits_ru: ['6 месяцев бесплатного сервиса', 'Поддержка hands-free звонков'],
      tech_uz: 'Bluetooth LE Audio, Auracast tayyor, GN ReSound Smart 3D ilovasi.',
      tech_ru: 'Bluetooth LE Audio, поддержка Auracast, приложение GN ReSound Smart 3D.',
      fittingRange_uz: 'Yengil — og‘ir eshitish yo‘qotishlari.',
      fittingRange_ru: 'От лёгкой до тяжёлой потери слуха.',
      regulatoryNote_uz: 'CE va FCC mosligi, IP68 himoya.',
      regulatoryNote_ru: 'Соответствует CE и FCC, класс защиты IP68.',
      status: 'published',
    },
    {
      name_uz: 'Cochlear Nucleus 8 Processor',
      name_ru: 'Cochlear Nucleus 8 Processor',
      slug: 'cochlear-nucleus-8',
      description_uz:
        'Nucleus 8 — Cochlear’ning eng yengil va aqlli tashqi protsessori. SmartSound IQ 2 bilan adaptiv ishlash.',
      description_ru:
        'Nucleus 8 — самый лёгкий и умный звуковой процессор Cochlear. SmartSound IQ 2 адаптирует звук.',
      intro_uz:
        'Auracast qo‘llab-quvvatlanishtirilishi, Android/iOS bilan to‘g‘ridan-to‘g‘ri striming va True Wireless aksessuarlari.',
      intro_ru:
        'Поддержка Auracast, прямой стриминг с Android/iOS и True Wireless аксессуары.',
      price: new Prisma.Decimal(48500000),
      stock: 2,
      brandId: cochlearBrand.id,
      categoryId: otherCategory.id,
      specsText: 'SmartSound IQ 2, ForwardFocus, Bluetooth LE Audio, Google Fast Pair.',
      galleryUrls: [
        'https://images.unsplash.com/photo-1564149504-6a44e02d3c00?auto=format&fit=crop&w=800&q=80',
      ],
      audience: ['children', 'adults'],
      formFactors: ['bte'],
      signalProcessing: 'SmartSound IQ 2, SCAN 2 Scene Classifier',
      powerLevel: 'Cochlear implant processor',
      hearingLossLevels: ['severe', 'profound'],
      smartphoneCompatibility: ['iphone', 'android'],
      tinnitusSupport: false,
      paymentOptions: ['cash-card'],
      availabilityStatus: 'preorder',
      features_uz: [
        'Auracast tayyor dastlabki implant protsessori',
        'ForwardFocus dasturi old tomondagi nutqqa e’tibor qaratadi',
      ],
      features_ru: [
        'Первый звуковой процессор с поддержкой Auracast',
        'ForwardFocus усиливает речь спереди и подавляет шум',
      ],
      benefits_uz: ['True Wireless aksessuarlari bilan kengaytirilgan imkoniyat', 'Uzoq muddatli servis'],
      benefits_ru: ['True Wireless аксессуары расширяют возможности', 'Долгосрочный сервис и поддержка'],
      tech_uz: 'SmartSound IQ 2, ForwardFocus, Cochlear Smart App.',
      tech_ru: 'SmartSound IQ 2, ForwardFocus, Cochlear Smart App.',
      fittingRange_uz: 'Og‘ir — chuqur eshitish yo‘qotishlari, koxlear implant egalari.',
      fittingRange_ru: 'Для тяжёлой и глубокой потери слуха, пользователей имплантов.',
      regulatoryNote_uz: 'Tibbiy uskunalar: implant komponenti. CE/FDA tasdiqlangan.',
      regulatoryNote_ru: 'Медицинское изделие: компонент импланта. Одобрено CE/FDA.',
      status: 'published',
    },
    {
      name_uz: 'Interacoustics Affinity Compact',
      name_ru: 'Interacoustics Affinity Compact',
      slug: 'interacoustics-affinity-compact',
      description_uz:
        'Affinity Compact — klinik sinov va fitting uchun modulli platforma. REM, HIT va balans testlarini qo‘llab-quvvatlaydi.',
      description_ru:
        'Affinity Compact — модульная платформа для REM, HIT и климатических тестов слуховых аппаратов.',
      intro_uz:
        'REM modu, Visual Speech Mapping va binaural sinovlar, NOAH modullari bilan integratsiya.',
      intro_ru:
        'REM модуль, Visual Speech Mapping и бинауральные тесты, интеграция с NOAH.',
      price: new Prisma.Decimal(32500000),
      stock: 3,
      brandId: interacousticsBrand.id,
      categoryId: otherCategory.id,
      specsText: 'REM, HIT, Tinnitus & eHFA modullari, Binaural Tone & Noise sinovlari.',
      galleryUrls: [
        'https://images.unsplash.com/photo-1559757175-0eb29f9ab1b2?auto=format&fit=crop&w=800&q=80',
      ],
      audience: ['adults'],
      formFactors: ['bte'],
      signalProcessing: 'REM & Speech Mapping analyzers',
      powerLevel: 'Professional diagnostic platform',
      hearingLossLevels: [],
      smartphoneCompatibility: [],
      tinnitusSupport: false,
      paymentOptions: ['cash-card'],
      availabilityStatus: 'in-stock',
      features_uz: [
        'Klinik REM va HIT testlari uchun integral yechim',
        'Visual Speech Mapping orqali real vaqtli ko‘rsatkichlar',
      ],
      features_ru: [
        'Интегрированное решение для клинических REM и HIT тестов',
        'Visual Speech Mapping для наглядного контроля',
      ],
      benefits_uz: ['Kompakt dizayn, USB orqali ulanish', 'Bepul dasturiy yangilanishlar'],
      benefits_ru: ['Компактный форм-фактор, подключение по USB', 'Бесплатные обновления ПО'],
      tech_uz: 'Affinity Suite, NOAH modullari integratsiyasi, REM, HIT, VRA, Tinnitus Analyzer.',
      tech_ru: 'Affinity Suite, интеграция NOAH, REM, HIT, VRA, Tinnitus Analyzer.',
      fittingRange_uz: 'Klinik tekshiruvlar uchun professional yechim.',
      fittingRange_ru: 'Профессиональное решение для клинических обследований.',
      regulatoryNote_uz: 'CE va ISO 13485 sertifikatlari mavjud.',
      regulatoryNote_ru: 'Сертификаты CE и ISO 13485.',
      status: 'published',
    },
  );

  await prisma.product.createMany({ data: products });
}

async function seedShowcases() {
  const products = await prisma.product.findMany({ select: { id: true } });

  const interacousticsProducts = products.filter((_, index) => index % 2 === 0).slice(0, 9);
  const cochlearProducts = products.filter((_, index) => index % 2 === 1).slice(0, 9);

  await prisma.showcase.create({
    data: {
      type: 'interacoustics',
      productIds: interacousticsProducts.map((p) => p.id),
    },
  });

  await prisma.showcase.create({
    data: {
      type: 'cochlear',
      productIds: cochlearProducts.map((p) => p.id),
    },
  });
}

async function seedPosts() {
  const posts = Array.from({ length: 3 }).map((_, index) => ({
    title_uz: `Maqola ${index + 1} - O'zbek`,
    title_ru: `Статья ${index + 1} - Русский`,
    body_uz: `Maqola ${index + 1} matni - O'zbek`,
    body_ru: `Текст статьи ${index + 1} - Русский`,
    excerpt_uz: `Maqola ${index + 1} qisqacha matn - O'zbek`,
    excerpt_ru: `Краткое описание статьи ${index + 1} - Русский`,
    slug: `post-${index + 1}`,
    tags: ['eshitish', 'maslahat'],
    status: 'published',
    publishAt: new Date(),
  }));

  await prisma.post.createMany({ data: posts });
}

async function seedFaq() {
  const faqData = [
    {
      question_uz: "Quloq apparatini qanday tanlash kerak?",
      question_ru: 'Как подобрать слуховой аппарат?',
      answer_uz: "Mutaxassislarimiz maxsus testlar asosida tavsiya berishadi.",
      answer_ru: 'Наши специалисты подбирают решение после диагностики.',
      order: 1,
      status: 'published',
    },
    {
      question_uz: 'Garantiya muddati qancha?',
      question_ru: 'Какой срок гарантии?',
      answer_uz: 'Har bir apparat uchun 12 oygacha kafolat beriladi.',
      answer_ru: 'На каждый аппарат предоставляется гарантия до 12 месяцев.',
      order: 2,
      status: 'published',
    },
    {
      question_uz: "Servis xizmatlari mavjudmi?",
      question_ru: 'Есть ли сервисное обслуживание?',
      answer_uz: "Ha, muntazam texnik xizmat ko'rsatish mavjud.",
      answer_ru: 'Да, доступно регулярное сервисное обслуживание.',
      order: 3,
      status: 'published',
    },
  ];

  await prisma.faq.createMany({ data: faqData });
}

async function seedBranches() {
  const branches = Array.from({ length: 4 }).map((_, index) => ({
    name_uz: `Filial ${index + 1}`,
    name_ru: `Филиал ${index + 1}`,
    address_uz: `Toshkent, ${index + 1}-ko'cha, ${index + 1}-uy`,
    address_ru: `Ташкент, улица ${index + 1}, дом ${index + 1}`,
    phone: `+998 71 202 ${1400 + index}`,
    phones: [`+998 90 123 ${5600 + index}`],
    map_iframe: 'https://maps.google.com',
    order: index + 1,
  }));

  await prisma.branch.createMany({ data: branches });
}

async function seedPages() {
  const pages = [
    {
      slug: 'about',
      title_uz: 'Biz haqimizda',
      title_ru: 'О нас',
      body_uz: 'Acoustic.uz — eshitish markazlari tarmog\'i.',
      body_ru: 'Acoustic.uz — сеть центров слуха.',
      status: 'published',
    },
    {
      slug: 'contacts',
      title_uz: 'Kontaktlar',
      title_ru: 'Контакты',
      body_uz: "Biz bilan bog'laning: +998 71 202 14 41",
      body_ru: 'Свяжитесь с нами: +998 71 202 14 41',
      status: 'published',
    },
  ];

  await prisma.page.createMany({ data: pages });
}

async function main() {
  console.log('🌱 Starting database seed...');

  await clearDatabase();
  await seedRoles();
  await seedUsers();
  await seedSettings();
  await seedBanners();
  await seedServices();
  await seedBrandsAndCategories();
  await seedProducts();
  await seedShowcases();
  await seedPosts();
  await seedFaq();
  await seedBranches();
  await seedPages();

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

