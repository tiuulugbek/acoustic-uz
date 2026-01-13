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
async function testProductsAPI() {
    try {
        // Simulate API findAll with limit 1000
        const products = await prisma.product.findMany({
            take: 1000,
            skip: 0,
            include: { brand: true, category: true, catalogs: true },
            orderBy: { createdAt: 'desc' },
        });
        console.log(`API dan keladigan mahsulotlar (limit: 1000): ${products.length} ta`);
        console.log(`Jami mahsulotlar: ${await prisma.product.count()} ta`);
        // Check first few products
        console.log('\nBirinchi 5 ta mahsulot:');
        products.slice(0, 5).forEach((p, i) => {
            console.log(`${i + 1}. ${p.name_uz} (${p.productType || 'null'})`);
        });
    }
    catch (error) {
        console.error('Xatolik:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testProductsAPI();
//# sourceMappingURL=test_products_api.js.map