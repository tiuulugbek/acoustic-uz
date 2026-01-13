"use strict";
/**
 * Seed script to create ProductCategory entries for the 9 catalog items
 * This ensures products can be linked to these categories and appear in filters
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const catalogCategories = [
    {
        name_uz: "Ko'rinmas quloq apparatlari",
        name_ru: 'Незаметные заушные',
        slug: 'category-invisible',
        description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modelllar.",
        description_ru: 'Простые в уходе модели, которые легко скрываются за ухом.',
        order: 1,
    },
    {
        name_uz: 'Keksalar uchun',
        name_ru: 'Для пожилых людей',
        slug: 'category-seniors',
        description_uz: 'Qulay boshqaruvli, ishonchli va bardoshli eshitish yechimlari.',
        description_ru: 'Надёжные решения для пожилых клиентов.',
        order: 2,
    },
    {
        name_uz: 'Bolalar uchun',
        name_ru: 'Для детей и подростков',
        slug: 'category-children',
        description_uz: 'Bolalarning nutq rivojlanishini qo\'llab-quvvatlovchi modelllar.',
        description_ru: 'Решения, помогающие ребёнку развивать речь.',
        order: 3,
    },
    {
        name_uz: 'AI texnologiyalari',
        name_ru: 'С AI-технологиями',
        slug: 'category-ai',
        description_uz: 'Sun\'iy intellekt asosidagi aqlli eshitish yechimlari.',
        description_ru: 'Умные технологии на базе искусственного интеллекта.',
        order: 4,
    },
    {
        name_uz: "Ikkinchi darajadagi eshitish yo'qotilishi",
        name_ru: 'При тугоухости 2 степени',
        slug: 'category-moderate-loss',
        description_uz: "O'rtacha eshitish yo'qotilishi uchun keng tanlov.",
        description_ru: 'Большой выбор моделей для умеренной тугоухости.',
        order: 5,
    },
    {
        name_uz: 'Kuchli va superkuchli',
        name_ru: 'Мощные и супермощные',
        slug: 'category-powerful',
        description_uz: '3-4 darajali eshitish yo\'qotilishi uchun kuchli apparatlar.',
        description_ru: 'Решения для 3 и 4 степени снижения слуха.',
        order: 6,
    },
    {
        name_uz: 'Tovushni boshqarish',
        name_ru: 'Управление шумом в ушах',
        slug: 'category-tinnitus',
        description_uz: 'Shovqinni niqoblaydigan tovush terapiyasi.',
        description_ru: 'Эффективная терапия, маскирующая шум в ушах.',
        order: 7,
    },
    {
        name_uz: 'Smartfon uchun',
        name_ru: 'Для смартфона',
        slug: 'category-smartphone',
        description_uz: "Smartfoningizdan to'g'ridan-to'g'ri sifatli ovoz.",
        description_ru: 'Звук высокого качества прямо со смартфона.',
        order: 8,
    },
];
async function seedCatalogCategories() {
    console.log('🌱 Seeding catalog categories...\n');
    // Check if categories already exist
    const existingCategories = await prisma.productCategory.findMany({
        where: {
            slug: {
                in: catalogCategories.map((cat) => cat.slug),
            },
        },
    });
    if (existingCategories.length > 0) {
        console.log(`⚠️  Found ${existingCategories.length} existing categories. Updating...`);
        for (const category of catalogCategories) {
            const existing = existingCategories.find((c) => c.slug === category.slug);
            if (existing) {
                await prisma.productCategory.update({
                    where: { id: existing.id },
                    data: {
                        name_uz: category.name_uz,
                        name_ru: category.name_ru,
                        description_uz: category.description_uz,
                        description_ru: category.description_ru,
                        order: category.order,
                    },
                });
                console.log(`✅ Updated: ${category.name_uz} / ${category.name_ru}`);
            }
            else {
                await prisma.productCategory.create({
                    data: category,
                });
                console.log(`✅ Created: ${category.name_uz} / ${category.name_ru}`);
            }
        }
    }
    else {
        // Create all categories
        for (const category of catalogCategories) {
            await prisma.productCategory.create({
                data: category,
            });
            console.log(`✅ Created: ${category.name_uz} / ${category.name_ru}`);
        }
    }
    console.log(`\n✅ Successfully seeded ${catalogCategories.length} catalog categories!`);
    console.log('\n📝 These categories can now be used to:');
    console.log('   - Link products via categoryId');
    console.log('   - Display products on category pages');
    console.log('   - Filter products by category');
    console.log('\n💡 Next steps:');
    console.log('   1. Assign products to these categories in Admin Panel → Catalog → Products');
    console.log('   2. Products will appear on category pages with filters');
}
seedCatalogCategories()
    .catch((error) => {
    console.error('❌ Error seeding catalog categories:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-catalog-categories.js.map