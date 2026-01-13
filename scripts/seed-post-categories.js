"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding post categories...');
    // Create Bemorlar category
    const bemorlar = await prisma.postCategory.upsert({
        where: { slug: 'bemorlar' },
        update: {},
        create: {
            name_uz: 'Bemorlar',
            name_ru: 'Пациентам',
            slug: 'bemorlar',
            description_uz: 'Bemorlar uchun maqolalar',
            description_ru: 'Статьи для пациентов',
            order: 1,
            status: 'published',
        },
    });
    console.log('✅ Created Bemorlar category:', bemorlar.id);
    // Create Bolalar category
    const bolalar = await prisma.postCategory.upsert({
        where: { slug: 'bolalar' },
        update: {},
        create: {
            name_uz: 'Bolalar',
            name_ru: 'Дети и слух',
            slug: 'bolalar',
            description_uz: 'Bolalar uchun maqolalar',
            description_ru: 'Статьи о детях и слухе',
            order: 2,
            status: 'published',
        },
    });
    console.log('✅ Created Bolalar category:', bolalar.id);
    console.log('✨ Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-post-categories.js.map