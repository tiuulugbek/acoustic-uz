import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCatalogs() {
  const catalogs = [
    {
      name_uz: "Ko'rinmas quloq apparatlari",
      name_ru: 'Невидимые слуховые аппараты',
      slug: 'ko-rinmas-quloq-apparatlari',
      description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modelllar.",
      description_ru: 'Комфортно размещаемые за ухом, практически невидимые модели.',
      order: 1,
      status: 'published' as const,
    },
    {
      name_uz: 'Keksalar uchun',
      name_ru: 'Для пожилых',
      slug: 'keksalar-uchun',
      description_uz: 'Qulay boshqaruvli, ishonchli va bardoshli eshitish yechimlari.',
      description_ru: 'Легко управляемые, надёжные и долговечные слуховые решения.',
      order: 2,
      status: 'published' as const,
    },
    {
      name_uz: 'Bolalar uchun',
      name_ru: 'Для детей',
      slug: 'bolalar-uchun',
      description_uz: "Bolalarning nutq rivojlanishini qo'llab-quvvatlovchi modelllar.",
      description_ru: 'Модели, поддерживающие речевое развитие детей.',
      order: 3,
      status: 'published' as const,
    },
    {
      name_uz: 'Al texnologiyalari',
      name_ru: 'AI технологии',
      slug: 'al-texnologiyalari',
      description_uz: "Sun'iy intellekt asosidagi aqlli eshitish yechimlari.",
      description_ru: 'Умные слуховые решения на основе искусственного интеллекта.',
      order: 4,
      status: 'published' as const,
    },
    {
      name_uz: "Ikkinchi darajadagi eshitish yo'qotilishi",
      name_ru: 'Потеря слуха второй степени',
      slug: 'ikkinchi-darajadagi-eshitish-yo-qotilishi',
      description_uz: "O'rtacha eshitish yo'qotilishi uchun keng tanlov.",
      description_ru: 'Широкий выбор для умеренной потери слуха.',
      order: 5,
      status: 'published' as const,
    },
    {
      name_uz: 'Kuchli va superkuchli',
      name_ru: 'Мощные и супермощные',
      slug: 'kuchli-va-superkuchli',
      description_uz: "3-4 darajali eshitish yo'qotilishi uchun kuchli apparatlar.",
      description_ru: 'Мощные устройства для потери слуха 3-4 степени.',
      order: 6,
      status: 'published' as const,
    },
    {
      name_uz: 'Tovushni boshqarish',
      name_ru: 'Управление звуком',
      slug: 'tovushni-boshqarish',
      description_uz: "Shovqinni niqoblaydigan tovush terapiyasi.",
      description_ru: 'Звуковая терапия, маскирующая шум.',
      order: 7,
      status: 'published' as const,
    },
    {
      name_uz: 'Smartfon uchun',
      name_ru: 'Для смартфона',
      slug: 'smartfon-uchun',
      description_uz: "Smartfoningizdan to'g'ridan-to'g'ri sifatli ovoz.",
      description_ru: 'Прямое высококачественное звучание с вашего смартфона.',
      order: 8,
      status: 'published' as const,
    },
    {
      name_uz: "Ko'rinmas",
      name_ru: 'Невидимые',
      slug: 'ko-rinmas',
      description_uz: "Kichik, sezilmaydigan eshitish apparatlari.",
      description_ru: 'Маленькие, незаметные слуховые аппараты.',
      order: 9,
      status: 'published' as const,
    },
  ];

  // Delete existing catalogs first
  await prisma.catalog.deleteMany({});
  
  // Create new catalogs
  await prisma.catalog.createMany({ data: catalogs });
  
  console.log(`✅ Created ${catalogs.length} catalogs successfully!`);
}

seedCatalogs()
  .catch((error) => {
    console.error('❌ Seeding catalogs failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



