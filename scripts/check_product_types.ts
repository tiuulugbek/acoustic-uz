import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkProductTypes() {
  try {
    const total = await prisma.product.count();
    const withType = await prisma.product.count({
      where: {
        productType: { not: null },
      },
    });
    const hearingAids = await prisma.product.count({
      where: {
        productType: 'hearing-aids',
      },
    });
    const nullType = await prisma.product.count({
      where: {
        productType: null,
      },
    });

    console.log('=== Mahsulot turlari statistikasi ===');
    console.log(`Jami mahsulotlar: ${total} ta`);
    console.log(`Turi bor: ${withType} ta`);
    console.log(`Eshitish moslamalari: ${hearingAids} ta`);
    console.log(`Turi yo'q (null): ${nullType} ta`);

    // Bir nechta mahsulotni ko'rsatish
    const sample = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name_uz: true,
        productType: true,
      },
    });

    console.log('\n=== Namuna mahsulotlar ===');
    sample.forEach(p => {
      console.log(`${p.name_uz}: ${p.productType || 'null'}`);
    });
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductTypes();

