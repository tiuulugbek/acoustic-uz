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
  await prisma.catalog.deleteMany();
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
      desc_uz: "Interacoustics — diagnostika va eshitish uskunalari bo'yicha yetakchi brend.",
      desc_ru: 'Interacoustics — ведущий бренд в области диагностики и слуховых решений.',
    },
    {
      name: 'Cochlear',
      slug: 'cochlear',
      desc_uz: "Cochlear — koxlear implantlar bo'yicha jahonda yetakchi.",
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
      desc_uz: "Widex — tabiiy tovush va sun'iy intellekt asosidagi apparatlar.",
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

async function seedCatalogs() {
  const catalogsData = [
    {
      name_uz: "Ko'rinmas quloq orqasidagi",
      name_ru: 'Незаметные заушные',
      slug: 'ko-rinmas-quloq-orqasidagi',
      description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modellar. Qulay boshqaruvli va parvarish qilish oson.",
      description_ru: 'Простые в уходе и управлении модели легко скрываются за ушной раковиной и волосами.',
      order: 1,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: 'Keksalar uchun',
      name_ru: 'Для пожилых людей',
      slug: 'keksalar-uchun',
      description_uz: "Ishonchli, bardoshli va parvarish qilish oson eshitish yechimlari keksalar uchun.",
      description_ru: 'Надежные, долговечные и простые в уходе слуховые решения для людей пожилого возраста.',
      order: 2,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: "Ko'rinmas",
      name_ru: 'Невидимые',
      slug: 'ko-rinmas',
      description_uz: "Eshitish muammosiga sezilmaydigan yechim, u bilan siz uyatchanlikni unutasiz.",
      description_ru: 'Незаметное решение проблемы со слухом, с которым вы забудете о стеснении.',
      order: 3,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: "Ikkinchi darajadagi eshitish yo'qotilishi",
      name_ru: 'При тугоухости 2 степени',
      slug: 'ikkinchi-darajadagi-eshitish-yo-qotilishi',
      description_uz: "O'rtacha eshitish yo'qotilishi uchun keng tanlov.",
      description_ru: 'Большой выбор моделей для помощи при нарушениях слуха умеренной степени.',
      order: 4,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: 'AI texnologiyalari',
      name_ru: 'C Al-технологиями',
      slug: 'ai-texnologiyalari',
      description_uz: "Sun'iy intellekt asosidagi aqlli eshitish texnologiyalari.",
      description_ru: 'Умные слуховые технологии на базе искусственного интеллекта.',
      order: 5,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: "Bolalar va o'smirlar uchun",
      name_ru: 'Для детей и подростков',
      slug: 'bolalar-va-osmirlar-uchun',
      description_uz: "Bolalarning nutq ko'nikmalarini normal rivojlantirishga yordam beradigan eshitish yechimlari.",
      description_ru: 'Слуховые решения, которые помогут обеспечить ребенку нормальное развитие речевых навыков.',
      order: 6,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: "Quloqdagi shovqinni boshqarish",
      name_ru: 'Управление шумом в ушах',
      slug: 'quloqdagi-shovqinni-boshqarish',
      description_uz: "Samarali tovush terapiyasi quloq shovqinini niqoblaydi va darhol yengillik beradi.",
      description_ru: 'Эффективная звуковая терапия маскирует ушной шум и приносит моментальное облегчение.',
      order: 7,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: 'Smartfon uchun',
      name_ru: 'Для смартфона',
      slug: 'smartfon-uchun',
      description_uz: "Smartfoningizdan to'g'ridan-to'g'ri eshitish apparatlariga yuqori sifatli ovoz.",
      description_ru: 'Звук высокого качества с вашего смартфона напрямую в слуховые аппараты.',
      order: 8,
      status: 'published',
      showOnHomepage: true,
    },
    {
      name_uz: 'Kuchli va superkuchli',
      name_ru: 'Мощные и супермощные',
      slug: 'kuchli-va-superkuchli',
      description_uz: "3 va 4 darajadagi eshitish yo'qotilishi uchun universal yechimlar.",
      description_ru: 'Универсальные решения для улучшения слуха при 3 и 4 степени тугоухости.',
      order: 9,
      status: 'published',
      showOnHomepage: true,
    },
  ];

  await prisma.catalog.createMany({
    data: catalogsData,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${catalogsData.length} catalogs`);
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
  const posts = [
    {
      title_uz: 'Oticon More 1 - Yangi avlod eshitish apparati',
      title_ru: 'Oticon More 1 - Слуховой аппарат нового поколения',
      body_uz: 'Oticon More 1 - sun\'iy intellekt bilan jihozlangan yangi avlod eshitish apparati. Bu model eng yaxshi eshitish tajribasini ta\'minlaydi va kundalik hayotda qulaylik yaratadi.',
      body_ru: 'Oticon More 1 - слуховой аппарат нового поколения с искусственным интеллектом. Эта модель обеспечивает лучший слуховой опыт и создает комфорт в повседневной жизни.',
      excerpt_uz: 'Oticon More 1 - sun\'iy intellekt bilan jihozlangan yangi avlod eshitish apparati. Bu model eng yaxshi eshitish tajribasini ta\'minlaydi va kundalik hayotda qulaylik yaratadi.',
      excerpt_ru: 'Oticon More 1 - слуховой аппарат нового поколения с искусственным интеллектом. Эта модель обеспечивает лучший слуховой опыт и создает комфорт в повседневной жизни.',
      slug: 'oticon-more-1-yangi-avlod',
      tags: ['oticon', 'yangi-model', 'ai'],
      status: 'published',
      publishAt: new Date(),
    },
    {
      title_uz: 'Phonak Audéo Lumity - Smartfon bilan integratsiya',
      title_ru: 'Phonak Audéo Lumity - Интеграция со смартфоном',
      body_uz: 'Phonak Audéo Lumity smartfon ilovalari orqali to\'liq boshqariladi. Telefon qo\'ng\'iroqlari, musiqa va video eshitish apparatiga to\'g\'ridan-to\'g\'ri uzatiladi.',
      body_ru: 'Phonak Audéo Lumity полностью управляется через приложения для смартфона. Телефонные звонки, музыка и видео передаются напрямую в слуховой аппарат.',
      excerpt_uz: 'Phonak Audéo Lumity smartfon ilovalari orqali to\'liq boshqariladi. Telefon qo\'ng\'iroqlari, musiqa va video eshitish apparatiga to\'g\'ridan-to\'g\'ri uzatiladi.',
      excerpt_ru: 'Phonak Audéo Lumity полностью управляется через приложения для смартфона. Телефонные звонки, музыка и видео передаются напрямую в слуховой аппарат.',
      slug: 'phonak-audeo-lumity-smartfon',
      tags: ['phonak', 'smartfon', 'bluetooth'],
      status: 'published',
      publishAt: new Date(),
    },
    {
      title_uz: 'Bolalar uchun eshitish apparatlari - Maxsus dizayn',
      title_ru: 'Слуховые аппараты для детей - Специальный дизайн',
      body_uz: 'Bolalar uchun eshitish apparatlari mustahkam, suv o\'tkazmaydi va xavfsiz materiallardan tayyorlangan. Ular bolalar eshitish xususiyatlariga moslashtirilgan va kundalik faollik uchun qulay.',
      body_ru: 'Слуховые аппараты для детей прочные, водонепроницаемые и изготовлены из безопасных материалов. Они адаптированы к особенностям слуха детей и удобны для повседневной активности.',
      excerpt_uz: 'Bolalar uchun eshitish apparatlari mustahkam, suv o\'tkazmaydi va xavfsiz materiallardan tayyorlangan. Ular bolalar eshitish xususiyatlariga moslashtirilgan.',
      excerpt_ru: 'Слуховые аппараты для детей прочные, водонепроницаемые и изготовлены из безопасных материалов. Они адаптированы к особенностям слуха детей.',
      slug: 'bolalar-uchun-eshitish-apparatlari',
      tags: ['bolalar', 'maxsus-dizayn', 'xavfsiz'],
      status: 'published',
      publishAt: new Date(),
    },
    {
      title_uz: 'Eshitish yo\'qotilishi va demensiya o\'rtasidagi bog\'liqlik',
      title_ru: 'Связь между потерей слуха и деменцией',
      body_uz: 'Tadqiqotlar shuni ko\'rsatadiki, eshitish yo\'qotilishi demensiya rivojlanishi xavfini oshiradi. Eshitish apparatlaridan foydalanish bu xavfni kamaytirishga yordam beradi va miya faolligini saqlab qoladi.',
      body_ru: 'Исследования показывают, что потеря слуха увеличивает риск развития деменции. Использование слуховых аппаратов помогает снизить этот риск и сохранить активность мозга.',
      excerpt_uz: 'Tadqiqotlar shuni ko\'rsatadiki, eshitish yo\'qotilishi demensiya rivojlanishi xavfini oshiradi. Eshitish apparatlaridan foydalanish bu xavfni kamaytirishga yordam beradi.',
      excerpt_ru: 'Исследования показывают, что потеря слуха увеличивает риск развития деменции. Использование слуховых аппаратов помогает снизить этот риск.',
      slug: 'eshitish-yoqotilishi-demensiya',
      tags: ['tadqiqot', 'sogliq', 'demensiya'],
      status: 'published',
      publishAt: new Date(),
    },
    {
      title_uz: '0% muddatli to\'lov - Qulay shartlar',
      title_ru: 'Рассрочка 0% - Удобные условия',
      body_uz: 'Acoustic.uz markazlarida eshitish apparatlarini 0% muddatli to\'lov bilan sotib olishingiz mumkin. Qulay shartlar va uzun muddatli to\'lov imkoniyatlari mavjud.',
      body_ru: 'В центрах Acoustic.uz вы можете приобрести слуховые аппараты в рассрочку 0%. Доступны удобные условия и долгосрочные варианты оплаты.',
      excerpt_uz: 'Acoustic.uz markazlarida eshitish apparatlarini 0% muddatli to\'lov bilan sotib olishingiz mumkin. Qulay shartlar va uzun muddatli to\'lov imkoniyatlari mavjud.',
      excerpt_ru: 'В центрах Acoustic.uz вы можете приобрести слуховые аппараты в рассрочку 0%. Доступны удобные условия и долгосрочные варианты оплаты.',
      slug: '0-muddatli-tolov',
      tags: ['tolov', 'muddatli', 'qulay'],
      status: 'published',
      publishAt: new Date(),
    },
    {
      title_uz: 'Qanday diabet va eshitish yo\'qotilishi bog\'liq?',
      title_ru: 'Как связаны диабет и потеря слуха?',
      body_uz: 'Qanday diabet eshitish yo\'qotilishi rivojlanishi uchun xavf omili bo\'lishi mumkin. Muntazam tekshiruvlar va eshitish apparatlaridan foydalanish diabet bilan og\'rigan bemorlar uchun muhimdir.',
      body_ru: 'Сахарный диабет может быть фактором риска развития потери слуха. Регулярные проверки и использование слуховых аппаратов важны для пациентов с диабетом.',
      excerpt_uz: 'Qanday diabet eshitish yo\'qotilishi rivojlanishi uchun xavf omili bo\'lishi mumkin. Muntazam tekshiruvlar va eshitish apparatlaridan foydalanish muhimdir.',
      excerpt_ru: 'Сахарный диабет может быть фактором риска развития потери слуха. Регулярные проверки и использование слуховых аппаратов важны.',
      slug: 'diabet-eshitish-yoqotilishi',
      tags: ['diabet', 'sogliq', 'tadqiqot'],
      status: 'published',
      publishAt: new Date(),
    },
  ];

  await prisma.post.createMany({ data: posts });
}

async function seedFaq() {
  const faqs = [
    {
      question_uz: 'Eshitish apparati qanday ishlaydi?',
      question_ru: 'Как работает слуховой аппарат?',
      answer_uz: 'Eshitish apparati mikrofondan tovushlarni qabul qiladi, ularni raqamli signalga aylantiradi va qayta ishlaydi. Keyin kuchaytirilgan tovush quloq ichiga uzatiladi. Zamonaviy apparatlar AI texnologiyasi yordamida nutqni shovqindan ajratadi va eng yaxshi eshitishni ta\'minlaydi.',
      answer_ru: 'Слуховой аппарат принимает звуки через микрофон, преобразует их в цифровой сигнал и обрабатывает. Затем усиленный звук передается в ухо. Современные аппараты используют технологию ИИ для отделения речи от шума и обеспечения наилучшего слуха.',
      order: 1,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparatini qancha vaqt davomida kiyish mumkin?',
      question_ru: 'Как долго можно носить слуховой аппарат?',
      answer_uz: 'Eshitish apparatini kun davomida kiyish mumkin. Dastlabki kunlarda qisqa vaqt (2-3 soat) kiyib, keyin vaqtni asta-sekin oshirish tavsiya etiladi. Quloq apparatiga moslashish uchun 1-2 hafta kerak bo\'lishi mumkin.',
      answer_ru: 'Слуховой аппарат можно носить в течение всего дня. В первые дни рекомендуется носить его короткое время (2-3 часа), постепенно увеличивая продолжительность. Для адаптации к аппарату может потребоваться 1-2 недели.',
      order: 2,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparati qancha narxda?',
      question_ru: 'Сколько стоит слуховой аппарат?',
      answer_uz: 'Eshitish apparatlari narxi model, funksiyalar va texnologiyalariga qarab 5 milliondan 30 million so\'mgacha o\'zgaradi. Bizda 0% muddatli to\'lov va turli xil to\'lov shartlari mavjud. Bepul konsultatsiya va sinov uchun bizga murojaat qiling.',
      answer_ru: 'Стоимость слуховых аппаратов варьируется от 5 до 30 миллионов сум в зависимости от модели, функций и технологий. У нас доступна рассрочка 0% и различные условия оплаты. Обратитесь к нам для бесплатной консультации и примерки.',
      order: 3,
      status: 'published',
    },
    {
      question_uz: 'Bolalar uchun eshitish apparatlari mavjudmi?',
      question_ru: 'Есть ли слуховые аппараты для детей?',
      answer_uz: 'Ha, bizda bolalar uchun maxsus dizayn qilingan eshitish apparatlari mavjud. Ular mustahkam, suv o\'tkazmaydi va bolalar uchun xavfsiz materiallardan tayyorlangan. Bolalar uchun apparatlar kattalar uchun modellardan farqli ravishda bolalar eshitish xususiyatlariga moslashtirilgan.',
      answer_ru: 'Да, у нас есть слуховые аппараты, специально разработанные для детей. Они прочные, водонепроницаемые и изготовлены из безопасных для детей материалов. Детские аппараты адаптированы к особенностям слуха детей, в отличие от моделей для взрослых.',
      order: 4,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparatini smartfon bilan boshqarish mumkinmi?',
      question_ru: 'Можно ли управлять слуховым аппаратом через смартфон?',
      answer_uz: 'Ha, ko\'pchilik zamonaviy eshitish apparatlari smartfon ilovalari orqali boshqariladi. Ilova orqali ovoz balandligini sozlash, rejimlarni o\'zgartirish va hatto telefon qo\'ng\'iroqlarini to\'g\'ridan-to\'g\'ri eshitish apparatiga uzatish mumkin.',
      answer_ru: 'Да, большинство современных слуховых аппаратов управляются через приложения для смартфона. Через приложение можно регулировать громкость, менять режимы и даже передавать телефонные звонки напрямую в слуховой аппарат.',
      order: 5,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparatini qanday parvarish qilish kerak?',
      question_ru: 'Как ухаживать за слуховым аппаратом?',
      answer_uz: 'Eshitish apparatini har kuni quruq mato bilan tozalash, namlikdan saqlash va batareyani muntazam almashtirish kerak. Kechasi apparatni yopiq idishda saqlash va namlikni yutuvchi vositalardan foydalanish tavsiya etiladi.',
      answer_ru: 'Слуховой аппарат следует ежедневно очищать сухой тканью, защищать от влаги и регулярно менять батарею. Рекомендуется хранить аппарат в закрытом контейнере на ночь и использовать влагопоглощающие средства.',
      order: 6,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparatini qancha vaqt ishlatish mumkin?',
      question_ru: 'Как долго можно использовать слуховой аппарат?',
      answer_uz: 'Zamonaviy eshitish apparatlari odatda 5-7 yil davomida ishlaydi. Muntazam parvarish va texnik xizmat ko\'rsatish bilan bu muddat yanada uzoq bo\'lishi mumkin. Har yili apparatni tekshirish va sozlash tavsiya etiladi.',
      answer_ru: 'Современные слуховые аппараты обычно служат 5-7 лет. При регулярном уходе и техническом обслуживании этот срок может быть еще дольше. Рекомендуется ежегодно проверять и настраивать аппарат.',
      order: 7,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparati quloqni shikastlaydimi?',
      question_ru: 'Вредит ли слуховой аппарат уху?',
      answer_uz: 'Yo\'q, to\'g\'ri sozlangan eshitish apparati quloqni shikastlamaydi. Aksincha, u eshitish qobiliyatini yaxshilaydi va miyada eshitish markazlarini faollashtiradi. Muhimi - apparatni mutaxassis tomonidan to\'g\'ri sozlash va muntazam tekshirish.',
      answer_ru: 'Нет, правильно настроенный слуховой аппарат не вредит уху. Наоборот, он улучшает слух и активирует слуховые центры в мозге. Важно правильно настроить аппарат специалистом и регулярно проверять его.',
      order: 8,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparatini uxlashda ham kiyish mumkinmi?',
      question_ru: 'Можно ли носить слуховой аппарат во время сна?',
      answer_uz: 'Umuman olganda, uxlashda eshitish apparatini kiyish tavsiya etilmaydi. Bu quloq terisini qizdiradi va qulflanishga olib kelishi mumkin. Kechasi apparatni yopiq idishda saqlash va batareyani olib tashlash yaxshiroq.',
      answer_ru: 'В целом, носить слуховой аппарат во время сна не рекомендуется. Это может нагревать кожу уха и привести к дискомфорту. Лучше хранить аппарат в закрытом контейнере на ночь и вынимать батарею.',
      order: 9,
      status: 'published',
    },
    {
      question_uz: 'Eshitish apparatini qayerdan sotib olish mumkin?',
      question_ru: 'Где можно купить слуховой аппарат?',
      answer_uz: 'Acoustic.uz markazlarida siz eshitish apparatlarini sotib olishingiz va bepul konsultatsiya olishingiz mumkin. Bizda barcha yetakchi brendlar (Oticon, Phonak, Widex, Signia) mavjud. Bepul sinov va sozlash xizmatlari ham mavjud.',
      answer_ru: 'В центрах Acoustic.uz вы можете приобрести слуховые аппараты и получить бесплатную консультацию. У нас представлены все ведущие бренды (Oticon, Phonak, Widex, Signia). Также доступны бесплатные примерка и настройка.',
      order: 10,
      status: 'published',
    },
  ];

  await prisma.faq.createMany({ data: faqs });
}

async function seedBranches() {
  const FILIALLAR = {
    "chilonzor": {"nomi": "Acoustic - Chilonzor filiali", "kenglik": 41.297306266331134, "uzunlik": 69.20506945414891, "tel": "712884444", "manzil": "Toshkent sh, Chilonzor 7-45-3"},
    "yunusobod": {"nomi": "Acoustic - Yunusobod filiali", "kenglik": 41.36200701177543, "uzunlik": 69.28818898298819, "tel": "945904114", "manzil": "Toshkent shahar, Yunusobod 2-mavze 6-uy. Mo'ljal Asaka Bank. The Elements mehmonxona ro'parasida"},
    "yakkasaroy": {"nomi": "Acoustic - Yakkasaroy filiali", "kenglik": 41.29482805319527, "uzunlik": 69.2537342099695, "tel": "712156850", "manzil": "Aniqlik kiritilmoqda"},
    "toshmi": {"nomi": "Acoustic - Toshmi filiali", "kenglik": 41.34892415113293, "uzunlik": 69.17652213409222, "tel": "998804114", "manzil": "Toshkent shahar, Shayhontoxur tumani, Farobiy 35. Mo'ljal Safia Bakery to'g'risida"},
    "sergeli": {"nomi": "Acoustic - Sergeli filiali", "kenglik": 41.219489304004405, "uzunlik": 69.22274179647307, "tel": "903224114", "manzil": "Toshkent sh, Sergeli tumani, Sergeli 8 mavzesi, shokirariq ko'chasi, Mo'ljal: Baxt uyi to'yxona orqasida"},
    "qoyliq": {"nomi": "Acoustic - Qo'yliq filiali", "kenglik": 41.241842586370325, "uzunlik": 69.33474558113085, "tel": "903934114", "manzil": "Aniqlik kiritilmoqda"},
    "sebzor": {"nomi": "Acoustic - Sebzor filiali", "kenglik": 41.3384931847745, "uzunlik": 69.25241099169301, "tel": "771514114", "manzil": "Toshkent shahar, Olmazor tumani, Sebzor 35V"},
    "guliston": {"nomi": "Acoustic - Guliston filiali", "kenglik": 40.50459092587306, "uzunlik": 68.7707139810919, "tel": "903324114", "manzil": "Sirdaryo viloyat, Guliston shahar, Birlashgan ko`chasi, 6B-uy. Mo`ljal: Suzish havzasi orqasida"},
    "samarqand": {"nomi": "Acoustic - Samarqand filiali", "kenglik": 39.66356652899635, "uzunlik": 66.93702432979721, "tel": "994474114", "manzil": "Aniqlik kiritilmoqda"},
    "navoiy": {"nomi": "Acoustic - Navoiy filiali", "kenglik": 40.0904468842983, "uzunlik": 65.37393329641368, "tel": "937664114", "manzil": "Navoiy shahar Zarafshon MFY Lev Tolstoy ko'chasi 1/30-31 uy."},
    "buxoro": {"nomi": "Acoustic - Buxoro filiali", "kenglik": 39.75176019168013, "uzunlik": 64.43596539454518, "tel": "935130049", "manzil": "Aniqlik kiritilmoqda"},
    "qarshi": {"nomi": "Acoustic - Qarshi filiali", "kenglik": 38.87481581351129, "uzunlik": 65.80650890984371, "tel": "908744114", "manzil": "Qarshi shahar, Chaqar MFY, Islom Karimov Ko'chasi, 353-uy. Mo'ljal: Eski shahar 4- maktab yonida"},
    "shahrisabz": {"nomi": "Acoustic - Shahrisabz filiali", "kenglik": 39.05949178901263, "uzunlik": 66.84198368286825, "tel": "998040605", "manzil": "Aniqlik kiritilmoqda"},
    "termiz": {"nomi": "Acoustic - Termiz filiali", "kenglik": 37.22774555440551, "uzunlik": 67.27256185209002, "tel": "909794114", "manzil": "Surxondaryo viloyati. Termiz shahar, Taraqqiyot ko'chasi. 36 A. Mo'ljal: Viloyat prokuraturasi yonida."},
    "urganch": {"nomi": "Acoustic - Urganch filiali", "kenglik": 41.56322416092417, "uzunlik": 60.625337067655515, "tel": "902224114", "manzil": "Aniqlik kiritilmoqda"},
    "nukus": {"nomi": "Acoustic - Nukus filiali", "kenglik": 42.466655629545826, "uzunlik": 59.61873943886847, "tel": "907094114", "manzil": "Aniqlik kiritilmoqda"},
    "andijon": {"nomi": "Acoustic - Andijon filiali", "kenglik": 40.77613236348919, "uzunlik": 72.3559091811062, "tel": "994204114", "manzil": "Andijon shahar, Alisher Navoiy shox ko'chasi 86/88-uy"},
    "fargona": {"nomi": "Acoustic - Farg'ona filiali", "kenglik": 40.38304233120668, "uzunlik": 71.78483432341388, "tel": "911614114", "manzil": "Aniqlik kiritilmoqda"},
    "namangan": {"nomi": "Acoustic - Namangan filiali", "kenglik": 40.99393111918123, "uzunlik": 71.67986242344605, "tel": "932084114", "manzil": "Namangan shahar, Boburshox ko'chasi,  16/4. Mo'ljal 11-maktab ro'pparasida."},
    "qoqon": {"nomi": "Acoustic - Qo'qon filiali", "kenglik": 40.53595158781408, "uzunlik": 70.95132830992938, "tel": "916795334", "manzil": "Qo'qon shahar, Yangi Chorsu 219-uy."},
    "jizzax": {"nomi": "Acoustic - Jizzax filiali", "kenglik": 40.12635503885972, "uzunlik": 67.82918768107209, "tel": "933654114", "manzil": "Jizzax shahar, Toshloq MFY, Shifokorlar ko'chasi, 8A uy"}
  };

  const branches = Object.entries(FILIALLAR).map(([slug, data], index) => {
    // Telefon raqamini formatlash
    let phone = data.tel;
    if (!phone.startsWith('+998')) {
      if (phone.startsWith('998')) {
        phone = `+${phone}`;
      } else if (phone.length === 9) {
        phone = `+998${phone}`;
      } else {
        phone = `+998${phone}`;
      }
    }

    // Nomni o'zbek va rus tillariga ajratish
    const nomi = data.nomi;
    const name_uz = nomi.replace('Acoustic - ', '').replace(' filiali', '');
    const name_ru = name_uz; // Rus tilida ham xuddi shu nomni ishlatamiz

    return {
      name_uz: name_uz,
      name_ru: name_ru,
      slug: slug,
      address_uz: data.manzil,
      address_ru: data.manzil, // Rus tilida ham xuddi shu manzilni ishlatamiz
      phone: phone,
      phones: [],
      latitude: data.kenglik,
      longitude: data.uzunlik,
      order: index + 1,
    };
  });

  await prisma.branch.createMany({ 
    data: branches,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${branches.length} branches`);
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

async function seedHomepageContent() {
  // Homepage Sections
  const sections = [
    {
      key: 'services',
      title_uz: 'Xizmatlarimiz',
      title_ru: 'Наши услуги',
      subtitle_uz: 'Professional eshitish yechimlari',
      subtitle_ru: 'Профессиональные слуховые решения',
      description_uz: 'Biz sizga eng yaxshi eshitish yechimlarini taklif etamiz',
      description_ru: 'Мы предлагаем вам лучшие слуховые решения',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 1,
      status: 'published',
    },
    {
      key: 'hearing-aids',
      title_uz: 'Eshitish apparatlari',
      title_ru: 'Слуховые аппараты',
      subtitle_uz: 'Zamonaviy texnologiyalar',
      subtitle_ru: 'Современные технологии',
      description_uz: 'Eng yaxshi brendlar va modellar',
      description_ru: 'Лучшие бренды и модели',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 2,
      status: 'published',
    },
    {
      key: 'interacoustics',
      title_uz: 'Interacoustics',
      title_ru: 'Interacoustics',
      subtitle_uz: 'Diagnostika uskunalari',
      subtitle_ru: 'Диагностическое оборудование',
      description_uz: 'Professional diagnostika va tekshiruv',
      description_ru: 'Профессиональная диагностика и обследование',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 3,
      status: 'published',
    },
    {
      key: 'cochlear',
      title_uz: 'Cochlear implantlar',
      title_ru: 'Кохлеарные импланты',
      subtitle_uz: 'Chuqur eshitish yo\'qotilishi uchun',
      subtitle_ru: 'Для глубокой потери слуха',
      description_uz: 'Koxlear implantlar va aksessuarlar',
      description_ru: 'Кохлеарные импланты и аксессуары',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 4,
      status: 'published',
    },
    {
      key: 'path-to-better-hearing',
      title_uz: 'Yaxshi eshitishga yo\'l',
      title_ru: 'Путь к лучшему слуху',
      subtitle_uz: '4 qadamda',
      subtitle_ru: 'В 4 шага',
      description_uz: 'Bizning jarayonimiz',
      description_ru: 'Наш процесс',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 5,
      status: 'published',
    },
    {
      key: 'fresh-posts',
      title_uz: 'So\'nggi yangiliklar',
      title_ru: 'Последние новости',
      subtitle_uz: 'Maqolalar va yangiliklar',
      subtitle_ru: 'Статьи и новости',
      description_uz: 'Eshitish va sog\'liq haqida',
      description_ru: 'О слухе и здоровье',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 6,
      status: 'published',
    },
    {
      key: 'faq',
      title_uz: 'Savol-Javob',
      title_ru: 'Вопросы и ответы',
      subtitle_uz: 'Tez-tez so\'raladigan savollar',
      subtitle_ru: 'Часто задаваемые вопросы',
      description_uz: 'Eshitish apparatlari haqida',
      description_ru: 'О слуховых аппаратах',
      showTitle: true,
      showSubtitle: false,
      showDescription: false,
      order: 7,
      status: 'published',
    },
    {
      key: 'branches',
      title_uz: 'Filiallarimiz',
      title_ru: 'Наши филиалы',
      subtitle_uz: 'Bizning manzillar',
      subtitle_ru: 'Наши адреса',
      description_uz: 'Barcha filiallar va kontaktlar',
      description_ru: 'Все филиалы и контакты',
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 8,
      status: 'published',
    },
  ];

  await prisma.homepageSection.createMany({
    data: sections,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${sections.length} homepage sections`);

  // Homepage Links
  const links = [
    {
      sectionKey: 'services',
      text_uz: 'Barcha xizmatlarni ko\'rish',
      text_ru: 'Посмотреть все услуги',
      href: '/services',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      sectionKey: 'hearing-aids',
      text_uz: 'Katalogga o\'tish',
      text_ru: 'Перейти в каталог',
      href: '/catalog',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      sectionKey: 'interacoustics',
      text_uz: 'Batafsil',
      text_ru: 'Подробнее',
      href: '/catalog/interacoustics',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      sectionKey: 'cochlear',
      text_uz: 'Batafsil',
      text_ru: 'Подробнее',
      href: '/catalog/cochlear',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      sectionKey: 'fresh-posts',
      text_uz: 'Barcha maqolalarni ko\'rish',
      text_ru: 'Посмотреть все статьи',
      href: '/posts',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      sectionKey: 'branches',
      text_uz: 'Barcha filiallarni ko\'rish',
      text_ru: 'Посмотреть все филиалы',
      href: '/branches',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
  ];

  await prisma.homepageLink.createMany({
    data: links,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${links.length} homepage links`);

  // Homepage Placeholders
  const placeholders = [
    {
      sectionKey: 'services',
      text_uz: 'Xizmatlar tez orada qo\'shiladi',
      text_ru: 'Услуги будут добавлены в ближайшее время',
      backgroundColor: '#f0f0f0',
      textColor: '#666',
    },
    {
      sectionKey: 'hearing-aids',
      text_uz: 'Mahsulotlar tez orada qo\'shiladi',
      text_ru: 'Продукты будут добавлены в ближайшее время',
      backgroundColor: '#f0f0f0',
      textColor: '#666',
    },
  ];

  for (const placeholder of placeholders) {
    await prisma.homepagePlaceholder.upsert({
      where: { sectionKey: placeholder.sectionKey },
      create: placeholder,
      update: placeholder,
    });
  }

  console.log(`✅ Created ${placeholders.length} homepage placeholders`);

  // Homepage Empty States
  const emptyStates = [
    {
      sectionKey: 'services',
      message_uz: 'Hozircha xizmatlar mavjud emas',
      message_ru: 'Услуги пока недоступны',
      icon: 'info',
    },
    {
      sectionKey: 'hearing-aids',
      message_uz: 'Hozircha mahsulotlar mavjud emas',
      message_ru: 'Продукты пока недоступны',
      icon: 'empty-box',
    },
  ];

  for (const emptyState of emptyStates) {
    await prisma.homepageEmptyState.upsert({
      where: { sectionKey: emptyState.sectionKey },
      create: emptyState,
      update: emptyState,
    });
  }

  console.log(`✅ Created ${emptyStates.length} homepage empty states`);

  // Catalog Page Config
  await prisma.catalogPageConfig.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      hearingAidsTitle_uz: 'Eshitish apparatlari',
      hearingAidsTitle_ru: 'Слуховые аппараты',
      interacousticsTitle_uz: 'Interacoustics',
      interacousticsTitle_ru: 'Interacoustics',
      accessoriesTitle_uz: 'Aksessuarlar',
      accessoriesTitle_ru: 'Аксессуары',
    },
    update: {
      hearingAidsTitle_uz: 'Eshitish apparatlari',
      hearingAidsTitle_ru: 'Слуховые аппараты',
      interacousticsTitle_uz: 'Interacoustics',
      interacousticsTitle_ru: 'Interacoustics',
      accessoriesTitle_uz: 'Aksessuarlar',
      accessoriesTitle_ru: 'Аксессуары',
    },
  });

  console.log('✅ Created catalog page config');

  // Common Texts
  const commonTexts = [
    {
      key: 'read-more',
      text_uz: 'Batafsil',
      text_ru: 'Подробнее',
      category: 'buttons',
    },
    {
      key: 'learn-more',
      text_uz: 'Ko\'proq o\'rganish',
      text_ru: 'Узнать больше',
      category: 'buttons',
    },
    {
      key: 'contact-us',
      text_uz: 'Biz bilan bog\'lanish',
      text_ru: 'Связаться с нами',
      category: 'buttons',
    },
    {
      key: 'call-now',
      text_uz: 'Hozir qo\'ng\'iroq qiling',
      text_ru: 'Позвоните сейчас',
      category: 'buttons',
    },
    {
      key: 'free-consultation',
      text_uz: 'Bepul konsultatsiya',
      text_ru: 'Бесплатная консультация',
      category: 'services',
    },
    {
      key: 'free-delivery',
      text_uz: 'Bepul yetkazib berish',
      text_ru: 'Бесплатная доставка',
      category: 'services',
    },
  ];

  for (const text of commonTexts) {
    await prisma.commonText.upsert({
      where: { key: text.key },
      create: text,
      update: text,
    });
  }

  console.log(`✅ Created ${commonTexts.length} common texts`);

  // Availability Statuses
  const availabilityStatuses = [
    {
      key: 'in-stock',
      label_uz: 'Mavjud',
      label_ru: 'В наличии',
      schema: 'https://schema.org/InStock',
      colorClass: 'text-green-600 bg-green-50',
      order: 1,
    },
    {
      key: 'out-of-stock',
      label_uz: 'Mavjud emas',
      label_ru: 'Нет в наличии',
      schema: 'https://schema.org/OutOfStock',
      colorClass: 'text-red-600 bg-red-50',
      order: 2,
    },
    {
      key: 'preorder',
      label_uz: 'Oldindan buyurtma',
      label_ru: 'Предзаказ',
      schema: 'https://schema.org/PreOrder',
      colorClass: 'text-blue-600 bg-blue-50',
      order: 3,
    },
    {
      key: 'coming-soon',
      label_uz: 'Tez orada',
      label_ru: 'Скоро',
      schema: 'https://schema.org/PreOrder',
      colorClass: 'text-yellow-600 bg-yellow-50',
      order: 4,
    },
  ];

  await prisma.availabilityStatus.createMany({
    data: availabilityStatuses,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${availabilityStatuses.length} availability statuses`);
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
  await seedCatalogs();
  await seedProducts();
  await seedShowcases();
  await seedPosts();
  await seedFaq();
  await seedBranches();
  await seedPages();
  await seedHomepageContent();

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

