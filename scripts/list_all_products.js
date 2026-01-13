"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
async function listAllProducts() {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name_uz: true,
                name_ru: true,
                slug: true,
                productType: true,
                status: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log(`=== Jami mahsulotlar: ${products.length} ta ===\n`);
        products.forEach((p, index) => {
            console.log(`${index + 1}. ${p.name_uz} | ${p.productType || 'null'} | ${p.status}`);
        });
        // Status bo'yicha guruhlash
        const byStatus = products.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {});
        console.log('\n=== Status bo\'yicha ===');
        Object.entries(byStatus).forEach(([status, count]) => {
            console.log(`${status}: ${count} ta`);
        });
        // ProductType bo'yicha guruhlash
        const byType = products.reduce((acc, p) => {
            const type = p.productType || 'null';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        console.log('\n=== Mahsulot turi bo\'yicha ===');
        Object.entries(byType).forEach(([type, count]) => {
            console.log(`${type}: ${count} ta`);
        });
    }
    catch (error) {
        console.error('Xatolik:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
listAllProducts();
//# sourceMappingURL=list_all_products.js.map