import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed service categories based on sluh.by/services structure
 */
async function seedServiceCategories() {
  console.log('🌱 Seeding service categories from sluh.by/services...');

  // Based on actual sluh.by/services structure - these are the main service groups
  const categories = [
    {
      name_uz: "Diagnostika",
      name_ru: "Диагностика",
      slug: "diagnostika",
      description_uz: "Eshitish qobiliyatini to'liq diagnostika qilish - bolalar va kattalar uchun.",
      description_ru: "Полная диагностика слуха - для детей и взрослых.",
      order: 1,
      status: "published" as const,
    },
    {
      name_uz: "Maslahat va konsultatsiya",
      name_ru: "Консультация",
      slug: "konsultatsiya",
      description_uz: "Surdolog shifokorlaridan professional maslahat va konsultatsiya olish.",
      description_ru: "Получите профессиональную консультацию и советы от врачей-сурдологов.",
      order: 2,
      status: "published" as const,
    },
    {
      name_uz: "Korreksiya va reabilitatsiya",
      name_ru: "Коррекция и реабилитация",
      slug: "korreksiya-reabilitatsiya",
      description_uz: "Eshitishni tuzatish va reabilitatsiya qilish - apparatlar va qo'llab-quvvatlash xizmatlari.",
      description_ru: "Коррекция и реабилитация слуха - аппараты и услуги поддержки.",
      order: 3,
      status: "published" as const,
    },
    {
      name_uz: "Xizmat ko'rsatish va ta'mirlash",
      name_ru: "Обслуживание и ремонт",
      slug: "servis-remont",
      description_uz: "Eshitish apparatlarini xizmat ko'rsatish, ta'mirlash va texnik qo'llab-quvvatlash.",
      description_ru: "Обслуживание, ремонт и техническая поддержка слуховых аппаратов.",
      order: 4,
      status: "published" as const,
    },
    {
      name_uz: "Qo'shimcha xizmatlar",
      name_ru: "Дополнительные услуги",
      slug: "dopolnitelnye-uslugi",
      description_uz: "Qo'shimcha xizmatlar: muddatli to'lov, chet elliklar uchun qabul, narxlar.",
      description_ru: "Дополнительные услуги: рассрочка, прием иностранных граждан, цены.",
      order: 5,
      status: "published" as const,
    },
  ];

  // Create categories one by one to handle duplicates
  for (const category of categories) {
    try {
      await prisma.serviceCategory.upsert({
        where: { slug: category.slug },
        update: {
          name_uz: category.name_uz,
          name_ru: category.name_ru,
          description_uz: category.description_uz,
          description_ru: category.description_ru,
          order: category.order,
          status: category.status,
        },
        create: category,
      });
      console.log(`✅ Created/updated category: ${category.name_uz} (${category.slug})`);
    } catch (error) {
      console.error(`❌ Error creating category ${category.slug}:`, error);
    }
  }

  console.log('✅ Service categories seeded successfully!');
}

async function main() {
  try {
    await seedServiceCategories();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

