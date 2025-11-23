import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function cleanProducts() {
  try {
    console.log('=== Barcha mahsulotlarni o\'chirish ===\n');

    // 1. Barcha mahsulotlarni o'chirish
    console.log('1. Barcha mahsulotlarni o\'chirish...');
    const deletedCount = await prisma.product.deleteMany({});
    console.log(`   ✅ ${deletedCount.count} ta mahsulot o'chirildi\n`);

    // 2. Media entries bilan bog'liq mahsulotlar yo'q bo'lgani uchun, 
    //    faqat mahsulotlar bilan bog'liq bo'lmagan media'larni o'chirish (ixtiyoriy)
    //    Bu qismni o'tkazib yuboramiz, chunki media boshqa joylarda ham ishlatilishi mumkin

    console.log('=== Natijalar ===');
    console.log(`O'chirilgan: ${deletedCount.count} ta mahsulot`);
    console.log('\n✅ Baza tozalandi. Endi yangi faylni import qilish mumkin.');
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
cleanProducts()
  .then(() => {
    console.log('\n✅ Tozalash yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });



