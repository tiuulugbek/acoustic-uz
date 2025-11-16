/**
 * Seed script to add the 9 hearing aid catalog items from the image
 * These items appear on both the homepage Product Catalog section and /catalog page
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hearingAidItems = [
  {
    title_uz: "Ko'rinmas quloq apparatlari",
    title_ru: 'Незаметные заушные',
    description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modelllar.",
    description_ru: 'Простые в уходе модели, которые легко скрываются за ухом.',
    link: '/catalog/category-invisible',
    order: 1,
    status: 'published' as const,
  },
  {
    title_uz: 'Keksalar uchun',
    title_ru: 'Для пожилых людей',
    description_uz: 'Qulay boshqaruvli, ishonchli va bardoshli eshitish yechimlari.',
    description_ru: 'Надёжные решения для пожилых клиентов.',
    link: '/catalog/category-seniors',
    order: 2,
    status: 'published' as const,
  },
  {
    title_uz: 'Bolalar uchun',
    title_ru: 'Для детей и подростков',
    description_uz: 'Bolalarning nutq rivojlanishini qo\'llab-quvvatlovchi modelllar.',
    description_ru: 'Решения, помогающие ребёнку развивать речь.',
    link: '/catalog/category-children',
    order: 3,
    status: 'published' as const,
  },
  {
    title_uz: 'AI texnologiyalari',
    title_ru: 'С AI-технологиями',
    description_uz: 'Sun\'iy intellekt asosidagi aqlli eshitish yechimlari.',
    description_ru: 'Умные технологии на базе искусственного интеллекта.',
    link: '/catalog/category-ai',
    order: 4,
    status: 'published' as const,
  },
  {
    title_uz: "Ikkinchi darajadagi eshitish yo'qotilishi",
    title_ru: 'При тугоухости 2 степени',
    description_uz: "O'rtacha eshitish yo'qotilishi uchun keng tanlov.",
    description_ru: 'Большой выбор моделей для умеренной тугоухости.',
    link: '/catalog/category-moderate-loss',
    order: 5,
    status: 'published' as const,
  },
  {
    title_uz: 'Kuchli va superkuchli',
    title_ru: 'Мощные и супермощные',
    description_uz: '3-4 darajali eshitish yo\'qotilishi uchun kuchli apparatlar.',
    description_ru: 'Решения для 3 и 4 степени снижения слуха.',
    link: '/catalog/category-powerful',
    order: 6,
    status: 'published' as const,
  },
  {
    title_uz: 'Tovushni boshqarish',
    title_ru: 'Управление шумом в ушах',
    description_uz: 'Shovqinni niqoblaydigan tovush terapiyasi.',
    description_ru: 'Эффективная терапия, маскирующая шум в ушах.',
    link: '/catalog/category-tinnitus',
    order: 7,
    status: 'published' as const,
  },
  {
    title_uz: 'Smartfon uchun',
    title_ru: 'Для смартфона',
    description_uz: "Smartfoningizdan to'g'ridan-to'g'ri sifatli ovoz.",
    description_ru: 'Звук высокого качества прямо со смартфона.',
    link: '/catalog/category-smartphone',
    order: 8,
    status: 'published' as const,
  },
  {
    title_uz: "Ko'rinmas",
    title_ru: 'Невидимые',
    description_uz: 'Kichik, sezilmaydigan eshitish apparatlari.',
    description_ru: 'Незаметные решения, скрывающие проблему.',
    link: '/catalog/category-invisible',
    order: 9,
    status: 'published' as const,
  },
];

async function seedHearingAids() {
  console.log('🌱 Seeding hearing aid catalog items...\n');

  // First, check if items already exist
  const existing = await prisma.homepageHearingAid.findMany();
  if (existing.length > 0) {
    console.log(`⚠️  Found ${existing.length} existing items. Deleting old items...`);
    await prisma.homepageHearingAid.deleteMany();
  }

  // Create all items
  for (const item of hearingAidItems) {
    const created = await prisma.homepageHearingAid.create({
      data: item,
    });
    console.log(`✅ Created: ${created.title_uz} / ${created.title_ru}`);
  }

  console.log(`\n✅ Successfully seeded ${hearingAidItems.length} hearing aid catalog items!`);
  console.log('\n📝 These items will now appear on:');
  console.log('   - Homepage: Product Catalog section (Eshitish aparatlari)');
  console.log('   - Catalog page: /catalog');
  console.log('\n💡 You can manage these items in the admin panel:');
  console.log('   Admin Panel → Homepage → "Eshitish apparatlari kartochkalari"');
}

seedHearingAids()
  .catch((error) => {
    console.error('❌ Error seeding hearing aids:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

