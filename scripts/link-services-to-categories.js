"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Link existing services to their appropriate categories
 * Based on service slugs matching category slugs
 */
async function linkServicesToCategories() {
    console.log('🔗 Linking services to categories...\n');
    // Mapping of service slugs to category slugs based on logical grouping
    const serviceToCategoryMap = {
        // Диагностика (Diagnostics) category
        'diagnostika-dlya-detey': 'diagnostika',
        'diagnostika-dlya-vzroslyh': 'diagnostika',
        'diagnostika-sluha': 'diagnostika',
        'audiometriya': 'diagnostika',
        'online-hearing-test': 'diagnostika',
        // Консультация (Consultation) category
        'konsultatsiya-surdologa': 'konsultatsiya',
        // Коррекция и реабилитация (Correction and Rehabilitation) category
        'korreksiya-sluha': 'korreksiya-reabilitatsiya',
        'individualnye-ushnye-vkladyshi': 'korreksiya-reabilitatsiya',
        // Обслуживание и ремонт (Service and Repair) category
        'remont-i-diagnostika-sluhovyh-apparatov': 'servis-remont',
        // Дополнительные услуги (Additional Services) category
        'sluhovye-apparaty-v-rassrochku': 'dopolnitelnye-uslugi',
        'muddatli-tolovga-eshitish-apparatlari': 'dopolnitelnye-uslugi',
        'priem-inostrannyih-grazhdan': 'dopolnitelnye-uslugi',
        'tseny-na-uslugi-vracha': 'dopolnitelnye-uslugi',
    };
    // Get all categories
    const categories = await prisma.serviceCategory.findMany();
    const categoryMap = new Map(categories.map((cat) => [cat.slug, cat.id]));
    // Get all services
    const services = await prisma.service.findMany();
    let linkedCount = 0;
    let notLinkedCount = 0;
    for (const service of services) {
        const categorySlug = serviceToCategoryMap[service.slug];
        if (categorySlug) {
            const categoryId = categoryMap.get(categorySlug);
            if (categoryId) {
                await prisma.service.update({
                    where: { id: service.id },
                    data: { categoryId },
                });
                console.log(`✅ Linked: ${service.title_uz} → ${categorySlug}`);
                linkedCount++;
            }
            else {
                console.log(`⚠️  Category not found: ${categorySlug}`);
                notLinkedCount++;
            }
        }
        else {
            console.log(`⚠️  No category mapping for: ${service.slug} (${service.title_uz})`);
            notLinkedCount++;
        }
    }
    console.log(`\n✅ Successfully linked ${linkedCount} services to categories`);
    if (notLinkedCount > 0) {
        console.log(`⚠️  ${notLinkedCount} services were not linked (check mappings)`);
    }
}
async function main() {
    try {
        await linkServicesToCategories();
    }
    catch (error) {
        console.error('❌ Linking failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=link-services-to-categories.js.map