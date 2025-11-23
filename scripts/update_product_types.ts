import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function updateProductTypes() {
  try {
    console.log('Mahsulot turlarini yangilash boshlandi...');

    // Barcha mahsulotlarni olish
    const products = await prisma.product.findMany({
      where: {
        productType: null, // Faqat productType null bo'lganlar
      },
    });

    console.log(`Topilgan mahsulotlar (productType null): ${products.length} ta`);

    // Barcha mahsulotlarni "hearing-aids" ga o'rnatish
    const result = await prisma.product.updateMany({
      where: {
        productType: null,
      },
      data: {
        productType: 'hearing-aids',
      },
    });

    console.log(`Yangilangan mahsulotlar: ${result.count} ta`);
    console.log('Mahsulot turlari muvaffaqiyatli yangilandi!');
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductTypes();

