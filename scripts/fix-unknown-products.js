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
async function fixUnknownProducts() {
    try {
        console.log('=== Unknown mahsulotlarni Interacoustics ga o\'zgartirish ===\n');
        // Interacoustics brand'ni topish yoki yaratish
        let interacousticsBrand = await prisma.brand.findFirst({
            where: {
                name: { contains: 'Interacoustics', mode: 'insensitive' },
            },
        });
        if (!interacousticsBrand) {
            interacousticsBrand = await prisma.brand.create({
                data: {
                    name: 'Interacoustics',
                    slug: 'interacoustics',
                },
            });
            console.log('✅ Interacoustics brand yaratildi');
        }
        else {
            console.log(`✅ Interacoustics brand topildi: ${interacousticsBrand.name}`);
        }
        // Unknown brand'ga tegishli mahsulotlarni topish
        const unknownBrands = await prisma.brand.findMany({
            where: {
                OR: [
                    { name: { contains: 'Unknown', mode: 'insensitive' } },
                    { name: { contains: 'Unkown', mode: 'insensitive' } },
                    { name: { contains: 'unknown', mode: 'insensitive' } },
                    { name: { contains: 'unkown', mode: 'insensitive' } },
                ],
            },
            include: {
                products: true,
            },
        });
        console.log(`\n📦 ${unknownBrands.length} ta Unknown brand topildi`);
        let updatedProducts = 0;
        let deletedBrands = 0;
        for (const unknownBrand of unknownBrands) {
            console.log(`\n🔍 Brand: ${unknownBrand.name} (${unknownBrand.products.length} ta mahsulot)`);
            // Barcha mahsulotlarni Interacoustics ga o'zgartirish
            const result = await prisma.product.updateMany({
                where: {
                    brandId: unknownBrand.id,
                },
                data: {
                    brandId: interacousticsBrand.id,
                },
            });
            updatedProducts += result.count;
            console.log(`   ✅ ${result.count} ta mahsulot Interacoustics ga o'zgartirildi`);
            // Unknown brand'ni o'chirish
            await prisma.brand.delete({
                where: { id: unknownBrand.id },
            });
            deletedBrands++;
            console.log(`   🗑️  Brand o'chirildi: ${unknownBrand.name}`);
        }
        // BrandId null bo'lgan mahsulotlarni ham tekshirish
        const productsWithoutBrand = await prisma.product.findMany({
            where: {
                brandId: null,
            },
        });
        if (productsWithoutBrand.length > 0) {
            console.log(`\n📦 ${productsWithoutBrand.length} ta brand'siz mahsulot topildi`);
            const result = await prisma.product.updateMany({
                where: {
                    brandId: null,
                },
                data: {
                    brandId: interacousticsBrand.id,
                },
            });
            updatedProducts += result.count;
            console.log(`   ✅ ${result.count} ta mahsulot Interacoustics ga o'zgartirildi`);
        }
        console.log('\n=== Natijalar ===');
        console.log(`✅ O'zgartirilgan mahsulotlar: ${updatedProducts} ta`);
        console.log(`🗑️  O'chirilgan brand'lar: ${deletedBrands} ta`);
        console.log(`\n✅ Barcha Unknown mahsulotlar Interacoustics ga o'zgartirildi`);
    }
    catch (error) {
        console.error('\n❌ Xatolik:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
fixUnknownProducts()
    .then(() => {
    console.log('\n✅ Yakunlandi');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
});
//# sourceMappingURL=fix-unknown-products.js.map